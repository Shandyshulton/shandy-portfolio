// Sumber data tunggal untuk node 3D dan chip skill di halaman,
// supaya hover di salah satunya bisa menyalakan yang lain.
export const STACK_GROUPS = [
  {
    id: 'frontend',
    items: [
      { id: 'react', label: 'React.js', color: '#61dafb' },
      { id: 'next', label: 'Next.js', color: '#1c00bb' },
      { id: 'js', label: 'JavaScript', color: '#f7df1e' },
      { id: 'tailwind', label: 'Tailwind CSS', color: '#38bdf8' },
      { id: 'vite', label: 'Vite', color: '#a78bfa' },
      { id: 'bootstrap', label: 'Bootstrap', color: '#a970ff' },
      { id: 'html', label: 'HTML & CSS', color: '#ff7a45' },
    ],
  },
  {
    id: 'backend',
    items: [
      { id: 'laravel', label: 'Laravel', color: '#ff5a4d' },
      { id: 'go', label: 'Golang', color: '#00c4e0' },
      { id: 'php', label: 'PHP', color: '#8f9bd6' },
      { id: 'mysql', label: 'MySQL', color: '#f5a524' },
      { id: 'rest', label: 'REST API', color: '#5eead4' },
      { id: 'figma', label: 'Figma', color: '#f472b6' },
    ],
  },
];

export const STACK_FLAT = STACK_GROUPS.flatMap((g, gi) =>
  g.items.map((item, i) => ({ ...item, group: gi, index: i, count: g.items.length })),
);
