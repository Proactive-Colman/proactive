import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'green',
  primaryShade: 5,
  colors: {
    green: [
      '#e9fbe5',
      '#c6f6c1',
      '#8be78b',
      '#4ade80',
      '#22c55e', // flat accent green
      '#16a34a',
      '#15803d',
      '#166534',
      '#14532d',
      '#052e16',
    ],
    dark: [
      '#23272b', // main background
      '#2d3237', // card/panel background
      '#343a40',
      '#495057',
      '#6c757d',
      '#adb5bd',
      '#ced4da',
      '#dee2e6',
      '#e9ecef',
      '#f8f9fa',
    ],
  },
  defaultRadius: 16,
  fontFamily: 'Inter, sans-serif',
  components: {
    Paper: {
      defaultProps: {
        radius: 16,
        withBorder: false,
        shadow: undefined,
      },
      styles: {
        root: {
          backgroundColor: '#2d3237',
          boxShadow: 'none',
        },
      },
    },
    Card: {
      styles: {
        root: {
          backgroundColor: '#2d3237',
          borderRadius: 16,
          boxShadow: 'none',
        },
      },
    },
    Button: {
      defaultProps: {
        radius: 10,
        size: 'md',
      },
      styles: {
        root: {
          background: '#22c55e',
          color: '#23272b',
          fontWeight: 700,
          boxShadow: 'none',
          textShadow: 'none',
        },
      },
    },
    Title: {
      styles: {
        root: {
          color: '#22c55e',
          textShadow: 'none',
          fontWeight: 800,
        },
      },
    },
    Text: {
      styles: {
        root: {
          color: '#fff',
        },
      },
    },
  },
});

