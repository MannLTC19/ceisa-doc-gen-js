/**
 * Token Budget Monitor Component
 * 
 * Displays:
 * - Total token usage
 * - Budget remaining ($1 cap)
 * - Per-section breakdown
 * - Visual progress indicator
 * - Warnings and alerts
 */

import React, { useMemo } from 'react';
import { AlertCircle, CheckCircle2, DollarSign, Zap, TrendingUp } from 'lucide-react';
import { Progress, Card, Statistic, Row, Col, Tag, Alert, Table } from 'antd';

export const TokenBudgetMonitor = ({
  totalCost = 0,
  totalTokens = 0,
  budgetCap = 1.0,
  sectionBreakdown = {},
  autoFillSections = [],
  filledSections = [],
  showDetails = false,
}) => {
  // Calculate metrics
  const metrics = useMemo(() => {
    const remaining = budgetCap - totalCost;
    const percentUsed = (totalCost / budgetCap) * 100;
    const isOverBudget = totalCost > budgetCap;
    const isNearLimit = percentUsed > 80;

    // Convert to IDR (1 USD ≈ 16,000 IDR)
    const idr = totalCost * 16_000;
    const idrBudget = budgetCap * 16_000;
    const idrRemaining = remaining * 16_000;

    return {
      remaining,
      percentUsed,
      isOverBudget,
      isNearLimit,
      idr,
      idrBudget,
      idrRemaining,
    };
  }, [totalCost, budgetCap]);

  // Build section breakdown table data
  const sectionTableData = useMemo(() => {
    if (!showDetails || Object.keys(sectionBreakdown).length === 0) return [];

    return Object.entries(sectionBreakdown).map(([section, breakdown], idx) => ({
      key: idx,
      section: section.split('.')[1] || section,
      tokens: breakdown.totalTokens,
      cost: breakdown.totalCost,
      status: filledSections.includes(section) ? 'Filled' : 'Pending',
      priority: autoFillSections.includes(section) ? '⚡ Auto' : '👥 Manual',
    }));
  }, [sectionBreakdown, filledSections, autoFillSections, showDetails]);

  // Color based on usage
  const getProgressColor = () => {
    if (metrics.isOverBudget) return '#ef4444';
    if (metrics.percentUsed > 80) return '#f59e0b';
    if (metrics.percentUsed > 50) return '#3b82f6';
    return '#10b981';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* HEADER ALERT */}
      {metrics.isOverBudget && (
        <Alert
          message="❌ Budget Exceeded"
          description={`Total cost (${formatUSD(metrics.totalCost)}) exceeds budget cap (${formatUSD(budgetCap)}). Add new sections will be blocked.`}
          type="error"
          icon={<AlertCircle />}
          showIcon
        />
      )}

      {metrics.isNearLimit && !metrics.isOverBudget && (
        <Alert
          message="⚠️ Budget Limit Approaching"
          description={`${metrics.percentUsed.toFixed(1)}% of budget used. Only ${formatUSD(metrics.remaining)} remaining.`}
          type="warning"
          icon={<AlertCircle />}
          showIcon
        />
      )}

      {/* MAIN METRICS */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderColor: getProgressColor(), borderWidth: 2 }}>
            <Statistic
              title="Total Cost"
              value={formatUSD(metrics.totalCost)}
              prefix={<DollarSign size={16} />}
              suffix={` / ${formatUSD(budgetCap)}`}
              valueStyle={{ color: getProgressColor(), fontSize: 20, fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Total Tokens"
              value={Math.round(metrics.totalTokens).toLocaleString()}
              suffix=" tok"
              prefix={<Zap size={16} />}
              valueStyle={{ fontSize: 18, fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Budget Remaining"
              value={metrics.isOverBudget ? '—' : formatUSD(metrics.remaining)}
              valueStyle={{
                color: metrics.isOverBudget ? '#ef4444' : '#10b981',
                fontSize: 18,
                fontWeight: 700,
              }}
            />
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
              ≈ Rp {(metrics.idrRemaining).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Usage"
              value={metrics.percentUsed.toFixed(1)}
              suffix="%"
              valueStyle={{
                color: getProgressColor(),
                fontSize: 18,
                fontWeight: 700,
              }}
            />
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
              {filledSections.length} sections filled
            </div>
          </Card>
        </Col>
      </Row>

      {/* PROGRESS BAR */}
      <Card>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Budget Utilization</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {formatUSD(metrics.totalCost)} / {formatUSD(budgetCap)}
            </span>
          </div>

          <Progress
            percent={Math.min(100, metrics.percentUsed)}
            strokeColor={getProgressColor()}
            format={(percent) => `${percent.toFixed(1)}%`}
          />
        </div>

        {metrics.isOverBudget && (
          <div style={{
            marginTop: 12,
            padding: '8px 12px',
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: 4,
            fontSize: 12,
            color: '#991b1b',
          }}>
            💰 Over by: {formatUSD(metrics.totalCost - budgetCap)}
          </div>
        )}

        {metrics.isNearLimit && !metrics.isOverBudget && (
          <div style={{
            marginTop: 12,
            padding: '8px 12px',
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: 4,
            fontSize: 12,
            color: '#92400e',
          }}>
            ⚡ Safe zone remaining: {formatUSD(metrics.remaining)}
          </div>
        )}
      </Card>

      {/* SECTION BREAKDOWN (Optional) */}
      {showDetails && sectionTableData.length > 0 && (
        <Card title="Section Breakdown" size="small">
          <Table
            columns={[
              { title: 'Section', dataIndex: 'section', key: 'section' },
              {
                title: 'Tokens',
                dataIndex: 'tokens',
                key: 'tokens',
                align: 'right',
                render: (num) => num.toLocaleString(),
              },
              {
                title: 'Cost',
                dataIndex: 'cost',
                key: 'cost',
                align: 'right',
                render: (num) => formatUSD(num),
              },
              {
                title: 'Priority',
                dataIndex: 'priority',
                key: 'priority',
                render: (text) => <Tag>{text}</Tag>,
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (text) => (
                  <Tag color={text === 'Filled' ? 'green' : 'default'}>
                    {text === 'Filled' ? '✓' : '○'} {text}
                  </Tag>
                ),
              },
            ]}
            dataSource={sectionTableData}
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* INFO BOX */}
      <Card style={{ background: '#f0f9ff', borderColor: '#0284c7' }}>
        <div style={{ fontSize: 12, color: '#0c4a6e', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>💡 Budget Info:</div>
          <div>• <strong>Hard Limit:</strong> {formatUSD(budgetCap)} per document</div>
          <div>• <strong>Auto-Priority:</strong> Penelitian, BRD, FSD tabs generate automatically</div>
          <div>• <strong>Optional:</strong> Charter &amp; Kajian tabs require "Fill with AI" button click</div>
          <div>• <strong>Generation blocked:</strong> When total would exceed {formatUSD(budgetCap)}</div>
        </div>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITY FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

function formatUSD(num) {
  return `$${num.toFixed(4)}`;
}

export default TokenBudgetMonitor;
