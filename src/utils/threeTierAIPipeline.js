/**
 * Three-Tier AI Pipeline Architecture
 * 
 * TIER 1: EXTRACTION (Haiku + Gemini)
 * Extract ~100-word summaries from document
 * Focus: KEY sections only relevant to Opus analysis
 * 
 * TIER 2: DEEP ANALYSIS (Opus)
 * Analyze summaries with indepth logic
 * Output: Structured JSON format
 * 
 * TIER 3: DISTRIBUTION (Haiku + Gemini)
 * Distribute Opus JSON to tables, columns, tabs
 * Fast implementation of analysis results
 * 
 * COST MODEL:
 * - Tier 1: Haiku ($0.80/1M input) + Gemini ($0.075/1M)
 * - Tier 2: Opus ($3/1M input) - small input, deep analysis
 * - Tier 3: Haiku + Gemini (parallel fast distribution)
 * TOTAL: ~$0.40-0.50/doc (well under $1 cap)
 */

// ─────────────────────────────────────────────────────────────────────────────
//  TIER 1: EXTRACTION PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

export class AIExtractionPipeline {
  constructor() {
    this.summaries = {
      haiku: [],
      gemini: [],
      ranked: [] // Final ranked summaries for Opus
    };
    this.usage = {
      haiku: { inputTokens: 0, outputTokens: 0, cost: 0 },
      gemini: { inputTokens: 0, outputTokens: 0, cost: 0 }
    };
  }

  /**
   * Extract key summaries from document (parallel Haiku + Gemini)
   * Focus: ~100 words each, relevant to project analysis
   */
  async extractSummaries(documentText, onProgress) {
    const sections = this._segmentDocument(documentText, 3000); // 3k char segments
    
    onProgress?.({ status: 'extracting', message: 'Merangkum dokumen dengan Haiku & Gemini...' });

    try {
      // Parallel extraction: Haiku + Gemini
      const [haikusummaries, geminiSummaries] = await Promise.all([
        this._extractWithHaiku(sections),
        this._extractWithGemini(sections)
      ]);

      this.summaries.haiku = haikusummaries;
      this.summaries.gemini = geminiSummaries;

      // Rank summaries: compare & select best from each AI
      this.summaries.ranked = this._rankSummaries(haikusummaries, geminiSummaries);

      onProgress?.({ 
        status: 'extracted', 
        message: `✓ Extracted ${this.summaries.ranked.length} key summaries`,
        summaryCount: this.summaries.ranked.length
      });

      return this.summaries.ranked;

    } catch (error) {
      onProgress?.({ status: 'error', message: `Extraction failed: ${error.message}` });
      throw error;
    }
  }

