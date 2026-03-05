/**
 * tokenMonitor.js
 * 
 * Token tracking & optimization for Anthropic API
 * Monitors usage per field, calculates costs, and provides insights
 * 
 * PRIORITY FIELDS (80% token budget):
 * - kebutuhanFungsional (BRD)
 * - useCases (Penelitian)
 * - actors (Penelitian/UAW)
 * - mermaid diagrams (FSD)
 * - asIsToBe (BRD)
 */

// ─── TOKEN PRICING (as of March 2026) ────────────────────────────────────────
export const TOKEN_PRICING = {
  'claude-haiku-4-5-20251001': {
    input:  0.80 / 1_000_000,   // $0.80 per 1M tokens
    output: 4.0  / 1_000_000,   // $4.00 per 1M tokens
    name: 'Haiku 4.5'
  },
  'claude-opus-4-6-20250514': {
    input:  15 / 1_000_000,     // expensive - avoid
    output: 75 / 1_000_000,
    name: 'Opus 4.6'
  }
};

// ─── PER-FIELD TOKEN ESTIMATION ──────────────────────────────────────────────
export class TokenEstimator {
  // Rough estimation: 1 token ≈ 4 chars on average
  // Haiku is more efficient: 1 token ≈ 5-6 chars
  
  static CHARS_PER_TOKEN = 5; // Conservative for Haiku
  
  static estimateForField(fieldName, content, priority = 'MEDIUM') {
    if (!content) return 0;
    
    const baseChars = typeof content === 'string' 
      ? content.length 
      : JSON.stringify(content).length;
    
    const baseTokens = Math.ceil(baseChars / this.CHARS_PER_TOKEN);
    
    // Priority adjustments (critical fields get better compression)
    const priorityMultiplier = {
      'CRITICAL': 0.95,   // 5% extra space for detail
      'HIGH': 0.90,       // 10% extra
      'MEDIUM': 0.85,     // 15% extra  
      'BASIC': 0.80       // 20% compression
    }[priority] || 0.85;
    
    return Math.ceil(baseTokens * priorityMultiplier);
  }
  
  static estimateTotalForObject(obj, priorityMap = {}) {
    let totalTokens = 0;
    
    for (const [key, value] of Object.entries(obj)) {
      const priority = priorityMap[key] || 'MEDIUM';
      totalTokens += this.estimateForField(key, value, priority);
    }
    
    return totalTokens;
  }
}

// ─── TOKEN USAGE TRACKER ─────────────────────────────────────────────────────
export class TokenUsageTracker {
  constructor(modelName = 'claude-haiku-4-5-20251001') {
    this.model = modelName;
    this.pricing = TOKEN_PRICING[modelName];
    this.passes = [];
    this.fieldBreakdown = {};
    this.totalCost = 0;
  }
  
  /**
   * Record a single pass (triage or analysis)
   */
  recordPass(passName, inputTokens, outputTokens, fieldResults = {}) {
    const input_cost  = inputTokens  * this.pricing.input;
    const output_cost = outputTokens * this.pricing.output;
    const total_cost  = input_cost + output_cost;
    
    const passRecord = {
      pass: passName,
      timestamp: new Date().toISOString(),
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      input_cost,
      output_cost,
      total_cost,
      fieldResults
    };
    
    this.passes.push(passRecord);
    this.totalCost += total_cost;
    
    // Update field breakdown
    for (const [field, tokens] of Object.entries(fieldResults)) {
      if (!this.fieldBreakdown[field]) {
        this.fieldBreakdown[field] = { tokens: 0, cost: 0, count: 0 };
      }
      this.fieldBreakdown[field].tokens += tokens;
      this.fieldBreakdown[field].cost += tokens * (this.pricing.input + this.pricing.output) / 2;
      this.fieldBreakdown[field].count += 1;
    }
    
    return passRecord;
  }
  
