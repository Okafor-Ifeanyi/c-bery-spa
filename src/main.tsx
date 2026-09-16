import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { enableTouchActiveStates, markIntroPending } from './lib/motion';
import './styles/tokens.css';
import './styles/base.css';
import './styles/motion.css';

// Before the first render, so the page-load sequence never paints a frame in
// the wrong state. No-ops under prefers-reduced-motion or on a deep link.
markIntroPending();
// Lets iOS Safari show :active press states on cards and tiles.
enableTouchActiveStates();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
