/* Short posts from LinkedIn, rendered inside the Writing section */
// Own posts worth reading first; everything else sits behind "show all".
const PINNED_POSTS = ['li-009', 'li-010', 'li-011', 'li-014', 'li-001'];

function Posts() {
  const [posts, setPosts] = useState([]);
  const [showAll, setShowAll] = useState(false);
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

  const pinned = posts.filter(p => PINNED_POSTS.includes(p.id));
  const visible = showAll ? filtered.slice(0, limit) : pinned;

  return (
    <div className="short-posts">
      <Eyebrow>Short posts · LinkedIn</Eyebrow>

      {showAll && <div className="signals-controls">
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
      </div>}

      <div className="posts">
        {visible.map((p, i) => (
          <article
            className={'post' + (active === p.id ? ' open' : '')}
            key={p.id}
            role="button"
            tabIndex={0}
            aria-expanded={active === p.id}
            onClick={() => setActive(active === p.id ? null : p.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActive(active === p.id ? null : p.id);
              }
            }}
          >
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

      {!showAll && posts.length > pinned.length && (
        <button className="posts-more" onClick={() => setShowAll(true)}>
          Show all {posts.length} posts
        </button>
      )}

      {showAll && filtered.length > limit && (
        <button className="posts-more" onClick={() => setLimit(l => l + 20)}>
          Load more · {filtered.length - limit} remaining
        </button>
      )}

      {showAll && filtered.length === 0 && posts.length > 0 && (
        <div className="posts-empty">No posts match “{q}”.</div>
      )}

      <div className="posts-note">
        <span className="dot" /> Synced from LinkedIn data export, {posts.length} posts, latest {fmt(posts[0]?.date || '')}.
      </div>
    </div>
  );
}

Object.assign(window, { Posts });
