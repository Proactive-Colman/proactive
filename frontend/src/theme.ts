import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'teal',
  colors: {
    teal: [
      '#e6fcf5',
      '#c3fae8',
      '#96f2d7',
      '#63e6be',
      '#38d9a9',
      '#20c997',
      '#12b886',
      '#0ca678',
      '#099268',
      '#087f5b',
    ],
    green: [
      '#ebfbee',
      '#d3f9d8',
      '#b2f2bb',
      '#8ce99a',
      '#69db7c',
      '#51cf66',
      '#40c057',
      '#37b24d',
      '#2f9e44',
      '#2b8a3e',
    ],
    gray: [
      '#f8f9fa',
      '#f1f3f5',
      '#e9ecef',
      '#dee2e6',
      '#ced4da',
      '#adb5bd',
      '#868e96',
      '#495057',
      '#343a40',
      '#212529',
    ],
  },
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  defaultRadius: 16,
  components: {
    Card: {
      defaultProps: {
        shadow: 'sm',
        withBorder: false,
        radius: 'md',
      },
      styles: {
        root: {
          backgroundColor: '#fff',
          color: '#222',
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
        },
      },
    },
    Paper: {
      defaultProps: {
        shadow: 'sm',
        withBorder: false,
        radius: 'md',
      },
      styles: {
        root: {
          backgroundColor: '#fff',
          color: '#222',
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
        },
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
        color: 'teal',
      },
      styles: {
        root: {
          fontWeight: 700,
        },
      },
    },
    Title: {
      styles: {
        root: {
          color: '#222',
          fontWeight: 800,
        },
      },
    },
    Text: {
      styles: {
        root: {
          color: '#222',
        },
      },
    },
    Table: {
      styles: {
        root: {
          color: '#222',
        },
      },
    },
  },
});
