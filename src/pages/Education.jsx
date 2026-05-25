import { GraduationCap, Award, Calendar } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import './Education.css';

const education = [
  {
    degree: 'Computer Science — Database Technology',
    institution: 'Bina Nusantara University (BINUS)',
    period: 'Aug 2023 – Aug 2027 (Expected)',
    type: 'University',
    description:
      'Pursuing a Bachelor\'s degree in Computer Science with a specialization in Database Technology. Engaged in various academic projects, club activities, and hands-on web development work alongside studies.',
    highlights: ['Database Technology Specialization', 'Active Member of BNCC', 'Full-Stack Project Development'],
  },
  {
    degree: 'Software Engineering',
    institution: 'SMK Telkom Jakarta',
    period: 'Jul 2020 – Jun 2023',
    type: 'Vocational High School',
    description:
      'Completed a 3-year vocational program focused on Software Engineering fundamentals, including programming, web development, and software project management. Graduated with a strong technical foundation.',
    highlights: ['Software Engineering Fundamentals', 'Web Development Basics', 'Active in Student Council (OSIS)'],
  },
];

const certifications = [
  {
    title: 'BNSP Junior Web Developer Certificate',
    issuer: 'Telkom DigiUp',
    date: 'December 2022',
    color: '#c8522a',
  },
  {
    title: 'English Conversation for Employees: Upper-Intermediate',
    issuer: 'LB LIA Language Institute',
    date: 'February 2024',
    color: '#2a7cc8',
  },
  {
    title: 'Belajar Dasar Artificial Intelligence',
    issuer: 'Dicoding Indonesia',
    date: 'December 2025',
    color: '#8b2ac8',
  },
];

export default function Education() {
  return (
    <div className="page edu-page">
      <Helmet>
        <title>Education | Shandy Shulton Shihab</title>
        <meta name="description" content="Academic profile of Shandy Shulton Shihab, majoring in Computer Science (Database Technology) at Binus University and professional certifications." />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Education | Shandy Shulton Shihab" />
        <meta property="og:description" content="Academic background and certifications profile." />
        <meta property="og:image" content="/images/PP.jpeg" />
      </Helmet>
      <p className="section-label">Academic Background</p>
      <h1 className="section-title">Education</h1>

      <div className="edu-list">
        {education.map((e, i) => (
          <div key={e.degree} className="edu-card animate-fadeUp" style={{ animationDelay: `${i * 0.15}s` }}>
            <div className="edu-timeline">
              <div className="edu-icon-wrap">
                <GraduationCap size={22} />
              </div>
              <div className="edu-line" />
            </div>
            <div className="edu-content">
              <span className="edu-type-badge">{e.type}</span>
              <h2 className="edu-degree">{e.degree}</h2>
              <p className="edu-institution">{e.institution}</p>
              <div className="edu-period">
                <Calendar size={13} />
                {e.period}
              </div>
              <p className="edu-desc">{e.description}</p>
              <ul className="edu-highlights">
                {e.highlights.map(h => (
                  <li key={h}><span className="hl-dot" /> {h}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="cert-section animate-fadeUp delay-3">
        <p className="section-label" style={{ marginTop: 0 }}>Credentials</p>
        <h2 style={{ fontFamily: 'Syne', fontSize: '1.8rem', marginBottom: 32 }}>Certifications</h2>
        <div className="cert-grid">
          {certifications.map((c) => (
            <div key={c.title} className="cert-card">
              <div className="cert-icon" style={{ background: c.color + '18', color: c.color }}>
                <Award size={20} />
              </div>
              <h3 className="cert-title">{c.title}</h3>
              <p className="cert-issuer">{c.issuer}</p>
              <span className="cert-date mono">{c.date}</span>
              <div className="cert-bar" style={{ background: c.color }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
