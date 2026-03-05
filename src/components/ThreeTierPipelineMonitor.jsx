import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, CheckCircle, AlertCircle, Loader } from 'lucide-react';

/**
 * ThreeTierPipelineMonitor
 * 
 * Real-time display of 3-tier pipeline progress:
 * - Tier 1 (Extraction): Haiku + Gemini summaries
 * - Tier 2 (Analysis): Opus deep analysis
 * - Tier 3 (Distribution): Results to tables/tabs
 */
export default function ThreeTierPipelineMonitor({ onProgress, isActive = false }) {
  const [tier1, setTier1] = useState({
    status: 'idle',
    message: 'Menunggu extract...',
    summaryCount: 0,
    usage: null
  });
  const [tier2, setTier2] = useState({
    status: 'idle',
    message: 'Menunggu analisis...',
    usage: null
  });
  const [tier3, setTier3] = useState({
    status: 'idle',
    message: 'Menunggu distribusi...',
    distributionCount: 0,
    successCount: 0,
    usage: null
  });
  const [totalCost, setTotalCost] = useState(0);
  const [costPercent, setCostPercent] = useState(0);

  /**
   * Listen to progress updates from orchestrator
   */
  useEffect(() => {
    const handleProgress = (data) => {
      if (data.tier === 1) {
        setTier1({
          status: data.status,
          message: data.message,
          summaryCount: data.summaryCount || 0,
          usage: data.usage
        });
      } else if (data.tier === 2) {
        setTier2({
          status: data.status,
          message: data.message,
          usage: data.usage
        });
      } else if (data.tier === 3) {
        setTier3({
          status: data.status,
          message: data.message,
          distributionCount: data.distributionCount || 0,
          successCount: data.successCount || 0,
          usage: data.usage
        });
      } else if (data.tier === 'complete') {
        if (data.summary) {
          setTotalCost(parseFloat(data.summary.totalCost));
          setCostPercent(parseFloat(data.summary.percentOfBudget));
        }
      }
    };

    if (onProgress) {
      window.addEventListener('threeTierProgress', (e) => handleProgress(e.detail));
      return () => window.removeEventListener('threeTierProgress', handleProgress);
    }
  }, [onProgress]);

  const TierBox = ({ tier, number, haiku = false, gemini = false, opus = false }) => {
    const getStatusColor = () => {
      if (tier.status === 'idle') return 'bg-slate-600';
      if (tier.status === 'starting' || tier.status === 'extracting' || tier.status === 'analyzing' || tier.status === 'distributing') return 'bg-blue-500';
      if (tier.status === 'complete' || tier.status === 'extracted' || tier.status === 'analyzed' || tier.status === 'distributed') return 'bg-green-500';
      if (tier.status === 'error') return 'bg-red-500';
      return 'bg-slate-500';
    };

    const getStatusIcon = () => {
      if (tier.status === 'idle') return '⏳';
      if (tier.status === 'starting' || tier.status === 'extracting' || tier.status === 'analyzing' || tier.status === 'distributing') return '🔄';
      if (tier.status === 'complete' || tier.status === 'extracted' || tier.status === 'analyzed' || tier.status === 'distributed') return '✅';
      if (tier.status === 'error') return '❌';
      return '⚙️';
    };

    return (
      <div className="rounded-lg border-2 border-slate-700 bg-slate-900 p-4 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-white">
              {getStatusIcon()} Tier {number}: {haiku ? 'Extraction (Haiku+Gemini)' : opus ? 'Analysis (Opus)' : 'Distribution (Gemini)'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{tier.message}</p>
          </div>
          <div className={`${getStatusColor()} rounded px-2 py-1 text-xs font-bold text-white`}>
            {tier.status.toUpperCase()}
          </div>
        </div>

        {/* Tier 1 Details */}
        {haiku && tier.summaryCount > 0 && (
          <div className="mt-2 text-xs text-slate-300">
            📊 Extracted: {tier.summaryCount} summaries
            {tier.usage && (
              <>
                <br />
                🎯 Haiku: {tier.usage.haiku.inputTokens.toLocaleString()} tokens
                ({tier.usage.haiku.percentOfBudget})
                <br />
                🌈 Gemini: {tier.usage.gemini.inputTokens.toLocaleString()} tokens
                ({tier.usage.gemini.percentOfBudget})
                <br />
                💰 Cost: ${tier.usage.extractionCost}
              </>
            )}
          </div>
        )}

        {/* Tier 2 Details */}
        {opus && tier.usage && (
          <div className="mt-2 text-xs text-slate-300">
            🧠 Opus Analysis:
            <br />
            💬 Input: {tier.usage.inputTokens.toLocaleString()} tokens
            <br />
            📤 Output: {tier.usage.outputTokens.toLocaleString()} tokens
            <br />
            💰 Cost: ${tier.usage.cost.toFixed(4)} ({tier.usage.percentOfBudget})
          </div>
        )}

        {/* Tier 3 Details */}
        {!haiku && !opus && tier.distributionCount > 0 && (
          <div className="mt-2 text-xs text-slate-300">
            📋 Distribution:
            <br />
            ✓ Success: {tier.successCount}/{tier.distributionCount} sections
            {tier.usage && (
              <>
                <br />
                💰 Cost: ${tier.usage.gemini.cost} ({tier.usage.gemini.percentOfBudget})
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-lg border-2 border-indigo-500 bg-slate-800/50 p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-indigo-400" />
        <h2 className="text-sm font-bold text-white">Three-Tier AI Pipeline</h2>
        {isActive && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">ACTIVE</span>}
      </div>

      {/* Tier 1 - Extraction */}
      <TierBox tier={tier1} number={1} haiku={true} />

      {/* Tier 2 - Analysis */}
      <TierBox tier={tier2} number={2} opus={true} />

      {/* Tier 3 - Distribution */}
      <TierBox tier={tier3} number={3} />

      {/* Total Cost Bar */}
      {totalCost > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-bold text-white">Total Pipeline Cost</span>
            <span className={`text-xs font-bold ${costPercent > 80 ? 'text-red-400' : 'text-green-400'}`}>
              ${totalCost.toFixed(4)} ({costPercent}% of $1.00)
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                costPercent > 80 ? 'bg-red-500' : costPercent > 50 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(costPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            💡 Three-tier optimization: Cheap extraction → Focused analysis → Fast distribution
          </p>
        </div>
      )}
    </div>
  );
}
