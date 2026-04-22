const WORK = [
  {
    co: 'N26',
    loc: 'Berlin, Germany',
    title: 'Lead Software Engineer',
    tag: 'Architecting the Transaction Data Platform for a pan-European bank. 500M+ events/month, 99.99% uptime, GDPR-compliant by design.',
    date: 'Sep 2022 — Present',
  },
  {
    co: 'Thoughtworks',
    loc: 'Gurgaon, India',
    title: 'Tech Lead',
    tag: 'Delivered geolocation services for a Fortune-500 US construction client. Tripled throughput with RDS auto-scaling; onboarded a team of 4.',
    date: 'Mar 2020 — Sep 2022',
  },
  {
    co: 'Q3 Technologies',
    loc: 'Gurgaon, India',
    title: 'Senior Developer',
    tag: 'Senior IC on multi-tenant SaaS. Designed APIs, integrations, and release pipelines.',
    date: 'Dec 2017 — Mar 2020',
  },
  {
    co: 'Amdocs',
    loc: 'Gurgaon, India',
    title: 'Software Engineer',
    tag: 'Telco billing and OSS systems. Java, Oracle, and a healthy respect for legacy data models.',
    date: 'May 2017 — Dec 2017',
  },
  {
    co: 'Tata Consultancy Services',
    loc: 'Gurgaon, India',
    title: 'Engineer — Technology',
    tag: 'First engineering role. Enterprise Java, client-facing delivery, foundational rigor.',
    date: 'Oct 2015 — Apr 2017',
  },
];

function Work() {
  return (
    <section id="work">
      <div className="wrap">
        <SectionHead
          num="§ 02 — WORK"
          title='Five companies. <span class="it">One throughline.</span>'
          right="2015 → Present · 10 yrs"
        />

        <div className="work">
          {WORK.map((w, i) => (
            <div className="work-row" key={w.co}>
              <div className="r-num">W/0{i+1}</div>
              <div className="r-co">
                {w.co}
                <span className="loc">{w.loc}</span>
              </div>
              <div className="r-title">
                {w.title}
                <span className="tag">{w.tag}</span>
              </div>
              <div className="r-date">{w.date}</div>
              <div className="r-arrow">→</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Work });
