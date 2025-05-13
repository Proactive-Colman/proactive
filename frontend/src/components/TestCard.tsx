import React from 'react';
import { Card, Typography, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Test } from '../services/testService';

const { Title, Text } = Typography;

interface TestCardProps {
  test: Test;
  onEdit: (test: Test) => void;
  onDelete: (id: number) => void;
}

export const TestCard: React.FC<TestCardProps> = ({ test, onEdit, onDelete }) => {
  return (
    <Card
      style={{ width: 300, margin: '16px' }}
      actions={[
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => onEdit(test)}
          key="edit"
        >
          Edit
        </Button>,
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(test.id)}
          key="delete"
        >
          Delete
        </Button>,
      ]}
    >
      <Title level={4}>{test.name}</Title>
      <Text>{test.description}</Text>
    </Card>
  );
}; 