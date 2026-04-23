/* Posts (signals / LinkedIn) */
function Posts() {
  const [posts, setPosts] = useState([]);
  const [active, setActive] = useState(null);
  const [q, setQ] = useState('');
  const [year, setYear] = useState('all');
  const [limit, setLimit] = useState(15);

  useEffect(() => {
    fetch('posts/posts.json').then(r => r.json()).then(setPosts).catch(() => setPosts([]));
  }, []);

  const fmt = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase();
  };

  const years = useMemo(() => {
    const set = new Set(posts.map(p => (p.date || '').slice(0, 4)).filter(Boolean));
    return ['all', ...[...set].sort().reverse()];
  }, [posts]);

  const byYear = useMemo(() => {
    const m = {};
    posts.forEach(p => {
      const y = (p.date || '').slice(0, 4);
      m[y] = (m[y] || 0) + 1;
    });
    return m;
  }, [posts]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return posts.filter(p => {
      if (year !== 'all' && !(p.date || '').startsWith(year)) return false;
      if (!needle) return true;
      return (p.title + ' ' + p.body).toLowerCase().includes(needle);
    });
  }, [posts, q, year]);

  const visible = filtered.slice(0, limit);

  return (
    <section id="signals">
      <div className="wrap">
        <SectionHead
          num="§ 04 / SIGNALS"
          title='Notes <span class="it">in public.</span>'
          right={`${posts.length} LinkedIn posts · auto-synced`}
        />

        <div className="signals-controls">
          <div className="sc-search">
            <span>⌕</span>
            <input placeholder="Search posts…" value={q} onChange={e => { setQ(e.target.value); setLimit(15); }} />
          </div>
          <div className="sc-years">
            {years.map(y => (
              <button key={y} className={year === y ? 'on' : ''} onClick={() => { setYear(y); setLimit(15); }}>
                {y === 'all' ? `All · ${posts.length}` : `${y} · ${byYear[y] || 0}`}
              </button>
            ))}
          </div>
        </div>

        <div className="posts">
          {visible.map((p, i) => (
            <article className={'post' + (active === p.id ? ' open' : '')} key={p.id} onClick={() => setActive(active === p.id ? null : p.id)}>
              <div className="p-left">
                <div className="p-num">N° {String(i+1).padStart(3, '0')}</div>
                <div className="p-date">{fmt(p.date)}</div>
              </div>
              <div className="p-body">
                <h3 className="p-title">{p.title}</h3>
                {!active || active !== p.id ? <p className="p-excerpt">{p.excerpt}</p> : null}
                {p.tags?.length ? <div className="p-tags">{p.tags.map(t => <span key={t}>#{t}</span>)}</div> : null}
                {active === p.id && (
                  <div className="p-full">
                    {p.body.split('\n').map((para, i) => para.trim() ? <p key={i}>{para}</p> : <br key={i} />)}
                    {p.url && <a className="p-link" href={p.url} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}>Read on LinkedIn →</a>}
                  </div>
                )}
              </div>
              <div className="p-arrow">{active === p.id ? 'x' : '+'}</div>
            </article>
          ))}
        </div>

        {filtered.length > limit && (
          <button className="posts-more" onClick={() => setLimit(l => l + 20)}>
            Load more · {filtered.length - limit} remaining
          </button>
        )}

        {filtered.length === 0 && posts.length > 0 && (
          <div className="posts-empty">No posts match “{q}”.</div>
        )}

        <div className="posts-note">
          <span className="dot" /> Synced from LinkedIn data export, {posts.length} posts, latest {fmt(posts[0]?.date || '')}.
        </div>
      </div>
    </section>
  );
}

/* Journal moved to components/terminal.jsx (CRT terminal reader) */
// eslint-disable-next-line no-unused-vars
function _LegacyJournal() {
  const [entries, setEntries] = useState([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('journal.drafts') || '[]'); } catch { return []; }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');

  useEffect(() => {
    const files = window.JOURNAL_FILES || [];
    Promise.all(files.map(f =>
      fetch(f).then(r => r.text()).then(text => {
        const { meta, body } = window.parseFrontmatter(text);
        return { file: f, meta, body, html: window.mdToHtml(body) };
      }).catch(() => null)
    )).then(all => {
      const valid = all.filter(Boolean).sort((a, b) => (b.meta.date || '').localeCompare(a.meta.date || ''));
      setEntries(valid);
      setLoading(false);
    });
  }, []);

  const saveDraft = () => {
    if (!draftTitle.trim() || !draftBody.trim()) return;
    const newDraft = {
      id: 'draft-' + Date.now(),
      meta: { title: draftTitle, date: new Date().toISOString().slice(0,10), tags: ['draft'] },
      body: draftBody,
      html: window.mdToHtml(draftBody),
      isDraft: true,
    };
    const next = [newDraft, ...drafts];
    setDrafts(next);
    localStorage.setItem('journal.drafts', JSON.stringify(next));
    setDraftTitle(''); setDraftBody('');
    setDrawerOpen(false);
  };

  const deleteDraft = (id) => {
    const next = drafts.filter(d => d.id !== id);
    setDrafts(next);
    localStorage.setItem('journal.drafts', JSON.stringify(next));
  };

  const all = [...drafts, ...entries];
  const current = all[idx];

  const fmt = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase();
  };

  return (
    <section id="journal">
      <div className="wrap">
        <SectionHead
          num="§ 05 / JOURNAL"
          title='Slow thoughts, <span class="it">written down.</span>'
          right={`${entries.length} entries · markdown`}
        />

        <div className="journal">
          <aside className="j-index">
            <div className="j-idx-head">
              <div className="eyebrow">Index</div>
              <button className="j-new" onClick={() => setDrawerOpen(true)}>＋ New note</button>
            </div>
            {loading && <div className="j-loading">Loading…</div>}
            <ol className="j-list">
              {all.map((e, i) => (
                <li key={e.file || e.id} className={idx === i ? 'on' : ''} onClick={() => setIdx(i)}>
                  <div className="j-li-num">{String(i+1).padStart(2, '0')}</div>
                  <div className="j-li-body">
                    <div className="j-li-title">
                      {e.meta.title || 'Untitled'}
                      {e.isDraft && <span className="j-draft-tag">draft</span>}
                    </div>
                    <div className="j-li-meta">{fmt(e.meta.date)} {e.meta.tags && Array.isArray(e.meta.tags) && e.meta.tags.length ? '· ' + e.meta.tags.slice(0,2).join(', ') : ''}</div>
                  </div>
                  {e.isDraft && <button className="j-li-x" onClick={(ev) => { ev.stopPropagation(); deleteDraft(e.id); if (idx === i) setIdx(0); }}>×</button>}
                </li>
              ))}
            </ol>

            <div className="j-howto">
              <div className="eyebrow" style={{ marginBottom: 10 }}>How to write</div>
              <p>Drop a <code>.md</code> file in <code>/journal/</code> with YAML frontmatter: title, date, tags, excerpt, then list it in <code>journal/index.js</code>. Or tap <em>+ New note</em> above to save a quick draft (stored locally).</p>
            </div>
          </aside>

          <article className="j-reader">
            {current ? (
              <>
                <header className="j-head">
                  <div className="j-meta">
                    <span>{fmt(current.meta.date)}</span>
                    {current.meta.tags && Array.isArray(current.meta.tags) && <span>· {current.meta.tags.join(' · ')}</span>}
                    {current.isDraft && <span className="j-draft-tag">local draft</span>}
                  </div>
                  <h1>{current.meta.title || 'Untitled'}</h1>
                  {current.meta.excerpt && <p className="j-excerpt">{current.meta.excerpt}</p>}
                </header>
                <div className="j-body" dangerouslySetInnerHTML={{ __html: current.html }} />
                <footer className="j-foot">
                  <span>Gaurav Ratnawat · Berlin</span>
                  <span>{current.file || '(local draft)'}</span>
                </footer>
              </>
            ) : <div className="j-loading">No entries yet.</div>}
          </article>
        </div>

        {drawerOpen && (
          <div className="j-drawer-overlay" onClick={() => setDrawerOpen(false)}>
            <div className="j-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="j-drawer-head">
                <div className="eyebrow">New note · Markdown</div>
                <button onClick={() => setDrawerOpen(false)}>×</button>
              </div>
              <input className="j-drawer-title" placeholder="Title…" value={draftTitle} onChange={e => setDraftTitle(e.target.value)} />
              <textarea className="j-drawer-body" placeholder={"# Heading\n\nStart writing in markdown…\n\n- supports lists\n- **bold**, *italic*, `code`\n- code blocks with ``` fences"} value={draftBody} onChange={e => setDraftBody(e.target.value)} />
              <div className="j-drawer-foot">
                <span>Saved to this browser. For permanence, commit a .md file.</span>
                <button className="j-save" onClick={saveDraft}>Save draft</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

Object.assign(window, { Posts });
