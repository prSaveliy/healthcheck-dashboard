import { createBrowserRouter, RouterProvider, useRouteError } from 'react-router-dom';
import { HttpError } from '@/commons/httpError';

import { DashBoard } from '@/pages/dashboard/Dashboard';
import { NotFound } from '@/pages/error/NotFound';
import { GeneralError } from '@/pages/error/GeneralError';
import { TooManyRequests } from '@/pages/error/TooManyRequests';

import { GlobalMetrics } from '@/components/dashboard/metrics/global-metrics/GlobalMetrics';
import { WebsiteMetrics } from '@/components/dashboard/metrics/website-metrics/WebsiteMetrics';
import { BotMetrics } from '@/components/dashboard/metrics/bot-metrics/BotMetrics';

import { ThemeProvider } from '@/app/providers/ThemeProvider';

const RootError = () => {
  const error = useRouteError();
  if (error instanceof HttpError) {
    switch (error.status) {
      case 404:
        return <NotFound />;
      case 429:
        return <TooManyRequests />;
    }
  }

  return <GeneralError />;
};

const router = createBrowserRouter([
  {
    errorElement: <RootError />,
    children: [
      {
        path: '/',
        element: (
          <DashBoard>
            <GlobalMetrics />
          </DashBoard>
        ),
      },
      {
        path: '/telegramBot/:id',
        element: (
          <DashBoard>
            <BotMetrics />
          </DashBoard>
        ),
      },
      {
        path: '/website/:id',
        element: (
          <DashBoard>
            <WebsiteMetrics />
          </DashBoard>
        ),
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export const App = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
