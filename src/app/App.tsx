import { HomePage } from '@views/pages/HomePage';
import { NotFoundPage } from '@views/pages/NotFoundPage';
import { isHomePath } from './routing';

export function App() {
  if (!isHomePath(window.location.pathname)) {
    return <NotFoundPage />;
  }

  return <HomePage />;
}
