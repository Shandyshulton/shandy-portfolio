import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import './Chatbot.css';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.1-8b-instant';

const SYSTEM_CONTEXT = `Kamu adalah asisten virtual interaktif untuk portfolio website milik Shandy Shulton Shihab.

=== PROFIL ===
Nama: Shandy Shulton Shihab
Fokus: Front-End Developer (dengan kemampuan Full Stack)
Email: ssshandy60@gmail.com
Telepon: +6281212181182
LinkedIn: https://www.linkedin.com/in/shandyshulton-shihab-73a25922a/
GitHub: https://github.com/Shandyshulton
Portfolio: https://shandy-shulton-shihab.vercel.app/
Status: Tersedia untuk magang, freelance, dan kolaborasi

Ringkasan:
Mahasiswa Computer Science di Bina Nusantara University dengan latar belakang Software Engineering dari SMK Telkom Jakarta. Fokus pada front-end web development dengan pengalaman membangun antarmuka yang responsif dan interaktif. Memiliki perhatian kuat pada UI implementation dan struktur kode, serta pengalaman di UI/UX design menggunakan Figma.

=== KEAHLIAN TEKNIS ===
Front-End: HTML, CSS, JavaScript, React.js, Bootstrap, Tailwind CSS, Vite
Back-End: Laravel, MySQL
Tools & Lain: Figma (UI/UX), Jira (project management), Git/GitHub

=== PENDIDIKAN ===
1. Bina Nusantara University (Binus)
   - Program: Computer Science — spesialisasi Database Technology
   - Periode: Agustus 2023 – Agustus 2027 (Expected)

2. SMK Telkom Jakarta
   - Program: Software Engineering (Rekayasa Perangkat Lunak)
   - Periode: Juli 2020 – Juni 2023

=== PROYEK ===
1. PlayStation Rental Management System (Juni 2025)
   - Role: Full Stack Developer
   - Tech: Laravel, MySQL, Bootstrap
   - Deskripsi: Sistem manajemen rental PlayStation berbasis web dengan autentikasi multi-user dan fitur CRUD. Mencakup monitoring transaksi dan manajemen database relasional untuk data pelanggan dan rental.

2. Personal Portfolio Website (Oktober 2025)
   - Role: Front-End Developer
   - Tech: React.js, Vite, Tailwind CSS
   - Link: https://shandy-shulton-shihab.vercel.app/
   - Deskripsi: Website portfolio responsif untuk menampilkan proyek, skill, dan informasi kontak.

3. Petly – Pet Care E-Commerce Website (Desember 2025)
   - Role: Front-End Developer
   - Tech: HTML, CSS, JavaScript, Tailwind CSS, Laravel
   - Deskripsi: Antarmuka responsif untuk halaman product listing, cart, dan checkout. Mengintegrasikan front-end dengan back-end Laravel.

=== PENGALAMAN ORGANISASI ===
1. BNCC (Bina Nusantara Computer Club) — Bina Nusantara University
   - Role: Member | Team Project Management (TPM)
   - Back-End Developer dalam proyek berbasis tim menggunakan Laravel.
   - Belajar project scheduling dan task management menggunakan Jira.

2. Student Council (OSIS) — SMK Telkom Jakarta
   - Divisi: Media and Communications (Juli 2020 – Maret 2023)
   - Membuat desain visual untuk konten media sosial dan publikasi internal.

=== SERTIFIKASI ===
1. BNSP Junior Web Developer Certificate (Telkom DigiUp) — Desember 2022
2. Belajar Dasar Artificial Intelligence — Dicoding Indonesia — Desember 2025
3. English Conversation for Employees: Upper-Intermediate Level (LB LIA) — Februari 2024

=== INSTRUKSI ===
- Jawab pertanyaan seputar profil, skill, proyek, pendidikan, pengalaman, sertifikasi, dan cara menghubungi Shandy
- Jika ditanya di luar topik tersebut, arahkan kembali secara ramah
- Gunakan bahasa yang sama dengan pengguna (Indonesia atau Inggris)
- Jawab singkat, jelas, dan ramah
- Jangan mengarang informasi yang tidak ada di atas
- Untuk pertanyaan kontak, arahkan ke email ssshandy60@gmail.com atau halaman Contact di website`;

const WELCOME_MSG = 'Halo! Saya asisten virtual Shandy. Ada yang ingin kamu tanyakan tentang profil, proyek, atau cara menghubungi Shandy? 👋';

async function sendToGroq(history, userText) {
  const messages = [
    { role: 'system', content: SYSTEM_CONTEXT },
    ...history,
    { role: 'user', content: userText },
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: WELCOME_MSG }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [appeared, setAppeared] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setAppeared(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const buildHistory = () =>
    messages.slice(1).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text,
    }));

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const reply = await sendToGroq(buildHistory(), userText);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      console.error('Groq error:', err);
      const msg = err?.message ?? '';
      let friendlyMsg = 'Maaf, terjadi kesalahan. Silakan coba lagi.';
      if (msg.includes('429')) friendlyMsg = 'Terlalu banyak request. Coba lagi sebentar ya.';
      else if (msg.includes('401') || msg.includes('403')) friendlyMsg = 'API key tidak valid. Silakan cek konfigurasi.';
      setMessages(prev => [...prev, { role: 'assistant', text: friendlyMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`chatbot-root ${appeared ? 'chatbot-appeared' : ''}`}>
      <div className={`chatbot-window ${isOpen ? 'chatbot-window--open' : ''}`} aria-hidden={!isOpen}>
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">
              <Bot size={16} />
            </div>
            <div>
              <p className="chatbot-header-name">Asisten Shandy</p>
              <p className="chatbot-header-status">
                <span className="chatbot-dot" />
                Online
              </p>
            </div>
          </div>
          <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>

        <div className="chatbot-body">
          {messages.map((msg, i) => (
            <div key={i} className={`chatbot-bubble-wrap chatbot-bubble-wrap--${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="chatbot-bubble-avatar">
                  <Bot size={12} />
                </div>
              )}
              <div className={`chatbot-bubble chatbot-bubble--${msg.role}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chatbot-bubble-wrap chatbot-bubble-wrap--assistant">
              <div className="chatbot-bubble-avatar">
                <Bot size={12} />
              </div>
              <div className="chatbot-bubble chatbot-bubble--assistant chatbot-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chatbot-footer">
          <input
            ref={inputRef}
            className="chatbot-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ketik pesan..."
            disabled={loading}
            aria-label="Pesan"
          />
          <button
            className="chatbot-send"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            aria-label="Kirim"
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      <button
        className={`chatbot-toggle ${isOpen ? 'chatbot-toggle--active' : ''}`}
        onClick={() => setIsOpen(p => !p)}
        aria-label="Buka chatbot"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {!isOpen && <span className="chatbot-badge" />}
      </button>
    </div>
  );
}
