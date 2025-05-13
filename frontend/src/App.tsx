import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import { Layout } from '@/components/Layout/Layout';
import { Provider } from 'react-redux';
import store, { persistor } from '@/store';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import appConfig from './configs/app.config';
import { mockServer } from './mock/mock';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';


export default function App() {
  /**
   * Set enableMock(Default true) to true at configs/app.config.js
   * If you wish to enable mock api
   */
  if (appConfig.enableMock) {
    mockServer();
  }

  return (
    <Warpper />
  );
}


const Warpper = () => {
const queryClient = new QueryClient();

return (
<QueryClientProvider client={queryClient}>
<MantineProvider theme={theme} defaultColorScheme="dark">
        <ModalsProvider>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <BrowserRouter>
                <Layout />
              </BrowserRouter>
            </PersistGate>
          </Provider>
        </ModalsProvider>
      </MantineProvider>
</QueryClientProvider>
)
}