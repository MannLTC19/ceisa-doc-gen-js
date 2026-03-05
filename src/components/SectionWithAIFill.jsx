/**
 * Section Wrapper Component
 * 
 * Wraps each major section with:
 * - Section header
 * - AI Fill button (with token cost)
 * - Loading state
 * - Completion status
 */

import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { AIFillButton } from './AIFillButton';

export const SectionWithAIFill = ({
  sectionKey,
  title,
  icon: Icon,
  estimatedTokens,
  priority = 'medium',
  autoFill = false,
  currentCost = 0,
  budgetCap = 1.0,
  isLoading = false,
  isCompleted = false,
  onFill,
  disabled = false,
  children,
  showButton = true,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          {Icon && (
            <div style={{ color: '#0284c7', display: 'flex', alignItems: 'center' }}>
              <Icon size={18} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1e293b' }}>
              {title}
            </div>
            {autoFill && (
              <div
                style={{
                  fontSize: 11,
                  color: '#7c3aed',
                  marginTop: 2,
                  fontWeight: 500,
                }}
              >
                ⚡ Auto-priority: Will generate with document analysis
              </div>
            )}
          </div>
        </div>

        {/* BUTTON */}
        {showButton && (
          <div style={{ minWidth: 180 }}>
            <AIFillButton
              sectionKey={sectionKey}
              label={title}
              estimatedTokens={estimatedTokens}
              priority={priority}
              autoFill={autoFill}
              currentCost={currentCost}
              budgetCap={budgetCap}
              isLoading={isLoading}
              isCompleted={isCompleted}
              onFill={onFill}
              disabled={disabled}
            />
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div style={{ paddingLeft: 8 }}>
        {isLoading && (
          <div
            style={{
              padding: '16px',
              background: '#ecf0ff',
              border: '1px solid #bfdbfe',
              borderRadius: 4,
              color: '#1e3a8a',
              fontSize: 13,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <div style={{ animation: 'spin 1s linear infinite' }}>⚙️</div>
            Generating {title}... This may take a few seconds.
          </div>
        )}
        {isCompleted && !isLoading && (
          <div
            style={{
              padding: '12px 16px',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: 4,
              color: '#166534',
              fontSize: 12,
              display: 'flex',
              gap: 6,
              alignItems: 'center',
            }}
          >
            <CheckCircle2 size={16} />
            ✓ Data filled by AI analysis
          </div>
        )}
        {children}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SectionWithAIFill;
