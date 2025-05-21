import { useEffect, useState } from 'react';
import { Paper, Text, Group, Select } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  data: any[];
  selectedTests: string[];
}

export function LineChart({ data, selectedTests }: LineChartProps) {
  const [metric, setMetric] = useState('executionTime');
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    // TODO: Transform data for chart
    const transformedData = {
      labels: data.map((d) => new Date(d.timestamp).toLocaleDateString()),
      datasets: selectedTests.map((testId) => ({
        label: `Test ${testId}`,
        data: data.filter((d) => d.testId === testId).map((d) => d[metric]),
        borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
        tension: 0.4,
      })),
    };

    setChartData(transformedData);
  }, [data, selectedTests, metric]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Test Performance Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: metric === 'executionTime' ? 'Execution Time (ms)' : 'Success Rate (%)',
        },
      },
    },
  };

  return (
    <Paper p="md">
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={500}>
          Performance Metrics
        </Text>
        <Select
          value={metric}
          onChange={(value) => setMetric(value || 'executionTime')}
          data={[
            { value: 'executionTime', label: 'Execution Time' },
            { value: 'successRate', label: 'Success Rate' },
          ]}
          style={{ width: 200 }}
        />
      </Group>
      <Line data={chartData} options={options} />
    </Paper>
  );
}