  /**
   * Get summary statistics
   */
  getSummary() {
    const totalInput  = this.passes.reduce((s, p) => s + p.inputTokens,  0);
    const totalOutput = this.passes.reduce((s, p) => s + p.outputTokens, 0);
    
    const fieldSummary = Object.entries(this.fieldBreakdown).map(([field, data]) => ({
      field,
      tokens: data.tokens,
      cost: data.cost,
      percentage: ((data.tokens / (totalInput + totalOutput)) * 100).toFixed(1)
    }));
    
    return {
      model: this.model,
      totalInputTokens: totalInput,
      totalOutputTokens: totalOutput,
      totalTokens: totalInput + totalOutput,
      totalCost: this.totalCost,
      totalCostFormatted: `Rp ${(this.totalCost * 15000).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`,  // rough IDR conversion
      passCount: this.passes.length,
      fieldSummary: fieldSummary.sort((a, b) => b.tokens - a.tokens),
      efficiency: {
        avgTokensPerPass: Math.round((totalInput + totalOutput) / this.passes.length),
        costPerKToken: (this.totalCost * 1000).toFixed(2),
        passes: this.passes
      }
    };
  }
  
  /**
   * Format for display (console or UI)
   */
  formatConsoleOutput() {
    const summary = this.getSummary();
    
    const line = (msg = '') => console.log(msg);
    
    line('\n═══════════════════════════════════════════════════════════════');
    line('📊 TOKEN USAGE SUMMARY (Per Document)');
    line('═══════════════════════════════════════════════════════════════');
    line(`Model: ${summary.model}`);
    line(`Passes: ${summary.passCount}`);
    line(`Total Tokens: ${summary.totalTokens.toLocaleString()} (Input: ${summary.totalInputTokens.toLocaleString()}, Output: ${summary.totalOutputTokens.toLocaleString()})`);
    line(`Total Cost: ${summary.totalCostFormatted} (USD $${summary.totalCost.toFixed(4)})`);
    line('');
    
    line('── BREAKDOWN BY FIELD (Priority Order) ────────────────────────');
    summary.fieldSummary.forEach(item => {
      const tokens = item.tokens.toLocaleString();
      const percent = item.percentage;
      const bar = '▓'.repeat(Math.round(percent / 2)) + '░'.repeat(50 - Math.round(percent / 2));
      line(`  ${item.field.padEnd(30)} │ ${bar} │ ${tokens} (${percent}%)`);
    });
    
    line('');
    line('── EFFICIENCY METRICS ────────────────────────────────────────');
    line(`  Avg tokens/pass: ${summary.efficiency.avgTokensPerPass.toLocaleString()}`);
    line(`  Cost per 1K tokens: $${summary.efficiency.costPerKToken}`);
    line('');
    line('═══════════════════════════════════════════════════════════════\n');
  }
  
  /**
   * Export as JSON for logging
   */
  toJSON() {
    return {
      model: this.model,
      summary: this.getSummary(),
      passes: this.passes,
      fieldBreakdown: this.fieldBreakdown
    };
  }
}

// ─── COST OPTIMIZER ─────────────────────────────────────────────────────────
export class CostOptimizer {
  constructor(maxBudgetUSD = 0.01) {
    this.maxBudget = maxBudgetUSD;
    this.tracker = new TokenUsageTracker();
  }
  
  /**
   * Check if we're within budget
   */
  isWithinBudget() {
    return this.tracker.totalCost <= this.maxBudget;
  }
  
  /**
   * Get remaining budget
   */
  getRemainingBudget() {
    return Math.max(0, this.maxBudget - this.tracker.totalCost);
  }
  
  /**
   * Estimate max document size for remaining budget
   */
  getMaxDocumentSize() {
    const remainingBudget = this.getRemainingBudget();
    const avgCostPerToken = (this.tracker.pricing.input + this.tracker.pricing.output) / 2;
    const maxTokens = remainingBudget / avgCostPerToken;
    const maxChars = maxTokens * TokenEstimator.CHARS_PER_TOKEN;
    
    return Math.floor(maxChars);
  }
  
