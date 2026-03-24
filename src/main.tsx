import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';
import '@/app/styles/global.css';
import { enableMocking } from '@/mocks/browser';

async function bootstrap() {
  if (import.meta.env.DEV) {
    await enableMocking();
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </React.StrictMode>,
  );
}

void bootstrap();
