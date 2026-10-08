import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import { initI18n } from './i18n/index.js'; // init i18n (hanya bahasa aktif)
import App from './App.jsx';

// Buang splash statis dari index.html begitu React siap mengambil alih,
// supaya tidak menumpuk dengan BootLoader yang dirender React.
const bootSplash = document.getElementById('boot-splash');
if (bootSplash) bootSplash.remove();

// Tunggu i18n siap (locale bahasa aktif termuat) sebelum render pertama agar
// tidak ada flash key/teks kosong. Hanya 1 bahasa yang diunduh di sini.
initI18n().finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </StrictMode>,
  );
});
