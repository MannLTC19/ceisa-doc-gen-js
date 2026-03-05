/**
 * Section AI Filler - Intelligent per-section AI generation with token control
 * 
 * Manages:
 * - Section-specific token estimation
 * - Smart prompt generation per section
 * - Budget enforcement ($1 cap per document)
 * - Token tracking and rollback on failure
 * 
 * NOW INTEGRATED WITH: Dual AI System (Opus + Gemini with cascade fallback)
 * See: dualAIFiller.js for collaborative AI analysis
 */

import { DualAICoordinator } from './dualAIFiller';

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION DEFINITIONS & TOKEN COSTS
// ─────────────────────────────────────────────────────────────────────────────

export const SECTION_DEFINITIONS = {
  // PENELITIAN (Research) TAB - Auto-fill priority
  'penelitian.actors': {
    tab: 'penelitian',
    label: 'Spesifikasi Aktor (UAW)',
    priority: 'critical',
    autoFill: true,
    estimatedTokens: 350,
    prompt: `Extract all system actors/users from the document. For each actor, provide:
- Name (clear identifier)
- Role (what they do)
- Type (GUI/API/Protocol/System)
- Interactions (list of actions they perform)

Return compact JSON array. Max 2 lines per actor.`,
    parseField: 'actors',
  },

  'penelitian.useCases': {
    tab: 'penelitian',
    label: 'Use Case Deskripsi (UUCW)',
    priority: 'critical',
    autoFill: true,
    estimatedTokens: 350,
    prompt: `Extract all use cases with complete descriptions:
- ID/Name
- Involved actors
- Main flow steps (numbered)
- Preconditions
- Postconditions
- Acceptance criteria

Be concise but complete. Return JSON array.`,
    parseField: 'useCases',
  },

  'penelitian.kebutuhanFungsional': {
    tab: 'penelitian',
    label: 'Kebutuhan Fungsional',
    priority: 'critical',
    autoFill: true,
    estimatedTokens: 250,
    prompt: `Extract functional requirements from the document:
- ID
- Description (clear, testable)
- Priority (High/Medium/Low)
- Acceptance criteria
- Owner (if specified)

Return JSON array. Max 2 lines per requirement.`,
    parseField: 'kebutuhanFungsional',
  },

  // BRD TAB - Auto-fill priority
  'brd.asIsToBe': {
    tab: 'brd',
    label: 'Kondisi As-Is To-Be',
    priority: 'critical',
    autoFill: true,
    estimatedTokens: 200,
    prompt: `Extract As-Is (current) and To-Be (target) state analysis:
- Business process/factor name
- Current state description
- Target state description
- Impact/benefit

Return JSON array with fields: factor, asIs, toBe, impact.`,
    parseField: 'asIsToBe',
  },

  'brd.kebutuhanFungsional': {
    tab: 'brd',
    label: 'Kebutuhan Fungsional (BRD)',
    priority: 'critical',
    autoFill: true,
    estimatedTokens: 200,
    prompt: `Extract functional requirements from BRD:
- Requirement ID
- Description
- Priority (H/M/L)
- Acceptance criteria

Return JSON array, concise format.`,
    parseField: 'kebutuhanFungsional',
  },

  // FSD TAB - Auto-fill diagrams
  'fsd.processFlow': {
    tab: 'fsd',
    label: 'Process Flow Diagram',
    priority: 'critical',
    autoFill: true,
    estimatedTokens: 150,
    prompt: `Extract or generate process flow diagram in Mermaid format.
Show: Start → Process steps → Decision points → End
Include all relevant actors and systems. Return valid Mermaid code.`,
    parseField: 'mermaid.processFlow',
  },

  'fsd.useCaseDiagram': {
    tab: 'fsd',
    label: 'Use Case Diagram',
    priority: 'high',
    autoFill: true,
    estimatedTokens: 100,
    prompt: `Generate Use Case diagram in Mermaid format.
Show: Actors, Use Cases, System boundary, Relationships.
Return valid Mermaid format.`,
    parseField: 'mermaid.useCaseDiagram',
  },

  'fsd.erd': {
    tab: 'fsd',
    label: 'Data Model (ERD)',
    priority: 'high',
    autoFill: true,
    estimatedTokens: 80,
    prompt: `Extract or generate Entity Relationship Diagram (ERD) in Mermaid format.
Show: Entities, attributes, relationships.
Return valid Mermaid ERD syntax.`,
    parseField: 'mermaid.erd',
  },

  // PROJECT CHARTER - Optional (user controls)
  'charter.lingkup': {
    tab: 'charter',
    label: 'Lingkup Proyek (Project Scope)',
    priority: 'medium',
    autoFill: false,
    estimatedTokens: 40,
    prompt: `Extract project scope from document:
- What is included/in-scope
- What is explicitly excluded/out-of-scope
Keep concise.`,
    parseField: 'lingkup',
  },

  'charter.jadwal': {
    tab: 'charter',
    label: 'Jadwal Proyek (Timeline)',
    priority: 'medium',
    autoFill: false,
    estimatedTokens: 40,
    prompt: `Extract project timeline/schedule:
- Key milestones
- Phase durations
- Start/end dates if available
Keep brief.`,
    parseField: 'jadwal',
  },

  'charter.sumberDaya': {
    tab: 'charter',
    label: 'Sumber Daya Proyek',
    priority: 'medium',
    autoFill: false,
    estimatedTokens: 50,
    prompt: `Extract resource information:
- Team members/roles
- Tools/technology
- Infrastructure
Brief summary format.`,
    parseField: 'sumberDaya',
  },

  'charter.biaya': {
    tab: 'charter',
    label: 'Biaya Proyek (Budget)',
    priority: 'medium',
    autoFill: false,
    estimatedTokens: 50,
    prompt: `Extract budget information:
- Total project cost
- Cost breakdown by phase/activity
- Contingency budget
Include amounts if available.`,
    parseField: 'biaya',
  },

  // KAJIAN (Requirements) - Optional (user controls)
  'kajian.masalahIsu': {
    tab: 'kajian',
    label: 'Masalah & Isu',
    priority: 'medium',
    autoFill: false,
    estimatedTokens: 60,
    prompt: `Extract problems and issues from requirements analysis:
- Problem statement
- Root causes
- Current pain points
- Business impact

Return structured extract.`,
    parseField: 'masalahIsu',
  },

  'kajian.kebutuhanFungsional': {
    tab: 'kajian',
    label: 'Kebutuhan Fungsional (Kajian)',
    priority: 'medium',
    autoFill: false,
    estimatedTokens: 100,
    prompt: `Extract functional requirements from requirements study:
- ID/Code
- Requirement description
- Business rule
- Acceptance criteria

Return JSON array.`,
    parseField: 'kebutuhanFungsional',
  },

  'kajian.risikoBisnis': {
    tab: 'kajian',
    label: 'Risiko Bisnis',
    priority: 'medium',
    autoFill: false,
    estimatedTokens: 50,
    prompt: `Extract business risks:
- Risk description
- Likelihood (High/Medium/Low)
- Impact
- Mitigation

Return JSON array.`,
    parseField: 'risikoBisnis',
  },
};

