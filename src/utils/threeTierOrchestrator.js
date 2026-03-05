/**
 * Three-Tier AI Pipeline Orchestrator
 * 
 * Coordinates: Extraction (Tier 1) → Analysis (Tier 2) → Distribution (Tier 3)
 * 
 * Flow:
 * 1. Extract summaries from raw document (Haiku + Gemini in parallel)
 * 2. Analyze summaries with Opus (deep indepth logic only)
 * 3. Distribute Opus results to tables/tabs (Gemini formatting)
 * 4. Track costs across all tiers
 */

import {
  AIExtractionPipeline,
  OpusAnalyzer,
  AIDistributionPipeline
} from './threeTierAIPipeline';

export class ThreeTierPipelineOrchestrator {
  constructor(budgetCap = 1.0) {
    this.budgetCap = budgetCap;
    
    // Pipeline components
    this.extractor = new AIExtractionPipeline();
    this.analyzer = new OpusAnalyzer();
    this.distributor = new AIDistributionPipeline();
    
    // Tracking
    this.usage = {};
    this.pipelineStatus = 'idle'; // idle, extracting, analyzing, distributing, complete, error
    this.summaries = null;
    this.analysis = null;
    this.distributions = null;
  }

  /**
   * Main orchestration: Run complete 3-tier pipeline
   */
  async processThroughPipeline(documentText, targetSections, onProgress) {
    try {
      // ──────────────────────────────────────────────────────────────
      // TIER 1: EXTRACTION - Extract summaries
      // ──────────────────────────────────────────────────────────────
      this.pipelineStatus = 'extracting';
      onProgress?.({ 
        tier: 1, 
        status: 'starting',
        message: 'Tier 1: Extracting key information (Haiku + Gemini)...'
      });

      this.summaries = await this.extractor.extractSummaries(documentText, (progress) => {
        onProgress?.({ tier: 1, ...progress });
      });

      const extractionUsage = this.extractor.getUsageSummary();
      onProgress?.({ 
        tier: 1, 
        status: 'complete',
        message: `✓ Tier 1 Complete: ${this.summaries.length} summaries`,
        usage: extractionUsage
      });

      // Check budget after Tier 1
      const tier1Cost = parseFloat(extractionUsage.extractionCost);
      if (tier1Cost > this.budgetCap * 0.3) {
        throw new Error(`Tier 1 exceeded 30% budget: $${tier1Cost.toFixed(4)}`);
      }

      // ──────────────────────────────────────────────────────────────
      // TIER 2: ANALYSIS - Deep analysis of summaries
      // ──────────────────────────────────────────────────────────────
      this.pipelineStatus = 'analyzing';
      onProgress?.({ 
        tier: 2, 
        status: 'starting',
        message: 'Tier 2: Deep analysis with Opus...'
      });

      // Prepare sections object (mock)
      const sections = {};

      this.analysis = await this.analyzer.analyzeAndStructure(
        this.summaries, 
        sections,
        (progress) => {
          onProgress?.({ tier: 2, ...progress });
        }
      );

      const analysisUsage = this.analyzer.getUsageSummary();
      onProgress?.({ 
        tier: 2, 
        status: 'complete',
        message: `✓ Tier 2 Complete: Full analysis produced`,
        usage: analysisUsage
      });

      // Check budget after Tier 2
      const tier2Cost = parseFloat(analysisUsage.percentOfBudget.replace('%', '')) / 100 * this.budgetCap;
      if (tier1Cost + tier2Cost > this.budgetCap * 0.8) {
        throw new Error(`Tier 1+2 exceeded 80% budget: $${(tier1Cost + tier2Cost).toFixed(4)}`);
      }

      // ──────────────────────────────────────────────────────────────
      // TIER 3: DISTRIBUTION - Distribute to sections
      // ──────────────────────────────────────────────────────────────
      this.pipelineStatus = 'distributing';
      onProgress?.({ 
        tier: 3, 
        status: 'starting',
        message: 'Tier 3: Distributing to tables & tabs (Gemini)...'
      });

      this.distributions = await this.distributor.distributeToSections(
        this.analysis,
        targetSections,
        (progress) => {
          onProgress?.({ tier: 3, ...progress });
        }
      );

      const distributionUsage = this.distributor.getUsageSummary();
      onProgress?.({ 
        tier: 3, 
        status: 'complete',
        message: `✓ Tier 3 Complete: ${distributionUsage.successCount}/${distributionUsage.distributionCount} sections`,
        usage: distributionUsage
      });

      // ──────────────────────────────────────────────────────────────
      // PIPELINE COMPLETE - Summarize costs
      // ──────────────────────────────────────────────────────────────
      this.pipelineStatus = 'complete';
      
      const totalCost = tier1Cost + tier2Cost + parseFloat(distributionUsage.gemini.cost);
      const costPercent = ((totalCost / this.budgetCap) * 100).toFixed(1);

      this.usage = {
        tier1: extractionUsage,
        tier2: analysisUsage,
        tier3: distributionUsage,
        totalCost: totalCost.toFixed(4),
        percentOfBudget: costPercent + '%',
        costSavings: totalCost < 0.25 ? 'EXCELLENT' : totalCost < 0.50 ? 'GOOD' : 'FAIR'
      };

      onProgress?.({ 
        tier: 'complete', 
        status: 'pipeline-done',
        message: `✓ Pipeline Complete: $${totalCost.toFixed(4)} used (${costPercent}% of ${this.budgetCap} budget)`,
        summary: this.usage
      });

      return {
        success: true,
        summaries: this.summaries,
        analysis: this.analysis,
        distributions: this.distributions,
        usage: this.usage,
        totalCost: parseFloat(this.usage.totalCost)
      };

    } catch (error) {
      this.pipelineStatus = 'error';
      onProgress?.({ 
        tier: 'error', 
        status: 'failed',
        message: `Pipeline failed: ${error.message}`,
        error: error
      });
      throw error;
    }
  }

  /**
   * Get complete usage summary across all tiers
   */
  getFullUsageSummary() {
    return {
      status: this.pipelineStatus,
      usage: this.usage,
      tier1: this.extractor.getUsageSummary(),
      tier2: this.analyzer.getUsageSummary(),
      tier3: this.distributor.getUsageSummary(),
      totalTiers: 3
    };
  }

  /**
   * Reset pipeline for new document
   */
  reset() {
    this.extractor = new AIExtractionPipeline();
    this.analyzer = new OpusAnalyzer();
    this.distributor = new AIDistributionPipeline();
    this.usage = {};
    this.pipelineStatus = 'idle';
    this.summaries = null;
    this.analysis = null;
    this.distributions = null;
  }
}

export default ThreeTierPipelineOrchestrator;
