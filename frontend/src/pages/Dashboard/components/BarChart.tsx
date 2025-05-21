import { Paper, Text } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  data: { name: string; success: number; failure: number }[];
}

export function BarChart({ data }: BarChartProps) {
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: 'Success',
        data: data.map((d) => d.success),
        backgroundColor: 'rgba(34,197,94,0.7)',
      },
      {
        label: 'Failure',
        data: data.map((d) => d.failure),
        backgroundColor: 'rgba(239,68,68,0.7)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Success/Failure Count per Test' },
    },
  };

  return (
    <Paper p="md" radius="lg" withBorder style={{ background: 'rgba(40,40,60,0.7)' }}>
      <Text size="lg" fw={700} mb="md">
        Success/Failure Count per Test
      </Text>
      <Bar data={chartData} options={options} />
    </Paper>
  );
}
