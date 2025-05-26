import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Grid,
  Card,
  Text,
  Group,
  Button,
  Stack,
  TextInput,
  Textarea,
  Modal,
  ActionIcon,
  Loader,
  Center,
  Timeline,
} from '@mantine/core';
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconUpload,
  IconX,
  IconCircleCheck,
} from '@tabler/icons-react';
import { testService, Test } from '@/services/test.service';
import { Dropzone } from '@mantine/dropzone';

interface TestFormData {
  name: string;
  description: string;
}

// Modern green/teal color palette
const accentColor = '#20c997'; // teal
const accentColorLight = '#b2f2bb';
const cardShadow = '0 4px 24px 0 rgba(32, 201, 151, 0.08)';
const cardRadius = 18;
const bgColor = '#f8fafb';
const cardBg = '#fff';
const textColor = '#212529';
const dimmedColor = '#868e96';
const badgeBg = '#f1f3f5'; // soft gray
const badgeText = '#228879'; // dark teal-green for text
const editIconBg = '#f1f3f5'; // neutral gray
const editIconHover = '#e9ecef';
const deleteIconBg = '#fff0f0';
const deleteIconHover = '#fa5252';
const deleteIconText = '#fa5252';
const createBtnBorder = accentColor;
const createBtnBg = '#fff';
const createBtnText = accentColor;
const createBtnHoverBg = accentColor;
const createBtnHoverText = '#fff';

