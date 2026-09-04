import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendChatMessage } from '../lib/chatApi.js';
import './Chatbot.css';

// Saran pertanyaan cepat (biar pengunjung tahu apa yang bisa ditanyakan).
const QUICK_ACTIONS = [
  { key: 'chat.quickProjects' },
  { key: 'chat.quickSkills' },
  { key: 'chat.quickContact' },
];

const SharaAvatar = ({ className = '' }) => (
  <img src="/shara.png" alt="Shara" className={`chatbot-shara-img ${className}`} />
);

export default function Chatbot() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [appeared, setAppeared] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const welcomeSentRef = useRef(false);

  // Tampilkan pesan sambutan sekali, dalam bahasa aktif.
  useEffect(() => {
    if (welcomeSentRef.current) return;
    welcomeSentRef.current = true;
    setMessages([{ role: 'assistant', text: t('chat.welcome'), isWelcome: true }]);
  }, [t]);

  useEffect(() => {
    const timer = setTimeout(() => setAppeared(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll ke pesan terbaru. Pakai scrollTop pada container (bukan
  // scrollIntoView) supaya andal walau window chat tertutup/semula tersembunyi.
  const scrollToBottom = (behavior = 'smooth') => {
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, loading]);

  // Tampilkan tombol "ke bawah" saat user scroll ke atas (chat panjang).
  const handleBodyScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 120);
  };

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const buildHistory = () =>
    messages
      .filter((m) => !m.isWelcome)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text,
      }));

  const appendMessage = (msg) => setMessages((prev) => [...prev, msg]);

  const sendMessage = async (text) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;
    setInput('');
    appendMessage({ role: 'user', text: userText });
    setLoading(true);

    try {
      const reply = await sendChatMessage({
        message: userText,
        history: buildHistory(),
        locale: i18n.language,
      });
      appendMessage({ role: 'assistant', text: reply });
    } catch (err) {
      console.error('Chat error:', err);
      appendMessage({ role: 'assistant', text: t('chat.error') });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Hanya tampilkan quick action di awal percakapan (sebelum user bertanya).
  const showQuickActions = messages.filter((m) => !m.isWelcome).length === 0;

  return (
    <div className={`chatbot-root ${appeared ? 'chatbot-appeared' : ''}`}>
      <div className={`chatbot-window ${isOpen ? 'chatbot-window--open' : ''}`} aria-hidden={!isOpen}>
        <div className="chatbot-header">
          <div className="chatbot-header-orb" aria-hidden="true" />
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">
              <SharaAvatar />
            </div>
            <div>
              <p className="chatbot-header-name">{t('chat.headerName')}</p>
              <p className="chatbot-header-status">
                <span className="chatbot-dot" />
                <span className="chatbot-status-ping" />
                {t('chat.status')}
              </p>
            </div>
          </div>
          <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label={t('chat.close')}>
            <X size={16} />
          </button>
        </div>

        <div className="chatbot-body" ref={bodyRef} onScroll={handleBodyScroll}>
          <div className="chatbot-ai-chip">
            <Sparkles size={11} />
            Shara · {t('chat.tagline')}
          </div>

          {messages.map((msg, i) => (
            <div key={i} className={`chatbot-bubble-wrap chatbot-bubble-wrap--${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="chatbot-bubble-avatar">
                  <SharaAvatar />
                </div>
              )}
              <div className={`chatbot-bubble chatbot-bubble--${msg.role}`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: (props) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" />
                      ),
                      table: (props) => (
                        <div className="chatbot-table-wrap">
                          <table {...props} />
                        </div>
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}

          {showQuickActions && !loading && (
            <div className="chatbot-quick">
              <p className="chatbot-quick-label">{t('chat.tryAsk')}</p>
              <div className="chatbot-quick-grid">
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    className="chatbot-quick-btn"
                    onClick={() => sendMessage(t(a.key))}
                  >
                    {t(a.key)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="chatbot-bubble-wrap chatbot-bubble-wrap--assistant">
              <div className="chatbot-bubble-avatar">
                <SharaAvatar />
              </div>
              <div className="chatbot-bubble chatbot-bubble--assistant chatbot-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        {showScrollBtn && (
          <button
            type="button"
            className="chatbot-scroll-bottom"
            onClick={() => scrollToBottom('smooth')}
            aria-label={t('chat.scrollBottom')}
          >
            <ArrowDown size={16} />
          </button>
        )}

        <div className="chatbot-footer">
          <input
            ref={inputRef}
            className="chatbot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={t('chat.placeholder')}
            disabled={loading}
            aria-label={t('chat.placeholder')}
          />
          <button
            className="chatbot-send"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            aria-label={t('chat.send')}
          >
            {loading ? <span className="chatbot-send-loader" /> : <Send size={15} />}
          </button>
        </div>
      </div>

      <button
        className={`chatbot-toggle ${isOpen ? 'chatbot-toggle--active' : ''}`}
        onClick={() => setIsOpen((p) => !p)}
        aria-label={isOpen ? t('chat.close') : t('chat.open')}
      >
        {isOpen ? <X size={22} /> : <SharaAvatar className="chatbot-shara-img--toggle" />}
        {!isOpen && <span className="chatbot-badge" />}
      </button>
    </div>
  );
}
