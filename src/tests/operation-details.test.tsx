import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { server } from '../mocks/server';
import { OperationDetailsPage } from '../pages/operation-details/OperationDetailsPage';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderPage(initialPath = '/operations/op_001') {
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
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/operations/:id" element={<OperationDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('OperationDetailsPage', () => {
  it('renders operation details', async () => {
    renderPage();

    expect(await screen.findByText(/TechMarket/i)).toBeInTheDocument();
    expect(screen.getByText(/Operation Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Risk Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/History/i)).toBeInTheDocument();
  });

  it('updates operation status through decision dialog', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText(/TechMarket/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /approve/i }));

    expect(screen.getByText(/Decision for TechMarket/i)).toBeInTheDocument();

    const commentInput = screen.getByLabelText(/comment/i);
    await user.clear(commentInput);
    await user.type(commentInput, 'Проверил сигналы, подтверждаю операцию.');

    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(await screen.findByText(/Статус обновлён: approved/i)).toBeInTheDocument();
  });
});