  /**
   * Recommend optimization strategy
   */
  getOptimizationRecommendations() {
    const summary = this.tracker.getSummary();
    const recommendations = [];
    
    // High token-to-value fields
    summary.fieldSummary.forEach(item => {
      if (item.percentage > 20 && !['kebutuhanFungsional', 'useCases', 'actors'].includes(item.field)) {
        recommendations.push({
          field: item.field,
          level: 'WARNING',
          message: `${item.field} menggunakan ${item.percentage}% tokens - consider reducing detail for non-critical fields`
        });
      }
    });
    
    // Budget alert
    if (!this.isWithinBudget()) {
      recommendations.push({
        field: 'BUDGET',
        level: 'CRITICAL',
        message: `Over budget! Cost: ${summary.totalCostFormatted}, Max: Rp ${(this.maxBudget * 15000).toLocaleString('id-ID')}`
      });
    } else {
      const remainingPercent = (this.getRemainingBudget() / this.maxBudget * 100).toFixed(1);
      if (remainingPercent < 20) {
        recommendations.push({
          field: 'BUDGET',
          level: 'INFO',
          message: `Only ${remainingPercent}% of budget remaining`
        });
      }
    }
    
    return recommendations;
  }
}

// ─── FIELD-LEVEL TOKEN ALLOCATOR ────────────────────────────────────────────
export const FIELD_PRIORITY_MAP = {
  // CRITICAL (80% weight) - Focus extraction here
  'kebutuhanFungsional': 'CRITICAL',
  'useCases': 'CRITICAL',
  'actors': 'CRITICAL',
  'mermaid.processFlow': 'CRITICAL',
  'mermaid.useCaseDiagram': 'CRITICAL',
  'asIsToBe': 'CRITICAL',
  
  // HIGH (12% weight)
  'mermaid.erd': 'HIGH',
  'kebutuhanNonFungsional': 'HIGH',
  
  // MEDIUM (5% weight)
  'risikoBisnis': 'MEDIUM',
  'detectedPeople': 'MEDIUM',
  
  // BASIC (3% weight)
  'nama': 'BASIC',
  'pengampu': 'BASIC',
  'unitPJ': 'BASIC',
  'kontakPIC': 'BASIC',
  'target': 'BASIC'
};

/**
 * Calculate recommended character limits per field based on priority
 */
export function getFieldCharLimits(totalAvailableChars = 60000) {
  const weights = {};
  let totalWeight = 0;
  
  for (const [field, priority] of Object.entries(FIELD_PRIORITY_MAP)) {
    const weight = {
      'CRITICAL': 13,  // ~80% split among 6 critical fields
      'HIGH': 6,       // ~12% split
      'MEDIUM': 2.5,   // ~5% split
      'BASIC': 0.75    // ~3% split
    }[priority] || 1;
    
    weights[field] = weight;
    totalWeight += weight;
  }
  
  const limits = {};
  for (const [field, weight] of Object.entries(weights)) {
    limits[field] = Math.floor((weight / totalWeight) * totalAvailableChars);
  }
  
  return limits;
}

/**
 * Main export: Create optimized document for AI processing
 * Intelligently selects and prioritizes fields
 */
export function optimizeDocumentForTokens(projectData, targetTokens = 1500) {
  const charLimits = getFieldCharLimits(targetTokens * TokenEstimator.CHARS_PER_TOKEN);
  
  const optimized = {
    ...projectData,
    _tokenAllocation: charLimits,
    _estimatedTokens: 0
  };
  
  // Truncate secondary fields to limits
  for (const [field, limit] of Object.entries(charLimits)) {
    if (optimized[field] && typeof optimized[field] === 'string') {
      optimized[field] = optimized[field].substring(0, limit);
    }
  }
  
  // Estimate total tokens
  optimized._estimatedTokens = TokenEstimator.estimateTotalForObject(
    Object.fromEntries(
      Object.entries(optimized).filter(([k]) => !k.startsWith('_'))
    ),
    FIELD_PRIORITY_MAP
  );
  
  return optimized;
}

export default {
  TokenEstimator,
  TokenUsageTracker,
  CostOptimizer,
  FIELD_PRIORITY_MAP,
  getFieldCharLimits,
  optimizeDocumentForTokens,
  TOKEN_PRICING
};
