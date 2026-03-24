import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { OperationsListPage } from '@/pages/operations-list/OperationsListPage';

function createWrapper(children: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <MemoryRouter>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('OperationsListPage', () => {
  it('renders operations from mock API', async () => {
    render(createWrapper(<OperationsListPage />));

    expect(await screen.findByText(/TechMarket/i)).toBeInTheDocument();
    expect(screen.getByText(/Daily Coffee/i)).toBeInTheDocument();
  });
});
