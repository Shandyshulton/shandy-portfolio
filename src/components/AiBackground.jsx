// Latar "developer AI" yang halus: grid + orb glow.
// Versi untuk halaman konten (lebih redup dari hero Home, tanpa token melayang
// agar tidak mengganggu keterbacaan).

export default function AiBackground({ muted = false }) {
  return (
    <div className={`ai-bg ${muted ? 'ai-bg--muted' : ''}`} aria-hidden="true">
      <div className="ai-grid" />
      <div className="ai-orb ai-orb--1" />
      <div className="ai-orb ai-orb--2" />
    </div>
  );
}
