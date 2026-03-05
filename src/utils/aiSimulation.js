/**
 * AI Simulation Engine using Monte Carlo Methods
 * 
 * Analyzes project viability and predicts success probability
 * using stochastic simulation with multiple business factors.
 * 
 * Monte Carlo Approach:
 * - Run 5,000-10,000 simulations with randomized inputs
 * - Calculate probability distribution of outcomes
 * - Generate confidence intervals and trend predictions
 * - Provide actionable insights based on statistical analysis
 * 
 * Recommendations: Uses Google Gemini API for smart, context-aware recommendations
 */

// Gemini API Configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Project Factor Definitions
 */
const FACTOR_RANGES = {
  scope: { min: 0.5, max: 2.0, impact: 0.15 },           // Scope creep factor
  team_expertise: { min: 0.3, max: 0.9, impact: 0.20 },  // Team capability (0.3-0.9)
  budget_adequacy: { min: 0.4, max: 1.5, impact: 0.18 }, // Budget margin
  timeline_pressure: { min: 0.2, max: 1.2, impact: 0.15 }, // Schedule pressure
  stakeholder_alignment: { min: 0.4, max: 0.95, impact: 0.12 }, // Alignment level
  technology_maturity: { min: 0.3, max: 0.95, impact: 0.12 }, // Tech stack stability
  risk_mitigation: { min: 0.2, max: 0.9, impact: 0.08 }, // Risk management quality
};

/**
 * Generate random normal distribution value
 * Box-Muller transform
 */
const randomNormal = (mean = 0, stdDev = 1) => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
};

/**
 * Generate factor value based on range with normal distribution
 */
const generateFactorValue = (factor) => {
  const { min, max } = factor;
  const mean = (min + max) / 2;
  const stdDev = (max - min) / 4;
  const value = randomNormal(mean, stdDev);
  return Math.max(min, Math.min(max, value));
};

/**
 * Calculate project success score
 * Weighted combination of all factors
 */
const calculateSuccessScore = (factors) => {
  let totalScore = 0;
  let totalWeight = 0;

  for (const [factorName, value] of Object.entries(factors)) {
    if (FACTOR_RANGES[factorName]) {
      const { min, max, impact } = FACTOR_RANGES[factorName];
      // Normalize value to 0-1 range where 1 is ideal
      const normalized = (value - min) / (max - min);
      totalScore += normalized * impact;
      totalWeight += impact;
    }
  }

  return (totalScore / totalWeight) * 100; // Return as 0-100
};

/**
 * Run Monte Carlo simulation for project probability
 * 
 * @param {Object} projectData - Project information
 * @param {number} simulations - Number of Monte Carlo iterations (default: 5000)
 * @param {number} months - Forecast period in months (default: 12)
 * @returns {Object} Simulation results with confidence intervals
 */
