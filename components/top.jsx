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

function Nav({ active }) {
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
        <span>GR · Ledger of Work</span>
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
        <span className="live">● Lead Engineer @ IMTF</span>
      </div>
    </nav>
  );
}

/* The signature: an append-only ledger of events, always posting. */
const LEDGER_EVENTS = [
  ['txn.card.settled', 'cr'],
  ['txn.sepa.ingested', 'dr'],
  ['stream.offset.committed', 'cr'],
  ['screening.alert.cleared', 'cr'],
  ['gdpr.deletion.acked', 'dr'],
  ['case.risk.scored', 'dr'],
  ['txn.instant.posted', 'cr'],
  ['audit.trail.appended', 'cr'],
  ['consumer.rebalanced', 'dr'],
  ['sla.p99.within.bounds', 'cr'],
];

function LiveLedger() {
  const START_OFFSET = 84921;
  const VISIBLE_ROWS = 7;
  const APPEND_MS = 1600;

  const makeRow = (offset) => {
    const [ev, drcr] = LEDGER_EVENTS[offset % LEDGER_EVENTS.length];
    const ms = 120 + ((offset * 37) % 740);
    return { offset, ev, drcr, ms };
  };

  const [rows, setRows] = useState(() =>
    Array.from({ length: VISIBLE_ROWS }, (_, i) => makeRow(START_OFFSET + i))
  );

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      setRows(prev => {
        const next = makeRow(prev[prev.length - 1].offset + 1);
        return [...prev.slice(1), next];
      });
    }, APPEND_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="ledger" aria-label="Live event ledger, decorative">
      <div className="ledger-head">
        <span>Transaction ledger · append-only</span>
        <span className="live-dot">simulated feed</span>
      </div>
      <div className="ledger-cols">
        <span>Offset</span><span>Event</span><span>Latency</span><span>Dr/Cr</span>
      </div>
      <div className="ledger-rows">
        {rows.map((r, i) => (
          <div className={'ledger-row' + (i === rows.length - 1 ? ' appended' : '')} key={r.offset}>
            <span className="off">{String(r.offset).padStart(6, '0')}</span>
            <span className="ev">{r.ev}</span>
            <span className="ms">{r.ms} ms</span>
            <span className={'drcr ' + r.drcr}>{r.drcr.toUpperCase()}</span>
          </div>
        ))}
      </div>
      <div className="ledger-foot">
        <span>Balance</span>
        <span><b>500M+ tx / month</b> · nothing lost</span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="hero">
      <div className="hero-status">
        <div className="badge"><span className="g" /> Lead Engineer · IMTF · Financial crime prevention</div>
      </div>
      <div className="wrap">
        <div className="hero-grid">
          <div>
            <p className="hero-name">Gaurav Ratnawat — <b>The Ledger of Work</b></p>
            <h1 className="hero-title">
              <span className="row"><span>Systems that</span></span>
              <span className="row"><span><em>never</em> lose</span></span>
              <span className="row"><span>a transaction.</span></span>
            </h1>

            <div className="hero-meta">
              <div className="cell">
                <div className="k">Role</div>
                <div className="v">Lead Engineer at <b>IMTF</b> · financial crime prevention</div>
              </div>
              <div className="cell">
                <div className="k">Location</div>
                <div className="v">Berlin, Germany · <b>CET</b></div>
              </div>
              <div className="cell">
                <div className="k">Focus</div>
                <div className="v">Distributed systems, Kafka, <b>Kotlin/Java</b>, AWS</div>
              </div>
              <div className="cell">
                <div className="k">Previously</div>
                <div className="v"><b>N26</b> · Thoughtworks · Amdocs · TCS</div>
              </div>
            </div>
          </div>

          <LiveLedger />
        </div>
      </div>
    </section>
  );
}

/* Balance brought forward: the career in one ruled line */
function Ticker() {
  return (
    <div className="ticker">
      <span className="bf">Balance b/f</span>
      <span><b>10+ yrs</b> backend</span>
      <span><b>6</b> companies</span>
      <span><b>500M+</b> tx/month handled</span>
      <span><b>99.99%</b> uptime</span>
      <span><b>P99 &lt; 1s</b> at 1.5K RPS</span>
      <span>carried forward →</span>
    </div>
  );
}

function About() {
  return (
    <section id="about">
      <div className="wrap">
        <SectionHead
          num="Entry 01 / Index"
          title='Ten years <span class="it">keeping</span> the books<br/>on distributed systems.'
          right="Philosophy / Principles"
        />

        <div className="about-grid">
          <div className="about-lead">
            I build <em>event driven platforms</em> for regulated products in banking, financial crime prevention, and compliance, where <em>correctness</em> and <em>latency</em> are not negotiable.
          </div>
          <div className="about-body">
            <p>I lead backend and data platforms in regulated environments, owning architecture end to end: ingestion, streaming, APIs, observability, data lineage, and migration strategy.</p>
            <p>Across fintech, regtech, consulting, SaaS, and telecom domains, I have learned that distributed systems fail at boundaries, and contracts, ownership, idempotency, and recovery design matter most.</p>
            <p>I care about mentoring, unglamorous documentation, and the long tail of production incidents that never make the roadmap.</p>
          </div>
        </div>

        <div className="principles">
          <div className="p">
            <div className="n">P/01</div>
            <h4>Correctness over cleverness.</h4>
            <p>A boring, well observed service beats a clever, opaque one. Every time.</p>
          </div>
          <div className="p">
            <div className="n">P/02</div>
            <h4>Seams are the product.</h4>
            <p>The interesting work lives at boundaries: contracts, idempotency, backpressure, and recovery. Design there first.</p>
          </div>
          <div className="p">
            <div className="n">P/03</div>
            <h4>Mentor what you want to inherit.</h4>
            <p>Lead engineers scale through other engineers. I invest in reviews, pairing, and architecture conversations.</p>
          </div>
        </div>

      </div>
    </section>
  );
}

Object.assign(window, { Nav, Hero, Ticker, About, SectionHead, Eyebrow, LiveLedger });
