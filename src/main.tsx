import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('main.tsx loaded');
console.log('Environment check:', {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'Present' : 'MISSING',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'MISSING',
});

try {
  const rootElement = document.getElementById('root');
  console.log('Root element found:', !!rootElement);

  if (!rootElement) {
    document.body.innerHTML = '<div style="color: white; background: black; padding: 20px; font-family: sans-serif;"><h1>Error: Root element not found</h1><p>The app could not find the #root element in the DOM.</p></div>';
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Fatal error during app initialization:', error);
  document.body.innerHTML = `<div style="color: white; background: black; padding: 20px; font-family: sans-serif;">
    <h1>App Failed to Load</h1>
    <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
    <p>Check the browser console (F12) for more details.</p>
  </div>`;
}