// Add short key aliases for backward compatibility
SECTION_DEFINITIONS['actors'] = SECTION_DEFINITIONS['penelitian.actors'];
SECTION_DEFINITIONS['useCases'] = SECTION_DEFINITIONS['penelitian.useCases'];
SECTION_DEFINITIONS['kebutuhanFungsional'] = SECTION_DEFINITIONS['penelitian.kebutuhanFungsional'];
SECTION_DEFINITIONS['asIsToBe'] = SECTION_DEFINITIONS['brd.asIsToBe'];
SECTION_DEFINITIONS['processFlow'] = SECTION_DEFINITIONS['fsd.processFlow'];
SECTION_DEFINITIONS['useCaseDiagram'] = SECTION_DEFINITIONS['fsd.useCaseDiagram'];
SECTION_DEFINITIONS['erd'] = SECTION_DEFINITIONS['fsd.erd'];

// ─────────────────────────────────────────────────────────────────────────────
//  TOKEN ESTIMATION & BUDGET TRACKING
// ─────────────────────────────────────────────────────────────────────────────

const USD_PER_DOLLAR = 1.0;
const HAIKU_INPUT_COST = 0.80 / 1_000_000;  // $0.80 per 1M tokens
const HAIKU_OUTPUT_COST = 4.0 / 1_000_000;  // $4.0 per 1M tokens

