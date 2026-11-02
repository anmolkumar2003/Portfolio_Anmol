import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { analyticsRepository } from '@repositories';
import '@styles/global.scss';
import { App } from './App';

analyticsRepository.init();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
