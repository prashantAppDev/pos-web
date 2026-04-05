import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { App, ConfigProvider } from 'antd';
import { queryClient } from './lib/queryClient';
import AppRoot from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
        <App>
          <AppRoot />
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  </StrictMode>
);