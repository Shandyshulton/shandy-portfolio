import { useLocation } from 'react-router-dom';
import './ParallaxBackdrop.css';

const WORDS = { '/education': 'EDUCATION', '/experience': 'EXPERIENCE' };

// Tiga lapisan dekoratif (jauh → dekat). Tiap lapisan bergeser dengan jarak
// berbeda saat halaman di-scroll, sehingga muncul kesan kedalaman (parallax).
// x/y dalam %, y relatif terhadap tinggi lapisan (200vh).
const LAYERS = [
  { id: 'far', items: [
    ['ring', 8, 10, 120], ['dot', 22, 30, 8], ['ring', 70, 22, 80], ['dot', 88, 48, 10],
    ['ring', 40, 64, 150], ['dot', 14, 80, 8], ['ring', 82, 86, 100], ['dot', 55, 94, 10],
  ] },
  { id: 'mid', items: [
    ['{ }', 6, 18, 34], ['</>', 76, 12, 30], ['01', 90, 38, 26], ['=>', 18, 52, 30],
    ['[ ]', 66, 62, 34], ['&&', 36, 78, 26], ['//', 84, 90, 32], ['()', 10, 96, 30],
  ] },
  { id: 'near', items: [
    ['+', 4, 8, 44], ['cross', 94, 24, 38], ['+', 52, 40, 36], ['cross', 8, 58, 40],
    ['+', 92, 72, 42], ['cross', 46, 88, 36],
  ] },
];

export default function ParallaxBackdrop() {
  const { pathname } = useLocation();
  const word = WORDS[pathname];
  return (
    <div className="pbd" aria-hidden="true">
      {word && (
        <div className="pbd-layer pbd-word" key={pathname}>
          <span className="pbd-bigword">{word}</span>
        </div>
      )}
      {LAYERS.map((layer) => (
        <div className={`pbd-layer pbd-${layer.id}`} key={layer.id}>
          {layer.items.map(([kind, x, y, size], i) => {
            const style = { left: `${x}%`, top: `${y}%`, '--s': `${size}px` };
            if (kind === 'ring') return <span className="pbd-ring" style={style} key={i} />;
            if (kind === 'dot') return <span className="pbd-dot" style={style} key={i} />;
            if (kind === 'cross') return <span className="pbd-cross" style={style} key={i} />;
            return <span className="pbd-glyph mono" style={style} key={i}>{kind}</span>;
          })}
        </div>
      ))}
    </div>
  );
}
