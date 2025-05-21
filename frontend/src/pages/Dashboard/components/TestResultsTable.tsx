import { Table, ActionIcon, Group, Badge } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';

interface TestResultsTableProps {
  selectedTest: string | null;
  onEdit: (test: any) => void;
}

export function TestResultsTable({ selectedTest, onEdit }: TestResultsTableProps) {
  // TODO: Replace with actual data
  const mockData = [
    {
      id: '1',
      name: 'Test 1',
      status: 'success',
      executionTime: 1500,
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Test 2',
      status: 'failed',
      executionTime: 2000,
      timestamp: new Date().toISOString(),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Table striped highlightOnHover>
      <thead>
        <tr>
          <th>Test Name</th>
          <th>Status</th>
          <th>Execution Time</th>
          <th>Timestamp</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {mockData.map((test) => (
          <tr key={test.id}>
            <td>{test.name}</td>
            <td>
              <Badge color={getStatusColor(test.status)}>{test.status}</Badge>
            </td>
            <td>{test.executionTime}ms</td>
            <td>{new Date(test.timestamp).toLocaleString()}</td>
            <td>
              <Group gap={4}>
                <ActionIcon color="blue" onClick={() => onEdit(test)}>
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon color="red">
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