export function Tests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingTest, setCreatingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<TestFormData>({
    name: '',
    description: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    file?: string;
  }>({});

  const validateForm = () => {
    const errors: typeof formErrors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!file) {
      errors.file = 'Python file is required';
    } else if (!file.name.endsWith('.py')) {
      errors.file = 'File must be a .py Python file';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const fetchedTests = await testService.getAllTests();
      setTests(fetchedTests);
    } catch (e) {
      setError('Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!creatingTest) {
      setModalOpen(false);
      resetForm();
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    try {
      await testService.deleteTest(id);
      await loadTests();
    } catch (e) {
      setError('Failed to delete test');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }
      setCreatingTest(true);
      setError(null);
      const form = new FormData();
      form.append('name', formData.name.trim());
      form.append('description', formData.description.trim());
      form.append('file', file!);
      await testService.createTest(form);
      setModalOpen(false);
      resetForm();
      await loadTests();
    } catch (e: any) {
      setError(e.message || 'Failed to save test');
    } finally {
      setCreatingTest(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setFile(null);
    setError(null);
    setFormErrors({});
  };

  if (loading) {
    return (
      <Center h="80vh" style={{ background: bgColor }}>
        <Loader size="xl" color={accentColor} />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="80vh" style={{ background: bgColor }}>
        <Text color="red" size="xl">
          {error}
        </Text>
      </Center>
    );
  }

  return (
    <Container
      size="xl"
      py="xl"
      style={{ background: bgColor, minHeight: '100vh', borderRadius: 24 }}
    >
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Title order={1} style={{ color: textColor, fontWeight: 800, letterSpacing: -1 }}>
            Test Management
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={handleCreateTest}
            variant="filled"
            color={accentColor}
            style={{
              background: accentColor,
              color: '#fff',
              fontWeight: 600,
              fontSize: 18,
              borderRadius: 12,
              boxShadow: '0 2px 8px 0 rgba(32,201,151,0.10)',
            }}
          >
            Create Test
          </Button>
        </Group>

        <Grid gutter="lg">
          {tests.map((test) => (
            <Grid.Col key={test._id} span={{ base: 12, md: 6, lg: 4 }}>
              <Card
                p="lg"
                radius={cardRadius}
                style={{
                  background: cardBg,
                  boxShadow: cardShadow,
                  minHeight: 170,
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  cursor: 'pointer',
                }}
                withBorder={false}
              >
                <Stack gap={6}>
                  <Group justify="space-between" align="flex-start">
                    <Text size="lg" fw={700} style={{ color: textColor }}>
                      {test.name || 'Unnamed Test'}
                    </Text>
                    <Group>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDeleteTest(test._id)}
                        style={{
                          background: deleteIconBg,
                          color: deleteIconText,
                          borderRadius: 8,
                          transition: 'background 0.2s, color 0.2s',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = deleteIconHover;
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = deleteIconBg;
                          e.currentTarget.style.color = deleteIconText;
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Text size="sm" style={{ color: dimmedColor, marginBottom: 2 }}>
                    {test.description || 'No description'}
                  </Text>
                  <Text size="sm" style={{ color: dimmedColor, marginBottom: 2 }}>
                    URL: {test.startUrl}
                  </Text>
                  {test.steps && test.steps.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        marginTop: 8,
                      }}
                    >
                      <Text
                        size="xs"
                        style={{
                          color: dimmedColor,
                          fontWeight: 700,
                          marginRight: 12,
                          minWidth: 48,
                          lineHeight: '18px',
                          paddingTop: 2,
                        }}
                      >
                        Steps:
                      </Text>
                      <Timeline
                        active={test.steps.length - 1}
                        bulletSize={10}
                        lineWidth={3}
                        color={accentColor}
                        style={{ margin: 0, padding: 0, marginLeft: 48, marginTop: 8 }}
                      >
                        {test.steps.map((step, idx) => (
                          <Timeline.Item
                            key={idx}
                            title={
                              <span style={{ fontSize: 14, color: dimmedColor, fontWeight: 500 }}>
                                {step.name}
                              </span>
                            }
                            style={{
                              minHeight: 18,
                              paddingTop: 0,
                              paddingBottom: 0,
                              marginLeft: 0,
                            }}
                          />
                        ))}
                      </Timeline>
                    </div>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        <Modal
          opened={modalOpen}
          onClose={handleCloseModal}
          title="Create Test"
          size="lg"
          closeOnClickOutside={!creatingTest}
          closeOnEscape={!creatingTest}
          styles={{
            header: { background: cardBg },
            body: { background: bgColor },
            title: { color: textColor, fontWeight: 700 },
          }}
        >
          <div style={{ position: 'relative' }}>
            {creatingTest && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                  borderRadius: 8,
                }}
              >
                <Stack align="center" gap="md">
                  <Loader size="xl" color={accentColor} />
                  <Text size="lg" fw={500} style={{ color: textColor }}>
                    Creating your test...
                  </Text>
                </Stack>
              </div>
            )}

            <Stack>
              {error && (
                <Text color="red" size="sm" style={{ marginBottom: 8 }}>
                  {error}
                </Text>
              )}
              <TextInput
                label="Name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) {
                    setFormErrors({ ...formErrors, name: undefined });
                  }
                }}
                required
                disabled={creatingTest}
                error={formErrors.name}
                styles={{ input: { background: cardBg, color: textColor, borderRadius: 8 } }}
              />
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (formErrors.description) {
                    setFormErrors({ ...formErrors, description: undefined });
                  }
                }}
                required
                disabled={creatingTest}
                error={formErrors.description}
                styles={{ input: { background: cardBg, color: textColor, borderRadius: 8 } }}
              />
              {!file && (
                <Dropzone
                  onDrop={(files) => {
                    setFile(files[0]);
                    if (formErrors.file) {
                      setFormErrors({ ...formErrors, file: undefined });
                    }
                  }}
                  accept={{ 'text/x-python': ['.py'] }}
                  maxFiles={1}
                  multiple={false}
                  disabled={creatingTest}
                  style={{
                    background: cardBg,
                    border: `2px dashed ${formErrors.file ? '#fa5252' : accentColor}`,
                    borderRadius: 12,
                    padding: 24,
                    textAlign: 'center',
                    minHeight: 120,
                    position: 'relative',
                    opacity: creatingTest ? 0.6 : 1,
                  }}
                >
                  <Stack align="center" gap={4} style={{ width: '100%' }}>
                    <IconUpload size={32} color={formErrors.file ? '#fa5252' : accentColor} />
                    <Text size="sm" style={{ color: textColor }}>
                      Drag a Python file here or click to select
                    </Text>
                    <Text size="xs" style={{ color: dimmedColor }}>
                      Only .py files are accepted
                    </Text>
                  </Stack>
                </Dropzone>
              )}
              {formErrors.file && (
                <Text color="red" size="xs" style={{ marginTop: -8 }}>
                  {formErrors.file}
                </Text>
              )}
              {file && !creatingTest && (
                <Group
                  justify="space-between"
                  align="center"
                  style={{ background: cardBg, padding: 12, borderRadius: 8 }}
                >
                  <Text size="sm" style={{ color: textColor }}>
                    {file.name}
                  </Text>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => {
                      setFile(null);
                      if (formErrors.file) {
                        setFormErrors({ ...formErrors, file: undefined });
                      }
                    }}
                    disabled={creatingTest}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Group>
              )}
              <Button
                onClick={handleSubmit}
                variant="filled"
                color={accentColor}
                style={{ background: accentColor, fontWeight: 600, borderRadius: 10 }}
                loading={creatingTest}
                disabled={creatingTest}
              >
                {creatingTest ? 'Creating...' : 'Create Test'}
              </Button>
            </Stack>
          </div>
        </Modal>
      </Stack>
    </Container>
  );
}
