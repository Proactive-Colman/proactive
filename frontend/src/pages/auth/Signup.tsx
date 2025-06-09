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
import { IconAlertCircle, IconUserPlus, IconUser } from '@tabler/icons-react';
import { authService, SignupData } from '@/services/auth.service';

const accentColor = '#20c997';
const cardBg = '#fff';
const textColor = '#212529';
const dimmedColor = '#868e96';

export function Signup() {
  const [formData, setFormData] = useState<SignupData>({
    username: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (!formData.username.trim() || !formData.password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.signup(formData);
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
                    Sign Up
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
                placeholder="Choose a username"
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
                placeholder="Choose a password (min 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
                styles={{
                  input: { background: cardBg, color: textColor, borderRadius: 8 },
                  label: { color: textColor, fontWeight: 500 },
                }}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                leftSection={<IconUserPlus size={16} />}
                style={{
                  background: accentColor,
                  fontWeight: 600,
                  borderRadius: 10,
                  marginTop: 10,
                }}
                fullWidth
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>

              <Center>
                <Text size="sm" style={{ color: dimmedColor }}>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: accentColor,
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Login
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
