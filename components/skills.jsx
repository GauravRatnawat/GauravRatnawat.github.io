const SKILLS = [
  {
    cat: 'Languages', sig: 'S/01',
    items: [
      ['Kotlin', 'primary'],
      ['Java (11–21)', 'primary'],
      ['Go', 'working'],
      ['TypeScript · NestJS', 'working'],
      ['Vue.js', 'working'],
    ],
  },
  {
    cat: 'Frameworks', sig: 'S/02',
    items: [
      ['Spring Boot', 'daily'],
      ['Quarkus', 'daily'],
      ['Hibernate', 'daily'],
      ['JOOQ', 'daily'],
      ['QueryDSL', 'used'],
      ['SiteWhere IoT', 'used'],
    ],
  },
  {
    cat: 'Messaging & Streams', sig: 'S/03',
    items: [
      ['Kafka', 'expert'],
      ['Kafka Streams', 'expert'],
      ['AWS SQS', 'daily'],
      ['AWS Kinesis', 'used'],
      ['ActiveMQ', 'used'],
    ],
  },
  {
    cat: 'Databases & Data', sig: 'S/04',
    items: [
      ['PostgreSQL', 'expert'],
      ['AWS Aurora', 'expert'],
      ['AWS RDS', 'daily'],
      ['MongoDB', 'daily'],
      ['Azure SQL Server', 'used'],
      ['Lakehouse · S3 · Glue · Athena', 'daily'],
    ],
  },
  {
    cat: 'Cloud & Infrastructure', sig: 'S/05',
    items: [
      ['AWS', 'expert'],
      ['Azure', 'daily'],
      ['GCP', 'working'],
      ['Kubernetes', 'expert'],
      ['Docker', 'daily'],
      ['Multi-Region', 'daily'],
    ],
  },
  {
    cat: 'DevOps & Quality', sig: 'S/06',
    items: [
      ['GitHub Actions', 'daily'],
      ['Argo CD', 'daily'],
      ['Azure DevOps', 'used'],
      ['Jenkins', 'used'],
      ['SonarQube', 'daily'],
      ['Karate · Gatling · JMeter', 'daily'],
    ],
  },
  {
    cat: 'Architectures', sig: 'S/07',
    items: [
      ['Event-Driven', 'expert'],
      ['Microservices', 'expert'],
      ['Distributed Systems', 'expert'],
      ['Streaming', 'expert'],
      ['CQRS · Saga', 'daily'],
      ['Service-Oriented', 'daily'],
    ],
  },
  {
    cat: 'Observability & SRE', sig: 'S/08',
    items: [
      ['Datadog', 'expert'],
      ['OpenSearch', 'daily'],
      ['CloudWatch', 'daily'],
      ['Tracing · Metrics · Alerting', 'daily'],
      ['SLA / SLO', 'daily'],
      ['MTTR reduction', 'daily'],
    ],
  },
  {
    cat: 'Security & Compliance', sig: 'S/09',
    items: [
      ['GDPR data deletion', 'expert'],
      ['Data lineage', 'daily'],
      ['PII handling', 'daily'],
      ['Secure API design', 'daily'],
      ['Audit-ready systems', 'daily'],
    ],
  },
];

// Bucket LinkedIn skills into sensible groups
const LI_BUCKETS = [
  { k: 'Leadership & Craft', match: /leadership|management|mentor|collaborat|enable|facilita|stakehold|strateg|vision|review|retrospect|communic|writ|team|recruit|soft skills|project|product road|kpi|performance|direct|enable|knowledge shar/i },
  { k: 'Languages', match: /^(java|kotlin|javascript|typescript|c\+\+|^c$|python|go|scala|sql|programming|coding standards)$|jvm|algorithms|data structures|research/i },
  { k: 'Frameworks & Libraries', match: /spring|hibernate|nestjs|vue|jooq|maven|tomcat/i },
  { k: 'Cloud & Infra', match: /aws|azure|gcp|kubernetes|docker|dns|firewall|endpoint|aks|gitops|linux|cloud/i },
  { k: 'Databases & Data', match: /sql|mysql|oracle|rds|mongo|hibernate|distributed database|database/i },
  { k: 'Architecture & Systems', match: /microservice|architect|system|distrib|design|solution|model|integration|restful|representational|rest api|iot|sitewhere/i },
  { k: 'Process & Delivery', match: /agile|continuous|ci\/cd|tdd|test driven|debug|incident|reliab|monitor|scrum|kanban|xp/i },
  { k: 'Other', match: /.*/ },
];

