import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';

async function enableMocking() {
  if (!import.meta.env.DEV) {
    return;
  }

  try {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
    });
  } catch (error) {
    console.warn('MSW failed to start, continuing without mocks.', error);
  }
}

enableMocking().finally(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});