export const TokenBudgetTracker = {
  /**
   * Estimate cost for a section generation
   */
  estimateSectionCost(sectionKey) {
    const section = SECTION_DEFINITIONS[sectionKey];
    if (!section) return 0;
    
    // Estimate: input tokens (1,000) + output tokens (section estimate)
    const inputTokens = 1000;
    const outputTokens = section.estimatedTokens;
    const totalTokens = inputTokens + outputTokens;
    
    const cost = (inputTokens * HAIKU_INPUT_COST) + (outputTokens * HAIKU_OUTPUT_COST);
    return {
      tokens: totalTokens,
      cost,
      breakdown: {
        inputTokens,
        outputTokens,
        haiku_input: inputTokens * HAIKU_INPUT_COST,
        haiku_output: outputTokens * HAIKU_OUTPUT_COST,
      }
    };
  },

  /**
   * Calculate cumulative cost for multiple sections
   */
  estimateTotalCost(sectionKeys = []) {
    let totalTokens = 0;
    let totalCost = 0;
    const breakdown = {};

    sectionKeys.forEach(key => {
      const estimate = this.estimateSectionCost(key);
      totalTokens += estimate.tokens;
      totalCost += estimate.cost;
      breakdown[key] = estimate;
    });

    return { totalTokens, totalCost, breakdown };
  },

  /**
   * Check if cost would exceed budget
   */
  wouldExceedBudget(currentCost, additionalSectionKey, budgetCap = USD_PER_DOLLAR) {
    const sectionEstimate = this.estimateSectionCost(additionalSectionKey);
    return (currentCost + sectionEstimate.cost) > budgetCap;
  },

  /**
   * Get budget remaining
   */
  getBudgetRemaining(usedCost, budgetCap = USD_PER_DOLLAR) {
    const remaining = budgetCap - usedCost;
    return Math.max(0, remaining);
  },

  /**
   * Get sections that can still be generated within budget
   */
  getAffordableSections(usedCost, sectionKeys, budgetCap = USD_PER_DOLLAR) {
    return sectionKeys.filter(key => 
      !this.wouldExceedBudget(usedCost, key, budgetCap)
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION-SPECIFIC AI GENERATION
// ─────────────────────────────────────────────────────────────────────────────

export const SectionAIGenerator = {
  /**
   * Generate AI content for a specific section
   */
  async fillSection(apiKey, sectionKey, documentText, onProgress) {
    const section = SECTION_DEFINITIONS[sectionKey];
    if (!section) throw new Error(`Unknown section: ${sectionKey}`);

    const notify = (msg) => {
      console.log(`[${sectionKey}] ${msg}`);
      onProgress?.({ status: 'processing', message: msg, section: sectionKey });
    };

    notify(`Starting AI fill for ${section.label}...`);

    try {
      // Call Claude Haiku for section-specific extraction
      const response = await fetch('/anthropic/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 256,  // Conservative limit per section
          system: `You are an expert requirements analyst. Extract information and return ONLY valid JSON.`,
          messages: [{
            role: 'user',
            content: `${section.prompt}\n\nDocument:\n${documentText.substring(0, 5000)}`
          }],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Haiku API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const text = (data.content || [])
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n');

      notify(`Parsing response...`);

      // Parse and validate JSON
      let result;
      try {
        // Extract JSON from code blocks if present
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
        const jsonStr = jsonMatch[1] || text;
        result = JSON.parse(jsonStr);
      } catch (e) {
        throw new Error(`Failed to parse AI response as JSON: ${e.message}`);
      }

      notify(`✅ Successfully generated ${section.label}`);

      return {
        success: true,
        section: sectionKey,
        data: result,
        usage: data.usage,
        cost: {
          inputTokens: data.usage?.input_tokens || 0,
          outputTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
          totalCost: ((data.usage?.input_tokens || 0) * HAIKU_INPUT_COST) + 
                     ((data.usage?.output_tokens || 0) * HAIKU_OUTPUT_COST),
        }
      };

    } catch (error) {
      notify(`❌ Error: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get auto-fill sections (priority critical)
   */
  getAutoFillSections() {
    return Object.entries(SECTION_DEFINITIONS)
      .filter(([_, section]) => section.autoFill && section.priority === 'critical')
      .map(([key, _]) => key);
  },

  /**
   * Get optional sections (user must click button)
   */
  getOptionalSections() {
    return Object.entries(SECTION_DEFINITIONS)
      .filter(([_, section]) => !section.autoFill)
      .map(([key, _]) => key);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  BATCH GENERATION WITH BUDGET CONTROL
// ─────────────────────────────────────────────────────────────────────────────

export const BatchSectionGenerator = {
  /**
   * Auto-generate all critical priority sections (Penelitian, BRD, FSD)
   */
  async autoFillCriticalSections(apiKey, documentText, budgetCap = USD_PER_DOLLAR, onProgress) {
    const sections = SectionAIGenerator.getAutoFillSections();
    const results = {};
    let totalCost = 0;
    const errors = [];

    for (const sectionKey of sections) {
      try {
        // Check budget before generating
        if (TokenBudgetTracker.wouldExceedBudget(totalCost, sectionKey, budgetCap)) {
          onProgress?.({
            status: 'budget-exceeded',
            message: `Budget limit ($${budgetCap}) reached. Skipping remaining sections.`,
            section: sectionKey,
            totalCost,
          });
          break;
        }

        // Generate section
        const result = await SectionAIGenerator.fillSection(
          apiKey,
          sectionKey,
          documentText,
          onProgress
        );

        results[sectionKey] = result;
        totalCost += result.cost.totalCost;

      } catch (error) {
        errors.push({ section: sectionKey, error: error.message });
        onProgress?.({
          status: 'error',
          message: `Error in ${sectionKey}: ${error.message}`,
        });
      }
    }

    return {
      results,
      totalCost,
      totalTokens: Object.values(results).reduce((sum, r) => sum + r.cost.totalTokens, 0),
      errors,
      remainingBudget: Math.max(0, budgetCap - totalCost),
    };
  },

  /**
   * Generate specific optional sections (user-requested)
   */
  async fillOptionalSections(apiKey, documentText, sectionKeys, budgetCap = USD_PER_DOLLAR, onProgress) {
    const results = {};
    let totalCost = 0;
    const errors = [];

    for (const sectionKey of sectionKeys) {
      try {
        // Check budget
        if (TokenBudgetTracker.wouldExceedBudget(totalCost, sectionKey, budgetCap)) {
          onProgress?.({
            status: 'budget-exceeded',
            message: `Cannot generate ${sectionKey}: would exceed $${budgetCap} budget.`,
          });
          continue;
        }

        // Generate
        const result = await SectionAIGenerator.fillSection(
          apiKey,
          sectionKey,
          documentText,
          onProgress
        );

        results[sectionKey] = result;
        totalCost += result.cost.totalCost;

      } catch (error) {
        errors.push({ section: sectionKey, error: error.message });
      }
    }

    return {
      results,
      totalCost,
      totalTokens: Object.values(results).reduce((sum, r) => sum + r.cost.totalTokens, 0),
      errors,
      remainingBudget: Math.max(0, budgetCap - totalCost),
    };
  },
};

export { DualAICoordinator };
export default { TokenBudgetTracker, SectionAIGenerator, BatchSectionGenerator, SECTION_DEFINITIONS, DualAICoordinator };
