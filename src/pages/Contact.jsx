import { useState } from 'react';
import { Mail, GitFork, Globe, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { fetchCms } from '../lib/cmsApi.js';
import { useCmsSettings } from '../lib/useCmsProfile.js';
import AiBackground from '../components/AiBackground.jsx';
import Reveal from '../components/Reveal.jsx';
import DevShell from '../components/DevShell.jsx';
import './Contact.css';

const SITE_URL = 'https://www.shandyshultonshihab.my.id/';
const PROFILE_IMAGE = `${SITE_URL}images/PP.jpeg`;

export default function Contact() {
  const { t } = useTranslation();
  const settings = useCmsSettings();
  const profile = settings.general.profile;
  const contactContent = settings.contact.content;
  const contactForm = settings.contact.form;
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetchCms('/public/contact-submissions', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSent(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to send. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const contacts = [
    { icon: <Mail size={20} />, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { icon: <Phone size={20} />, label: 'Phone', value: profile.phone, href: `tel:${profile.phone}` },
    { icon: <MapPin size={20} />, label: 'Location', value: profile.location, href: null },
    { icon: <GitFork size={20} />, label: 'GitHub', value: profile.github.replace(/^https?:\/\/(www\.)?github\.com\//, ''), href: profile.github },
    { icon: <Globe size={20} />, label: 'LinkedIn', value: profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, ''), href: profile.linkedin },
  ];

  return (
    <div className="page contact-page">
      <AiBackground muted />
      <Helmet>
        <title>Contact | Shandy Shulton Shihab</title>
        <meta name="description" content="Contact Shandy Shulton Shihab for full-stack web development opportunities and collaboration." />
        <link rel="canonical" href={`${SITE_URL}contact`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}contact`} />
        <meta property="og:title" content="Contact | Shandy Shulton Shihab" />
        <meta property="og:description" content="Contact Shandy Shulton Shihab for full-stack web development opportunities and collaboration." />
        <meta property="og:image" content={PROFILE_IMAGE} />
        <meta name="twitter:title" content="Contact | Shandy Shulton Shihab" />
        <meta name="twitter:description" content="Contact Shandy Shulton Shihab for full-stack web development opportunities and collaboration." />
        <meta name="twitter:image" content={PROFILE_IMAGE} />
      </Helmet>
      <Reveal as="p" className="section-label">{contactContent.section_label || t('contact.sectionLabel')}</Reveal>
      <Reveal as="h1" delay={80} className="section-title">{contactContent.title || t('contact.title')}</Reveal>

      <Reveal delay={120}>
        <DevShell file="~/contact.sh" status={t('contact.ready')} right={{ ln: contacts.length + 8, branch: 'main' }}>
          <div className="contact-grid">
            {/* Left — Info */}
            <div className="contact-info">
              <p className="contact-intro">
                <span className="shell-prompt">❯</span> {contactContent.intro || t('contact.intro')}
              </p>

              <div className="contact-list">
                {contacts.map((c) => (
                  <div key={c.label} className="contact-item">
                    <div className="contact-item-icon">{c.icon}</div>
                    <div className="contact-item-body">
                      <p className="contact-item-label">
                        <span className="contact-item-caret">$</span> {c.label}
                      </p>
                      {c.href ? (
                        <a href={c.href} target={c.href.startsWith('http') ? '_blank' : '_self'} rel="noreferrer" className="contact-item-value link">
                          {c.value}
                        </a>
                      ) : (
                        <p className="contact-item-value">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="contact-socials">
                <a href={profile.github} target="_blank" rel="noreferrer" className="social-btn">
                  <GitFork size={18} /> GitHub
                </a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="social-btn social-btn-linkedin">
                  <Globe size={18} /> LinkedIn
                </a>
              </div>
            </div>

            {/* Right — Form */}
            <div className="contact-form-wrap">
              {sent ? (
                <div className="form-success">
                  <CheckCircle size={48} color="var(--accent)" />
                  <h3>{contactForm.success_title || t('contact.form.successTitle')}</h3>
                  <p>{contactForm.success_text || t('contact.form.successText')}</p>
                  <button className="btn btn-outline" onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', message:'' }); }}>
                    {t('contact.form.sendAnother')}
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">{t('contact.form.name')}</label>
                      <input id="name" name="name" type="text" placeholder={t('contact.form.namePlaceholder')} required value={form.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">{t('contact.form.email')}</label>
                      <input id="email" name="email" type="email" placeholder={t('contact.form.emailPlaceholder')} required value={form.email} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">{t('contact.form.subject')}</label>
                    <input id="subject" name="subject" type="text" placeholder={t('contact.form.subjectPlaceholder')} required value={form.subject} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">{t('contact.form.message')}</label>
                    <textarea id="message" name="message" rows="6" placeholder={t('contact.form.messagePlaceholder')} required value={form.message} onChange={handleChange} />
                  </div>
                  <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
                    {loading ? (
                      <span className="spinner" />
                    ) : (
                      <><Send size={16} /> {t('contact.form.send')}</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </DevShell>
      </Reveal>
    </div>
  );
}
