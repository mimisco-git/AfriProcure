import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { supabase } from './lib/supabase';
import { CloudGate } from './workspace/CloudGate';
import { WorkspaceProvider, createLocalWorkspace } from './workspace/WorkspaceContext';
import './index.css';

// With Supabase configured the app is multi-user (sign-in + organizations);
// otherwise it runs as a single-user workspace stored in this browser.
const app = supabase ? (
  <CloudGate client={supabase}>
    <App />
  </CloudGate>
) : (
  <WorkspaceProvider value={createLocalWorkspace()}>
    <App />
  </WorkspaceProvider>
);

createRoot(document.getElementById('root')!).render(<StrictMode>{app}</StrictMode>);
