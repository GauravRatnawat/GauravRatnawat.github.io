function App() {
  const [active, setActive] = useState(NAV_SECTIONS[0].id);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-40% 0px -50% 0px' });
    NAV_SECTIONS.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <div className="grain" />
      <Nav active={active} />
      <main>
        <Hero />
        <Ticker />
        <Cases />
        <Work />
        <About />
        <Projects />
        <Journal />
        <Skills />
        <Contact />
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
