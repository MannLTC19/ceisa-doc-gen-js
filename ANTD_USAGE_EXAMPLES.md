/**
 * USAGE EXAMPLES - Ant Design Components
 * 
 * Contoh-contoh praktis menggunakan Ant Design dengan theme Bea Cukai
 */

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 1: Basic Card with Content
// ═══════════════════════════════════════════════════════════════════════════

import { Card, Button, Space } from 'antd';
import { FileText, Plus, Delete } from 'lucide-react';

export function CardExample() {
  return (
    <Card
      title={<><FileText /> Informasi Proyek</>}
      extra={<Button type="primary" icon={<Plus />}>Tambah</Button>}
    >
      <p>Konten card Anda di sini</p>
      <Space>
        <Button type="primary">Simpan</Button>
        <Button>Batal</Button>
      </Space>
    </Card>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 2: Form with Multiple Fields
// ═══════════════════════════════════════════════════════════════════════════

import { Form, Input, Select, Button, Row, Col } from 'antd';

export function FormExample() {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log('Form values:', values);
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item label="Nama Proyek" name="nama" rules={[{ required: true }]}>
            <Input placeholder="Masukkan nama proyek..." />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="active">Aktif</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="completed">Selesai</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Deskripsi" name="description">
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Simpan Perubahan
        </Button>
      </Form.Item>
    </Form>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 3: Data Table
// ═══════════════════════════════════════════════════════════════════════════

import { Table, Tag, Button, Space, Modal, message } from 'antd';

export function TableExample() {
  const data = [
    {
      id: 1,
      name: 'CEISA Module A',
      status: 'active',
      progress: 85,
      date: '2026-03-05',
    },
    {
      id: 2,
      name: 'CEISA Module B',
      status: 'pending',
      progress: 45,
      date: '2026-03-10',
    },
    {
      id: 3,
      name: 'CEISA Module C',
      status: 'completed',
      progress: 100,
      date: '2026-02-20',
    },
  ];

  const columns = [
    {
      title: 'Nama Modul',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          active: 'green',
          pending: 'orange',
          completed: 'blue',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => `${progress}%`,
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">Edit</Button>
          <Button type="link" danger size="small">Delete</Button>
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" />;
}


// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 4: Modal with Form
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';

export function ModalFormExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Submitted:', values);
      message.success('Data berhasil disimpan!');
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('Terjadi kesalahan');
    }
  };

  return (
    <>
      <Button type="primary" onClick={() => setIsModalOpen(true)}>
        Buka Modal
      </Button>

      <Modal
        title="Form Input"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Simpan"
        cancelText="Batal"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Masukkan Teks"
            name="input"
            rules={[{ required: true, message: 'Wajib diisi' }]}
          >
            <Input placeholder="Teks Anda..." />
          </Form.Item>

          <Form.Item label="Catatan" name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 5: Tabs
// ═══════════════════════════════════════════════════════════════════════════

import { Tabs } from 'antd';
import { FileText, Settings, Users } from 'lucide-react';

export function TabsExample() {
  return (
    <Tabs
      items={[
        {
          key: '1',
          label: <>< FileText size={16} /> Kajian Kebutuhan</>,
          children: <div>Konten Tab 1</div>,
        },
        {
          key: '2',
          label: <>< Settings size={16} /> Konfigurasi</>,
          children: <div>Konten Tab 2</div>,
        },
        {
          key: '3',
          label: <>< Users size={16} /> Users</>,
          children: <div>Konten Tab 3</div>,
        },
      ]}
    />
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 6: Alert & Message
// ═══════════════════════════════════════════════════════════════════════════

import { Alert, Button, Space, message, notification } from 'antd';

export function AlertExample() {
  const showMessage = (type) => {
    message[type]('Ini adalah pesan ' + type);
  };

  const showNotification = () => {
    notification.open({
      message: 'Notifikasi Penting',
      description: 'Ini adalah deskripsi notifikasi yang lebih detail.',
      duration: 4.5,
    });
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Alert message="Pesan Sukses" type="success" />
      <Alert message="Pesan Warning" type="warning" />
      <Alert message="Pesan Error" type="error" />
      <Alert message="Pesan Info" type="info" />

      <Space>
        <Button onClick={() => showMessage('success')}>Success Message</Button>
        <Button onClick={() => showMessage('warning')}>Warning Message</Button>
        <Button onClick={() => showMessage('error')}>Error Message</Button>
        <Button onClick={showNotification}>Notification</Button>
      </Space>
    </Space>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 7: Collapse (Accordion)
// ═══════════════════════════════════════════════════════════════════════════

import { Collapse } from 'antd';

export function CollapseExample() {
  return (
    <Collapse
      items={[
        {
          key: '1',
          label: 'Bagian 1 - Kajian Kebutuhan',
          children: <p>Konten bagian 1...</p>,
        },
        {
          key: '2',
          label: 'Bagian 2 - Analisis Proses',
          children: <p>Konten bagian 2...</p>,
        },
        {
          key: '3',
          label: 'Bagian 3 - Desain Teknis',
          children: <p>Konten bagian 3...</p>,
        },
      ]}
    />
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 8: Using Custom Components
// ═══════════════════════════════════════════════════════════════════════════

import { 
  Card, 
  PrimaryButton, 
  TextInput, 
  StatusBadge, 
  PriorityBadge,
  FormGrid,
  FormGroup,
} from './AntdComponents';

export function CustomComponentsExample() {
  return (
    <Card title="Custom Components" icon={FileText}>
      <FormGrid columns={2}>
        <FormGroup label="Nama" required>
          <TextInput placeholder="Masukkan nama..." />
        </FormGroup>

        <FormGroup label="Email" required>
          <TextInput type="email" placeholder="Email..." />
        </FormGroup>

        <FormGroup label="Status">
          <StatusBadge type="success" status="Aktif" />
        </FormGroup>

        <FormGroup label="Prioritas">
          <PriorityBadge priority="High" />
        </FormGroup>
      </FormGrid>

      <div style={{ marginTop: 20 }}>
        <PrimaryButton type="primary">Simpan</PrimaryButton>
      </div>
    </Card>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 9: Responsive Layout
// ═══════════════════════════════════════════════════════════════════════════

import { Row, Col, Card, Space } from 'antd';

export function ResponsiveLayoutExample() {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card title="Column 1">Responsive content 1</Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card title="Column 2">Responsive content 2</Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card title="Column 3">Responsive content 3</Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card title="Main Content">Main area - 16/24 columns</Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Sidebar">Sidebar - 8/24 columns</Card>
        </Col>
      </Row>
    </Space>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 10: File Upload with OCR
// ═══════════════════════════════════════════════════════════════════════════

import { Card, Space, Alert } from 'antd';
import FileUploadWithOCR from './FileUploadWithOCR';

export function FileUploadExample() {
  const handleFileExtracted = (text, file, metadata) => {
    console.log('File extracted:', {
      fileName: metadata.fileName,
      text: text.substring(0, 100),
      quality: metadata.quality,
      method: metadata.extractionMethod,
    });
  };

  return (
    <Card title="Upload Document dengan OCR">
      <Alert
        message="Upload dokumen untuk OCR extraction"
        type="info"
        style={{ marginBottom: 16 }}
      />

      <FileUploadWithOCR
        label="Upload File (PDF, Gambar, Doc, Excel)"
        onFileExtracted={handleFileExtracted}
        enableOCR={true}
        qualityThreshold={50}
      />
    </Card>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// TIPS & BEST PRACTICES
// ═══════════════════════════════════════════════════════════════════════════

/*
✅ DO:

1. Use Ant Design components directly
   import { Button, Form, Table } from 'antd';

2. Leverage Space for consistent spacing
   <Space><Button>1</Button><Button>2</Button></Space>

3. Use responsive grid system
   <Row gutter={16}>
     <Col xs={24} md={12}>Content</Col>
   </Row>

4. Implement proper form validation
   rules={[{ required: true, message: 'Required' }]}

5. Use theme colors from tokens
   style={{ color: 'var(--bea-primary)' }}

6. Handle loading states
   <Button loading={isLoading}>Process</Button>

7. Confirm important actions
   <Popconfirm title="Are you sure?" onConfirm={handleDelete}>
     <Button danger>Delete</Button>
   </Popconfirm>


❌ DON'T:

1. Hardcode colors
   DON'T: style={{ color: '#1A428B' }}
   DO: style={{ color: 'var(--bea-primary)' }}

2. Mix custom CSS with Ant Design
   Avoid overriding Ant styles unnecessarily

3. Ignore responsive design
   Always use xs, sm, md, lg breakpoints

4. Create components when Ant has them
   Don't build your own button, use Button component

5. Forget accessibility
   Use proper labels, ARIA attributes, etc.

6. Forget loading states
   Always show loading feedback for async operations

7. Use inline styles for complex layouts
   Use Row/Col grid system instead
*/

export default {
  CardExample,
  FormExample,
  TableExample,
  ModalFormExample,
  TabsExample,
  AlertExample,
  CollapseExample,
  CustomComponentsExample,
  ResponsiveLayoutExample,
  FileUploadExample,
};
