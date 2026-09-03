import { useEffect, useState } from 'react';
import { Minus, X } from 'lucide-react';

// Label bahasa per ekstensi berkas (untuk chip di tab).
const LANG_HINT = {
  ts: 'TS',
  log: 'LOG',
  md: 'MD',
  sh: 'SH',
  json: 'JSON',
  js: 'JS',
  jsx: 'TSX',
  css: 'CSS',
};

export default function DevShell({ file, lang = 'ts', status = 'ready', children, right }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Animasi masuk halus setelah mount (hanya saat user tak reduced-motion).
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const ext = (file.split('.').pop() || lang).toLowerCase();
  const langLabel = LANG_HINT[ext] ?? LANG_HINT[lang] ?? ext.toUpperCase();

  return (
    <div className={`devshell ${mounted ? 'devshell-in' : ''}`}>
      {/* Title bar editor */}
      <div className="devshell-bar">
        <div className="devshell-dots">
          <span className="ds-dot ds-dot--r" />
          <span className="ds-dot ds-dot--y" />
          <span className="ds-dot ds-dot--g" />
        </div>

        <div className="devshell-tab mono">
          <span className="devshell-caret">❯</span>
          <span className="devshell-filename">{file}</span>
          <span className="devshell-lang" aria-hidden="true">{langLabel}</span>
        </div>

        <div className="devshell-actions" aria-hidden="true">
          <button type="button" className="devshell-act"><Minus size={12} /></button>
          <button type="button" className="devshell-act"><Square size={11} /></button>
          <button type="button" className="devshell-act"><X size={12} /></button>
        </div>

        <div className="devshell-status mono">
          <span className="devshell-status-dot" />
          {status}
        </div>
      </div>

      {/* Konten halaman */}
      <div className="devshell-body">
        {children}
        <span className="devshell-corner" aria-hidden="true">
          &lt;{right?.tech ?? lang} /&gt;
        </span>
      </div>

      {/* Garis status bawah ala editor */}
      <div className="devshell-foot mono">
        <span>
          {right?.branch ?? 'main'}
          <span className="devshell-foot-sep">·</span>
          Ln {right ? right.ln : 1}, Col 1
        </span>
        <span className="devshell-foot-right">
          {right?.lang ?? langLabel} <span className="devshell-foot-sep">·</span> UTF-8
        </span>
      </div>
    </div>
  );
}

// Ikon "persegi" kecil (lucide Square kecil) untuk tombol aksi.
function Square({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  );
}
