/**
 * Modern green/teal admin dashboard layout with authentication.
 */
import React, { lazy, Suspense, useMemo, ReactNode, useEffect, useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import { authService } from '@/services/auth.service';
import {
  AppShell,
  Text,
  Burger,
  Group,
  NavLink,
  Avatar,
  Input,
  ActionIcon,
  Paper,
  Menu,
  UnstyledButton,
  Stack,
} from '@mantine/core';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  IconDashboard,
  IconTestPipe,
  IconBell,
  IconSearch,
  IconLogout,
  IconUser,
  IconChevronDown,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

export function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Set up auth interceptors on app start
    authService.setupInterceptors();

    const checkAuth = () => {
      // Wait for auth service to be initialized
      if (!authService.isInitialized()) {
        setTimeout(checkAuth, 50);
        return;
      }

      setAuthInitialized(true);
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setUser(authService.getUser());

      // Check if current route is login/signup
      const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';

      if (!authenticated && !isAuthRoute) {
        // Not authenticated and not on auth route - redirect to login
        navigate('/login', { replace: true });
      } else if (authenticated && isAuthRoute) {
        // Authenticated but on auth route - redirect to dashboard
        navigate('/dashboard', { replace: true });
      } else if (authenticated && location.pathname === '/') {
        // Authenticated and on root - redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    };

    checkAuth();
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login', { replace: true });
  };

  const navItems = [
    { icon: IconDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: IconTestPipe, label: 'Tests', path: '/tests' },
  ];

  // Show loading while auth is initializing
  if (!authInitialized) {
    return <LoadingScreen />;
  }

  // If not authenticated and not on auth routes, show loading while redirecting
  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/signup') {
    return <LoadingScreen />;
  }

  // If on auth routes, don't show the layout - just render the outlet
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return <Outlet />;
  }

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      styles={{
        main: { background: '#f8f9fa', minHeight: '100vh' },
      }}
    >
      {/* HEADER */}
      <AppShell.Header
        style={{
          background: '#fff',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)',
          borderBottom: '1px solid #e9ecef',
          zIndex: 10,
        }}
      >
        <Group h="100%" px="lg" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="#20c997" />
            {/* Logo */}
            <Paper
              radius={12}
              p={4}
              style={{ background: '#e6fcf5', display: 'flex', alignItems: 'center' }}
            >
              <Text fw={900} size="lg" style={{ color: '#20c997', letterSpacing: 1 }}>
                PROACTIVE
              </Text>
            </Paper>
          </Group>
          <Group gap="md">
            <ActionIcon variant="light" color="teal" size="lg">
              <IconBell size={22} />
            </ActionIcon>

            {/* Profile Dropdown */}
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={8}>
                    <Avatar radius="xl" color="teal" size={36} style={{ fontWeight: 700 }}>
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Group gap={4} visibleFrom="sm">
                      <Text size="sm" fw={500} style={{ color: '#212529' }}>
                        {user?.username || 'User'}
                      </Text>
                      <IconChevronDown size={14} color="#868e96" />
                    </Group>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item leftSection={<IconUser size={16} />} disabled>
                  {user?.username || 'User'}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={16} />}
                  color="red"
                  onClick={handleLogout}
                >
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* SIDEBAR */}
      <AppShell.Navbar
        p="md"
        style={{
          background: '#fff',
          borderRight: '1px solid #e9ecef',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)',
        }}
      >
        <Stack gap={4} align="stretch" style={{ marginTop: 24 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                label={
                  <Text fw={600} size="md" style={{ color: isActive ? '#fff' : '#20c997' }}>
                    {item.label}
                  </Text>
                }
                leftSection={
                  <item.icon size="1.3rem" stroke={1.7} color={isActive ? '#fff' : '#20c997'} />
                }
                active={isActive}
                onClick={() => navigate(item.path)}
                variant={isActive ? 'filled' : 'light'}
                styles={{
                  root: {
                    background: isActive ? '#20c997' : 'transparent',
                    borderRadius: 12,
                    marginBottom: 4,
                    boxShadow: isActive ? '0 2px 8px 0 rgba(32,201,151,0.08)' : 'none',
                    transition: 'background 0.2s, color 0.2s',
                    cursor: 'pointer',
                  },
                }}
              />
            );
          })}
        </Stack>
      </AppShell.Navbar>

      {/* MAIN CONTENT */}
      <AppShell.Main style={{ minHeight: '100vh' }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
