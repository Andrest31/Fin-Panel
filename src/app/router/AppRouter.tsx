import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '@/shared/ui/MainLayout';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { OperationDetailsPage } from '@/pages/operation-details/OperationDetailsPage';
import { OperationsListPage } from '@/pages/operations-list/OperationsListPage';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'operations', element: <OperationsListPage /> },
      { path: 'operations/:operationId', element: <OperationDetailsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
