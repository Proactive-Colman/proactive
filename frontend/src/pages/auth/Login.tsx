import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Center,
  Alert,
  Group,
} from '@mantine/core';
import { IconAlertCircle, IconLogin, IconUser } from '@tabler/icons-react';
import { authService, LoginData } from '@/services/auth.service';

const accentColor = '#20c997';
const cardBg = '#fff';
const textColor = '#212529';
const dimmedColor = '#868e96';

export function Login() {
  const [formData, setFormData] = useState<LoginData>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated
    if (authService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.login(formData);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      size="xs"
      py={80}
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
    >
      <Center style={{ width: '100%' }}>
        <Paper
          withBorder
          shadow="md"
          p={30}
          radius="md"
          style={{
            background: cardBg,
            minWidth: 400,
            boxShadow: '0 4px 24px 0 rgba(32, 201, 151, 0.08)',
          }}
        >
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <Center>
                <Group>
                  <IconUser size={32} color={accentColor} />
                  <Title order={2} style={{ color: textColor }}>
                    Login
                  </Title>
                </Group>
              </Center>

              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red">
                  {error}
                </Alert>
              )}

              <TextInput
                label="Username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={loading}
                styles={{
                  input: { background: cardBg, color: textColor, borderRadius: 8 },
                  label: { color: textColor, fontWeight: 500 },
                }}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
                styles={{
                  input: { background: cardBg, color: textColor, borderRadius: 8 },
                  label: { color: textColor, fontWeight: 500 },
                }}
              />

              <Button
                type="submit"
                loading={loading}
                leftSection={<IconLogin size={16} />}
                style={{
                  background: accentColor,
                  fontWeight: 600,
                  borderRadius: 10,
                  marginTop: 10,
                }}
                fullWidth
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <Center>
                <Text size="sm" style={{ color: dimmedColor }}>
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    style={{
                      color: accentColor,
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Sign up
                  </Link>
                </Text>
              </Center>
            </Stack>
          </form>
        </Paper>
      </Center>
    </Container>
  );
}
