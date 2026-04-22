function Tweaks({ theme, setTheme, display, setDisplay, accent, setAccent }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === '__activate_edit_mode') setOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const set = (patch) => {
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
  };

  return (
    <div className={'tweaks' + (open ? ' open' : '')}>
      <div className="th">
        <h5>Tweaks</h5>
        <button className="x" onClick={() => setOpen(false)}>×</button>
      </div>

      <div className="row">
        <label>Theme</label>
        <div className="seg">
          {['dark','ink','paper'].map(t => (
            <button key={t} className={theme===t?'on':''} onClick={() => { setTheme(t); set({theme:t}); }}>{t}</button>
          ))}
        </div>
      </div>

      <div className="row">
        <label>Display type</label>
        <div className="seg">
          {[['serif','Fraunces'],['grotesk','Grotesk'],['mono','Mono']].map(([k, lbl]) => (
            <button key={k} className={display===k?'on':''} onClick={() => { setDisplay(k); set({display:k}); }}>{lbl}</button>
          ))}
        </div>
      </div>

      <div className="row">
        <label>Accent</label>
        <div className="seg">
          {[['amber','#ff7a1a'],['lime','#b7f000'],['ice','#4ea8ff']].map(([k, c]) => (
            <button key={k} className={accent===k?'on':''} style={{ background: accent===k?c:'', color: accent===k?'#000':'', borderColor: c }} onClick={() => { setAccent(k); set({accent:k}); }}>{k}</button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '.14em', textTransform: 'uppercase' }}>
        Toggle via the Tweaks button in the toolbar
      </div>
    </div>
  );
}

function Cursor() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const onMove = (e) => {
      el.style.left = e.clientX + 'px';
      el.style.top = e.clientY + 'px';
    };
    const onOver = (e) => {
      const t = e.target;
      if (t && t.closest && t.closest('a, button, .work-row, .chip')) el.classList.add('big');
      else el.classList.remove('big');
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);
  return <div className="cursor" ref={ref} />;
}

function App() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "paper",
    "display": "serif",
    "accent": "amber"
  }/*EDITMODE-END*/;

  const [theme, setTheme] = useState(TWEAK_DEFAULTS.theme);
  const [display, setDisplay] = useState(TWEAK_DEFAULTS.display);
  const [accent, setAccent] = useState(TWEAK_DEFAULTS.accent);
  const [active, setActive] = useState('about');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? '' : theme);
  }, [theme]);

  useEffect(() => {
    const fam = {
      serif: '"Fraunces", ui-serif, Georgia, serif',
      grotesk: '"Inter Tight", "Söhne", ui-sans-serif, system-ui, sans-serif',
      mono: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
    }[display];
    document.documentElement.style.setProperty('--serif', fam);
  }, [display]);

  useEffect(() => {
    const c = { amber: ['#ff7a1a','#f2d9a0'], lime: ['#b7f000','#d6ff80'], ice: ['#4ea8ff','#9fe3ff'] }[accent];
    document.documentElement.style.setProperty('--accent', c[0]);
    document.documentElement.style.setProperty('--accent-2', c[1]);
  }, [accent]);

  useEffect(() => {
    const sections = ['about','work','cases','signals','journal','skills','contact'];
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <div className="grain" />
      <div className="frame" />
      <Cursor />
      <Nav active={active} theme={theme} setTheme={setTheme} />
      <main>
        <Hero />
        <Ticker />
        <About />
        <Work />
        <Cases />
        <Posts />
        <Journal />
        <Skills />
        <Contact />
      </main>
      <Tweaks theme={theme} setTheme={setTheme} display={display} setDisplay={setDisplay} accent={accent} setAccent={setAccent} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