export const runMonteCarloSimulation = async (projectData = {}, simulations = 5000, months = 12) => {
  const results = {
    simulations: simulations,
    successScores: [],
    monthlyForecasts: [],
    confidenceIntervals: {},
    riskProfile: {},
    recommendations: [],
    timestamp: new Date().toISOString(),
  };

  // Run Monte Carlo simulations
  for (let sim = 0; sim < simulations; sim++) {
    const factors = {};
    
    // Generate random factors for this simulation
    for (const [factorName, factorDef] of Object.entries(FACTOR_RANGES)) {
      factors[factorName] = generateFactorValue(factorDef);
    }

    // Apply project-specific adjustments if provided
    if (projectData.scope_estimate) {
      factors.scope = Math.max(0.5, Math.min(2.0, factors.scope * (projectData.scope_estimate / 1)));
    }
    if (projectData.team_size) {
      // Larger teams slightly improve expertise factor
      factors.team_expertise = Math.max(0.3, Math.min(0.9, factors.team_expertise * (1 + projectData.team_size * 0.05)));
    }
    if (projectData.budget_estimate) {
      // More budget = higher adequacy
      factors.budget_adequacy = Math.max(0.4, Math.min(1.5, factors.budget_adequacy * (projectData.budget_estimate / 1000000)));
    }
    if (projectData.timeline_months) {
      // Tighter timeline = more pressure
      factors.timeline_pressure = Math.max(0.2, Math.min(1.2, factors.timeline_pressure * (6 / projectData.timeline_months)));
    }

    const score = calculateSuccessScore(factors);
    results.successScores.push(score);
  }

  // Calculate statistics
  results.successScores.sort((a, b) => a - b);

  // Confidence intervals (percentiles)
  results.confidenceIntervals = {
    p5: results.successScores[Math.floor(simulations * 0.05)],
    p25: results.successScores[Math.floor(simulations * 0.25)],
    p50: results.successScores[Math.floor(simulations * 0.50)],
    p75: results.successScores[Math.floor(simulations * 0.75)],
    p95: results.successScores[Math.floor(simulations * 0.95)],
    mean: results.successScores.reduce((a, b) => a + b, 0) / simulations,
    stdDev: Math.sqrt(
      results.successScores.reduce((sum, score) => sum + Math.pow(score - results.confidenceIntervals.mean, 2), 0) / simulations
    ),
  };

  // Generate monthly forecasts (decay model)
  for (let month = 1; month <= months; month++) {
    // Project success degrades over time without proper management
    const decayFactor = 1 - (0.02 * month);
    const baseScore = results.confidenceIntervals.p50;
    const monthlyScore = Math.max(30, baseScore * decayFactor);

    results.monthlyForecasts.push({
      month,
      probability: monthlyScore,
      confidence: results.confidenceIntervals.p75,
      risk: 100 - monthlyScore,
    });
  }

  // Risk profile classification
  const meanScore = results.confidenceIntervals.mean;
  if (meanScore >= 80) {
    results.riskProfile = {
      level: 'LOW',
      color: '#50cd89',
      description: 'High probability of success. Well-balanced project profile.',
    };
  } else if (meanScore >= 65) {
    results.riskProfile = {
      level: 'MODERATE',
      color: '#ffc700',
      description: 'Moderate risk. Monitor key factors throughout project lifecycle.',
    };
  } else if (meanScore >= 50) {
    results.riskProfile = {
      level: 'HIGH',
      color: '#ff9500',
      description: 'Elevated risk. Implement proactive mitigation strategies.',
    };
  } else {
    results.riskProfile = {
      level: 'CRITICAL',
      color: '#f1416c',
      description: 'Critical risk. Significant challenges identified. Consider project restructuring.',
    };
  }

  // Generate recommendations
  results.recommendations = await generateRecommendations(projectData, results);

  return results;
};

/**
 * Generate AI-powered recommendations based on simulation results
 */
/**
 * Generate Smart Recommendations using Google Gemini
 * Falls back to rule-based if API unavailable
 */
