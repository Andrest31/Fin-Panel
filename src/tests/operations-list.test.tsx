import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { server } from '../mocks/server';
import { OperationsListPage } from '../pages/operations-list/OperationsListPage';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OperationsListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('OperationsListPage', () => {
  it('renders operations from mock API', async () => {
    renderPage();

    expect(await screen.findByText(/TechMarket/i)).toBeInTheDocument();
    expect(screen.getByText(/Daily Coffee/i)).toBeInTheDocument();
  });
});