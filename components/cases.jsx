function ArchDiagram() {
  // Simple SVG architecture diagram for the Transaction Data Platform
  return (
    <div className="arch">
      <div style={{display:'flex', justifyContent:'space-between', marginBottom: 16, color:'var(--ink-mute)'}}>
        <span>FIG. 01 — TRANSACTION DATA PLATFORM · HIGH-LEVEL</span>
        <span>N26 / Berlin</span>
      </div>
      <svg viewBox="0 0 900 220" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
          </marker>
          <pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="var(--rule)" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="900" height="220" fill="url(#dots)" opacity="0.5" />

        {/* producers */}
        <g fontFamily="var(--mono)" fontSize="10" fill="var(--ink)">
          <rect x="20" y="30" width="130" height="36" rx="2" fill="var(--bg)" stroke="var(--rule)"/>
          <text x="85" y="52" textAnchor="middle">Card Auth</text>
          <rect x="20" y="80" width="130" height="36" rx="2" fill="var(--bg)" stroke="var(--rule)"/>
          <text x="85" y="102" textAnchor="middle">Payments</text>
          <rect x="20" y="130" width="130" height="36" rx="2" fill="var(--bg)" stroke="var(--rule)"/>
          <text x="85" y="152" textAnchor="middle">Transfers</text>
        </g>

        {/* kafka */}
        <g>
          <rect x="210" y="60" width="110" height="110" rx="2" fill="var(--bg-elev)" stroke="var(--accent)" strokeWidth="1.2"/>
          <text x="265" y="85" textAnchor="middle" fontFamily="var(--mono)" fontSize="10" fill="var(--accent)">KAFKA</text>
          <text x="265" y="120" textAnchor="middle" fontFamily="var(--serif)" fontSize="20" fill="var(--ink)">500M/mo</text>
          <text x="265" y="148" textAnchor="middle" fontFamily="var(--mono)" fontSize="9" fill="var(--ink-dim)">ingest · streams</text>
        </g>

        {/* services */}
        <g fontFamily="var(--mono)" fontSize="10" fill="var(--ink)">
          <rect x="380" y="40" width="150" height="42" rx="2" fill="var(--bg)" stroke="var(--rule)"/>
          <text x="455" y="58" textAnchor="middle">TX API · p99 &lt;1s</text>
          <text x="455" y="72" textAnchor="middle" fill="var(--ink-mute)" fontSize="9">Spring Boot · K8s</text>

          <rect x="380" y="95" width="150" height="42" rx="2" fill="var(--bg)" stroke="var(--rule)"/>
          <text x="455" y="113" textAnchor="middle">Enrichment</text>
          <text x="455" y="127" textAnchor="middle" fill="var(--ink-mute)" fontSize="9">Kafka Streams</text>

          <rect x="380" y="150" width="150" height="42" rx="2" fill="var(--bg)" stroke="var(--rule)"/>
          <text x="455" y="168" textAnchor="middle">GDPR Deleter</text>
          <text x="455" y="182" textAnchor="middle" fill="var(--ink-mute)" fontSize="9">20+ systems</text>
        </g>

        {/* sinks */}
        <g fontFamily="var(--mono)" fontSize="10" fill="var(--ink)">
          <rect x="590" y="30" width="140" height="36" rx="2" fill="var(--bg)" stroke="var(--rule)"/>
          <text x="660" y="52" textAnchor="middle">Aurora · Redis</text>

          <rect x="590" y="80" width="140" height="36" rx="2" fill="var(--bg)" stroke="var(--rule)"/>
          <text x="660" y="102" textAnchor="middle">OpenSearch</text>

          <rect x="590" y="130" width="140" height="36" rx="2" fill="var(--bg)" stroke="var(--rule)"/>
          <text x="660" y="152" textAnchor="middle">Lakehouse</text>
          <text x="660" y="178" textAnchor="middle" fill="var(--ink-mute)" fontSize="9">Flink · S3 · Glue · Athena</text>
        </g>

        {/* consumers */}
        <g fontFamily="var(--mono)" fontSize="10" fill="var(--ink-dim)">
          <rect x="770" y="30" width="110" height="36" rx="2" fill="var(--bg)" stroke="var(--rule-soft)" strokeDasharray="2 3"/>
          <text x="825" y="52" textAnchor="middle">Compliance</text>
          <rect x="770" y="80" width="110" height="36" rx="2" fill="var(--bg)" stroke="var(--rule-soft)" strokeDasharray="2 3"/>
          <text x="825" y="102" textAnchor="middle">Product</text>
          <rect x="770" y="130" width="110" height="36" rx="2" fill="var(--bg)" stroke="var(--rule-soft)" strokeDasharray="2 3"/>
          <text x="825" y="152" textAnchor="middle">Regulators</text>
        </g>

        {/* arrows */}
        <g stroke="var(--accent)" strokeWidth="1" fill="none" markerEnd="url(#arr)">
          <line x1="150" y1="48" x2="208" y2="80"/>
          <line x1="150" y1="98" x2="208" y2="110"/>
          <line x1="150" y1="148" x2="208" y2="140"/>
          <line x1="320" y1="85" x2="378" y2="60"/>
          <line x1="320" y1="115" x2="378" y2="115"/>
          <line x1="320" y1="145" x2="378" y2="170"/>
          <line x1="530" y1="60" x2="588" y2="48"/>
          <line x1="530" y1="115" x2="588" y2="98"/>
          <line x1="530" y1="170" x2="588" y2="148"/>
          <line x1="730" y1="48" x2="768" y2="48"/>
          <line x1="730" y1="98" x2="768" y2="98"/>
          <line x1="730" y1="148" x2="768" y2="148"/>
        </g>
      </svg>
    </div>
  );
}

