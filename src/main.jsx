import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import './i18n/index.js'; // ← import i18n sebelum App
import App from './App.jsx';

// Buang splash statis dari index.html begitu React siap mengambil alih,
// supaya tidak menumpuk dengan BootLoader yang dirender React.
const bootSplash = document.getElementById('boot-splash');
if (bootSplash) bootSplash.remove();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