  /**
   * Segment document into chunks for efficient processing
   */
  _segmentDocument(text, chunkSize = 3000) {
    const segments = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      segments.push(text.substring(i, i + chunkSize));
    }
    return segments;
  }

  /**
   * Extract with Haiku (fast, cheap summarization)
   */
  async _extractWithHaiku(sections) {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC API key required');

    const summaries = [];

    for (const section of sections) {
      const prompt = `Extract ONLY the most important information (~100 words) that would be crucial for project documentation analysis.

Focus on:
- Key stakeholders, actors, processes
- Business requirements, objectives
- Technical constraints
- Risk factors, dependencies
- Budget/timeline/scope indicators

Section:
${section}

Return JSON: { summary: "...", importance: 1-10, keywords: [...] }`;

      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-3-5-20241022',
            max_tokens: 300,
            temperature: 0.3,
            system: 'Extract only key information. Return JSON only.',
            messages: [{ role: 'user', content: prompt }]
          })
        });

        if (!response.ok) continue;

        const data = await response.json();
        const content = data.content?.[0]?.text || '';
        
        // Update usage
        this.usage.haiku.inputTokens += data.usage?.input_tokens || 0;
        this.usage.haiku.outputTokens += data.usage?.output_tokens || 0;
        this.usage.haiku.cost += ((data.usage?.input_tokens || 0) * 0.80 / 1_000_000) +
                                 ((data.usage?.output_tokens || 0) * 4.0 / 1_000_000);

        try {
          const parsed = JSON.parse(this._extractJSON(content));
          summaries.push({
            source: 'haiku',
            ...parsed,
            sectionIndex: sections.indexOf(section)
          });
        } catch (e) {
          // Skip malformed JSON
        }

      } catch (error) {
        console.warn('Haiku extraction error:', error);
      }
    }

    return summaries;
  }

  /**
   * Extract with Gemini (alternative perspective summarization)
   */
  async _extractWithGemini(sections) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key required');

    const summaries = [];

    for (const section of sections) {
      const prompt = `Summarize the most critical information (~100 words) for project documentation.

Key aspects:
- Scope, objectives, deliverables
- Team, resources, constraints
- Success criteria, risks
- Schedule, budget

Section:
${section}

JSON: { summary: "...", importance: 1-10, keywords: [...] }`;

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 300 }
          })
        });

        if (!response.ok) continue;

        const data = await response.json();
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Estimate usage
        const inputEst = Math.ceil(prompt.length / 4);
        const outputEst = Math.ceil(content.length / 4);
        this.usage.gemini.inputTokens += inputEst;
        this.usage.gemini.outputTokens += outputEst;
        this.usage.gemini.cost += (inputEst * 0.075 / 1_000_000) + (outputEst * 0.3 / 1_000_000);

        try {
          const parsed = JSON.parse(this._extractJSON(content));
          summaries.push({
            source: 'gemini',
            ...parsed,
            sectionIndex: sections.indexOf(section)
          });
        } catch (e) {
          // Skip malformed
        }

      } catch (error) {
        console.warn('Gemini extraction error:', error);
      }
    }

    return summaries;
  }

  /**
   * Rank & merge summaries (select best from both AIs)
   */
  _rankSummaries(haiku, gemini) {
    const merged = [...haiku, ...gemini];
    
    // Sort by importance, deduplicate by sectionIndex
    const seen = new Set();
    const ranked = merged
      .sort((a, b) => (b.importance || 0) - (a.importance || 0))
      .filter(s => {
        if (seen.has(s.sectionIndex)) return false;
        seen.add(s.sectionIndex);
        return true;
      })
      .slice(0, 10); // Top 10 summaries

    return ranked;
  }

  /**
   * Safe JSON extraction from text
   */
  _extractJSON(text) {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : '{}';
  }

  /**
   * Get extraction usage summary
   */
  getUsageSummary() {
    return {
      haiku: {
        ...this.usage.haiku,
        percentOfBudget: ((this.usage.haiku.cost / 1.0) * 100).toFixed(2) + '%'
      },
      gemini: {
        ...this.usage.gemini,
        percentOfBudget: ((this.usage.gemini.cost / 1.0) * 100).toFixed(2) + '%'
      },
      extractionCost: (this.usage.haiku.cost + this.usage.gemini.cost).toFixed(4)
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  TIER 2: OPUS ANALYZER
//  Deep indepth analysis of extracted summaries
// ─────────────────────────────────────────────────────────────────────────────

export class OpusAnalyzer {
  constructor() {
    this.analysis = null;
    this.usage = { inputTokens: 0, outputTokens: 0, cost: 0 };
  }

  /**
   * Analyze extracted summaries with Opus
   * Produces structured JSON for distribution
   */
  async analyzeAndStructure(summaries, sections, onProgress) {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC API key required');

    onProgress?.({ status: 'analyzing', message: 'Analisis mendalam dengan Opus...' });

    const summaryText = summaries
      .map((s, i) => `[${i + 1}] (importance: ${s.importance || 5}/10)\n${s.summary}`)
      .join('\n\n');

    const prompt = `You are a project documentation expert. Analyze these extracted summaries and produce structured JSON for all project documentation sections.

Extracted Key Information:
${summaryText}

Produce COMPLETE JSON structure:
{
  "penelitian": {
    "actors": [...],
    "useCases": [...],
    "kebutuhanFungsional": [...]
  },
  "brd": {
    "asIsToBe": [...],
    "kebutuhanFungsional": [...]
  },
  "fsd": {
    "processFlow": "Mermaid code",
    "useCaseDiagram": "Mermaid code",
    "erd": "Mermaid code"
  },
  "charter": {
    "lingkup": "...",
    "jadwal": "...",
    "sumberDaya": [...],
    "biaya": "..."
  },
  "kajian": {
    "masalahIsu": [...],
    "risikoBisnis": [...]
  }
}

Requirements:
- Return ONLY valid JSON, no markdown
- All arrays with complete details
- Infer reasonable values from context
- Ensure business logic consistency
- Keep descriptions concise but complete`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-1-20250805',
          max_tokens: 4000,
          temperature: 0.4,
          system: 'You are a precise documentation analyst. Produce complete, structured JSON from summaries.',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) throw new Error(`Opus API error: ${response.status}`);

      const data = await response.json();
      const content = data.content?.[0]?.text || '';

      this.usage.inputTokens = data.usage?.input_tokens || 0;
      this.usage.outputTokens = data.usage?.output_tokens || 0;
      this.usage.cost = (this.usage.inputTokens * 3.0 / 1_000_000) +
                        (this.usage.outputTokens * 15.0 / 1_000_000);

      // Parse JSON
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON found in Opus response');

      this.analysis = JSON.parse(match[0]);

      onProgress?.({ 
        status: 'analyzed', 
        message: '✓ Analisis mendalam selesai, siap distribusi',
        analysisReady: true
      });

      return this.analysis;

    } catch (error) {
      onProgress?.({ status: 'error', message: `Opus analysis failed: ${error.message}` });
      throw error;
    }
  }

  /**
   * Get Opus usage
   */
  getUsageSummary() {
    return {
      ...this.usage,
      percentOfBudget: ((this.usage.cost / 1.0) * 100).toFixed(2) + '%'
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  TIER 3: DISTRIBUTION PIPELINE
//  Distribute Opus analysis to tables, columns, tabs via Haiku+Gemini
// ─────────────────────────────────────────────────────────────────────────────

export class AIDistributionPipeline {
  constructor() {
    this.distributions = [];
    this.usage = { haiku: { cost: 0 }, gemini: { cost: 0 } };
  }

  /**
   * Distribute Opus JSON to specific sections/tables (parallel Haiku+Gemini)
   */
  async distributeToSections(opusAnalysis, targetSections, onProgress) {
    onProgress?.({ status: 'distributing', message: 'Distribusi hasil ke tabel & tab...' });

    try {
      // Parallel distribution
      const results = await Promise.all(
        targetSections.map(section => 
          this._distributeSection(section, opusAnalysis)
        )
      );

      this.distributions = results;

      onProgress?.({ 
        status: 'distributed', 
        message: `✓ Didistribusikan ke ${results.length} seksi`,
        distributionCount: results.length
      });

      return results;

    } catch (error) {
      onProgress?.({ status: 'error', message: `Distribution failed: ${error.message}` });
      throw error;
    }
  }

  /**
   * Distribute single section using fastest AI (Gemini or Haiku)
   */
  async _distributeSection(section, opusAnalysis) {
    // Extract relevant data from Opus analysis
    const sectionData = opusAnalysis[section.tab]?.[section.field];
    if (!sectionData) return { section: section.key, status: 'no-data' };

    // Use Gemini for fast distribution (cheapest + reliable)
    const prompt = `Format this data for a documentation table/form:

Data: ${JSON.stringify(sectionData)}

Target: ${section.label}

Produce formatted output (JSON if array, text if string):
${JSON.stringify(sectionData)}

Keep format clean, concise, complete.`;

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!geminiKey) throw new Error('Gemini key required');

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1000 }
        })
      });

      if (!response.ok) throw new Error(`Gemini error: ${response.status}`);

      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Track cost
      const outputEst = Math.ceil(content.length / 4);
      this.usage.gemini.cost += (outputEst * 0.3 / 1_000_000);

      return {
        section: section.key,
        tab: section.tab,
        field: section.field,
        status: 'distributed',
        data: sectionData,
        formatted: content
      };

    } catch (error) {
      console.warn(`Failed to distribute ${section.key}:`, error);
      return {
        section: section.key,
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Get distribution cost
   */
  getUsageSummary() {
    return {
      gemini: {
        cost: this.usage.gemini.cost.toFixed(4),
        percentOfBudget: ((this.usage.gemini.cost / 1.0) * 100).toFixed(2) + '%'
      },
      distributionCount: this.distributions.length,
      successCount: this.distributions.filter(d => d.status === 'distributed').length
    };
  }
}

export default {
  AIExtractionPipeline,
  OpusAnalyzer,
  AIDistributionPipeline
};
