import React, { useState } from 'react';
import { Button, Modal, Form, Input, Row, Col, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Test } from '../services/testService';
import { TestCard } from './TestCard';
import { useGetTests, useCreateTest, useUpdateTest, useDeleteTest } from '@/hooks/tests';

export const TestList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [form] = Form.useForm();

  const { isLoading, isError, data: tests, error } = useGetTests();
  const createMutation = useCreateTest();
  const updateMutation = useUpdateTest();
  const deleteMutation = useDeleteTest();

  const handleCreate = () => {
    setEditingTest(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (test: Test) => {
    setEditingTest(test);
    form.setFieldsValue(test);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = (values: Omit<Test, 'id'>) => {
    if (editingTest) {
      updateMutation.mutate({ id: editingTest.id, test: values });
    } else {
      createMutation.mutate(values);
    }
    setIsModalVisible(false);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: '24px', color: 'red' }}>
        Error: {error instanceof Error ? error.message : 'Failed to load tests'}
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      
      <Row gutter={[16, 16]}>
        {Array.isArray(tests) && tests.map((test: Test) => (
          <Col key={test.id}>
            <TestCard
              test={test}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Col>
        ))}
      </Row>

      <Modal
        title={editingTest ? 'Edit Test' : 'Create Test'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the test name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input the test description!' }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={createMutation.isLoading || updateMutation.isLoading}
            >
              {editingTest ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}; 