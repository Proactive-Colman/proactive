import React from 'react';
import { TestList } from '../../components/TestList';

const TestsPage: React.FC = () => {
  return (
    <div>
      <h1 style={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>Tests Management</h1>
      <TestList />
    </div>
  );
};



export default TestsPage; 