/* ——— Terminal Journal Reader ——— */
/* Section §05 shows a terminal preview. Clicking "open full screen" or
   typing `open` expands to a fullscreen CRT terminal with real commands:
   ls, cat <file>, help, clear, vim <file>, whoami, exit */

const { useState, useEffect, useRef, useMemo } = React;

const BOOT_LINES = [
  { t: 'sys', v: 'field-notebook v2.6.04 — gaurav@berlin' },
  { t: 'sys', v: 'kernel: linux 6.1 · shell: /bin/gsh · term: xterm-256color' },
  { t: 'sys', v: 'mounted /journal (45 entries) · read-only' },
  { t: 'sys', v: 'type `help` for commands · `ls` to list · `cat <n>` to read' },
];

function stripMdToTerminal(md) {
  if (!md) return '';
  // Convert markdown to plain terminal-friendly text with ANSI-style markers
  let out = md;
  // Code fences → boxed
  out = out.replace(/```(\w+)?\n([\s\S]*?)```/g, (m, lang, code) => {
    const lines = code.trimEnd().split('\n');
    const max = Math.max(...lines.map(l => l.length), 20);
    const bar = '─'.repeat(Math.min(max + 2, 76));
    return `\n┌${bar}┐\n${lines.map(l => '│ ' + l.padEnd(Math.min(max, 74)) + ' │').join('\n')}\n└${bar}┘\n`;
  });
  // Headings
  out = out.replace(/^### (.+)$/gm, '  ▸ $1');
  out = out.replace(/^## (.+)$/gm, '\n※ $1\n' + '─'.repeat(40));
  out = out.replace(/^# (.+)$/gm, '\n══ $1 ══');
  // Lists
  out = out.replace(/^\s*[-*] (.+)$/gm, '  • $1');
  out = out.replace(/^\s*(\d+)\. (.+)$/gm, '  $1. $2');
  // Blockquotes
  out = out.replace(/^> (.+)$/gm, '  ▎ $1');
  // Inline code / bold / italic — strip markers
  out = out.replace(/`([^`]+)`/g, '⟨$1⟩');
  out = out.replace(/\*\*([^*]+)\*\*/g, '$1');
  out = out.replace(/\*([^*]+)\*/g, '$1');
  return out.trim();
}

function Prompt({ path = '~/journal', inline = false }) {
  return (
    <span className="tm-prompt">
      <span className="tm-user">gaurav@berlin</span>
      <span className="tm-colon">:</span>
      <span className="tm-path">{path}</span>
      <span className="tm-dollar">$</span>
      {inline && <span>&nbsp;</span>}
    </span>
  );
}

function Journal() {
  const [entries, setEntries] = useState([]);
  const [drafts, setDrafts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('journal.drafts') || '[]'); } catch { return []; }
  });
  const [fullscreen, setFullscreen] = useState(false);
  const [history, setHistory] = useState([]); // { kind: 'cmd'|'out', cmd?, lines }
  const [input, setInput] = useState('');
  const [cmdLog, setCmdLog] = useState([]);
  const [cmdIdx, setCmdIdx] = useState(-1);
  const inputRef = useRef();
  const bodyRef = useRef();

  // Load entries
  useEffect(() => {
    const files = window.JOURNAL_FILES || [];
    Promise.all(files.map((f, i) =>
      fetch(f).then(r => r.text()).then(text => {
        const { meta, body } = window.parseFrontmatter(text);
        return { id: i + 1, file: f, meta, body };
      }).catch(() => null)
    )).then(all => {
      const valid = all.filter(Boolean).sort((a, b) => (b.meta.date || '').localeCompare(a.meta.date || ''));
      // Re-number by date-desc order
      setEntries(valid.map((e, i) => ({ ...e, id: i + 1 })));
    });
  }, []);

  const all = useMemo(() => {
    return [
      ...entries,
      ...drafts.map((d, i) => ({ id: entries.length + i + 1, file: `drafts/${d.id}.md`, meta: d.meta, body: d.body, isDraft: true })),
    ];
  }, [entries, drafts]);

  // Auto-scroll on history change
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [history, fullscreen]);

  // Focus input when fullscreen opens
  useEffect(() => {
    if (fullscreen) {
      setHistory([
        { kind: 'out', lines: BOOT_LINES.map(l => ({ cls: 'tm-sys', v: l.v })) },
      ]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [fullscreen]);

  // Esc to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && fullscreen) setFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  const pushOut = (lines) => setHistory(h => [...h, { kind: 'out', lines }]);
  const pushCmd = (cmd, path = '~/journal') => setHistory(h => [...h, { kind: 'cmd', cmd, path }]);

  const fmt = (d) => {
    if (!d) return '????-??-??';
    return d.slice(0, 10);
  };

  const runLs = () => {
    pushOut([
      { cls: 'tm-muted', v: `total ${all.length}` },
      ...all.map((e, i) => ({
        cls: 'tm-ls',
        v: [
          String(e.id).padStart(3, '0'),
          fmt(e.meta.date),
          (e.meta.tags?.[0] || '—').padEnd(12),
          '·',
          e.meta.title || 'Untitled',
          e.isDraft ? ' (draft)' : '',
        ].join('  '),
      })),
      { cls: 'tm-muted', v: '' },
      { cls: 'tm-muted', v: `read with: cat <id>   e.g. cat 1` },
    ]);
  };

  const runCat = (arg) => {
    const n = parseInt(arg, 10);
    const entry = all.find(e => e.id === n);
    if (!entry) {
      pushOut([{ cls: 'tm-err', v: `cat: ${arg}: no such entry. try \`ls\`` }]);
      return;
    }
    const header = [
      { cls: 'tm-cat-file', v: `── ${entry.file} ` + '─'.repeat(Math.max(0, 70 - entry.file.length - 4)) },
      { cls: 'tm-meta', v: `date:    ${entry.meta.date || '—'}` },
      { cls: 'tm-meta', v: `title:   ${entry.meta.title || 'Untitled'}` },
      { cls: 'tm-meta', v: `tags:    ${(entry.meta.tags || []).join(', ') || '—'}` },
      { cls: 'tm-cat-file', v: '─'.repeat(70) },
      { cls: 'tm-body', v: '' },
    ];
    const bodyText = stripMdToTerminal(entry.body);
    const bodyLines = bodyText.split('\n').map(v => ({ cls: 'tm-body', v }));
    const footer = [
      { cls: 'tm-body', v: '' },
      { cls: 'tm-cat-file', v: '─'.repeat(70) },
      { cls: 'tm-muted', v: `— EOF · gaurav ratnawat, berlin · ${entry.meta.date || ''}` },
    ];
    pushOut([...header, ...bodyLines, ...footer]);
  };

  const runHelp = () => {
    pushOut([
      { cls: 'tm-help-h', v: 'AVAILABLE COMMANDS' },
      { cls: 'tm-help', v: '  ls              list all journal entries' },
      { cls: 'tm-help', v: '  cat <id>        read entry by number (e.g. cat 2)' },
      { cls: 'tm-help', v: '  open <id>       alias for cat' },
      { cls: 'tm-help', v: '  grep <term>     search titles & bodies' },
      { cls: 'tm-help', v: '  tag <name>      filter entries by tag' },
      { cls: 'tm-help', v: '  tree            show entry structure' },
      { cls: 'tm-help', v: '  whoami          about the author' },
      { cls: 'tm-help', v: '  date            current time in berlin' },
      { cls: 'tm-help', v: '  clear           clear screen' },
      { cls: 'tm-help', v: '  exit            close terminal' },
      { cls: 'tm-help', v: '' },
      { cls: 'tm-help', v: '  ↑ / ↓           history · Tab completes · Esc closes' },
    ]);
  };

  const runGrep = (term) => {
    if (!term) { pushOut([{ cls: 'tm-err', v: 'usage: grep <term>' }]); return; }
    const t = term.toLowerCase();
    const hits = all.filter(e =>
      (e.meta.title || '').toLowerCase().includes(t) ||
      (e.body || '').toLowerCase().includes(t)
    );
    if (!hits.length) { pushOut([{ cls: 'tm-muted', v: `no matches for "${term}"` }]); return; }
    pushOut([
      { cls: 'tm-muted', v: `${hits.length} match${hits.length === 1 ? '' : 'es'}` },
      ...hits.map(e => ({
        cls: 'tm-ls',
        v: `${String(e.id).padStart(3,'0')}  ${fmt(e.meta.date)}  · ${e.meta.title}`,
      })),
    ]);
  };

  const runTag = (tag) => {
    if (!tag) {
      const all_tags = [...new Set(all.flatMap(e => e.meta.tags || []))].sort();
      pushOut([
        { cls: 'tm-muted', v: `${all_tags.length} tags available:` },
        { cls: 'tm-ls', v: '  ' + all_tags.map(t => '#' + t).join('  ') },
        { cls: 'tm-muted', v: 'usage: tag <name>' },
      ]);
      return;
    }
    const hits = all.filter(e => (e.meta.tags || []).includes(tag));
    if (!hits.length) { pushOut([{ cls: 'tm-muted', v: `no entries tagged #${tag}` }]); return; }
    pushOut([
      { cls: 'tm-muted', v: `${hits.length} entries tagged #${tag}` },
      ...hits.map(e => ({
        cls: 'tm-ls',
        v: `${String(e.id).padStart(3,'0')}  ${fmt(e.meta.date)}  · ${e.meta.title}`,
      })),
    ]);
  };

  const runTree = () => {
    const byYear = {};
    all.forEach(e => {
      const y = (e.meta.date || 'undated').slice(0, 4);
      (byYear[y] = byYear[y] || []).push(e);
    });
    const years = Object.keys(byYear).sort().reverse();
    const lines = [{ cls: 'tm-body', v: 'journal/' }];
    years.forEach((y, yi) => {
      const isLastY = yi === years.length - 1;
      lines.push({ cls: 'tm-body', v: (isLastY ? '└── ' : '├── ') + y + '/' });
      byYear[y].forEach((e, ei) => {
        const isLastE = ei === byYear[y].length - 1;
        lines.push({ cls: 'tm-body', v: (isLastY ? '    ' : '│   ') + (isLastE ? '└── ' : '├── ') + String(e.id).padStart(3,'0') + '  ' + e.meta.title });
      });
    });
    lines.push({ cls: 'tm-muted', v: '' });
    lines.push({ cls: 'tm-muted', v: `${all.length} entries across ${years.length} year${years.length === 1 ? '' : 's'}` });
    pushOut(lines);
  };

  const runWhoami = () => {
    pushOut([
      { cls: 'tm-body', v: 'gaurav ratnawat' },
      { cls: 'tm-muted', v: 'lead software engineer · berlin' },
      { cls: 'tm-muted', v: 'distributed systems · kafka · kotlin · aws' },
      { cls: 'tm-muted', v: '10+ yrs · currently shipping 99.99% uptime at n26' },
      { cls: 'tm-muted', v: '' },
      { cls: 'tm-muted', v: 'mail:     de.gratnawat@gmail.com' },
      { cls: 'tm-muted', v: 'phone:    +49 152 92604891' },
      { cls: 'tm-muted', v: 'linkedin: linkedin.com/in/ratnawatgaurav' },
    ]);
  };

  const runDate = () => {
    const d = new Date().toLocaleString('en-GB', { timeZone: 'Europe/Berlin', dateStyle: 'full', timeStyle: 'long' });
    pushOut([{ cls: 'tm-body', v: d }]);
  };

  const exec = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) { pushCmd(''); return; }
    pushCmd(trimmed);
    setCmdLog(l => [...l, trimmed]);
    setCmdIdx(-1);

    const [cmd, ...args] = trimmed.split(/\s+/);
    const arg = args.join(' ');

    switch (cmd) {
      case 'ls': case 'll': case 'dir': runLs(); break;
      case 'cat': case 'open': case 'read': case 'less': case 'more': runCat(arg); break;
      case 'help': case '?': case 'h': runHelp(); break;
      case 'grep': case 'search': case 'find': runGrep(arg); break;
      case 'tag': case 'tags': runTag(arg); break;
      case 'tree': runTree(); break;
      case 'whoami': case 'about': runWhoami(); break;
      case 'date': case 'time': runDate(); break;
      case 'clear': case 'cls': setHistory([]); break;
      case 'exit': case 'quit': case 'q': case ':q': setFullscreen(false); break;
      case 'echo': pushOut([{ cls: 'tm-body', v: arg }]); break;
      case 'pwd': pushOut([{ cls: 'tm-body', v: '/home/gaurav/journal' }]); break;
      case 'sudo': pushOut([{ cls: 'tm-err', v: 'nice try. this is a read-only notebook.' }]); break;
      case 'vim': case 'nano': case 'emacs': pushOut([{ cls: 'tm-err', v: `${cmd}: this is a reader. write notes in markdown and commit them to /journal/.` }]); break;
      case 'rm': pushOut([{ cls: 'tm-err', v: 'rm: permission denied. notes are append-only.' }]); break;
      default: pushOut([{ cls: 'tm-err', v: `gsh: command not found: ${cmd}` }, { cls: 'tm-muted', v: 'type `help` for commands' }]);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      exec(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!cmdLog.length) return;
      const next = cmdIdx < 0 ? cmdLog.length - 1 : Math.max(0, cmdIdx - 1);
      setCmdIdx(next);
      setInput(cmdLog[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdIdx < 0) return;
      const next = cmdIdx + 1;
      if (next >= cmdLog.length) { setCmdIdx(-1); setInput(''); }
      else { setCmdIdx(next); setInput(cmdLog[next]); }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const cmds = ['ls', 'cat', 'open', 'grep', 'tag', 'tree', 'whoami', 'date', 'help', 'clear', 'exit'];
      const match = cmds.find(c => c.startsWith(input.toLowerCase()));
      if (match) setInput(match + ' ');
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setHistory([]);
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      pushCmd(input + '^C');
      setInput('');
    }
  };

  // Section-preview mini terminal (3 entries + CTA)
  const previewEntries = all.slice(0, 3);

  return (
    <section id="journal">
      <div className="wrap">
        <SectionHead
          num="§ 05 — JOURNAL"
          title='Field notes, <span class="it">in the shell.</span>'
          right={`${entries.length} entries · /journal/`}
        />

        <div className="tm-preview" onClick={() => setFullscreen(true)}>
          <div className="tm-chrome">
            <div className="tm-dots">
              <span className="d r" /><span className="d y" /><span className="d g" />
            </div>
            <div className="tm-title">gaurav@berlin — field-notebook — 100×32</div>
            <div className="tm-hint">click to open ⌘↵</div>
          </div>
          <div className="tm-body tm-body-preview">
            <div className="tm-line"><span className="tm-sys">field-notebook v2.6.04 — {entries.length} entries loaded</span></div>
            <div className="tm-line"><Prompt inline /> ls</div>
            {previewEntries.map(e => (
              <div className="tm-line tm-ls" key={e.id}>
                {String(e.id).padStart(3, '0')}  {fmt(e.meta.date)}  {(e.meta.tags?.[0] || '—').padEnd(12)}  ·  {e.meta.title}
              </div>
            ))}
            <div className="tm-line tm-muted">... {Math.max(0, all.length - 3)} more entries</div>
            <div className="tm-line"><Prompt inline /> <span className="tm-caret">_</span></div>
          </div>
          <div className="tm-cta">
            <span>Open fullscreen terminal</span>
            <span className="arrow">↗</span>
          </div>
        </div>

        <div className="tm-tips">
          <div><span className="k">TIP</span> Type <code>help</code> to see commands · <code>ls</code> to list · <code>cat 1</code> to read entry 1 · <code>grep kafka</code> to search.</div>
        </div>
      </div>

      {fullscreen && (
        <div className="tm-fullscreen" onClick={() => inputRef.current?.focus()}>
          <div className="tm-scanlines" />
          <div className="tm-fs-chrome">
            <div className="tm-dots">
              <span className="d r" onClick={() => setFullscreen(false)} /><span className="d y" /><span className="d g" />
            </div>
            <div className="tm-title">gaurav@berlin — /home/gaurav/journal — {new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/Berlin' })}</div>
            <button className="tm-close" onClick={(e) => { e.stopPropagation(); setFullscreen(false); }}>ESC to close</button>
          </div>
          <div className="tm-body tm-body-fs" ref={bodyRef}>
            {history.map((h, i) => (
              h.kind === 'cmd' ? (
                <div className="tm-line tm-cmd-line" key={i}>
                  <Prompt path={h.path || '~/journal'} inline />
                  {h.cmd}
                </div>
              ) : (
                h.lines.map((l, j) => (
                  <div className={'tm-line ' + (l.cls || '')} key={`${i}-${j}`}>{l.v || '\u00A0'}</div>
                ))
              )
            ))}
            <div className="tm-input-line">
              <Prompt path="~/journal" inline />
              <input
                ref={inputRef}
                className="tm-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKey}
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
              <span className="tm-caret-live">▊</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

Object.assign(window, { Journal });
