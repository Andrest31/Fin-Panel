import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { server } from '../mocks/server';
import { OperationsListPage } from '../pages/operations-list/OperationsListPage';

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
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
    expect(screen.getByText(/Fast Electronics/i)).toBeInTheDocument();
  });

  it('shows bulk actions and updates selected count', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText(/TechMarket/i)).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);
    await user.click(checkboxes[2]);

    expect(screen.getByText(/Выбрано операций: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Selected: 2/i)).toBeInTheDocument();
  });

  it('applies filters by status', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText(/TechMarket/i)).toBeInTheDocument();

    const statusSelect = screen.getByLabelText(/status/i);
    await user.click(statusSelect);
    await user.click(await screen.findByRole('option', { name: /approved/i }));

    await waitFor(() => {
      expect(screen.getByText(/Daily Coffee/i)).toBeInTheDocument();
      expect(screen.queryByText(/TechMarket/i)).not.toBeInTheDocument();
    });
  });
});