const CASES = [
  {
    num: 'C/01',
    client: 'N26 Bank · Berlin',
    title: 'Transaction Data <span class="it">Platform</span>',
    role: 'Lead Engineer · Architect · Owner',
    stack: ['Kotlin', 'Java 17', 'Spring Boot 3', 'Kafka', 'Kafka Streams', 'PostgreSQL', 'Aurora', 'Redis', 'Flink', 'S3', 'Glue', 'Athena', 'Kubernetes', 'AWS', 'OpenSearch', 'Datadog', 'GitHub Actions'],
    hi: ['Kafka','Kotlin','AWS','Kubernetes'],
    stats: [
      { v: '500', sup: 'M+', k: 'tx / month' },
      { v: '99.99', sup: '%', k: 'uptime' },
      { v: '1.5', sup: 'K RPS', k: 'p99 < 1s' },
      { v: '−30', sup: '%', k: 'MTTR' },
    ],
    body: (
      <>
        <p>Led architecture and delivery of an event-driven platform powering compliance, product, and regulatory use cases across the bank. Owned it end-to-end — from the migration strategy that got us off the monolith, to the on-call rotation that keeps it up.</p>
        <p>Designed the Kafka ingestion pipeline, the low-latency read APIs, the enrichment topology, and the lakehouse sink for analytics. Built the GDPR data-deletion flow that spans 20+ downstream systems with audit-ready guarantees.</p>
      </>
    ),
    bullets: [
      'Kafka-based ingestion processing 500M+ transactions/month with sub-second end-to-end latency.',
      'Achieved 99.99% uptime via AWS multi-region, failover-aware deployments.',
      'Designed low-latency microservice APIs (p99 < 1s, ~1.5K RPS) on Kubernetes.',
      'Delivered GDPR-compliant data deletion spanning 20+ systems, audit-ready by design.',
      'Reduced MTTR by 30% through Datadog + OpenSearch observability upgrades.',
      'Mentored engineers, reviewed designs, and influenced architecture across consuming teams.',
    ],
    arch: true,
  },
  {
    num: 'C/02',
    client: 'N26 Bank · Berlin',
    title: 'Assistance <span class="it">Module</span>',
    role: 'Senior Contributor',
    stack: ['Kotlin', 'Spring Boot', 'Kafka', 'Intent Routing'],
    hi: ['Kotlin'],
    stats: [
      { v: '∞', sup: '', k: 'workflows automated' },
      { v: '↑', sup: '', k: 'response accuracy' },
      { v: '↓', sup: '', k: 'manual overhead' },
    ],
    body: (
      <p>Contributed to a banking assistance system integrating multiple internal and external services. Designed the request-routing logic that identifies user intent and forwards to the right backend — improving response accuracy and system efficiency. Automated end-to-end workflows to cut manual intervention.</p>
    ),
    bullets: [
      'Designed request routing based on user-intent identification.',
      'Automated end-to-end workflows, reducing operational overhead.',
      'Integrated internal + external services with graceful degradation.',
    ],
  },
  {
    num: 'C/03',
    client: 'Fortune-500 Construction Equipment OEM · USA',
    title: 'Dealer Locator <span class="it">Service</span>',
    role: 'Tech Lead @ Thoughtworks',
    stack: ['Spring Boot', 'Java 11', 'PostgreSQL', 'PostGIS', 'JOOQ', 'Karate', 'Gatling', 'Azure DevOps', 'AWS'],
    hi: ['PostGIS','AWS'],
    stats: [
      { v: '48 → 126', sup: '', k: 'TPS' },
      { v: '3', sup: '', k: 'geocoding APIs' },
      { v: '10+', sup: '', k: 'dashboards' },
      { v: '−5', sup: ' min', k: 'pipeline time' },
    ],
    body: (
      <p>Led the design and delivery of geocoding services for a major US construction equipment manufacturer — resolving dealers by address, IP, or coordinates. Owned the client-facing technical conversation, production RCAs, and onboarding of four engineers onto the platform.</p>
    ),
    bullets: [
      'Built 3 RESTful geocoding APIs (address / IP / coordinates).',
      'Increased TPS 48 → 126 via RDS read-replica auto-scaling.',
      'Created 10+ CloudWatch dashboards + custom metrics for production visibility.',
      'Cut Azure DevOps pipeline runtime by 5 min via targeted test strategy.',
      'Performed 10+ production root-cause analyses with the client.',
      'Onboarded 4 engineers onto the codebase and on-call rotation.',
    ],
  },
  {
    num: 'C/04',
    client: 'Telematics IoT',
    title: 'Device <span class="it">Telemetry</span>',
    role: 'Senior Developer',
    stack: ['SiteWhere', 'Java', 'MQTT'],
    hi: [],
    stats: [
      { v: 'N', sup: '', k: 'device classes' },
      { v: '↔', sup: '', k: 'custom workflows' },
    ],
    body: (
      <p>Analyzed device specifications across multiple IoT hardware classes and translated them into user stories. Customized the open-source SiteWhere framework to support project-specific device workflows — a useful exercise in both domain modeling and framework archaeology.</p>
    ),
    bullets: [
      'Translated hardware specs into product requirements.',
      'Customized SiteWhere for project-specific device flows.',
    ],
  },
];

function Case({ c }) {
  return (
    <div className="case">
      <div className="c-left">
        <div className="c-num">{c.num}</div>
        <div className="c-title" dangerouslySetInnerHTML={{ __html: c.title }} />
        <div className="c-client">{c.client}</div>
        <div style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-dim)' }}>{c.role}</div>
      </div>
      <div className="c-right">
        <div className="c-body">{c.body}</div>

        {c.stats && (
          <div className="stat-row">
            {c.stats.map((s, i) => (
              <div className="s" key={i}>
                <div className="v">{s.v}<sup>{s.sup}</sup></div>
                <div className="k">{s.k}</div>
              </div>
            ))}
          </div>
        )}

        <ul className="bullets">
          {c.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>

        {c.arch && <ArchDiagram />}

        <div className="stack">
          {c.stack.map(t => <span key={t} className={'chip' + (c.hi?.includes(t) ? ' hi' : '')}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}

function Cases() {
  return (
    <section id="cases">
      <div className="wrap">
        <SectionHead
          num="§ 03 — CASES"
          title='Selected <span class="it">works.</span>'
          right="Deep dives · 2018 → Now"
        />
        <div className="cases">
          {CASES.map(c => <Case key={c.num} c={c} />)}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Cases });
