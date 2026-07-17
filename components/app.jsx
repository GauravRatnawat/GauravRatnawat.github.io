function App() {
  const [active, setActive] = useState('about');

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
      <Nav active={active} />
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
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
