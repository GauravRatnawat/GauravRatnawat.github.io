/* Shared sub-components */
const { useState, useEffect, useRef, useMemo } = React;

function Eyebrow({ children }) {
  return <div className="eyebrow">{children}</div>;
}

function SectionHead({ num, title, right }) {
  return (
    <div className="sec-head">
      <div className="num">{num}</div>
      <h2 dangerouslySetInnerHTML={{ __html: title }} />
      <div className="right">{right}</div>
    </div>
  );
}

function Nav({ active, theme, setTheme }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const opts = { timeZone: 'Europe/Berlin', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
      setTime(d.toLocaleTimeString('en-GB', opts));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const items = [
    { id: 'about', label: 'Index' },
    { id: 'work', label: 'Work' },
    { id: 'cases', label: 'Cases' },
    { id: 'signals', label: 'Signals' },
    { id: 'journal', label: 'Journal' },
    { id: 'skills', label: 'Stack' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <nav className="nav">
      <div className="mono-mark">
        <span className="dot" />
        <span>GR — Lead Engineer</span>
      </div>
      <div className="menu">
        {items.map((it, i) => (
          <a key={it.id} href={`#${it.id}`} className={active === it.id ? 'active' : ''}>
            <span className="idx">0{i+1}</span>{it.label}
          </a>
        ))}
      </div>
      <div className="clock">
        <span>Berlin · {time}</span>
        <button
          onClick={() => setTheme(theme === ‘dark’ ? ‘paper’ : ‘dark’)}
          style={{
            fontFamily: ‘var(--mono)’, fontSize: 11, letterSpacing: ‘.12em’,
            textTransform: ‘uppercase’, padding: ‘5px 10px’,
            border: ‘1px solid var(--rule)’, borderRadius: 2,
            color: ‘var(--ink-dim)’, background: ‘transparent’,
            cursor: ‘pointer’, transition: ‘color .2s, border-color .2s’,
          }}
          onMouseEnter={e => { e.target.style.color = ‘var(--ink)’; e.target.style.borderColor = ‘var(--ink-mute)’; }}
          onMouseLeave={e => { e.target.style.color = ‘var(--ink-dim)’; e.target.style.borderColor = ‘var(--rule)’; }}
        >{theme === ‘dark’ ? ‘◐ paper’ : ‘◑ dark’}</button>
        <span className="live">● Available Q3 ‘26</span>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section id="hero">
      <div className="hero-status">
        <div className="badge"><span className="g" /> Open to Staff & Principal roles</div>
        <div style={{ marginTop: 10 }}>N° 001 / The Index</div>
      </div>
      <div className="wrap">
        <div className="hero-grid">
          <h1 className="hero-title">
            <span className="row"><span>Gaurav</span></span>
            <span className="row"><span>Ratnawat<span style={{color:'var(--accent)'}}>.</span></span></span>
            <span className="row"><span className="it">Systems at scale.</span></span>
          </h1>

          <div className="hero-meta">
            <div className="cell">
              <div className="k">Role</div>
              <div className="v">Lead Software Engineer — <b>N26</b></div>
            </div>
            <div className="cell">
              <div className="k">Location</div>
              <div className="v">Berlin, Germany · <b>UTC+1</b></div>
            </div>
            <div className="cell">
              <div className="k">Focus</div>
              <div className="v">Distributed systems, Kafka, <b>Kotlin/Java</b>, AWS</div>
            </div>
            <div className="cell">
              <div className="k">Tenure</div>
              <div className="v"><b>10+ yrs</b> backend · platform · cloud</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  const items = [
    'Kotlin', 'Java 21', 'Kafka', 'Kafka Streams', 'Spring Boot 3', 'Quarkus',
    'PostgreSQL', 'Aurora', 'Redis', 'Flink', 'AWS', 'Kubernetes',
    'Event-Driven', 'CQRS · Saga', 'Datadog', 'P99 < 1s'
  ];
  const line = (k) => (
    <span key={k}>
      {items.map((t, i) => (
        <React.Fragment key={i}>
          <span>{t}</span>
          <span className="sep">✦</span>
        </React.Fragment>
      ))}
    </span>
  );
  return (
    <div className="ticker">
      <div className="ticker-track">
        {line('a')}{line('b')}
      </div>
    </div>
  );
}

function About() {
  return (
    <section id="about">
      <div className="wrap">
        <SectionHead
          num="§ 01 — INDEX"
          title='Ten years <span class="it">designing</span> backends that<br/>outlive the hype cycle.'
          right="Philosophy / Principles"
        />

        <div className="about-grid">
          <div className="about-lead">
            I build <em>event-driven platforms</em> for regulated products — banking, compliance, IoT — where <em>correctness</em> and <em>latency</em> are not negotiable.
          </div>
          <div className="about-body">
            <p>Currently leading the Transaction Data Platform at N26, a bank serving 8 million customers across Europe. I own the architecture end-to-end: ingestion, streaming, APIs, observability, data lineage, and the migration path that got us here.</p>
            <p>Before N26 I spent two years at Thoughtworks as a Tech Lead, shipping for a Fortune-500 construction client, and five years before that across Q3 Technologies, Amdocs, and TCS — where I learned that distributed systems fail at the seams, and good engineers obsess over those seams.</p>
            <p>I care about mentoring, unglamorous documentation, and the long tail of production incidents that never make the roadmap.</p>
          </div>
        </div>

        <div className="principles">
          <div className="p">
            <div className="n">P/01</div>
            <h4>Correctness over cleverness.</h4>
            <p>A boring, well-observed service beats a clever, opaque one. Every time. Especially at 500M events/month.</p>
          </div>
          <div className="p">
            <div className="n">P/02</div>
            <h4>Seams are the product.</h4>
            <p>The interesting work lives at boundaries — contracts, idempotency, backpressure, recovery. Design there first.</p>
          </div>
          <div className="p">
            <div className="n">P/03</div>
            <h4>Mentor what you want to inherit.</h4>
            <p>Lead engineers scale through other engineers. I invest in reviews, pairing, and architecture conversations.</p>
          </div>
        </div>

        <div style={{ marginTop: 48 }} className="metrics">
          <div className="m">
            <div className="k">Transactions / Month</div>
            <div className="v">500<sup>M+</sup></div>
            <div className="d">Processed through Kafka ingestion pipelines at N26.</div>
          </div>
          <div className="m">
            <div className="k">Platform Uptime</div>
            <div className="v">99.99<sup>%</sup></div>
            <div className="d">AWS multi-region, failover-aware deployments.</div>
          </div>
          <div className="m">
            <div className="k">API Latency (p99)</div>
            <div className="v">&lt; 1<sup>s</sup></div>
            <div className="d">At ~1.5K RPS on Kubernetes microservices.</div>
          </div>
          <div className="m">
            <div className="k">MTTR Reduction</div>
            <div className="v">−30<sup>%</sup></div>
            <div className="d">Driven by observability, Datadog, OpenSearch.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Nav, Hero, Ticker, About, SectionHead, Eyebrow });
