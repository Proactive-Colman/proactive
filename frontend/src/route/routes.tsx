import { RouteObject } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { Tests } from '@/pages/tests/Tests';
import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';

const routes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'tests',
        element: <Tests />,
      },
    ],
  },
];

export default routes;
