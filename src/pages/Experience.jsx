import { Briefcase, Calendar, MapPin } from 'lucide-react'; // Di-trim ExternalLink yang tidak terpakai agar bebas warning ESLint
import { Helmet } from 'react-helmet-async'; // <-- 1. Import Helmet di paling atas
import './Experience.css';

const experiences = [
  {
    id: 1,
    role: 'Full Stack Developer Intern',
    company: 'PT Indonesia Satu Tujuh (INA17)', // Diperjelas sesuai nama resmi perusahaan
    period: 'Feb 2026 – Present',
    location: 'Jakarta, Indonesia',
    type: 'Internship',
    color: '#c8522a',
    description:
      'Contributed significantly to full-stack web application development, taking charge of backend system logic, database optimization, and modern feature integration.',
    responsibilities: [
      'Developed and optimized backend architectures and RESTful APIs utilizing Go (Gin framework) and Laravel.',
      'Designed and engineered scalable MySQL relational database schemas to enhance internal system workflows.',
      'Implemented dynamic multi-language localization (dynamic JSON structures) and enhanced internal CMS modules.',
      'Strengthened API ecosystem security through the implementation of token expiration mechanisms and proper 401 unauthorized handling.',
      'Collaborated effectively within a development team using version control tools (Git/GitLab) and Agile project tracking.',
    ],
    stack: ['Go', 'Gin', 'Laravel', 'MySQL', 'React.js', 'Git', 'REST API'],
  },
  {
    id: 2,
    role: 'Video Editor Intern',
    company: 'Dunamis Indonesia',
    period: '2025',
    location: 'Jakarta, Indonesia',
    type: 'Internship',
    color: '#2a7cc8',
    description:
      'Interned as a Video Editor at Dunamis Indonesia, a leading management consulting firm. Responsible for producing and editing video content for internal communications, training materials, and corporate presentations.',
    responsibilities: [
      'Edited and produced corporate training and communication videos',
      'Created motion graphics and visual assets for presentations',
      'Managed video project timelines and asset organization',
      'Collaborated with the communications team on content direction',
      'Ensured brand consistency across all visual content',
    ],
    stack: ['Adobe Premiere', 'After Effects', 'Figma', 'Content Creation'],
  },
  {
    id: 3,
    role: 'English Language Course',
    company: 'LB LIA Language Institute',
    period: 'Completed Feb 2024',
    location: 'Jakarta, Indonesia',
    type: 'Course',
    color: '#2ac87a',
    description:
      'Completed an English conversation course at Upper-Intermediate level at LB LIA, one of Indonesia\'s most reputable language institutes. Enhanced professional communication skills in English for workplace settings.',
    responsibilities: [
      'Completed Upper-Intermediate level English curriculum',
      'Practiced business and professional English communication',
      'Improved presentation and verbal communication skills',
      'Engaged in discussions, debates, and role-play scenarios',
    ],
    stack: ['English Communication', 'Business Writing', 'Professional Presentation'],
  },
  {
    id: 4,
    role: 'Member — Team Project Management (TPM)',
    company: 'BNCC (Bina Nusantara Computer Club)',
    period: 'During University Studies',
    location: 'BINUS University',
    type: 'Organization',
    color: '#8b2ac8',
    description:
      'Active member of BNCC, assigned to the Team Project Management division. Contributed as a Back-End Developer and gained additional exposure to front-end development within a collaborative team environment.',
    responsibilities: [
      'Assigned as Back-End Developer using Laravel framework',
      'Gained exposure to Front-End development and UI integration',
      'Learned project scheduling and task management with Jira',
      'Collaborated with cross-functional teams on student projects',
    ],
    stack: ['Laravel', 'Jira', 'Team Collaboration', 'Project Management'],
  },
];

export default function Experience() {
  return (
    <div className="page exp-page">
      {/* 2. Tambahkan block Helmet SEO ini */}
      <Helmet>
        <title>Experience | Shandy Shulton Shihab</title>
        <meta name="description" content="Professional experience and career history of Shandy Shulton Shihab, including Full Stack Developer Internships, corporate video editing, and technical organization tracking." />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Experience | Shandy Shulton Shihab" />
        <meta property="og:description" content="Professional journey and full-stack development internship achievements." />
        <meta property="og:image" content="/images/PP.jpeg" />
      </Helmet>

      <p className="section-label">My Journey</p>
      <h1 className="section-title">Experience</h1>

      <div className="exp-timeline">
        {experiences.map((exp, i) => (
          <div
            key={exp.id}
            className="exp-item animate-fadeUp"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div className="exp-marker">
              <div className="exp-dot" style={{ borderColor: exp.color, background: exp.color + '20' }}>
                <Briefcase size={16} style={{ color: exp.color }} />
              </div>
              {i < experiences.length - 1 && <div className="exp-connector" />}
            </div>

            <div className="exp-card">
              <div className="exp-card-top" style={{ borderLeftColor: exp.color }}>
                <div className="exp-header">
                  <div>
                    <span className="exp-type-badge" style={{ background: exp.color + '18', color: exp.color, borderColor: exp.color + '44' }}>
                      {exp.type}
                    </span>
                    <h2 className="exp-role">{exp.role}</h2>
                    <p className="exp-company">{exp.company}</p>
                  </div>
                  <div className="exp-meta">
                    <span className="exp-meta-item">
                      <Calendar size={13} /> {exp.period}
                    </span>
                    <span className="exp-meta-item">
                      <MapPin size={13} /> {exp.location}
                    </span>
                  </div>
                </div>

                <p className="exp-desc">{exp.description}</p>

                <ul className="exp-responsibilities">
                  {exp.responsibilities.map(r => (
                    <li key={r}>
                      <span className="resp-arrow" style={{ color: exp.color }}>→</span>
                      {r}
                    </li>
                  ))}
                </ul>

                <div className="exp-stack">
                  {exp.stack.map(s => (
                    <span key={s} className="tag">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}