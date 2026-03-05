/**
 * AI Fill Button Component
 * 
 * Provides "Fill with/by AI" button for each section with:
 * - Token cost preview
 * - Budget checking
 * - Loading states
 * - Error handling
 */

import React, { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle2, Loader2, DollarSign, Zap } from 'lucide-react';
import { Button, Tooltip, Spin, message } from 'antd';
import { TokenBudgetTracker } from '../utils/sectionAIFiller';

export const AIFillButton = ({
  sectionKey,
  label,
  estimatedTokens,
  priority,
  autoFill,
  currentCost,
  budgetCap = 1.0,
  isLoading = false,
  isCompleted = false,
  onFill,
  disabled = false,
  className = '',
}) => {
  const [showPreview, setShowPreview] = useState(false);

  // Calculate costs
  const sectionEstimate = TokenBudgetTracker.estimateSectionCost(sectionKey);
  const newTotalCost = currentCost + sectionEstimate.cost;
  const wouldExceedBudget = newTotalCost > budgetCap;
  const canGenerate = !disabled && !isCompleted && !wouldExceedBudget && !isLoading;

  // Cost formatting
  const formatUSD = (num) => `$${num.toFixed(4)}`;
  const formatTokens = (num) => `${Math.round(num).toLocaleString()} tok`;

  // Priority styling
  const priorityStyles = {
    critical: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    high: { bg: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
    medium: { bg: '#f3e8ff', border: '#a855f7', text: '#5b21b5' },
  };

  const style = priorityStyles[priority] || priorityStyles.medium;

  // Status badge
  const StatusBadge = () => {
    if (isCompleted) {
      return <span style={{ color: '#059669', fontSize: 12, fontWeight: 600 }}>✓ Filled</span>;
    }
    if (autoFill && !isCompleted) {
      return <span style={{ color: '#7c3aed', fontSize: 12, fontWeight: 600 }}>⚡ Auto Priority</span>;
    }
    if (wouldExceedBudget) {
      return <span style={{ color: '#dc2626', fontSize: 12, fontWeight: 600 }}>⚠️ Over Budget</span>;
    }
    return null;
  };

  // Tooltip content
  const tooltipContent = wouldExceedBudget ? (
    <div style={{ fontSize: 12 }}>
      <strong>Budget Limit Exceeded</strong>
      <div>Current: {formatUSD(currentCost)}</div>
      <div>+ This section: {formatUSD(sectionEstimate.cost)}</div>
      <div>= Total: {formatUSD(newTotalCost)} (limit: {formatUSD(budgetCap)})</div>
    </div>
  ) : (
    <div style={{ fontSize: 12 }}>
      <div><strong>{label}</strong></div>
      <div style={{ marginTop: 6, borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: 4 }}>
        <div>Input: ~1,000 tokens</div>
        <div>Output: ~{Math.round(sectionEstimate.breakdown.outputTokens)} tokens</div>
        <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <strong>Est. cost: {formatUSD(sectionEstimate.cost)}</strong>
        </div>
        <div style={{ marginTop: 4 }}>Current: {formatUSD(currentCost)}</div>
        <div>After: {formatUSD(newTotalCost)}</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ flex: 1 }}>
        <Tooltip title={tooltipContent} color={wouldExceedBudget ? '#dc2626' : '#1e40af'}>
          <Button
            onClick={() => onFill?.(sectionKey)}
            disabled={!canGenerate}
            loading={isLoading}
            type={isCompleted ? 'default' : 'primary'}
            size="small"
            icon={isCompleted ? <CheckCircle2 size={14} /> : <Sparkles size={14} />}
            className={className}
            style={{
              width: '100%',
              background: isCompleted ? '#ecfdf5' : wouldExceedBudget ? '#fee2e2' : undefined,
              borderColor: isCompleted ? '#10b981' : wouldExceedBudget ? '#ef4444' : undefined,
              color: isCompleted ? '#059669' : wouldExceedBudget ? '#dc2626' : undefined,
            }}
          >
            {isLoading ? 'Generating...' : isCompleted ? 'Filled' : 'Fill with AI'}
          </Button>
        </Tooltip>
      </div>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 11, color: '#64748b' }}>
        {wouldExceedBudget && <AlertCircle size={14} color="#dc2626" />}
        {isCompleted && <CheckCircle2 size={14} color="#10b981" />}
        <span title={`Est. ${formatTokens(sectionEstimate.tokens)}`}>
          {formatUSD(sectionEstimate.cost)}
        </span>
      </div>

      {StatusBadge() && (
        <StatusBadge />
      )}
    </div>
  );
};

export default AIFillButton;
