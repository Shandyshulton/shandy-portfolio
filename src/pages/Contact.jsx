import { useState } from 'react';
import { Mail, GitFork, Globe, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("access_key", "764e5437-356e-42f6-9887-98a4df81f2a5"); 
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("subject", form.subject);
    formData.append("message", form.message);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSent(true); 
      } else {
        alert("Terjadi kesalahan: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Gagal mengirim pesan. Silakan periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  };

  const contacts = [
    {
      icon: <Mail size={20} />,
      label: 'Email',
      value: 'ssshandy60@gmail.com',
      href: 'mailto:ssshandy60@gmail.com',
    },
    {
      icon: <Phone size={20} />,
      label: 'Phone',
      value: '+62 812-1218-1182',
      href: 'tel:+6281212181182',
    },
    {
      icon: <MapPin size={20} />,
      label: 'Location',
      value: 'Jakarta, Indonesia',
      href: null,
    },
    {
      icon: <GitFork size={20} />,
      label: 'GitHub',
      value: 'Shandyshulton',
      href: 'https://github.com/Shandyshulton',
    },
    {
      icon: <Globe size={20} />,
      label: 'LinkedIn',
      value: 'shandy-shulton-shihab',
      href: 'https://www.linkedin.com/in/shandy-shulton-shihab-73a25922a/',
    },
  ];

  return (
    <div className="page contact-page">
      <p className="section-label">Get in Touch</p>
      <h1 className="section-title">Contact Me</h1>

      <div className="contact-grid">
        {/* Left — Info */}
        <div className="contact-info animate-slideLeft">
          <p className="contact-intro">
            I'm currently open to internship opportunities, freelance projects, and
            collaborations. Feel free to reach out — I'd love to connect!
          </p>

          <div className="contact-list">
            {contacts.map(c => (
              <div key={c.label} className="contact-item">
                <div className="contact-item-icon">{c.icon}</div>
                <div>
                  <p className="contact-item-label">{c.label}</p>
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
            <a href="https://github.com/Shandyshulton" target="_blank" rel="noreferrer" className="social-btn">
              <GitFork size={18} /> GitHub
            </a>
            <a href="https://www.linkedin.com/in/shandy-shulton-shihab-73a25922a/" target="_blank" rel="noreferrer" className="social-btn social-btn-linkedin">
              <Globe size={18} /> LinkedIn
            </a>
          </div>
        </div>

        {/* Right — Form */}
        <div className="contact-form-wrap animate-fadeUp delay-2">
          {sent ? (
            <div className="form-success">
              <CheckCircle size={48} color="var(--accent)" />
              <h3>Message Sent!</h3>
              <p>Thanks for reaching out, Shandy will get back to you soon.</p>
              <button className="btn btn-outline" onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', message:'' }); }}>
                Send Another
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input id="name" name="name" type="text" placeholder="John Doe" required value={form.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input id="email" name="email" type="email" placeholder="john@example.com" required value={form.email} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input id="subject" name="subject" type="text" placeholder="Internship Opportunity / Collaboration" required value={form.subject} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows="6" placeholder="Hello Shandy, I'd like to..." required value={form.message} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <><Send size={16} /> Send Message</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
