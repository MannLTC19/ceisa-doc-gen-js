/**
 * AI Model Monitor Component
 * 
 * Displays:
 * - Active AI models (Opus/Gemini with status)
 * - Real-time token usage per model
 * - Cost tracking ($X of $1.00)
 * - Cascade events (when fallback to counter-AI triggered)
 * - Model usage distribution pie chart
 */

import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Progress, Tag, Timeline, Badge, Space, Tooltip, Alert } from 'antd';
import { Cpu, Zap, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export const AIModelMonitor = ({ 
  usageSummary = {
    opus: { cost: 0, calls: 0, percentOfBudget: '0%' },
    gemini: { cost: 0, calls: 0, percentOfBudget: '0%' },
    total: { cost: '0', remaining: '1.00', percentUsed: '0%' },
    cascadeEvents: 0,
    cascadeLog: []
  }
}) => {
  const budgetCap = 1.0;
  const totalSpent = parseFloat(usageSummary.total.cost);
  const isNearLimit = totalSpent > budgetCap * 0.8;
  const isExceeded = totalSpent >= budgetCap;

  const opusSpent = usageSummary.opus.cost || 0;
  const geminiSpent = usageSummary.gemini.cost || 0;
  
  const opusPercent = opusSpent > 0 ? (opusSpent / budgetCap) * 100 : 0;
  const geminiPercent = geminiSpent > 0 ? (geminiSpent / budgetCap) * 100 : 0;
  
  const statusColor = (percentage) => {
    if (percentage < 50) return '#10b981';  // Green
    if (percentage < 70) return '#3b82f6';  // Blue
    if (percentage < 85) return '#f59e0b';  // Orange
    return '#ef4444';                        // Red
  };

  const modelStatus = (model) => {
    const percentage = model === 'opus' 
      ? (opusSpent / budgetCap) * 100 
      : (geminiSpent / budgetCap) * 100;
    
    if (percentage < 50) return { status: 'ok', label: 'Ready', color: '#10b981' };
    if (percentage < 75) return { status: 'warning', label: 'Limited', color: '#f59e0b' };
    return { status: 'critical', label: 'Limited', color: '#ef4444' };
  };

  return (
    <div style={{ padding: '12px', backgroundColor: '#1f2937', borderRadius: '8px' }}>
      {/* Budget Alert */}
      {isExceeded ? (
        <Alert
          message="⚠️ Budget Exceeded"
          description={`Total cost: $${totalSpent.toFixed(4)} / $${budgetCap.toFixed(2)} - No more AI generations allowed`}
          type="error"
          showIcon
          style={{ marginBottom: 12 }}
        />
      ) : isNearLimit ? (
        <Alert
          message="⚠️ Approaching Budget Limit"
          description={`${(100 - parseFloat(usageSummary.total.percentUsed)).toFixed(1)}% remaining`}
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
        />
      ) : null}

      {/* Main Metrics Row */}
      <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
        {/* Total Spent */}
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ backgroundColor: '#111827', borderColor: '#374151' }}>
            <Tooltip title="Total cost from both AI models">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Total Spent</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: statusColor(parseFloat(usageSummary.total.percentUsed)) }}>
                    ${totalSpent.toFixed(4)}
                  </div>
                </div>
                <Zap size={20} style={{ color: statusColor(parseFloat(usageSummary.total.percentUsed)) }} />
              </div>
            </Tooltip>
          </Card>
        </Col>

        {/* Remaining Budget */}
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ backgroundColor: '#111827', borderColor: '#374151' }}>
            <Tooltip title={`${usageSummary.total.remaining} / $${budgetCap.toFixed(2)}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Remaining</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#10b981' }}>
                    ${usageSummary.total.remaining}
                  </div>
                </div>
                <TrendingUp size={20} style={{ color: '#10b981' }} />
              </div>
            </Tooltip>
          </Card>
        </Col>

        {/* Opus Status */}
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ backgroundColor: '#111827', borderColor: '#374151' }}>
            <Tooltip title={`${usageSummary.opus.calls} calls | $${opusSpent.toFixed(4)} spent`}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Cpu size={14} style={{ color: '#8b5cf6' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#8b5cf6' }}>Claude Opus</span>
                  <Tag color={modelStatus('opus').color} style={{ fontSize: 10 }}>
                    {modelStatus('opus').label}
                  </Tag>
                </div>
                <Progress 
                  percent={Math.min(100, opusPercent)} 
                  strokeColor="#8b5cf6"
                  size="small"
                  format={() => `${opusPercent.toFixed(0)}%`}
                />
              </div>
            </Tooltip>
          </Card>
        </Col>

        {/* Gemini Status */}
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ backgroundColor: '#111827', borderColor: '#374151' }}>
            <Tooltip title={`${usageSummary.gemini.calls} calls | $${geminiSpent.toFixed(4)} spent`}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Cpu size={14} style={{ color: '#ec4899' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#ec4899' }}>Google Gemini</span>
                  <Tag color={modelStatus('gemini').color} style={{ fontSize: 10 }}>
                    {modelStatus('gemini').label}
                  </Tag>
                </div>
                <Progress 
                  percent={Math.min(100, geminiPercent)} 
                  strokeColor="#ec4899"
                  size="small"
                  format={() => `${geminiPercent.toFixed(0)}%`}
                />
              </div>
            </Tooltip>
          </Card>
        </Col>
      </Row>

      {/* Overall Budget Bar */}
      <Card size="small" style={{ backgroundColor: '#111827', borderColor: '#374151', marginBottom: 12 }}>
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#d1d5db' }}>Budget Usage</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: statusColor(parseFloat(usageSummary.total.percentUsed)) }}>
            {usageSummary.total.percentUsed}
          </span>
        </div>
        <Progress 
          percent={Math.min(100, parseFloat(usageSummary.total.percentUsed))} 
          strokeColor={statusColor(parseFloat(usageSummary.total.percentUsed))}
          format={() => null}
        />
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>
          Budget: $0.00 / $1.00 → Remaining: ${usageSummary.total.remaining}
        </div>
      </Card>

      {/* Cascade Events */}
      {usageSummary.cascadeEvents > 0 ? (
        <Card 
          size="small" 
          style={{ backgroundColor: '#111827', borderColor: '#f59e0b', borderWidth: '1px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>
              {usageSummary.cascadeEvents} Cascade Event{usageSummary.cascadeEvents !== 1 ? 's' : ''} Triggered
            </span>
          </div>
          
          {usageSummary.cascadeLog?.length > 0 && (
            <Timeline 
              items={usageSummary.cascadeLog.map((event, idx) => ({
                dot: <Zap size={12} style={{ color: '#f59e0b', marginTop: 4 }} />,
                children: (
                  <div style={{ fontSize: 11, color: '#d1d5db' }}>
                    <div style={{ fontWeight: 600 }}>{event.section}</div>
                    <div style={{ color: '#9ca3af', fontSize: 10 }}>{event.cascade}</div>
                    <div style={{ color: '#6b7280', fontSize: 10 }}>
                      {new Date(event.timestamp).toLocaleTimeString('id-ID')}
                    </div>
                  </div>
                )
              }))}
            />
          )}
        </Card>
      ) : (
        <Card size="small" style={{ backgroundColor: '#111827', borderColor: '#374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 12 }}>
            <CheckCircle size={14} />
            <span>No cascade events - Both AIs operating normally</span>
          </div>
        </Card>
      )}

      {/* Info Box */}
      <div style={{ 
        fontSize: 11, 
        color: '#9ca3af', 
        marginTop: 12,
        padding: 8,
        backgroundColor: 'rgba(26, 66, 139, 0.1)',
        borderRadius: 4,
        borderLeft: '2px solid #1a428b'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6, color: '#60a5fa' }}>📊 Dual AI Strategy</div>
        <div><strong>🧠 Claude Opus:</strong> Deep analysis - UAW, UUCW, functional requirements, risk analysis</div>
        <div><strong>⚡ Google Gemini:</strong> Structured data - diagrams, tables, metrics, process flows</div>
        <div style={{ marginTop: 6 }}><strong>Cascade:</strong> If primary AI budget exceeded, automatically switches to counter-AI</div>
      </div>
    </div>
  );
};

export default AIModelMonitor;
