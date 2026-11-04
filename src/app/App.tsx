import { lazy, Suspense } from 'react';
import { HomePage } from '@views/pages/HomePage';
import { NotFoundPage } from '@views/pages/NotFoundPage';
import { resolveRoute } from './routing';

const TelemetryDashboardPage = lazy(async () => {
  const module = await import('@views/pages/TelemetryDashboardPage');
  return { default: module.TelemetryDashboardPage };
});

export function App() {
  const route = resolveRoute(window.location.pathname);

  if (route === 'telemetry') {
    return (
      <Suspense
        fallback={
          <main
            style={{
              minHeight: '100dvh',
              display: 'grid',
              placeItems: 'center',
              color: '#94a3b8',
              background: '#070b16',
            }}
          >
            Loading telemetry…
          </main>
        }
      >
        <TelemetryDashboardPage />
      </Suspense>
    );
  }

  if (route === 'home') {
    return <HomePage />;
  }

  return <NotFoundPage />;
}
