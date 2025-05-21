/**
 * Modern green/teal admin dashboard layout inspired by the reference image.
 */
import React, { lazy, Suspense, useMemo, ReactNode, useEffect } from 'react';
import useAuth from '@/utils/hooks/useAuth';
import useLocale from '@/utils/hooks/useLocale';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import { LayoutTypes } from '@/@types/layout';
import { useAppSelector } from '@/store';
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
} from '@mantine/core';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { IconDashboard, IconTestPipe, IconBell, IconSearch } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

const layouts: any = {
  [LayoutTypes.SimpleSideBar]: lazy(() => import('./LayoutTypes/SimpleSideBar')),
  [LayoutTypes.DeckedSideBar]: lazy(() => import('./LayoutTypes/DeckedSideBar')),
  [LayoutTypes.CollapsedSideBar]: lazy(() => import('./LayoutTypes/CollapsedSideBar')),
};

interface LayoutProps {
  children: ReactNode;
}

export function Layout() {
  const { authenticated } = useAuth();
  const layoutType = useAppSelector((state) => state.theme.currentLayout);
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();

  useLocale();

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  const AppLayout = useMemo(() => {
    if (authenticated) {
      return layouts[layoutType];
    }
    return lazy(() => import('./AuthLayout'));
  }, [authenticated]);

  const navItems = [
    { icon: IconDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: IconTestPipe, label: 'Tests', path: '/tests' },
  ];

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      navbarOffsetBreakpoint="sm"
      fixed
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
            {/* Logo placeholder */}
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
            <Avatar radius="xl" color="teal" size={36} src={null} style={{ fontWeight: 700 }}>
              U
            </Avatar>
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
        <Group direction="column" gap={4} align="stretch" style={{ marginTop: 24 }}>
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
        </Group>
      </AppShell.Navbar>

      {/* MAIN CONTENT */}
      <AppShell.Main style={{ minHeight: '100vh' }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
