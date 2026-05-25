import { GitFork, Mail, Globe, Download, ArrowRight, Code2, Palette, Database } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import './Home.css';

export default function Home() {
  const skills = [
    { icon: <Code2 size={18} />, label: 'Front-End', items: ['React.js', 'JavaScript', 'Tailwind CSS', 'Bootstrap'] },
    { icon: <Database size={18} />, label: 'Back-End', items: ['Laravel', 'MySQL', 'PHP', 'Golang'] },
    { icon: <Palette size={18} />, label: 'Design & Tools', items: ['Figma', 'Laragon', 'Jira', 'Git', 'Gitlab'] },
  ];

  return (
    <div className="home-page">
      <Helmet>
        <title>Shandy Shulton Shihab | Full Stack Developer Portfolio</title>
        <meta name="description" content="Computer Science undergraduate at Binus University with hands-on experience in building responsive, high-performance web applications." />
        
        {/* Open Graph untuk Preview Sosmed seperti LinkedIn / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Shandy Shulton Shihab | Full Stack Developer" />
        <meta property="og:description" content="Computer Science student at Binus University specializing in full-stack web development." />
        <meta property="og:image" content="/images/PP.jpeg" />
      </Helmet>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-greeting animate-fadeUp">
              <span className="mono greeting-tag">{"<hello world />"}</span>
            </p>
            <h1 className="hero-name animate-fadeUp delay-1">
              Shandy<br />
              <span className="name-accent">Shulton</span><br />
              Shihab
            </h1>
            <div className="hero-role animate-fadeUp delay-2">
              <span className="role-badge">Full Stack Developer</span>
              <span className="role-divider">·</span>
            </div>
            <p className="hero-bio animate-fadeUp delay-3">
              Computer Science undergraduate at <strong>Binus University</strong> with hands-on experience in 
              building responsive, high-performance web applications. Dedicated to delivering clean UI implementation, 
              maintainable code structures, and scalable design systems that optimize user experience.
            </p>

            <div className="hero-actions animate-fadeUp delay-4">
              <a href="/CV_Shandy.pdf" download className="btn btn-primary">
                <Download size={16} />
                Download CV
              </a>
              <a href="/contact" className="btn btn-outline">
                Get in Touch <ArrowRight size={16} />
              </a>
            </div>

            <div className="hero-socials animate-fadeUp delay-5">
              <a href="https://github.com/Shandyshulton" target="_blank" rel="noreferrer" className="social-link" aria-label="GitHub">
                <GitFork size={20} />
              </a>
              <a href="mailto:ssshandy60@gmail.com" className="social-link" aria-label="Email">
                <Mail size={20} />
              </a>
              <a href="https://www.linkedin.com/in/shandy-shulton-shihab-73a25922a/" target="_blank" rel="noreferrer" className="social-link" aria-label="LinkedIn">
                <Globe size={20} />
              </a>
            </div>
          </div>

          <div className="hero-photo-wrap animate-fadeIn delay-2">
            <div className="hero-photo-frame">
              <img 
                src="/images/PP.jpeg" 
                alt="Shandy Shulton Shihab" 
                className="hero-photo" 
              />
              
              <div className="photo-deco deco-1"></div>
              <div className="photo-deco deco-2"></div>
            </div>
            <div className="photo-status">
              <span className="status-dot"></span>
              Available for Internship
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-line"></div>
          <span className="mono" style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>SCROLL</span>
        </div>
      </section>

      {/* Skills */}
      <section className="skills-section">
        <p className="section-label">What I do</p>
        <h2 className="section-title">Skills & Stack</h2>
        <div className="skills-grid">
          {skills.map((s, i) => (
            <div key={s.label} className="skill-card animate-fadeUp" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="skill-card-header">
                <span className="skill-icon">{s.icon}</span>
                <h3 className="skill-label">{s.label}</h3>
              </div>
              <div className="skill-tags">
                {s.items.map(item => (
                  <span key={item} className="tag">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About strip */}
      <section className="about-strip">
        <div className="strip-grid">
          <div className="strip-left">
            <p className="section-label">About Me</p>
            <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(1.6rem,4vw,2.4rem)', lineHeight: 1.2, marginBottom: 20 }}>
              Building the web,<br />one component at a time.
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 16 }}>
              I'm a Software Engineering graduate from SMK Telkom Jakarta, now pursuing Computer Science
              (Database Technology specialization) at Bina Nusantara University.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
              My journey started with building UIs and grew into full-stack development — from React frontends
              to Laravel backends and MySQL databases. I take pride in writing clean, maintainable code
              and translating designs into pixel-perfect interfaces.
            </p>
          </div>
          <div className="strip-stats">
            {[
              { num: '3+', label: 'Projects Built' },
              { num: '2+', label: 'Years Coding' },
              { num: '5+', label: 'Tech Stacks' },
              { num: '3', label: 'Certifications' },
            ].map(s => (
              <div key={s.label} className="stat-item">
                <span className="stat-num">{s.num}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
