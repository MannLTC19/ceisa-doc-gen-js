import React, { useState, useEffect } from 'react';
import { Card, Spin, Button, Row, Col, Statistic, Progress, Tooltip, Timeline, Alert, Tag, Empty, Space } from 'antd';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Calendar, Users, DollarSign, Clock } from 'lucide-react';
import { runMonteCarloSimulation, generateExecutiveSummary, predictSupport, calculateProjectViability } from '../utils/aiSimulation';

/**
 * AI Simulation Component
 * 
 * Monte Carlo based project success probability analyzer
 * Shows:
 * - Overall viability score (0-100%)
 * - Risk profile and color coding
 * - Confidence intervals (5%, 25%, 50%, 75%, 95% percentiles)
 * - Monthly forecast for 12 months
 * - AI-powered recommendations
 * - Executive summary
 */
export const AISimulation = ({ projectData = {}, onClose = () => {} }) => {
  const [loading, setLoading] = useState(false);
  const [simResults, setSimResults] = useState(null);
  const [summary, setSummary] = useState(null);
  const [monthlyForecasts, setMonthlyForecasts] = useState([]);

  // Run simulation on component mount
  useEffect(() => {
    runSimulation();
  }, []);

  const runSimulation = async () => {
    setLoading(true);
    
    try {
      const results = await runMonteCarloSimulation(projectData, 8000, 12);
      setSimResults(results);
      setSummary(generateExecutiveSummary(projectData, results));
      setMonthlyForecasts(results.monthlyForecasts);
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card
        style={{
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1f2937',
          borderColor: '#374151',
        }}
      >
        <div style={{ textAlign: 'center', color: '#e5e7eb' }}>
          <Spin size="large" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 14, marginBottom: 8 }}>Menjalankan Monte Carlo Simulation...</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>
            Menganalisis {simResults ? `${simResults.simulations}` : '8,000'} skenario project
          </div>
        </div>
      </Card>
    );
  }

  if (!simResults || !summary) {
    return <Empty description="No simulation data" />;
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'LOW': return '#50cd89';
      case 'MODERATE': return '#ffc700';
      case 'HIGH': return '#ff9500';
      case 'CRITICAL': return '#f1416c';
      default: return '#3b82f6';
    }
  };

  const getConfidenceLevel = (score) => {
    if (score >= 80) return { label: 'Sangat Tinggi', color: '#50cd89' };
    if (score >= 65) return { label: 'Tinggi', color: '#ffc700' };
    if (score >= 50) return { label: 'Sedang', color: '#ff9500' };
    return { label: 'Rendah', color: '#f1416c' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Overall Viability Card */}
      <Card
        style={{
          background: `linear-gradient(135deg, ${simResults.riskProfile.color}15 0%, ${simResults.riskProfile.color}05 100%)`,
          borderColor: simResults.riskProfile.color,
          borderWidth: 2,
        }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Overall Viability</div>
              <Progress
                type="circle"
                percent={summary.overallViability}
                strokeColor={simResults.riskProfile.color}
                format={(percent) => (
                  <div style={{ fontSize: 24, fontWeight: 700, color: simResults.riskProfile.color }}>
                    {percent}%
                  </div>
                )}
                strokeWidth={4}
                width={80}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Risk Level</div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: simResults.riskProfile.color,
                  marginBottom: 4,
                }}
              >
                {simResults.riskProfile.level}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>
                {simResults.riskProfile.description}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#9ca3af' }}>Best Case (P95):</span>
                <span style={{ fontWeight: 600, color: '#50cd89' }}>
                  {summary.keyMetrics.bestCaseScenario}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#9ca3af' }}>Confidence Range (P25-P75):</span>
                <span style={{ fontWeight: 600, color: '#3b82f6' }}>
                  {summary.keyMetrics.confidenceRange}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#9ca3af' }}>Worst Case (P5):</span>
                <span style={{ fontWeight: 600, color: '#f1416c' }}>
                  {summary.keyMetrics.worstCaseScenario}
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            size="small"
            style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
          >
            <Statistic
              title={<span style={{ color: '#9ca3af', fontSize: 12 }}>6-Month Outlook</span>}
              value={summary.sixMonthOutlook}
              prefix={<TrendingUp size={16} />}
              valueStyle={{ color: '#3b82f6', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            size="small"
            style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
          >
            <Statistic
              title={<span style={{ color: '#9ca3af', fontSize: 12 }}>12-Month Outlook</span>}
              value={summary.twelveMonthOutlook}
              prefix={<Calendar size={16} />}
              valueStyle={{ color: '#ffc700', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            size="small"
            style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
          >
            <Statistic
              title={<span style={{ color: '#9ca3af', fontSize: 12 }}>Simulations Run</span>}
              value={simResults.simulations}
              prefix={<Target size={16} />}
              valueStyle={{ color: '#50cd89', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            size="small"
            style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
          >
            <Statistic
              title={<span style={{ color: '#9ca3af', fontSize: 12 }}>Mean Probability</span>}
              value={Math.round(simResults.confidenceIntervals.mean)}
              suffix="%"
              valueStyle={{ 
                color: simResults.confidenceIntervals.mean >= 70 ? '#50cd89' : '#ff9500', 
                fontSize: 18 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 12-Month Forecast */}
      <Card title="12-Month Success Probability Forecast" size="large">
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 16 }}>
            {monthlyForecasts.map((forecast) => (
              <Tooltip
                key={forecast.month}
                title={`Month ${forecast.month}: ${forecast.probability}% (±${100 - forecast.confidence}% uncertainty)`}
              >
                <div
                  style={{
                    flex: '1 1 60px',
                    minWidth: 60,
                    padding: 8,
                    backgroundColor: '#1f2937',
                    borderRadius: 6,
                    border: `2px solid ${
                      forecast.probability >= 80
                        ? '#50cd89'
                        : forecast.probability >= 65
                        ? '#ffc700'
                        : forecast.probability >= 50
                        ? '#ff9500'
                        : '#f1416c'
                    }`,
                    textAlign: 'center',
                    cursor: 'help',
                  }}
                >
                  <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>
                    M{forecast.month}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color:
                        forecast.probability >= 80
                          ? '#50cd89'
                          : forecast.probability >= 65
                          ? '#ffc700'
                          : forecast.probability >= 50
                          ? '#ff9500'
                          : '#f1416c',
                    }}
                  >
                    {forecast.probability}%
                  </div>
                  <div style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>
                    {forecast.trend === 'UP' ? '📈' : forecast.trend === 'DOWN' ? '📉' : '→'}
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
      </Card>

      {/* Critical Recommendations */}
      {summary.criticalRecommendations.length > 0 && (
        <Card title="🚨 Critical Recommendations" size="large" style={{ borderColor: '#ef4444' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {summary.criticalRecommendations.map((rec, idx) => (
              <Alert
                key={idx}
                message={rec.action}
                description={rec.detail}
                type="error"
                icon={<AlertTriangle size={16} />}
                showIcon
              />
            ))}
          </Space>
        </Card>
      )}

      {/* All Recommendations */}
      <Card title="📋 All AI Recommendations" size="large">
        <Timeline
          items={summary.allRecommendations.map((rec) => ({
            label: (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Tag
                  color={
                    rec.priority === 'HIGH'
                      ? 'red'
                      : rec.priority === 'MEDIUM'
                      ? 'orange'
                      : 'blue'
                  }
                >
                  {rec.priority}
                </Tag>
                <span style={{ color: '#9ca3af', fontSize: 12 }}>{rec.category}</span>
              </div>
            ),
            children: (
              <div style={{ color: '#e5e7eb' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{rec.action}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{rec.detail}</div>
              </div>
            ),
            dot:
              rec.priority === 'HIGH' ? (
                <AlertTriangle size={16} color="#f1416c" />
              ) : rec.priority === 'MEDIUM' ? (
                <TrendingUp size={16} color="#ffc700" />
              ) : (
                <CheckCircle size={16} color="#50cd89" />
              ),
          }))}
        />
      </Card>

      {/* Project Data Insights */}
      <Card title="📊 Project Data Snapshot" size="large">
        <Row gutter={[16, 16]}>
          {projectData.name && (
            <Col xs={24} sm={12}>
              <div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Project Name</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb' }}>
                  {projectData.name}
                </div>
              </div>
            </Col>
          )}
          {projectData.team_size && (
            <Col xs={24} sm={12}>
              <div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Team Size</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={14} /> {projectData.team_size} people
                </div>
              </div>
            </Col>
          )}
          {projectData.budget_estimate && (
            <Col xs={24} sm={12}>
              <div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Budget</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#50cd89', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <DollarSign size={14} /> IDR {(projectData.budget_estimate / 1000000).toFixed(1)}M
                </div>
              </div>
            </Col>
          )}
          {projectData.timeline_months && (
            <Col xs={24} sm={12}>
              <div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Timeline</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#ffc700', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} /> {projectData.timeline_months} months
                </div>
              </div>
            </Col>
          )}
        </Row>
      </Card>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button onClick={runSimulation}>Re-run Simulation</Button>
        <Button type="primary" onClick={onClose}>
          Close Analysis
        </Button>
      </div>

      {/* Metadata */}
      <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 8 }}>
        Simulation run at: {summary.timestamp} | Using Monte Carlo method with {simResults.simulations} iterations
      </div>
    </div>
  );
};

export default AISimulation;
