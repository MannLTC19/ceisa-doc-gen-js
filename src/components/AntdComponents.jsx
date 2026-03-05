/**
 * antdComponents.js - Ant Design wrapper components
 * Common components styled with Bea Cukai theme
 */

import React from 'react';
import {
  Card as AntCard,
  Button as AntButton,
  Form as AntForm,
  Input as AntInput,
  Select as AntSelect,
  Table as AntTable,
  Modal as AntModal,
  Alert as AntAlert,
  Tabs as AntTabs,
  Collapse as AntCollapse,
  Divider as AntDivider,
  Row,
  Col,
  Space,
  Badge,
  Tag,
  Empty,
} from 'antd';

/**
 * Card with Bea Cukai styling
 */
export const Card = ({ title, icon: Icon, children, ...props }) => (
  <AntCard
    {...props}
    title={
      title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 600 }}>
          {Icon && <Icon size={20} style={{ color: '#1A428B' }} />}
          {title}
        </div>
      )
    }
    style={{
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
      borderRadius: 8,
      ...props.style,
    }}
  >
    {children}
  </AntCard>
);

/**
 * Button variants
 */
export const PrimaryButton = (props) => (
  <AntButton type="primary" {...props} />
);

export const SecondaryButton = (props) => (
  <AntButton {...props} />
);

export const DangerButton = (props) => (
  <AntButton danger {...props} />
);

export const SuccessButton = (props) => (
  <AntButton type="primary" {...props} style={{ background: '#22C55E', ...props.style }} />
);

/**
 * Form components
 */
export const FormGroup = ({ label, required, children, error, layout = 'vertical', ...props }) => (
  <AntForm.Item
    label={label}
    required={required}
    tooltip={error ? { title: error, color: 'red' } : undefined}
    {...props}
  >
    {children}
  </AntForm.Item>
);

export const TextInput = (props) => (
  <AntInput
    {...props}
    style={{
      borderRadius: 6,
      ...props.style,
    }}
  />
);

export const TextArea = (props) => (
  <AntInput.TextArea
    {...props}
    style={{
      borderRadius: 6,
      ...props.style,
    }}
  />
);

export const SelectInput = (props) => (
  <AntSelect
    {...props}
    style={{
      borderRadius: 6,
      ...props.style,
    }}
  />
);

/**
 * Status Badge
 */
export const StatusBadge = ({ status, type = 'default' }) => {
  const statusConfig = {
    success: { color: '#22C55E', text: 'Berhasil' },
    warning: { color: '#F59E0B', text: 'Peringatan' },
    error: { color: '#EF4444', text: 'Gagal' },
    info: { color: '#06B6D4', text: 'Informasi' },
    default: { color: '#9CA3AF', text: 'Belum Set' },
  };

  const config = statusConfig[type] || statusConfig.default;

  return (
    <Tag
      color={config.color}
      style={{
        borderRadius: 4,
        padding: '4px 12px',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {status || config.text}
    </Tag>
  );
};

/**
 * Priority Badge
 */
export const PriorityBadge = ({ priority = 'Medium' }) => {
  const priorityConfig = {
    High: { color: '#EF4444', text: 'Tinggi' },
    Medium: { color: '#F59E0B', text: 'Menengah' },
    Low: { color: '#22C55E', text: 'Rendah' },
    Mandatory: { color: '#1A428B', text: 'Wajib' },
  };

  const config = priorityConfig[priority] || priorityConfig.Medium;

  return (
    <Tag color={config.color} style={{ borderRadius: 4, padding: '4px 12px' }}>
      {config.text}
    </Tag>
  );
};

/**
 * Section Divider
 */
export const SectionDivider = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1F2937' }}>
      {title}
    </h3>
    {children}
  </div>
);

/**
 * Form Grid Layout
 */
export const FormGrid = ({ columns = 2, children }) => (
  <Row gutter={[16, 16]}>
    {React.Children.map(children, (child) => (
      <Col xs={24} sm={24} md={24 / columns} key={child?.key}>
        {child}
      </Col>
    ))}
  </Row>
);

/**
 * Info Alert
 */
export const InfoAlert = ({ message, description, type = 'info' }) => (
  <AntAlert
    message={message}
    description={description}
    type={type}
    style={{ borderRadius: 6, marginBottom: 16 }}
  />
);

/**
 * Table wrapper
 */
export const DataTable = ({ columns, dataSource, rowKey, ...props }) => (
  <AntTable
    columns={columns}
    dataSource={dataSource}
    rowKey={rowKey}
    pagination={{ pageSize: 10, showSizeChanger: true }}
    style={{ borderRadius: 6 }}
    {...props}
  />
);

export default {
  Card,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  SuccessButton,
  FormGroup,
  TextInput,
  TextArea,
  SelectInput,
  StatusBadge,
  PriorityBadge,
  SectionDivider,
  FormGrid,
  InfoAlert,
  DataTable,
};
