import type {NavigationTree} from '@/@types/navigation';
import {IconDashboard, IconUpload} from '@tabler/icons-react';

const navigationConfig: NavigationTree[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    title: 'Dashboard',
    translateKey: '',
    icon: IconDashboard,
    authority: [],
    subMenu: []
  },
  {
    key: 'upload',
    path: '/upload',
    title: 'Upload',
    translateKey: '',
    icon: IconUpload,
    authority: [],
    subMenu: []
  },
  {
    key: 'tests',
    path: '/tests',
    title: 'Tests',
    translateKey: '',
    icon: IconUpload,
    authority: [],
    subMenu: []
  },
];

export default navigationConfig;
