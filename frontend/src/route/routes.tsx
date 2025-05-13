import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import Dashboard from '@/pages/examples/Dashboard';
import Upload from '@/pages/examples/Upload';
import Tests from '@/pages/tests';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'upload',
        element: <Upload />,
      },
      {
        path: 'tests',
        element: <Tests />,
      }
    ],
  },
];

export default routes; 