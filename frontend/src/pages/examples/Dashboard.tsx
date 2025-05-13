import { Grid, Paper, Title, Text, Stack, Container, Button, Group, rgba } from '@mantine/core';
import { AreaChart, PieChart, BarChart, LineChart } from '@mantine/charts';
import { useMantineTheme } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import './aiButton.css';
import { useGetTests } from '@/hooks/tests';

// Mock data for demonstration
const timeData = [
  { date: '2024-01', time: 120 },
  { date: '2024-02', time: 150 },
  { date: '2024-03', time: 180 },
  { date: '2024-04', time: 200 },
];

const performanceData = [
  { month: 'Jan', performance: 85 },
  { month: 'Feb', performance: 92 },
  { month: 'Mar', performance: 78 },
  { month: 'Apr', performance: 88 },
];

const trendData = [
  { week: 'Week 1', value: 100 },
  { week: 'Week 2', value: 120 },
  { week: 'Week 3', value: 90 },
  { week: 'Week 4', value: 110 },
];

export default function Dashboard() {
  const theme = useMantineTheme();
  const accent = theme.colors.green[4];
  const accent2 = theme.colors.green[3];
  const cardBg = theme.colors.dark[1];
  const mainBg = theme.colors.dark[0];
  const text = theme.white;
  const axisColor = '#fff';

  const failStepData = [
    { name: 'Step 1', value: 30, color: accent },
    { name: 'Step 2', value: 20, color: accent2 },
    { name: 'Step 3', value: 15, color: theme.colors.green[2] },
    { name: 'Step 4', value: 35, color: theme.colors.green[5] },
  ];

  return (
    <Container
      size="xl"
      p="md"
      style={{ height: '100%', overflow: 'hidden', background: mainBg, borderRadius: 24 }}
    >
      <Stack gap="xl" style={{ height: '100%' }}>
        <Group justify="space-between" align="center" mb="sm">
          <div>
            <Title order={1} style={{ color: accent }}>
              Your Tests
            </Title>
            <Text size="lg" style={{ color: text }}>
              Performance Metrics & Analytics
            </Text>
          </div>

          <Button
            className="ai-animated-button"
            variant="subtle"
            rightSection={<IconSparkles size={20} style={{ color: theme.colors.green[4] }} />}
            style={{
              fontWeight: 700,
              color: theme.colors.green[4],
              background: 'transparent',
              padding: '12px 24px',
              minWidth: 160,
              position: 'relative',
              zIndex: 1,
            }}
          >
            Analyze with AI
          </Button>
        </Group>

        <Grid gutter="xl" style={{ flex: 1, overflow: 'hidden' }}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="md" h="100%" style={{ background: cardBg }}>
              <Title order={3} mb="md" style={{ color: accent }}>
                Total Time
              </Title>
              <AreaChart
                h={200}
                data={timeData}
                dataKey="date"
                series={[{ name: 'time', color: accent }]}
                curveType="linear"
                withGradient
                xAxisProps={{
                  style: { fill: axisColor, stroke: axisColor },
                  tick: { style: { fill: axisColor } },
                  label: { style: { fill: axisColor } },
                }}
                yAxisProps={{
                  style: { fill: axisColor, stroke: axisColor },
                  tick: { style: { fill: axisColor } },
                  label: { style: { fill: axisColor } },
                }}
              />
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="md" h="100%" style={{ background: cardBg }}>
              <Title order={3} mb="md" style={{ color: accent }}>
                Fail Steps Distribution
              </Title>
              <PieChart
                h={200}
                data={failStepData}
                withTooltip
                tooltipDataSource="segment"
                withLabels
                labelsType="value"
              />
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="md" h="100%" style={{ background: cardBg }}>
              <Title order={3} mb="md" style={{ color: accent }}>
                Performance Metrics
              </Title>
              <BarChart
                h={200}
                data={performanceData}
                dataKey="month"
                series={[{ name: 'performance', color: accent }]}
                xAxisProps={{
                  style: { fill: axisColor, stroke: axisColor },
                  tick: { style: { fill: axisColor } },
                  label: { style: { fill: axisColor } },
                }}
                yAxisProps={{
                  style: { fill: axisColor, stroke: axisColor },
                  tick: { style: { fill: axisColor } },
                  label: { style: { fill: axisColor } },
                }}
                barProps={{ style: { fill: accent, stroke: accent } }}
                tooltipProps={{ wrapperStyle: { background: cardBg, color: text } }}
              />
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="md" h="100%" style={{ background: cardBg }}>
              <Title order={3} mb="md" style={{ color: accent }}>
                Weekly Trends
              </Title>
              <LineChart
                h={200}
                data={trendData}
                dataKey="week"
                series={[{ name: 'value', color: accent }]}
                curveType="linear"
                xAxisProps={{
                  style: { fill: axisColor, stroke: axisColor },
                  tick: { style: { fill: axisColor } },
                  label: { style: { fill: axisColor } },
                }}
                yAxisProps={{
                  style: { fill: axisColor, stroke: axisColor },
                  tick: { style: { fill: axisColor } },
                  label: { style: { fill: axisColor } },
                }}
              />
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
