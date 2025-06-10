import { useEffect, useState, useRef } from 'react';
import {
  Container,
  Grid,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Loader,
  Center,
  Tooltip,
  Badge,
  useMantineTheme,
  Table,
  ScrollArea,
  Timeline,
  Avatar,
  Select,
  Card,
  Input,
  ActionIcon,
  Pagination,
  Modal,
  Box,
  Collapse,
} from '@mantine/core';
import {
  IconPlayerPlay,
  IconExternalLink,
  IconCheck,
  IconX,
  IconClock,
  IconAlertCircle,
  IconSearch,
  IconRefresh,
  IconClockHour4,
  IconCalendar,
  IconExclamationCircle,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { testService, Test, TestResult } from '@/services/test.service';
import { LineChart } from './components/LineChart';
import { Pie, Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { API_CONFIG } from '@/config/api';
import { authService } from '@/services/auth.service';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  ChartTooltip,
  ChartLegend,
  ArcElement,
  BarElement
);

// Chart.js color palette for modern green/teal look
const chartColors = {
  green: '#38d9a9',
  teal: '#20c997',
  lightGreen: '#b2f2bb',
  lightTeal: '#96f2d7',
  gray: '#dee2e6',
  red: '#fa5252',
  purple: '#845ef7',
};

// Helper to generate distinct HSL colors for any number of steps
const getPieColors = (n: number) =>
  Array.from({ length: n }, (_, i) => `hsl(${(i * 360) / n}, 60%, 60%)`);

// Helper to generate green shades for any number of steps
const getGreenShades = (n: number) =>
  Array.from({ length: n }, (_, i) => `hsl(145, 60%, ${40 + (50 * i) / Math.max(1, n - 1)}%)`);

export function Dashboard() {
  const theme = useMantineTheme();
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [pieData, setPieData] = useState<any>(null);
  const [barData, setBarData] = useState<any>(null);
  const [lineData, setLineData] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [stepPieData, setStepPieData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [statusLineData, setStatusLineData] = useState<any>(null);
  const [selectedRun, setSelectedRun] = useState<TestResult | null>(null);
  const accentColor = theme.colors.teal[6];
  const dimmedColor = theme.colors.gray[6];
  const [errorExpanded, setErrorExpanded] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Helper for fallback values
  const getTestName = (test: Test) => test.name || 'Unnamed Test';
  const getTestDescription = (test: Test) => test.description || 'No description';

  useEffect(() => {
    // Wait for auth initialization before making API calls
    const checkAuthAndLoadData = () => {
      if (authService.isInitialized() && authService.isAuthenticated()) {
        setAuthInitialized(true);
        loadTests();
      } else if (authService.isInitialized() && !authService.isAuthenticated()) {
        // Auth is initialized but user is not authenticated
        // Let the Layout component handle the redirect
        setAuthInitialized(true);
      } else {
        // Auth not yet initialized, wait a bit and check again
        setTimeout(checkAuthAndLoadData, 50);
      }
    };

    checkAuthAndLoadData();
  }, []);

  useEffect(() => {
    if (selectedTestId) {
      loadTestData(selectedTestId);
    } else {
      setSelectedTest(null);
      setTestResults([]);
      setStats(null);
      setPieData(null);
      setBarData(null);
      setLineData(null);
      setTimelineData([]);
    }
  }, [selectedTestId]);

  const loadTests = async () => {
    try {
      setLoading(true);
      const fetchedTests = await testService.getAllTests();
      setTests(fetchedTests);
      if (fetchedTests.length > 0) {
        setSelectedTestId(fetchedTests[0]._id);
      }
    } catch (e) {
      setError('Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  const loadTestData = async (testId: string, opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);
      const test = tests.find((t) => t._id === testId) || null;
      setSelectedTest(test);

      const results = await testService.getTestResults(testId);
      setTestResults(results);

      const statsRes = await fetch(
        `${API_CONFIG.RESULTS_URL}${API_CONFIG.ENDPOINTS.TEST_RESULTS}/test/${testId}/stats`
      ).then((r) => r.json().catch(() => ({})));
      setStats(statsRes);

      // Pie chart: Success/Failure
      setPieData({
        labels: ['Success', 'Failure'],
        datasets: [
          {
            data: [
              Math.round((statsRes?.successRate || 0) * (statsRes?.totalRuns || 0)),
              (statsRes?.totalRuns || 0) -
                Math.round((statsRes?.successRate || 0) * (statsRes?.totalRuns || 0)),
            ],
            backgroundColor: [chartColors.green, chartColors.red],
            borderWidth: 0,
          },
        ],
      });
      // Bar chart: Step durations
      setBarData({
        labels: statsRes?.stepStats?.map((s: any) => s.name) || [],
        datasets: [
          {
            label: 'Avg Duration (s)',
            data: statsRes?.stepStats?.map((s: any) => s.averageDuration) || [],
            backgroundColor: chartColors.teal,
            borderRadius: 8,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
          },
        ],
      });
      // Pie chart: Step durations (for new pie)
      setStepPieData(
        statsRes?.stepStats && {
          labels: statsRes.stepStats.map((s: any) => s.name),
          datasets: [
            {
              data: statsRes.stepStats.map((s: any) => s.averageDuration),
              backgroundColor: getGreenShades(statsRes.stepStats.length),
              borderWidth: 0,
            },
          ],
        }
      );
      // Line chart: Execution time per run
      setLineData({
        labels: results.map((r) => new Date(r.createdAt || r.timestamp).toLocaleString()),
        datasets: [
          {
            label: 'Execution Time (s)',
            data: results.map((r) => r.totalRuntime),
            borderColor: chartColors.teal,
            backgroundColor: 'rgba(32,201,151,0.12)',
            tension: 0.4,
            pointBackgroundColor: chartColors.green,
            pointBorderColor: '#fff',
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true,
          },
        ],
      });
      // Status line chart
      setStatusLineData({
        labels: results.map((r) => new Date(r.createdAt || r.timestamp).toLocaleString()),
        datasets: [
          {
            label: 'Status',
            data: results.map((r) => (r.status === 'completed' ? 1 : 0)),
            borderColor: chartColors.purple,
            backgroundColor: 'rgba(132,94,247,0.12)',
            tension: 0,
            pointBackgroundColor: (context: { raw: number }) =>
              context.raw === 1 ? chartColors.green : chartColors.red,
            pointBorderColor: '#fff',
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      });
      // Timeline data
      setTimelineData(
        results.slice(-10).map((r: any, i: number) => ({
          status: r.status,
          time: new Date(r.createdAt || r.timestamp).toLocaleString(),
          icon:
            r.status === 'completed' ? (
              <IconCheck color="#51cf66" />
            ) : r.status === 'failed' ? (
              <IconX color="#fa5252" />
            ) : (
              <IconClock color="#fab005" />
            ),
          executionTime: r.executionTime,
          error: r.error,
        }))
      );
    } catch (e) {
      setError('Failed to fetch test data');
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  // Filtered tests for dropdown
  const filteredTests = tests.filter(
    (t) =>
      (t.name && t.name.toLowerCase().includes(search.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRefresh = async () => {
    if (!selectedTestId) return;
    setRefreshing(true);
    setDataLoading(true);
    await loadTestData(selectedTestId, { silent: true });
    setDataLoading(false);
    if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    refreshTimeout.current = setTimeout(() => setRefreshing(false), 700);
  };

  const paginatedResults = testResults
    .slice()
    .reverse()
    .slice((page - 1) * pageSize, page * pageSize);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.green[6];
      case 'failed':
        return theme.colors.red[6];
      default:
        return theme.colors.gray[6];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <IconCheck size={16} color={theme.colors.green[6]} />;
      case 'failed':
        return <IconX size={16} color={theme.colors.red[6]} />;
      default:
        return <IconClock size={16} color={theme.colors.gray[6]} />;
    }
  };

  if (loading || !authInitialized) {
    return (
      <Center h="80vh" style={{ background: '#f8fafb' }}>
        <Loader size="xl" color="teal" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="80vh" style={{ background: '#f8fafb' }}>
        <Group>
          <IconAlertCircle color="#fa5252" size={32} />
          <Text color="#fa5252" size="xl" fw={700}>
            {error}
          </Text>
        </Group>
      </Center>
    );
  }

  return (
    <Container
      size="xl"
      py="xl"
      style={{
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 4px 32px 0 rgba(174, 62, 201, 0.08)',
      }}
    >
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Title order={1}>Test Dashboard</Title>
          <Group>
            <Select
              label="Select Test"
              placeholder="Choose a test"
              data={filteredTests.map((t) => ({ value: t._id, label: t.name || 'Unnamed Test' }))}
              value={selectedTestId ?? ''}
              onChange={(val) => setSelectedTestId(val || null)}
              style={{ width: 300 }}
              styles={{
                input: { color: '#222', fontWeight: 500 },
                dropdown: { color: '#222' },
              }}
            />
            <ActionIcon
              variant="light"
              color="teal"
              size="lg"
              onClick={handleRefresh}
              title="Refresh results"
              style={{
                marginLeft: 8,
                marginTop: 22,
                transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              disabled={!selectedTestId || dataLoading}
            >
              {dataLoading ? (
                <Loader size={18} color="teal" />
              ) : (
                <IconRefresh
                  size={22}
                  style={{
                    transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                    transform: refreshing ? 'rotate(1080deg)' : 'rotate(0deg)',
                  }}
                />
              )}
            </ActionIcon>
          </Group>
        </Group>

        {!selectedTest && (
          <Center h={300}>
            <Text c="dimmed" size="xl">
              Select a test to view its analytics.
            </Text>
          </Center>
        )}

        {selectedTest && (
          <>
            <Grid gutter="md" align="stretch">
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Card p="sm" radius="md" style={{ minHeight: 80 }}>
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      Success Rate
                    </Text>
                    <Text size="lg" fw={700}>
                      {((stats?.successRate || 0) * 100).toFixed(1)}%
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Card p="sm" radius="md" style={{ minHeight: 80 }}>
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      Average Duration
                    </Text>
                    <Text size="lg" fw={700}>
                      {stats?.averageTotalRuntime
                        ? stats.averageTotalRuntime.toFixed(2) + 's'
                        : '-'}
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Card p="sm" radius="md" style={{ minHeight: 80 }}>
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      Total Runs
                    </Text>
                    <Text size="lg" fw={700}>
                      {stats?.totalRuns || 0}
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper
                  p="sm"
                  style={{
                    height: 260,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Title order={4} mb="xs" size="md">
                    Success/Failure Ratio
                  </Title>
                  <div
                    style={{
                      height: 180,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {pieData && <Pie data={pieData} />}
                  </div>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper
                  p="sm"
                  style={{
                    height: 260,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Title order={4} mb="xs" size="md">
                    Step Durations
                  </Title>
                  <div
                    style={{
                      height: 180,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stepPieData && <Pie data={stepPieData} />}
                  </div>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper
                  p="sm"
                  style={{
                    height: 260,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Title order={4} mb="xs" size="md">
                    Step Durations
                  </Title>
                  <div style={{ height: 180 }}>{barData && <Bar data={barData} />}</div>
                </Paper>
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={12}>
                <Paper p="sm" radius="md" style={{ height: 320, marginTop: 16 }}>
                  <Title order={4} mb="xs" size="md">
                    Execution Duration Over Time
                  </Title>
                  <div style={{ height: 260 }}>
                    <Line
                      data={lineData}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                              display: true,
                              text: 'Duration (s)',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </Paper>
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={12}>
                <Paper p="sm" radius="md" style={{ height: 320, marginTop: 16 }}>
                  <Title order={4} mb="xs" size="md">
                    Test Status Over Time
                  </Title>
                  <div style={{ height: 260 }}>
                    <Line
                      data={statusLineData}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            min: 0,
                            max: 1,
                            ticks: {
                              stepSize: 1,
                              callback: (value) => (value === 1 ? 'Success' : 'Failure'),
                            },
                            title: {
                              display: true,
                              text: 'Status',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </Paper>
              </Grid.Col>
            </Grid>

            <Paper p="sm" radius="md">
              <Title order={4} mb="xs" size="md">
                Recent Runs
              </Title>
              <ScrollArea h={220}>
                <Table
                  highlightOnHover
                  withColumnBorders
                  verticalSpacing="xs"
                  style={{ color: '#222' }}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Duration</Table.Th>
                      <Table.Th>Steps</Table.Th>
                      <Table.Th>Error</Table.Th>
                      <Table.Th>Execution Time</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {paginatedResults.map((result, i) => (
                      <Table.Tr
                        key={i}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedRun(result)}
                      >
                        <Table.Td>
                          <Badge
                            color={result.status === 'completed' ? 'green' : 'red'}
                            variant="light"
                            size="sm"
                          >
                            {result.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {result.totalRuntime ? `${result.totalRuntime.toFixed(2)}s` : '-'}
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="wrap">
                            {result.steps?.map((step: any, idx: number) => (
                              <Badge
                                key={idx}
                                color={
                                  step.status === 'completed'
                                    ? 'green'
                                    : step.status === 'none'
                                      ? 'gray'
                                      : 'red'
                                }
                                variant="light"
                                size="xs"
                              >
                                {step.name} {step.duration ? `(${step.duration.toFixed(2)}s)` : ''}
                              </Badge>
                            ))}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          {result.error ? (
                            <Text size="xs" c="red">
                              {result.error}
                            </Text>
                          ) : (
                            '-'
                          )}
                        </Table.Td>
                        <Table.Td>
                          {result.startTime
                            ? new Date(result.startTime).toLocaleString()
                            : result.createdAt
                              ? new Date(result.createdAt).toLocaleString()
                              : result.timestamp
                                ? new Date(result.timestamp).toLocaleString()
                                : '-'}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
              <Group justify="center" mt="md">
                <Pagination
                  total={Math.ceil(testResults.length / pageSize)}
                  value={page}
                  onChange={setPage}
                  size="sm"
                  radius="md"
                  withEdges
                />
              </Group>
            </Paper>
          </>
        )}
      </Stack>

      <Modal
        opened={!!selectedRun}
        onClose={() => setSelectedRun(null)}
        size="lg"
        title={
          <Group>
            {selectedRun && getStatusIcon(selectedRun.status)}
            <Text fw={600}>Test Run Details</Text>
          </Group>
        }
      >
        {selectedRun && (
          <Stack gap="md">
            <Group>
              <Card withBorder p="md" radius="md" style={{ flex: 1 }}>
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconClockHour4 size={16} color={theme.colors.teal[6]} />
                    <Text size="sm" c="dimmed">
                      Total Duration
                    </Text>
                  </Group>
                  <Text fw={600}>
                    {selectedRun.totalRuntime?.toFixed(2) ?? selectedRun.executionTime.toFixed(2)}s
                  </Text>
                </Stack>
              </Card>
              <Card withBorder p="md" radius="md" style={{ flex: 1 }}>
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconCalendar size={16} color={theme.colors.teal[6]} />
                    <Text size="sm" c="dimmed">
                      Execution Time
                    </Text>
                  </Group>
                  <Text fw={600}>
                    {new Date(selectedRun.createdAt || selectedRun.timestamp).toLocaleString()}
                  </Text>
                </Stack>
              </Card>
            </Group>

            {selectedRun.error && (
              <Card withBorder p="md" radius="md" style={{ borderColor: theme.colors.red[6] }}>
                <Group
                  gap="xs"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setErrorExpanded(!errorExpanded)}
                >
                  <IconExclamationCircle size={16} color={theme.colors.red[6]} />
                  <Text fw={600} c="red">
                    Error
                  </Text>
                  <ActionIcon variant="subtle" color="red" size="sm" style={{ marginLeft: 'auto' }}>
                    {errorExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                  </ActionIcon>
                </Group>
                <Collapse in={errorExpanded}>
                  <Text size="sm" mt="xs" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedRun.error}
                  </Text>
                </Collapse>
              </Card>
            )}

            <Card withBorder p="md" radius="md">
              <Text fw={600} mb="md">
                Steps
              </Text>
              <Timeline
                active={selectedRun.steps.length - 1}
                bulletSize={10}
                lineWidth={3}
                color={accentColor}
              >
                {selectedRun.steps.map((step, idx) => (
                  <Timeline.Item
                    key={idx}
                    bullet={getStatusIcon(step.status)}
                    title={
                      <Group gap="xs">
                        <Text size="sm" fw={500} c={getStatusColor(step.status)}>
                          {step.name}
                        </Text>
                        <Badge
                          size="sm"
                          variant="light"
                          color={
                            step.status === 'completed'
                              ? 'green'
                              : step.status === 'failed'
                                ? 'red'
                                : 'gray'
                          }
                        >
                          {step.duration.toFixed(2)}s
                        </Badge>
                      </Group>
                    }
                    style={{
                      minHeight: 18,
                      paddingTop: 0,
                      paddingBottom: 0,
                    }}
                  >
                    {step.error && (
                      <Text size="xs" c="red" mt={4} style={{ whiteSpace: 'pre-wrap' }}>
                        {step.error}
                      </Text>
                    )}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
