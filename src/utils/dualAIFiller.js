/**
 * Dual AI Filler System - Opus + Gemini Collaborative Analysis
 * 
 * Strategy:
 * - OPUS: Deep analysis (actors, use cases, complex patterns) - Left brain (logic)
 * - GEMINI: Structured data filling (tables, metrics, forms) - Right brain (creativity)
 * - CASCADE: Auto-fallback when Opus token quota exceeded
 * - CROSS-CHECK: Compare responses, select best
 * - COST: <$0.30/doc Opus + <$0.30/doc Gemini = <$0.60/doc (well under $1 cap)
 */

import { SECTION_DEFINITIONS } from './sectionAIFiller';

// ─────────────────────────────────────────────────────────────────────────────
//  COST MODELS
// ─────────────────────────────────────────────────────────────────────────────

const OPUS_COSTS = {
  input: 3.0 / 1_000_000,    // $3/1M tokens
  output: 15.0 / 1_000_000,  // $15/1M tokens
};

const GEMINI_COSTS = {
  input: 0.075 / 1_000_000,   // $0.075/1M tokens (1.5-PRO)
  output: 0.3 / 1_000_000,    // $0.3/1M tokens
};

// ─────────────────────────────────────────────────────────────────────────────
//  AI SELECTION STRATEGY
// ─────────────────────────────────────────────────────────────────────────────

export const AI_STRATEGY = {
  // OPUS sections - Deep analysis (research-focused)
  opus_primary: [
    'penelitian.actors',
    'penelitian.useCases',
    'penelitian.kebutuhanFungsional',
    'brd.asIsToBe',
    'kajian.masalahIsu',
  ],
  
  // GEMINI sections - Structured data (form/table filling)
  gemini_primary: [
    'fsd.processFlow',
    'fsd.useCaseDiagram',
    'fsd.erd',
    'charter.lingkup',
    'charter.jadwal',
    'charter.sumberDaya',
    'charter.biaya',
    'kajian.risikoBisnis',
  ],
  
  // Fallback: use counter-AI if primary quota exceeded
};

// ─────────────────────────────────────────────────────────────────────────────
//  DUAL AI COORDINATOR
// ─────────────────────────────────────────────────────────────────────────────

export class DualAICoordinator {
  constructor() {
    this.usage = {
      opus: { inputTokens: 0, outputTokens: 0, cost: 0, status: 'ready', calls: 0 },
      gemini: { inputTokens: 0, outputTokens: 0, cost: 0, status: 'ready', calls: 0 },
    };
    this.budgetCap = 1.0;
    this.cascadeLog = [];
  }

  /**
   * Determine best AI for section
   * Returns: { primary: 'opus'|'gemini', fallback: 'gemini'|'opus', reason: string }
   */
  selectAI(sectionKey) {
    const isPrimaryOpus = AI_STRATEGY.opus_primary.includes(sectionKey);
    
    // Check if primary can handle (has budget + quota)
    const primaryCanHandle = isPrimaryOpus 
      ? this.usage.opus.cost < this.budgetCap * 0.5  // Opus gets 50% of budget
      : this.usage.gemini.cost < this.budgetCap * 0.5; // Gemini gets 50% of budget
    
    if (primaryCanHandle) {
      return {
        primary: isPrimaryOpus ? 'opus' : 'gemini',
        fallback: isPrimaryOpus ? 'gemini' : 'opus',
        reason: 'Using primary AI - budget available'
      };
    }
    
    // Fallback to counter AI
    const counterCanHandle = isPrimaryOpus
      ? this.usage.gemini.cost < this.budgetCap * 0.5
      : this.usage.opus.cost < this.budgetCap * 0.5;
    
    if (counterCanHandle) {
      this.cascadeLog.push({
        section: sectionKey,
        timestamp: new Date().toISOString(),
        cascade: `${isPrimaryOpus ? 'Opus' : 'Gemini'} quota exceeded, cascading to ${isPrimaryOpus ? 'Gemini' : 'Opus'}`
      });
      
      return {
        primary: isPrimaryOpus ? 'gemini' : 'opus',
        fallback: isPrimaryOpus ? 'opus' : 'gemini',
        reason: `${isPrimaryOpus ? 'Opus' : 'Gemini'} budget limit reached - CASCADE to ${isPrimaryOpus ? 'Gemini' : 'Opus'}`
      };
    }
    
    // Both over-budget
    return {
      primary: isPrimaryOpus ? 'opus' : 'gemini',
      fallback: isPrimaryOpus ? 'gemini' : 'opus',
      reason: 'BOTH AIs over budget - attempting primary (may fail)'
    };
  }

  /**
   * Fill section with dual AI processing
   */
  async fillSection(sectionKey, documentText, options = {}) {
    const aiSelection = this.selectAI(sectionKey);
    const section = SECTION_DEFINITIONS[sectionKey];
    
    if (!section) {
      throw new Error(`Section not found: ${sectionKey}`);
    }

    const results = {
      sectionKey,
      content: null,
      primary_ai: aiSelection.primary,
      fallback_attempted: false,
      cascade_reason: aiSelection.reason,
      estimatedTokens: section.estimatedTokens,
      timestamp: new Date().toISOString(),
    };

    try {
      // Try primary AI
      const primaryResponse = await this._callAI(
        aiSelection.primary,
        sectionKey,
        documentText,
        section.prompt
      );
      
      results.content = primaryResponse.content;
      results.usage = primaryResponse.usage;
      
    } catch (error) {
      console.warn(`Primary AI (${aiSelection.primary}) failed:`, error.message);
      
      // Try fallback AI
      results.fallback_attempted = true;
      
      try {
        const fallbackResponse = await this._callAI(
          aiSelection.fallback,
          sectionKey,
          documentText,
          section.prompt
        );
        
        results.content = fallbackResponse.content;
        results.usage = fallbackResponse.usage;
        results.primary_ai = aiSelection.fallback;
        
      } catch (fallbackError) {
        results.error = `Both AIs failed: ${error.message} | Fallback: ${fallbackError.message}`;
        throw new Error(results.error);
      }
    }

    // Update usage tracking
    if (results.usage) {
      const model = results.primary_ai;
      this.usage[model].inputTokens += results.usage.inputTokens || 0;
      this.usage[model].outputTokens += results.usage.outputTokens || 0;
      this.usage[model].cost += results.usage.cost || 0;
      this.usage[model].calls += 1;
    }

    return results;
  }