function bucketSkill(s) {
  for (const b of LI_BUCKETS) if (b.match.test(s)) return b.k;
  return 'Other';
}

function Skills() {
  const [liSkills, setLiSkills] = useState([]);
  const [liCerts, setLiCerts] = useState([]);
  const [skillView, setSkillView] = useState('curated'); // curated | linkedin

  useEffect(() => {
    fetch('data/linkedin-skills.json').then(r => r.json()).then(setLiSkills).catch(() => {});
    fetch('data/linkedin-certs.json').then(r => r.json()).then(setLiCerts).catch(() => {});
  }, []);

  const liBuckets = useMemo(() => {
    const m = {};
    LI_BUCKETS.forEach(b => m[b.k] = []);
    liSkills.forEach(s => { m[bucketSkill(s)].push(s); });
    return LI_BUCKETS.map(b => ({ k: b.k, items: m[b.k] })).filter(b => b.items.length);
  }, [liSkills]);

  // Group certs by authority
  const certsByAuthority = useMemo(() => {
    const m = {};
    liCerts.forEach(c => {
      const a = c.authority || 'Other';
      (m[a] = m[a] || []).push(c);
    });
    // sort keys by count desc
    return Object.entries(m).sort((a, b) => b[1].length - a[1].length);
  }, [liCerts]);

  const headline = [
    { name: 'Spoud Kafka Developer Training', authority: 'Spoud', date: 'Dec 2025', license: 'f91eecd7-ddd6-4ca3-aa47-7fd1f1eb6a2a' },
    { name: 'Microsoft Certified: Azure Fundamentals', authority: 'Microsoft', date: 'Jul 2020' },
    { name: 'Aviatrix Certified Engineer — Multi-Cloud Network Associate', authority: 'Aviatrix', date: 'Jun 2020' },
    { name: 'Scalable Java Microservices · Spring Boot + Cloud', authority: 'Coursera', date: 'Nov 2019', license: 'NQB7U89X9FPS' },
    { name: 'Introduction to Internet of Things (XEE100)', authority: 'Stanford University', date: 'May 2020', license: 'X531415' },
    { name: 'B.Tech, Computer Science & Engineering', authority: 'RGTU, Bhopal', date: '2015' },
  ];

  return (
    <section id="skills">
      <div className="wrap">
        <SectionHead
          num="§ 06 — STACK"
          title='The <span class="it">toolkit,</span> honestly labeled.'
          right={`${SKILLS.length} curated · ${liSkills.length} endorsed`}
        />

        <div className="sc-years" style={{ marginBottom: 28 }}>
          <button className={skillView === 'curated' ? 'on' : ''} onClick={() => setSkillView('curated')}>Curated · {SKILLS.length}</button>
          <button className={skillView === 'linkedin' ? 'on' : ''} onClick={() => setSkillView('linkedin')}>LinkedIn endorsed · {liSkills.length}</button>
        </div>

        {skillView === 'curated' ? (
          <div className="skills-grid">
            {SKILLS.map((s) => (
              <div className="skill-cat" key={s.cat}>
                <div className="k">{s.sig}</div>
                <h4>{s.cat}</h4>
                <ul>
                  {s.items.map(([name, lvl]) => (
                    <li key={name}>
                      <span>{name}</span>
                      <span className="lvl">{lvl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="skills-grid">
            {liBuckets.map((b, i) => (
              <div className="skill-cat" key={b.k}>
                <div className="k">L/{String(i+1).padStart(2,'0')}</div>
                <h4>{b.k} <span style={{color:'var(--ink-mute)', fontSize:13, fontFamily:'var(--mono)'}}>· {b.items.length}</span></h4>
                <ul>
                  {b.items.map(s => (
                    <li key={s}><span>{s}</span><span className="lvl">endorsed</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 56 }}>
          <Eyebrow>Certifications & Education</Eyebrow>
          <div style={{ height: 18 }} />
          <div className="certs">
            {headline.map((c, i) => (
              <div className="cert" key={i}>
                <div className="sig">C/{String(i+1).padStart(2, '0')}</div>
                <div className="t">{c.name} <span className="sub">{c.authority}{c.license ? ` · ${c.license}` : ''}</span></div>
                <div className="d">{c.date}</div>
              </div>
            ))}
          </div>

          {certsByAuthority.length > 0 && (
            <details className="cert-details" style={{ marginTop: 24 }}>
              <summary>
                <span className="eyebrow">Training archive · {liCerts.length} courses across {certsByAuthority.length} sources</span>
                <span className="sum-hint">click to expand ▾</span>
              </summary>
              <div style={{ padding: '0 0 8px' }}>
                {certsByAuthority.map(([auth, items]) => (
                  <div key={auth} className="cert-auth-group">
                    <div className="cag-head">
                      <span className="cag-name">{auth}</span>
                      <span className="cag-count">{items.length} course{items.length === 1 ? '' : 's'}</span>
                    </div>
                    <div className="cert-list">
                      {items.map((c, i) => (
                        <div className="cert-row" key={i}>
                          <div className="cr-n">{String(i+1).padStart(2, '0')}</div>
                          <div className="cr-t">
                            {c.url ? <a href={c.url} target="_blank" rel="noopener">{c.name}</a> : c.name}
                          </div>
                          <div className="cr-d">{c.date || ''}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </section>
  );
}

const PUBLIC_PROJECTS = [
  {
    name: 'claudetop',
    desc: 'Terminal dashboard for Claude Code token usage and cost tracking.',
    stack: 'JavaScript',
    url: 'https://github.com/GauravRatnawat/claudetop',
  },
  {
    name: 'journal-recorder-agent',
    desc: 'Claude Code subagent that records coding sessions as searchable engineering notes.',
    stack: 'Shell',
    url: 'https://github.com/GauravRatnawat/journal-recorder-agent',
  },
  {
    name: 'job-search-plugin',
    desc: 'AI-powered Claude Code plugin for job discovery, fit scoring, and application prep.',
    stack: 'Shell',
    url: 'https://github.com/GauravRatnawat/job-search-plugin',
  },
  {
    name: 'ai-review-plugin',
    desc: 'IntelliJ plugin that reviews Git diffs with AI and renders findings inline.',
    stack: 'Kotlin',
    url: 'https://github.com/GauravRatnawat/ai-review-plugin',
  },
  {
    name: 'murmur',
    desc: 'Local-first AI meeting notes with audio capture, Whisper transcription, and LLM summaries.',
    stack: 'Python',
    url: 'https://github.com/GauravRatnawat/murmur',
  },
  {
    name: 'rfc-async-job-problem-details',
    desc: 'Internet-Draft extending RFC 9457 with reusable async job failure problem details.',
    stack: 'Spec / HTML',
    url: 'https://github.com/GauravRatnawat/rfc-async-job-problem-details',
  },
];

function Contact() {
  return (
    <section id="contact">
      <div className="wrap">
        <SectionHead
          num="§ 05 — CONTACT"
          title='Building something <span class="it">hard?</span>'
          right="Open to Staff / Principal · Berlin · Remote-EU"
        />

        <div className="contact-big">
          Let’s <span className="it">talk.</span><br/>
          <a href="mailto:contact@gauravratnawat.com">contact@gauravratnawat.com</a>
        </div>

        <div className="contact-grid">
          <div className="c">
            <div className="k">Email</div>
            <div className="v">contact@gauravratnawat.com</div>
          </div>
          <div className="c">
            <div className="k">Phone</div>
            <div className="v">+49 152 92604891</div>
          </div>
          <div className="c">
            <div className="k">LinkedIn</div>
            <div className="v"><a href="https://www.linkedin.com/in/ratnawatgaurav" target="_blank" rel="noopener">linkedin.com/in/ratnawatgaurav</a></div>
          </div>
          <div className="c">
            <div className="k">GitHub</div>
            <div className="v"><a href="https://github.com/GauravRatnawat" target="_blank" rel="noopener">github.com/GauravRatnawat</a></div>
          </div>
          <div className="c">
            <div className="k">Location</div>
            <div className="v">Berlin, DE · UTC+1</div>
          </div>
        </div>

        <div className="oss">
          <Eyebrow>Public Projects</Eyebrow>
          <div className="oss-list">
            {PUBLIC_PROJECTS.map((p, i) => (
              <article className="oss-row" key={p.name}>
                <div className="n">P/{String(i + 1).padStart(2, '0')}</div>
                <div className="t"><a href={p.url} target="_blank" rel="noopener">{p.name}</a></div>
                <div className="d">{p.desc}</div>
                <div className="s">{p.stack}</div>
              </article>
            ))}
          </div>
          <div className="oss-more">
            Browse all repositories on{' '}
            <a href="https://github.com/GauravRatnawat" target="_blank" rel="noopener">github.com/GauravRatnawat</a>
          </div>
        </div>

        <div className="foot">
          <div>© {new Date().getFullYear()} Gaurav Ratnawat</div>
          <div className="c">Typeset in Fraunces, Inter Tight & JetBrains Mono</div>
          <div className="r">Hand-coded · No trackers · v.26.04</div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Skills, Contact });
