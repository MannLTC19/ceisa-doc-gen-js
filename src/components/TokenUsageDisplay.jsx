import React, { useMemo } from 'react';
import { Card, Row, Col, Progress, Statistic, Table, Tag, Tooltip, Badge, Divider } from 'antd';
import {
  DollarOutlined,
  ThunderboltOutlined,
  PercentageOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

/**
 * TokenUsageDisplay.jsx
 * 
 * Professional UI component untuk display token usage per dokumen
 * Menampilkan:
 * - Total penggunaan token (input/output)
 * - Biaya dalam USD dan IDR
 * - Breakdown per field dengan visual bars
 * - Efficiency metrics
 * - Budget alerts & recommendations
 */

const TokenUsageDisplay = ({ usageData, maxBudgetUSD = 0.01, isLoading = false }) => {
  const summary = useMemo(() => {
    if (!usageData) return null;
    
    if (usageData.getSummary) {
      return usageData.getSummary();
    }
    
    // Handle raw API response format from aiProcessor.js
    if (usageData.triage || usageData.analysis) {
      const input = (usageData.triage?.input_tokens || 0) + (usageData.analysis?.input_tokens || 0);
      const output = (usageData.triage?.output_tokens || 0) + (usageData.analysis?.output_tokens || 0);
      const total = input + output;
      
      // Build field summary from costEstimate
      const costEstimate = usageData.costEstimate || {
        haiku_input: input * 0.80 / 1_000_000,
        haiku_output: output * 4.0 / 1_000_000,
        total_usd: (input * 0.80 + output * 4.0) / 1_000_000
      };
      
      // Parse field breakdown
      const fieldSummary = [];
      if (usageData.fieldBreakdown) {
        Object.entries(usageData.fieldBreakdown).forEach(([field, tokens]) => {
          fieldSummary.push({
            field,
            tokens,
            cost: tokens * (0.80 + 4.0) / 2 / 1_000_000,
            percentage: ((tokens / total) * 100).toFixed(1)
          });
        });
      }
      fieldSummary.sort((a, b) => b.tokens - a.tokens);
      
      return {
        totalInputTokens: input,
        totalOutputTokens: output,
        totalTokens: total,
        totalCost: costEstimate.total_usd,
        passCount: 2,
        efficiency: { avgTokensPerPass: Math.round(total / 2), costPerKToken: (costEstimate.total_usd * 1000).toFixed(4) },
        fieldSummary,
        costBreakdown: costEstimate
      };
    }
    
    return null;
  }, [usageData]);

  if (!summary) {
    return (
      <Card loading={isLoading} style={{ marginTop: 16 }}>
        <p>Tidak ada data penggunaan token.</p>
      </Card>
    );
  }

  const costIDR = summary.totalCost * 15000; // Rough conversion rate
  const budgetIDR = maxBudgetUSD * 15000;
  const costPercent = Math.min(100, (summary.totalCost / maxBudgetUSD) * 100);
  const isOverBudget = summary.totalCost > maxBudgetUSD;
  const efficiency = ((maxBudgetUSD - summary.totalCost) / maxBudgetUSD * 100).toFixed(1);

  // Field breakdown table data
  const fieldTableData = (summary.fieldSummary || []).map((item, idx) => ({
    key: idx,
    field: item.field,
    tokens: item.tokens.toLocaleString('id-ID'),
    percentage: `${item.percentage}%`,
    cost: `$${(item.cost * 1000).toFixed(3)}`,
  }));

  // Priority indicators
  const priorityColors = {
    CRITICAL: 'red',
    HIGH: 'orange',
    MEDIUM: 'blue',
    BASIC: 'default'
  };

  return (
    <div style={{ marginTop: 24 }}>
      {/* MAIN METRICS ROW */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ textAlign: 'center' }}>
            <Statistic
              title="Total Tokens"
              value={summary.totalTokens}
              suffix="tok"
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
              Input: {summary.totalInputTokens.toLocaleString('id-ID')} | Output: {summary.totalOutputTokens.toLocaleString('id-ID')}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ textAlign: 'center' }}>
            <Statistic
              title="Total Cost"
              value={summary.totalCost}
              precision={4}
              prefix={<DollarOutlined />}
              valueStyle={{ color: isOverBudget ? '#ff4d4f' : '#52c41a' }}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
              ≈ Rp {costIDR.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ textAlign: 'center' }}>
            <Statistic
              title="Passes Completed"
              value={summary.passCount}
              suffix="x"
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
              Avg: {summary.efficiency.avgTokensPerPass?.toLocaleString('id-ID') || '—'} tok/pass
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ textAlign: 'center' }}>
            <Statistic
              title={isOverBudget ? '⚠️ OVER BUDGET' : 'Budget Remaining'}
              value={isOverBudget ? '—' : efficiency}
              suffix={isOverBudget ? '' : '%'}
              valueStyle={{ color: isOverBudget ? '#ff4d4f' : '#52c41a' }}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
              Budget: USD ${maxBudgetUSD.toFixed(4)}
            </div>
          </Card>
        </Col>
      </Row>

      {/* BUDGET PROGRESS BAR */}
      <Card style={{ marginBottom: 16 }}>
        <h4>Budget Utilization</h4>
        <div style={{ marginBottom: 12 }}>
          <Progress
            percent={costPercent}
            strokeColor={{
              '0%': '#108ee9',
              '100%': isOverBudget ? '#ff4d4f' : '#87d068',
            }}
            format={(percent) => `${percent.toFixed(1)}%`}
          />
        </div>
        <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
          <span>
            {isOverBudget ? (
              <Tag icon={<ExclamationCircleOutlined />} color="red">
                OVER BUDGET: ${(summary.totalCost - maxBudgetUSD).toFixed(4)}
              </Tag>
            ) : (
              <Tag icon={<CheckCircleOutlined />} color="green">
                Within Budget
              </Tag>
            )}
          </span>
          <span style={{ textAlign: 'right' }}>
            Cost: ${summary.totalCost.toFixed(4)} / Budget: ${maxBudgetUSD.toFixed(4)}
          </span>
        </div>
      </Card>

      {/* FIELD BREAKDOWN TABLE */}
      <Card title="Token Usage by Field (Priority Order)" style={{ marginBottom: 16 }}>
        <Table
          columns={[
            {
              title: 'Field',
              dataIndex: 'field',
              key: 'field',
              render: (text) => (<><FileTextOutlined style={{ marginRight: 8 }} />{text}</>),
              width: '40%'
            },
            {
              title: 'Tokens',
              dataIndex: 'tokens',
              key: 'tokens',
              align: 'right',
              width: '25%'
            },
            {
              title: '% Total',
              dataIndex: 'percentage',
              key: 'percentage',
              align: 'center',
              width: '15%',
              render: (text) => <Tag>{text}</Tag>
            },
            {
              title: 'Cost',
              dataIndex: 'cost',
              key: 'cost',
              align: 'right',
              width: '20%',
              render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
            }
          ]}
          dataSource={fieldTableData}
          pagination={false}
          size="small"
        />
      </Card>

      {/* VISUAL BAR CHART */}
      <Card title="Token Distribution (Visual)" style={{ marginBottom: 16 }}>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {(summary.fieldSummary || []).map((item, idx) => {
            const percentage = parseFloat(item.percentage);
            const barColor = percentage > 20 ? '#1890ff' : percentage > 10 ? '#13c2c2' : '#52c41a';
            
            return (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>{item.field}</span>
                  <span>{item.tokens.toLocaleString()} ({item.percentage}%)</span>
                </div>
                <div style={{
                  width: '100%',
                  background: '#f0f0f0',
                  borderRadius: 4,
                  overflow: 'hidden',
                  height: 24
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    background: barColor,
                    height: '100%',
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: percentage > 10 ? 'center' : 'flex-end',
                    paddingRight: percentage > 10 ? 0 : 8,
                    fontSize: '11px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {percentage > 8 && `${item.percentage}%`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* EFFICIENCY METRICS */}
      <Card title="Efficiency Metrics">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Avg Tokens/Pass"
              value={summary.efficiency.avgTokensPerPass || 0}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ fontSize: 14 }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Cost per 1K Tokens"
              value={(summary.efficiency.costPerKToken || 0).toFixed(4)}
              prefix="$"
              valueStyle={{ fontSize: 14 }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Total Document Cost"
              value={costIDR.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
              prefix="Rp"
              valueStyle={{ fontSize: 14 }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Recommendation"
              value={isOverBudget ? 'Reduce' : 'OK'}
              valueStyle={{ fontSize: 14, color: isOverBudget ? '#ff4d4f' : '#52c41a' }}
            />
          </Col>
        </Row>
      </Card>

      {/* OPTIMIZATION TIP */}
      <Card type="inner" style={{ marginTop: 16, background: '#fafafa', border: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <ThunderboltOutlined style={{ fontSize: 16, color: '#faad14', marginTop: 2 }} />
          <div>
            <b>Optimization Tips:</b>
            <ul style={{ marginBottom: 0, marginTop: 8, fontSize: '13px' }}>
              <li>Critical fields (Kebutuhan Functional, Use Cases, Actors) use 80% of tokens ✓</li>
              <li>Focus extraction quality on priority fields, reduce detail in secondary fields</li>
              <li>For documents over 100k chars, use triage pass to select relevant pages</li>
              <li>Split large documents (more than 100k chars) into multiple smaller analyses</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TokenUsageDisplay;