  /**
   * Internal: Call specific AI model
   */
  async _callAI(model, sectionKey, documentText, prompt) {
    const apiKey = model === 'opus' 
      ? import.meta.env.VITE_ANTHROPIC_API_KEY
      : import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(`${model.toUpperCase()} API key not configured`);
    }

    if (model === 'opus') {
      return await this._callOpus(apiKey, sectionKey, documentText, prompt);
    } else {
      return await this._callGemini(apiKey, sectionKey, documentText, prompt);
    }
  }

  /**
   * Call Claude Opus for deep analysis
   */
  async _callOpus(apiKey, sectionKey, documentText, prompt) {
    // Truncate document to 10k chars for Opus (cost control)
    const truncatedDoc = documentText.substring(0, 10000);
    
    const fullPrompt = `Analyze section: ${SECTION_DEFINITIONS[sectionKey]?.label}

Document context (first 10k chars):
${truncatedDoc}

Task:
${prompt}

Return ONLY valid JSON, no markdown, no explanation.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 2000,
        temperature: 0.3,
        system: 'You are a precise documentation analyzer. Extract and structure information ONLY. Always return JSON.',
        messages: [{
          role: 'user',
          content: fullPrompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Opus API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    
    return {
      content: this._parseJSON(content),
      usage: {
        inputTokens: data.usage?.input_tokens || 0,
        outputTokens: data.usage?.output_tokens || 0,
        cost: ((data.usage?.input_tokens || 0) * OPUS_COSTS.input) +
              ((data.usage?.output_tokens || 0) * OPUS_COSTS.output)
      }
    };
  }

  /**
   * Call Google Gemini for structured data
   */
  async _callGemini(apiKey, sectionKey, documentText, prompt) {
    // Truncate to 6k chars for Gemini (cost control)
    const truncatedDoc = documentText.substring(0, 6000);
    
    const fullPrompt = `Section: ${SECTION_DEFINITIONS[sectionKey]?.label}

Document (max 6k chars):
${truncatedDoc}

${prompt}

JSON ONLY, no text.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Estimate tokens (Gemini doesn't return token count in free tier)
    const estimatedInputTokens = Math.ceil(fullPrompt.length / 4);
    const estimatedOutputTokens = Math.ceil(content.length / 4);
    
    return {
      content: this._parseJSON(content),
      usage: {
        inputTokens: estimatedInputTokens,
        outputTokens: estimatedOutputTokens,
        cost: (estimatedInputTokens * GEMINI_COSTS.input) +
              (estimatedOutputTokens * GEMINI_COSTS.output)
      }
    };
  }

  /**
   * Safe JSON parsing
   */
  _parseJSON(text) {
    try {
      // Extract JSON from text (handles markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error('JSON parse error:', e);
      return null;
    }
  }

  /**
   * Get usage summary
   */
  getUsageSummary() {
    const totalCost = this.usage.opus.cost + this.usage.gemini.cost;
    return {
      opus: {
        ...this.usage.opus,
        percentOfBudget: ((this.usage.opus.cost / this.budgetCap) * 100).toFixed(1) + '%'
      },
      gemini: {
        ...this.usage.gemini,
        percentOfBudget: ((this.usage.gemini.cost / this.budgetCap) * 100).toFixed(1) + '%'
      },
      total: {
        cost: totalCost.toFixed(4),
        remaining: (this.budgetCap - totalCost).toFixed(4),
        percentUsed: ((totalCost / this.budgetCap) * 100).toFixed(1) + '%'
      },
      cascadeEvents: this.cascadeLog.length,
      cascadeLog: this.cascadeLog
    };
  }

  /**
   * Reset for new document
   */
  reset() {
    this.usage = {
      opus: { inputTokens: 0, outputTokens: 0, cost: 0, status: 'ready', calls: 0 },
      gemini: { inputTokens: 0, outputTokens: 0, cost: 0, status: 'ready', calls: 0 },
    };
    this.cascadeLog = [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  TABLE & COLUMN FILLER
// ─────────────────────────────────────────────────────────────────────────────

export class TableFiller {
  /**
   * Fill empty cells in table using Gemini (fast, structured)
   * Complements AI section filling for comprehensive table population
   */
  static async fillTableCells(tableData, documentText, columnNames) {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!geminiKey) throw new Error('Gemini API key required');

    const prompt = `
Given document excerpt and table with columns: ${columnNames.join(', ')}

Document context:
${documentText.substring(0, 3000)}

Table rows with missing values (marked as null):
${JSON.stringify(tableData, null, 2)}

Fill missing cells with relevant extracted data from document. Keep values concise.
Return updated table as JSON array.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2000 }
      })
    });

    if (!response.ok) throw new Error(`Gemini error: ${response.status}`);

    const data = await response.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : tableData;
    } catch (e) {
      return tableData; // Return original if parse fails
    }
  }
}

export default DualAICoordinator;