const generateRecommendations = async (projectData, results) => {
  const meanScore = results.confidenceIntervals.mean;
  
  // Fallback rule-based recommendations
  const fallbackRecommendations = () => [
    ...(meanScore < 70 ? [{
      priority: 'HIGH',
      category: 'Risk Management',
      action: 'Develop comprehensive risk mitigation strategy',
      detail: 'Simulation indicates elevated risk factors. Prioritize contingency planning.',
    }] : []),
    
    ...(projectData.timeline_months && projectData.timeline_months < 3 ? [{
      priority: 'HIGH',
      category: 'Timeline',
      action: 'Reassess project schedule',
      detail: 'Very tight timeline detected. Consider phased approach or resource augmentation.',
    }] : []),
    
    ...(!projectData.team_size || projectData.team_size < 3 ? [{
      priority: 'MEDIUM',
      category: 'Team',
      action: 'Increase team capacity',
      detail: 'Team size may be insufficient. Consider expanding expertise or adding resources.',
    }] : []),
    
    ...(!projectData.budget_estimate || projectData.budget_estimate < 500000 ? [{
      priority: 'MEDIUM',
      category: 'Budget',
      action: 'Budget review required',
      detail: 'Budget may be constrained. Allocate contingency (15-20% buffer).',
    }] : []),
    
    ...(meanScore >= 75 ? [{
      priority: 'LOW',
      category: 'Optimization',
      action: 'Manage scope carefully',
      detail: 'Project outlook positive. Maintain current trajectory and monitor scope creep.',
    }] : []),
    
    ...(() => {
      const sixMonthForecast = results.monthlyForecasts[5];
      return sixMonthForecast && sixMonthForecast.probability < 65 ? [{
        priority: 'MEDIUM',
        category: 'Long-term',
        action: 'Plan mid-project review',
        detail: 'Success probability decreases by month 6. Schedule comprehensive project health check.',
      }] : [];
    })()
  ];
  
  // Try to get Gemini recommendations
  try {
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not configured, using fallback recommendations');
      return fallbackRecommendations();
    }
    
    const prompt = `
Berdasarkan analisis simulasi Monte Carlo untuk project:
- Nama: ${projectData.name || 'Unnamed'}
- Probabilitas Sukses Mean: ${Math.round(meanScore)}%
- Tim: ${projectData.team_size || 'N/A'} orang
- Budget: Rp ${projectData.budget_estimate?.toLocaleString() || 'TBD'}
- Timeline: ${projectData.timeline_months || 'N/A'} bulan
- Scope: ${projectData.scope_estimate || 'N/A'}

Berikan 3-5 rekomendasi strategis dalam format JSON dengan structure:
[
  {
    "priority": "HIGH|MEDIUM|LOW",
    "category": "Risk/Team/Budget/Timeline/Technology/Process",
    "action": "Action title (5-8 words)",
    "detail": "Detailed explanation (1-2 sentences in Indonesian)"
  }
]

Hanya return JSON array, TIDAK ADA TEKS LAIN.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      return recommendations.filter(r => r.priority && r.category);
    }
  } catch (error) {
    console.warn('Gemini recommendation generation failed, using fallback:', error.message);
  }
  
  return fallbackRecommendations();
};

/**
 * Calculate project viability score with confidence levels
 */
export const calculateProjectViability = (projectData = {}) => {
  // Quick assessment without full Monte Carlo
  let score = 50; // Base score

  // Scope assessment
  if (projectData.scope_estimate) {
    const scopeFactor = Math.min(1.5, projectData.scope_estimate / 1);
    score += (scopeFactor > 1 ? -5 : 5);
  } else {
    score -= 10; // Unscoped projects risky
  }

  // Team assessment
  if (projectData.team_size) {
    score += Math.min(15, projectData.team_size * 2);
  } else {
    score -= 10;
  }

  // Budget assessment
  if (projectData.budget_estimate) {
    score += Math.min(15, Math.log(projectData.budget_estimate / 100000) * 3);
  } else {
    score -= 10;
  }

  // Timeline assessment
  if (projectData.timeline_months) {
    score += Math.min(10, projectData.timeline_months);
  } else {
    score -= 10;
  }

  // Risk mitigation
  score += 5; // Default for having used this tool

  return Math.max(20, Math.min(95, score));
};

/**
 * Predict success probability for next N months
 */
export const predictSupport = (simResults, months = 24) => {
  const predictions = [];

  for (let month = 1; month <= months; month++) {
    let baseScore = simResults.confidenceIntervals.p50;

    // Apply time-based decay and growth factors
    const decayRate = 0.015; // 1.5% monthly decay
    const seasonalVariance = Math.sin(month * Math.PI / 6) * 5; // ±5% seasonal variation

    const monthlyProbability = Math.max(
      30,
      baseScore * (1 - decayRate * month) + seasonalVariance + (Math.random() - 0.5) * 3
    );

    predictions.push({
      month,
      probability: Math.round(monthlyProbability),
      trend: month > 1 ? (monthlyProbability > predictions[month - 2].probability ? 'UP' : 'DOWN') : 'STABLE',
      confidence: Math.round(simResults.confidenceIntervals.p75 * 0.95),
    });
  }

  return predictions;
};

/**
 * Generate executive summary from simulation
 */
export const generateExecutiveSummary = (projectData, simResults) => {
  const summary = {
    projectName: projectData.name || 'Unnamed Project',
    timestamp: new Date().toLocaleDateString('id-ID'),
    overallViability: Math.round(simResults.confidenceIntervals.mean),
    riskLevel: simResults.riskProfile.level,
    riskColor: simResults.riskProfile.color,
    keyMetrics: {
      meanSuccessProbability: Math.round(simResults.confidenceIntervals.mean) + '%',
      confidenceRange: `${Math.round(simResults.confidenceIntervals.p25)}% - ${Math.round(simResults.confidenceIntervals.p75)}%`,
      bestCaseScenario: Math.round(simResults.confidenceIntervals.p95) + '%',
      worstCaseScenario: Math.round(simResults.confidenceIntervals.p5) + '%',
    },
    sixMonthOutlook: simResults.monthlyForecasts[5] ? Math.round(simResults.monthlyForecasts[5].probability) + '%' : 'N/A',
    twelveMonthOutlook: simResults.monthlyForecasts[11] ? Math.round(simResults.monthlyForecasts[11].probability) + '%' : 'N/A',
    criticalRecommendations: simResults.recommendations.filter(r => r.priority === 'HIGH'),
    allRecommendations: simResults.recommendations,
  };

  return summary;
};

export default {
  runMonteCarloSimulation,
  calculateProjectViability,
  predictSupport,
  generateExecutiveSummary,
};
