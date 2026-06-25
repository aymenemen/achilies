// Faithful port of the uploaded solar_forecast_showcase.html home page.
// The CSS is injected via a <style> tag that lives only while the home route is
// mounted, so its generic selectors never leak into the /predict route.

export const HOME_CSS = `
  .home-root *, .home-root *::before, .home-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .home-root {
    background: var(--night);
    color: var(--sand);
    font-family: 'DM Mono', monospace;
    font-weight: 300;
    overflow-x: hidden;
  }

  /* NOISE OVERLAY */
  .home-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    pointer-events: none;
    z-index: 1000;
    opacity: 0.5;
  }

  /* HERO */
  .home-root .hero {
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    padding: 2rem 3rem 3rem;
    position: relative;
    overflow: hidden;
  }
  .home-root .hero-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 50% 110%, rgba(180,100,40,0.35) 0%, transparent 70%),
      radial-gradient(ellipse 40% 40% at 80% 20%, rgba(200,140,90,0.12) 0%, transparent 60%),
      var(--night);
    z-index: 0;
  }
  .home-root .sun-arc {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 350px;
    border: 1px solid rgba(212,95,43,0.2);
    border-bottom: none;
    border-radius: 350px 350px 0 0;
    z-index: 0;
  }
  .home-root .sun-arc::after {
    content: '';
    position: absolute;
    bottom: -14px;
    left: 50%;
    transform: translateX(-50%);
    width: 500px;
    height: 250px;
    border: 1px solid rgba(212,95,43,0.12);
    border-bottom: none;
    border-radius: 250px 250px 0 0;
  }
  .home-root .sun-dot {
    position: absolute;
    width: 6px;
    height: 6px;
    background: var(--ember);
    border-radius: 50%;
    box-shadow: 0 0 20px 4px rgba(212,95,43,0.6);
    animation: orbit 12s linear infinite;
    bottom: -3px;
    left: calc(50% - 3px);
    transform-origin: 3px calc(-350px + 3px);
  }
  @keyframes orbit {
    from { transform: rotate(-180deg); }
    to   { transform: rotate(0deg); }
  }
  .home-root .hero-nav {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .home-root .nav-logo {
    font-family: 'Playfair Display', serif;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    color: var(--dusk);
    font-style: italic;
  }
  .home-root .nav-links {
    display: flex;
    gap: 2rem;
    list-style: none;
  }
  .home-root .nav-links a {
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--fog);
    text-decoration: none;
    transition: color 0.2s;
  }
  .home-root .nav-links a:hover { color: var(--sand); }
  .home-root .nav-links a.nav-cta { color: var(--ember); }
  .home-root .hero-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 4rem 0 0;
    max-width: 900px;
  }
  .home-root .hero-eyebrow {
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ember);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .home-root .hero-eyebrow::before {
    content: '';
    display: block;
    width: 30px;
    height: 1px;
    background: var(--ember);
  }
  .home-root .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(3rem, 7vw, 6.5rem);
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: -0.02em;
    color: var(--sand);
    margin-bottom: 0.5rem;
  }
  .home-root .hero-title em { font-style: italic; color: var(--dusk); }
  .home-root .hero-subtitle {
    font-family: 'Fraunces', serif;
    font-size: clamp(1rem, 2vw, 1.4rem);
    font-weight: 300;
    font-style: italic;
    color: var(--fog);
    margin: 1.5rem 0 3rem;
    max-width: 560px;
    line-height: 1.6;
  }
  .home-root .hero-stats { display: flex; gap: 3rem; flex-wrap: wrap; }
  .home-root .hero-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 600;
    color: var(--sand);
    line-height: 1;
  }
  .home-root .hero-stat-label {
    font-size: 0.62rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--fog);
    margin-top: 0.3rem;
  }
  .home-root .hero-footer {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    color: var(--fog);
  }
  .home-root .scroll-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: nudge 2s ease-in-out infinite;
  }
  @keyframes nudge {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(4px); }
  }
  .home-root .scroll-hint::after { content: '↓'; font-size: 1rem; }

  /* SECTION BASE */
  .home-root section { padding: 6rem 3rem; position: relative; }
  .home-root .section-label {
    font-size: 0.62rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ember);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .home-root .section-label::before { content: ''; width: 20px; height: 1px; background: var(--ember); }
  .home-root .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 3.5rem);
    font-weight: 900;
    line-height: 1.05;
    color: var(--sand);
    margin-bottom: 1.5rem;
  }

  /* CONTEXT */
  .home-root .context-section { background: var(--pale); color: var(--ink); }
  .home-root .context-section .section-title { color: var(--ink); }
  .home-root .context-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-top: 3rem; }
  .home-root .context-text { font-family: 'Fraunces', serif; font-size: 1.1rem; line-height: 1.8; color: #4A3F30; font-weight: 300; }
  .home-root .context-text p + p { margin-top: 1rem; }
  .home-root .context-cards { display: flex; flex-direction: column; gap: 1rem; }
  .home-root .context-card { border: 1px solid rgba(180,130,60,0.25); border-radius: 4px; padding: 1.2rem 1.4rem; background: rgba(180,130,60,0.05); }
  .home-root .context-card-label { font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ember); margin-bottom: 0.4rem; }
  .home-root .context-card-value { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 600; color: var(--ink); }
  .home-root .context-card-sub { font-size: 0.75rem; color: var(--fog); margin-top: 0.2rem; }

  /* RESULTS */
  .home-root .results-section { background: var(--ink); }
  .home-root .results-section .section-title { color: var(--sand); }
  .home-root .results-intro { max-width: 600px; font-family: 'Fraunces', serif; font-size: 1rem; line-height: 1.8; color: var(--fog); margin-bottom: 3rem; font-style: italic; }
  .home-root .table-wrap { overflow-x: auto; margin-bottom: 3rem; }
  .home-root table { width: 100%; border-collapse: collapse; font-size: 0.75rem; min-width: 800px; }
  .home-root thead tr { border-bottom: 1px solid var(--dust-line); }
  .home-root th { font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--fog); padding: 0.75rem 1rem; text-align: right; font-weight: 400; }
  .home-root th:first-child { text-align: left; }
  .home-root td { padding: 0.9rem 1rem; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.04); font-family: 'DM Mono', monospace; font-size: 0.78rem; color: var(--sand); transition: background 0.15s; }
  .home-root td:first-child { text-align: left; color: var(--fog); font-size: 0.72rem; }
  .home-root tr:hover td { background: rgba(212,95,43,0.06); }
  .home-root tr.best-row td { color: #F5EDD6; }
  .home-root tr.best-row td:first-child { color: var(--dusk); }
  .home-root .penalty-high { color: #E07060 !important; }
  .home-root .penalty-mid  { color: #D4A060 !important; }
  .home-root .penalty-low  { color: #7BB88C !important; }
  .home-root .skill-bar-cell { min-width: 120px; }
  .home-root .skill-bar { display: inline-flex; align-items: center; gap: 6px; width: 100%; justify-content: flex-end; }
  .home-root .skill-bar-track { width: 60px; height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
  .home-root .skill-bar-fill { height: 100%; background: var(--ember); border-radius: 2px; }
  .home-root .arch-badge { display: inline-block; font-size: 0.55rem; letter-spacing: 0.12em; text-transform: uppercase; padding: 2px 6px; border-radius: 2px; margin-left: 6px; vertical-align: middle; }
  .home-root .arch-transformer { background: rgba(168,196,212,0.15); color: var(--sky); }
  .home-root .arch-xgboost { background: rgba(123,184,140,0.15); color: #7BB88C; }
  .home-root .arch-mlp { background: rgba(212,160,96,0.15); color: #D4A060; }
  .home-root .arch-rf { background: rgba(138,126,110,0.2); color: var(--fog); }
  .home-root .arch-baseline { background: rgba(212,95,43,0.15); color: var(--dusk); }

  /* FINDINGS */
  .home-root .findings-section { background: var(--night); }
  .home-root .findings-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5px; margin-top: 3rem; background: var(--dust-line); border: 1px solid var(--dust-line); }
  .home-root .finding-card { background: var(--night); padding: 2.5rem 2rem; position: relative; overflow: hidden; transition: background 0.3s; }
  .home-root .finding-card-wide { grid-column: span 2; }
  .home-root .finding-card:hover { background: rgba(180,100,40,0.08); }
  .home-root .finding-num { font-family: 'Playfair Display', serif; font-size: 5rem; font-weight: 900; color: rgba(212,95,43,0.12); line-height: 1; position: absolute; top: 1rem; right: 1.5rem; font-style: italic; pointer-events: none; }
  .home-root .finding-tag { font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ember); margin-bottom: 1rem; }
  .home-root .finding-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 600; color: var(--sand); line-height: 1.3; margin-bottom: 1rem; }
  .home-root .finding-body { font-size: 0.78rem; line-height: 1.8; color: var(--fog); }
  .home-root .finding-stat { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--dust-line); font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 600; color: var(--dusk); }
  .home-root .finding-stat-sub { font-family: 'DM Mono', monospace; font-size: 0.65rem; color: var(--fog); margin-top: 0.2rem; letter-spacing: 0.1em; }

  /* PARADOX */
  .home-root .paradox-section { background: var(--pale); color: var(--ink); }
  .home-root .paradox-section .section-title { color: var(--ink); }
  .home-root .paradox-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 3rem; }
  .home-root .paradox-block { border-left: 3px solid var(--ember); padding: 1.5rem 2rem; background: rgba(180,130,60,0.04); border-radius: 0 4px 4px 0; }
  .home-root .paradox-heading { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 600; color: var(--ink); margin-bottom: 0.75rem; }
  .home-root .paradox-text { font-size: 0.8rem; line-height: 1.8; color: #5A4E3E; }
  .home-root .paradox-formula { display: inline-block; margin: 0.75rem 0; font-family: 'DM Mono', monospace; font-size: 0.72rem; background: rgba(180,130,60,0.12); padding: 6px 12px; border-radius: 2px; color: var(--ember); }

  /* DUST VIZ */
  .home-root .dust-viz { margin-top: 3rem; background: var(--ink); border-radius: 4px; padding: 2.5rem; overflow: hidden; }
  .home-root .dust-chart-title { font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--fog); margin-bottom: 2rem; }
  .home-root .dust-bars { display: flex; flex-direction: column; gap: 1.4rem; }
  .home-root .dust-bar-row { display: grid; grid-template-columns: 150px 1fr 60px; align-items: center; gap: 1rem; }
  .home-root .dust-bar-label { font-size: 0.68rem; color: var(--fog); text-align: right; font-family: 'DM Mono', monospace; }
  .home-root .dust-bar-tracks { display: flex; flex-direction: column; gap: 3px; }
  .home-root .dust-bar-track { height: 8px; background: rgba(255,255,255,0.04); border-radius: 2px; overflow: hidden; position: relative; }
  .home-root .dust-bar-clean { height: 100%; background: rgba(168,196,212,0.7); border-radius: 2px; transition: width 1s ease; }
  .home-root .dust-bar-dust-fill { height: 100%; background: var(--ember); border-radius: 2px; transition: width 1s ease; }
  .home-root .dust-penalty-label { font-size: 0.68rem; font-family: 'DM Mono', monospace; text-align: right; }

  /* RISK */
  .home-root .risk-section { background: var(--ink); display: grid; grid-template-columns: 1fr 1fr; gap: 0; padding: 0; }
  .home-root .risk-half { padding: 5rem 4rem; position: relative; overflow: hidden; }
  .home-root .risk-half.danger { background: rgba(180,50,30,0.08); border-right: 1px solid rgba(180,50,30,0.2); }
  .home-root .risk-half.safe { background: rgba(60,140,90,0.06); }
  .home-root .risk-verdict { font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 1rem; }
  .home-root .risk-verdict.danger { color: #E07060; }
  .home-root .risk-verdict.safe { color: #7BB88C; }
  .home-root .risk-model-name { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; color: var(--sand); line-height: 1.2; margin-bottom: 0.5rem; }
  .home-root .risk-config { font-size: 0.65rem; letter-spacing: 0.15em; color: var(--fog); text-transform: uppercase; margin-bottom: 2rem; }
  .home-root .risk-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
  .home-root .risk-stat { padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 2px; border: 1px solid rgba(255,255,255,0.06); }
  .home-root .risk-stat-num { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 600; color: var(--sand); }
  .home-root .risk-stat-label { font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fog); margin-top: 0.2rem; }
  .home-root .risk-desc { font-size: 0.78rem; line-height: 1.8; color: var(--fog); font-family: 'Fraunces', serif; font-style: italic; }
  .home-root .risk-icon { position: absolute; top: 3rem; right: 3rem; font-size: 4rem; opacity: 0.08; font-family: 'Playfair Display', serif; }

  /* AOD */
  .home-root .aod-section { background: var(--night); }
  .home-root .aod-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 5rem; margin-top: 3rem; align-items: start; }
  .home-root .aod-text { font-family: 'Fraunces', serif; font-size: 1rem; line-height: 1.9; color: var(--fog); font-style: italic; }
  .home-root .aod-text strong { font-style: normal; color: var(--sand); font-weight: 300; }
  .home-root .aod-impact-table { width: 100%; border-collapse: collapse; min-width: 600px; }
  .home-root .aod-impact-table thead tr { border-bottom: 1px solid var(--dust-line); }
  .home-root .aod-impact-table th { font-size: 0.6rem; letter-spacing: 0.2em; color: var(--fog); padding: 0.5rem 0.75rem; text-align: right; text-transform: uppercase; font-weight: 400; }
  .home-root .aod-impact-table th:first-child { text-align: left; }
  .home-root .aod-impact-table td { padding: 0.9rem 0.75rem; font-size: 0.78rem; font-family: 'DM Mono', monospace; color: var(--sand); border-bottom: 1px solid rgba(255,255,255,0.04); text-align: right; }
  .home-root .aod-impact-table td:first-child { text-align: left; color: var(--fog); }
  .home-root .delta-neg { color: #E07060 !important; }
  .home-root .aod-conclusion { margin-top: 2rem; padding: 1.5rem; border: 1px solid rgba(212,95,43,0.2); border-radius: 2px; background: rgba(212,95,43,0.04); font-size: 0.78rem; line-height: 1.7; color: var(--fog); }
  .home-root .aod-conclusion strong { color: var(--dusk); font-weight: 400; }

  /* METHODOLOGY */
  .home-root .method-section { background: var(--pale); color: var(--ink); }
  .home-root .method-section .section-title { color: var(--ink); }
  .home-root .method-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 2rem 0 3rem; }
  .home-root .method-pill { font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; padding: 6px 14px; border: 1px solid rgba(180,130,60,0.3); border-radius: 2px; color: var(--ember); background: rgba(180,130,60,0.06); }
  .home-root .method-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(180,130,60,0.18); }
  .home-root .method-cell { background: var(--pale); padding: 1.5rem; }
  .home-root .method-cell-label { font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ember); margin-bottom: 0.5rem; }
  .home-root .method-cell-value { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 600; color: var(--ink); }
  .home-root .method-metrics-grid { margin-top: 3rem; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; }

  /* FOOTER */
  .home-root footer { background: var(--night); padding: 3rem; border-top: 1px solid var(--dust-line); display: flex; justify-content: space-between; align-items: center; }
  .home-root .footer-brand { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-style: italic; color: var(--dusk); }
  .home-root .footer-meta { font-size: 0.65rem; letter-spacing: 0.1em; color: var(--fog); text-align: right; }

  /* ANIMATIONS */
  .home-root .fade-up { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .home-root .fade-up.visible { opacity: 1; transform: translateY(0); }

  @media (max-width: 900px) {
    .home-root .context-grid, .home-root .paradox-grid, .home-root .aod-grid { grid-template-columns: minmax(0, 1fr); gap: 2.5rem; }
    .home-root .findings-grid { grid-template-columns: minmax(0, 1fr); }
    .home-root .finding-card-wide { grid-column: auto; }
    .home-root .method-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    .home-root .method-metrics-grid { grid-template-columns: minmax(0, 1fr); }
    .home-root .risk-section { grid-template-columns: minmax(0, 1fr); }
    .home-root .hero { padding: 1.5rem; }
    .home-root .hero-nav { flex-direction: column; gap: 1.5rem; }
    .home-root .nav-links { flex-wrap: wrap; justify-content: center; gap: 1rem; }
    .home-root section { padding: 4rem 1.5rem; }
    .home-root footer { flex-direction: column; gap: 1rem; text-align: center; }
  }
`;

export const HOME_BODY = `
<section class="hero">
  <div class="hero-bg"></div>
  <div class="sun-arc"><div class="sun-dot"></div></div>

  <nav class="hero-nav fade-up">
    <span class="nav-logo">Kt Forecasting Research</span>
    <ul class="nav-links">
      <li><a href="#results">Results</a></li>
      <li><a href="#findings">Findings</a></li>
      <li><a href="#risk">Risk Analysis</a></li>
      <li><a href="#methodology">Methodology</a></li>
      <li><a href="/predict" class="nav-cta">Live Tester</a></li>
    </ul>
  </nav>

  <div class="hero-content">
    <div class="hero-eyebrow fade-up" style="transition-delay:0.1s">Desert Atmospheric Forecasting · Ouarzazate, Morocco</div>
    <h1 class="hero-title fade-up" style="transition-delay:0.2s">
      Predicting<br><em>Solar Irradiance</em><br>Through Dust
    </h1>
    <p class="hero-subtitle fade-up" style="transition-delay:0.3s">
      A comparative study of eight machine-learning architectures forecasting the Clearness Index Kt in a hyper-arid Saharan environment — where dust storms rewrite the sky.
    </p>
    <div class="hero-stats fade-up" style="transition-delay:0.4s">
      <div><div class="hero-stat-num">8</div><div class="hero-stat-label">Model configs</div></div>
      <div><div class="hero-stat-num">5.97%</div><div class="hero-stat-label">Best nRMSE</div></div>
      <div><div class="hero-stat-num">256%</div><div class="hero-stat-label">Peak dust penalty</div></div>
      <div><div class="hero-stat-num">0.78</div><div class="hero-stat-label">Best skill score</div></div>
    </div>
  </div>

  <div class="hero-footer fade-up" style="transition-delay:0.5s">
    <span>30°56'N  6°54'W  · 1136 m a.s.l.</span>
    <span class="scroll-hint">scroll to explore</span>
  </div>
</section>

<section class="context-section fade-up" id="context">
  <div class="section-label">Study Context</div>
  <h2 class="section-title">The challenge of<br>Saharan light</h2>
  <div class="context-grid">
    <div class="context-text">
      <p>Ouarzazate sits at the gateway of the Sahara — one of the world's highest solar irradiance sites, hosting a 580 MW concentrated solar power complex. Its energy potential is extraordinary, but so is its atmospheric volatility.</p>
      <p>Saharan dust storms — <em>haboobs</em> — can reduce direct normal irradiance by over 80% within minutes. For grid operators, this is a critical failure mode: forecasts that perform beautifully on clear days may catastrophically underperform precisely when accurate prediction matters most.</p>
      <p>This study interrogates whether modern sequence-learning architectures can capture the non-stationary, high-kurtosis error distributions that define real-world desert solar forecasting.</p>
    </div>
    <div class="context-cards">
      <div class="context-card fade-up"><div class="context-card-label">Dataset composition</div><div class="context-card-value">~85–90% clear-sky days</div><div class="context-card-sub">Severe class imbalance — dust events are rare but catastrophic anomalies</div></div>
      <div class="context-card fade-up"><div class="context-card-label">Target variable</div><div class="context-card-value">Clearness Index (Kt)</div><div class="context-card-sub">Ratio of measured to theoretical clear-sky irradiance, 0–1</div></div>
      <div class="context-card fade-up"><div class="context-card-label">Baseline model</div><div class="context-card-value">Smart Persistence</div><div class="context-card-sub">Kt forecast anchored to most recent observed Kt × seasonal adjustment</div></div>
      <div class="context-card fade-up"><div class="context-card-label">Feature experiment</div><div class="context-card-value">AOD inclusion / exclusion</div><div class="context-card-sub">Each architecture tested with and without Aerosol Optical Depth features</div></div>
      <div class="context-card fade-up"><div class="context-card-label">Physical scale</div><div class="context-card-value">Noor Solar Complex, 580 MW</div><div class="context-card-sub">One of the world's largest CSP installations; forecast errors have MW-scale consequences</div></div>
    </div>
  </div>
</section>

<section class="results-section fade-up" id="results">
  <div class="section-label">Master Results</div>
  <h2 class="section-title">Performance<br>across all models</h2>
  <p class="results-intro">All eight configurations compared against the Smart Persistence baseline. Skill score measures relative improvement; dust penalty measures proportional error amplification under Saharan dust conditions.</p>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Model</th><th>MAE_Kt</th><th>RMSE_Kt</th><th>nRMSE %</th><th>Skill score</th><th>MAE W/m²</th><th>MAE clean</th><th>MAE dust</th><th>Dust penalty</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Smart Persistence <span class="arch-badge arch-baseline">Baseline</span></td>
          <td>0.1008</td><td>0.2059</td><td>26.35</td>
          <td class="skill-bar-cell"><span class="skill-bar">0.000 <span class="skill-bar-track"><span class="skill-bar-fill" style="width:0%"></span></span></span></td>
          <td>79.90</td><td>0.0948</td><td>0.1843</td><td class="penalty-mid">94.5%</td>
        </tr>
        <tr class="best-row">
          <td>Transformer <span class="arch-badge arch-transformer">Transformer</span> — No AOD</td>
          <td>0.0112</td><td>0.0466</td><td>5.97</td>
          <td class="skill-bar-cell"><span class="skill-bar">0.781 <span class="skill-bar-track"><span class="skill-bar-fill" style="width:78%"></span></span></span></td>
          <td>26.29</td><td>0.0097</td><td>0.0331</td><td class="penalty-high">242.8%</td>
        </tr>
        <tr>
          <td>Transformer <span class="arch-badge arch-transformer">Transformer</span> — AOD</td>
          <td>0.0122</td><td>0.0492</td><td>6.30</td>
          <td class="skill-bar-cell"><span class="skill-bar">0.769 <span class="skill-bar-track"><span class="skill-bar-fill" style="width:77%"></span></span></span></td>
          <td>26.50</td><td>0.0105</td><td>0.0372</td><td class="penalty-high">256.0%</td>
        </tr>
        <tr class="best-row">
          <td>XGBoost <span class="arch-badge arch-xgboost">XGBoost</span> — No AOD</td>
          <td>0.0271</td><td>0.0605</td><td>7.75</td>
          <td class="skill-bar-cell"><span class="skill-bar">0.706 <span class="skill-bar-track"><span class="skill-bar-fill" style="width:70%"></span></span></span></td>
          <td>33.90</td><td>0.0246</td><td>0.0618</td><td class="penalty-mid">151.2%</td>
        </tr>
        <tr>
          <td>XGBoost <span class="arch-badge arch-xgboost">XGBoost</span> — AOD</td>
          <td>0.0301</td><td>0.0628</td><td>8.03</td>
          <td class="skill-bar-cell"><span class="skill-bar">0.695 <span class="skill-bar-track"><span class="skill-bar-fill" style="width:70%"></span></span></span></td>
          <td>36.05</td><td>0.0277</td><td>0.0634</td><td class="penalty-mid">128.9%</td>
        </tr>
        <tr>
          <td>MLP <span class="arch-badge arch-mlp">MLP</span> — No AOD</td>
          <td>0.0620</td><td>0.1068</td><td>13.48</td>
          <td class="skill-bar-cell"><span class="skill-bar">0.622 <span class="skill-bar-track"><span class="skill-bar-fill" style="width:62%"></span></span></span></td>
          <td>—</td><td>0.0605</td><td>0.0837</td><td class="penalty-mid">38.3%</td>
        </tr>
        <tr>
          <td>MLP <span class="arch-badge arch-mlp">MLP</span> — AOD</td>
          <td>0.0630</td><td>0.1106</td><td>13.96</td>
          <td class="skill-bar-cell"><span class="skill-bar">0.608 <span class="skill-bar-track"><span class="skill-bar-fill" style="width:61%"></span></span></span></td>
          <td>—</td><td>0.0610</td><td>0.0928</td><td class="penalty-mid">52.1%</td>
        </tr>
        <tr>
          <td>Random Forest <span class="arch-badge arch-rf">RF</span> — No AOD</td>
          <td>0.0763</td><td>0.1213</td><td>15.31</td>
          <td class="skill-bar-cell"><span class="skill-bar">0.570 <span class="skill-bar-track"><span class="skill-bar-fill" style="width:57%"></span></span></span></td>
          <td>—</td><td>0.0734</td><td>0.1184</td><td class="penalty-low">61.3%</td>
        </tr>
        <tr>
          <td>Random Forest <span class="arch-badge arch-rf">RF</span> — AOD</td>
          <td>0.0781</td><td>0.1231</td><td>15.53</td>
          <td class="skill-bar-cell"><span class="skill-bar">0.564 <span class="skill-bar-track"><span class="skill-bar-fill" style="width:56%"></span></span></span></td>
          <td>—</td><td>0.0752</td><td>0.1204</td><td class="penalty-low">60.1%</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

<section class="findings-section fade-up" id="findings">
  <div class="section-label">Key Findings</div>
  <h2 class="section-title">Four critical<br>insights</h2>
  <div class="findings-grid">
    <div class="finding-card fade-up"><div class="finding-num">01</div><div class="finding-tag">Architecture trade-off</div><div class="finding-title">Deep sequence models win globally — and lose locally</div><div class="finding-body">The Transformer's self-attention captures multi-hour atmospheric trajectories that tree models structurally cannot. But near-zero clean-day error creates catastrophic amplification when dust events arrive as distribution shifts.</div><div class="finding-stat">+23.6 pp</div><div class="finding-stat-sub">Transformer advantage over XGBoost in Skill Score (0.781 vs 0.706)</div></div>
    <div class="finding-card fade-up"><div class="finding-num">02</div><div class="finding-tag">Feature Engineering</div><div class="finding-title">AOD features uniformly degrade every model tested</div><div class="finding-body">Aerosol Optical Depth — expected to improve dust-event prediction — consistently increased nRMSE across all architectures. Likely cause: temporal and spatial resolution mismatch between satellite AOD products and sub-hourly ground conditions.</div><div class="finding-stat">+0.22–0.48 pp</div><div class="finding-stat-sub">Range of nRMSE increase from adding AOD across all models</div></div>
    <div class="finding-card fade-up"><div class="finding-num">03</div><div class="finding-tag">Statistical Paradox</div><div class="finding-title">The dust penalty metric inverts the accuracy ranking</div><div class="finding-body">The model with the lowest absolute dust-day error (Transformer: 0.033 Kt) has the highest dust penalty (256%). The worst absolute dust performer (RF: 0.118 Kt) has the lowest penalty (60%). Dust penalty as defined rewards mediocrity on clear days.</div><div class="finding-stat">4× inversion</div><div class="finding-stat-sub">Penalty rank order inverts vs absolute MAE_dust rank order</div></div>
    <div class="finding-card fade-up"><div class="finding-num">04</div><div class="finding-tag">Operational Conclusion</div><div class="finding-title">Best global model ≠ most reliable operational deployment</div><div class="finding-body">For CSP grid dispatch, the Transformer's error variance under dust presents an unacceptable operational risk. XGBoost No AOD offers a more stable error envelope, predictable dust-event behavior, and no satellite data pipeline dependency.</div><div class="finding-stat">XGBoost</div><div class="finding-stat-sub">Recommended operational configuration — no AOD features</div></div>
    <div class="finding-card finding-card-wide fade-up"><div class="finding-num">05</div><div class="finding-tag">Architectural Insight</div><div class="finding-title">Random Forest's mediocrity is operationally instructive</div><div class="finding-body">RF achieves the worst global accuracy but the most consistent relative degradation between clean and dust days (60–61% penalty, far below Transformer's 243%). This is not dust robustness — it is mediocre baseline performance providing a low floor. The implication: models that genuinely handle dust well must be evaluated on absolute dust-day MAE, not relative penalty, to avoid rewarding consistent underperformance.</div></div>
    <div class="finding-card fade-up"><div class="finding-num">06</div><div class="finding-tag">Data Quality Flag</div><div class="finding-title">MAE_Wm² missing for three architectures</div><div class="finding-body">RF and MLP report NaN for the physical-unit MAE. This value should be derivable from MAE_Kt × mean clear-sky irradiance. The gap requires resolution before submission — a reviewer will request it immediately.</div><div class="finding-stat">3 of 8</div><div class="finding-stat-sub">Configurations missing physical unit error conversion</div></div>
  </div>
</section>

<section class="paradox-section fade-up" id="paradox">
  <div class="section-label">The Dust Paradox</div>
  <h2 class="section-title">Why the best model<br>carries the highest risk</h2>
  <div class="paradox-grid">
    <div>
      <div class="paradox-block fade-up"><div class="paradox-heading">The penalty formula</div><div class="paradox-formula">Dust_penalty = (MAE_dust − MAE_clean) / MAE_clean × 100</div><div class="paradox-text">This ratio compresses the denominator for high-performing models. A model that achieves MAE_clean = 0.0097 has a tiny baseline — any non-trivial dust-day error explodes the percentage.</div></div>
      <div class="paradox-block fade-up" style="margin-top:1rem"><div class="paradox-heading">The inversion in numbers</div><div class="paradox-text">Transformer No AOD: <strong style="color:var(--ink)">MAE_dust = 0.0331 Kt</strong> → penalty 243%<br><br>Random Forest No AOD: <strong style="color:var(--ink)">MAE_dust = 0.1184 Kt</strong> → penalty 61%<br><br>The RF's dust-day error is <strong style="color:var(--ember)">3.6× higher</strong> in absolute terms, yet the metric makes it appear more "robust." This is a methodological artifact that the paper must explicitly address.</div></div>
    </div>
    <div class="dust-viz fade-up">
      <div class="dust-chart-title">MAE_Kt — Clean days (blue) vs Dust days (amber) — all configurations</div>
      <div class="dust-bars" id="dustBars"></div>
      <div style="display:flex;gap:1.5rem;margin-top:1.5rem">
        <span style="display:flex;align-items:center;gap:6px;font-size:0.65rem;color:var(--fog)"><span style="width:14px;height:3px;background:rgba(168,196,212,0.7);display:inline-block;border-radius:1px"></span>MAE clean</span>
        <span style="display:flex;align-items:center;gap:6px;font-size:0.65rem;color:var(--fog)"><span style="width:14px;height:3px;background:var(--ember);display:inline-block;border-radius:1px"></span>MAE dust</span>
      </div>
    </div>
  </div>
</section>

<section class="aod-section fade-up" id="aod">
  <div class="section-label">AOD Feature Analysis</div>
  <h2 class="section-title">The feature that<br>made things worse</h2>
  <div class="aod-grid">
    <div>
      <p class="aod-text">Aerosol Optical Depth is the <strong>physically correct variable</strong> to include for dust-event prediction. It directly quantifies the columnar dust loading that attenuates solar radiation. Its uniform failure across all four architectures is therefore the most counterintuitive and important result in this study.</p>
      <p class="aod-text" style="margin-top:1rem">Three candidate explanations, in order of plausibility: <strong>temporal latency</strong> in satellite retrieval products, <strong>spatial resolution mismatch</strong> between pixel-level AOD and local dust dynamics, and <strong>information redundancy</strong> with lagged Kt values already encoding the same signal more cleanly.</p>
      <div class="aod-conclusion"><strong>Reviewer note:</strong> The paper should report the exact AOD product used (MODIS MOD04? SEVIRI? Sentinel-5P?), its native temporal resolution, and whether any temporal alignment or interpolation was applied. Without this, the negative AOD finding cannot be replicated or correctly interpreted.</div>
    </div>
    <div>
      <div class="table-wrap" style="margin-bottom:0">
        <table class="aod-impact-table">
          <thead><tr><th>Architecture</th><th>nRMSE No AOD</th><th>nRMSE + AOD</th><th>Δ nRMSE</th><th>Dust penalty Δ</th></tr></thead>
          <tbody>
            <tr><td>Transformer</td><td>5.97%</td><td>6.30%</td><td class="delta-neg">+0.33 pp</td><td class="delta-neg">+13.2 pp</td></tr>
            <tr><td>XGBoost</td><td>7.75%</td><td>8.03%</td><td class="delta-neg">+0.28 pp</td><td style="color:#7BB88C">−22.3 pp</td></tr>
            <tr><td>MLP</td><td>13.48%</td><td>13.96%</td><td class="delta-neg">+0.48 pp</td><td class="delta-neg">+13.8 pp</td></tr>
            <tr><td>Random Forest</td><td>15.31%</td><td>15.53%</td><td class="delta-neg">+0.22 pp</td><td style="color:#7BB88C">−1.2 pp</td></tr>
          </tbody>
        </table>
      </div>
      <div style="margin-top:1.5rem;padding:1rem;background:rgba(255,255,255,0.02);border:1px solid var(--dust-line);border-radius:2px">
        <div style="font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--fog);margin-bottom:0.5rem">XGBoost anomaly</div>
        <div style="font-size:0.75rem;line-height:1.7;color:var(--fog)">XGBoost uniquely shows improved dust penalty with AOD (+AOD → −22.3 pp penalty) despite worse global nRMSE. Tree-based splits can isolate high-AOD as a partition, creating conditional dust-regime behavior. Continuous activations in MLP cannot form such hard decision boundaries.</div>
      </div>
    </div>
  </div>
</section>

<section class="risk-section fade-up" id="risk">
  <div class="risk-half danger">
    <div class="risk-icon">⚠</div>
    <div class="risk-verdict danger">— Highest operational risk</div>
    <div class="risk-model-name">Transformer</div>
    <div class="risk-config">No AOD configuration · Skill 0.781</div>
    <div class="risk-stats">
      <div class="risk-stat"><div class="risk-stat-num" style="color:#E07060">243%</div><div class="risk-stat-label">Dust penalty</div></div>
      <div class="risk-stat"><div class="risk-stat-num">0.0097</div><div class="risk-stat-label">MAE_Kt clean</div></div>
      <div class="risk-stat"><div class="risk-stat-num">0.0331</div><div class="risk-stat-label">MAE_Kt dust</div></div>
      <div class="risk-stat"><div class="risk-stat-num">26.29</div><div class="risk-stat-label">MAE W/m²</div></div>
    </div>
    <p class="risk-desc">The false precision trap. Industry-leading nRMSE invites operators to reduce reserve margins — but dust-event error amplifies 25× over clear-sky performance. For a 100 MW CSP plant, this translates to potential 3–6 MW dispatch errors at the worst possible moment: storm onset.</p>
  </div>
  <div class="risk-half safe">
    <div class="risk-icon">✓</div>
    <div class="risk-verdict safe">— Most operationally reliable</div>
    <div class="risk-model-name">XGBoost</div>
    <div class="risk-config">No AOD configuration · Skill 0.706</div>
    <div class="risk-stats">
      <div class="risk-stat"><div class="risk-stat-num" style="color:#D4A060">151%</div><div class="risk-stat-label">Dust penalty</div></div>
      <div class="risk-stat"><div class="risk-stat-num">0.0246</div><div class="risk-stat-label">MAE_Kt clean</div></div>
      <div class="risk-stat"><div class="risk-stat-num">0.0618</div><div class="risk-stat-label">MAE_Kt dust</div></div>
      <div class="risk-stat"><div class="risk-stat-num">33.90</div><div class="risk-stat-label">MAE W/m²</div></div>
    </div>
    <p class="risk-desc">Predictable, bounded error. Dust-day absolute MAE (0.062 Kt) remains within CSP dispatch tolerance. No satellite AOD pipeline dependency eliminates a real-time data failure mode — AOD retrievals degrade over bright desert surfaces from surface albedo contamination.</p>
  </div>
</section>

<section class="method-section fade-up" id="methodology">
  <div class="section-label">Methodology</div>
  <h2 class="section-title">Experimental design</h2>
  <div class="method-pills">
    <span class="method-pill">Time-series forecasting</span>
    <span class="method-pill">Clearness Index Kt</span>
    <span class="method-pill">Smart Persistence baseline</span>
    <span class="method-pill">AOD ablation study</span>
    <span class="method-pill">Stratified evaluation</span>
    <span class="method-pill">Physical unit conversion</span>
  </div>
  <div class="method-grid">
    <div class="method-cell"><div class="method-cell-label">Location</div><div class="method-cell-value">Ouarzazate, Morocco</div></div>
    <div class="method-cell"><div class="method-cell-label">Elevation</div><div class="method-cell-value">1,136 m a.s.l.</div></div>
    <div class="method-cell"><div class="method-cell-label">Climate class</div><div class="method-cell-value">BWh — Hyper-arid</div></div>
    <div class="method-cell"><div class="method-cell-label">Architectures tested</div><div class="method-cell-value">4 (× 2 feature sets)</div></div>
    <div class="method-cell"><div class="method-cell-label">Primary metric</div><div class="method-cell-value">nRMSE (%)</div></div>
    <div class="method-cell"><div class="method-cell-label">Skill reference</div><div class="method-cell-value">Smart Persistence</div></div>
    <div class="method-cell"><div class="method-cell-label">Stratification</div><div class="method-cell-value">Clean / Dust days</div></div>
    <div class="method-cell"><div class="method-cell-label">Physical conversion</div><div class="method-cell-value">MAE_Kt → W/m²</div></div>
  </div>
  <div class="method-metrics-grid">
    <div style="padding:1.5rem;border:1px solid rgba(180,130,60,0.2);border-radius:2px;background:rgba(180,130,60,0.04)"><div class="method-cell-label" style="color:var(--ember)">nRMSE</div><div style="font-size:0.78rem;line-height:1.7;color:#4A3F30;font-family:'Fraunces',serif">Global normalized RMSE across entire test set. Dominated by the majority class (clear days).</div></div>
    <div style="padding:1.5rem;border:1px solid rgba(180,130,60,0.2);border-radius:2px;background:rgba(180,130,60,0.04)"><div class="method-cell-label" style="color:var(--ember)">Skill Score</div><div style="font-size:0.78rem;line-height:1.7;color:#4A3F30;font-family:'Fraunces',serif">Relative improvement over Smart Persistence. 0 = no better than baseline; 1 = perfect forecast.</div></div>
    <div style="padding:1.5rem;border:1px solid rgba(180,130,60,0.2);border-radius:2px;background:rgba(180,130,60,0.04)"><div class="method-cell-label" style="color:var(--ember)">Dust Penalty</div><div style="font-size:0.78rem;line-height:1.7;color:#4A3F30;font-family:'Fraunces',serif">Proportional MAE increase from clean to dust days. Must be read alongside absolute MAE_dust values.</div></div>
  </div>
</section>

<footer>
  <div class="footer-brand">Kt Forecasting Research</div>
  <div class="footer-meta">Ouarzazate Solar Complex · Drâa-Tafilalet Region<br>Short-term solar irradiance forecasting under Saharan dust conditions</div>
</footer>
`;

export const DUST_DATA = [
  { label: "Smart Persistence", clean: 0.0948, dust: 0.1843, penalty: 94.5 },
  { label: "Transformer — No AOD", clean: 0.0097, dust: 0.0331, penalty: 242.8 },
  { label: "Transformer — AOD", clean: 0.0105, dust: 0.0372, penalty: 256.0 },
  { label: "XGBoost — No AOD", clean: 0.0246, dust: 0.0618, penalty: 151.2 },
  { label: "XGBoost — AOD", clean: 0.0277, dust: 0.0634, penalty: 128.9 },
  { label: "MLP — No AOD", clean: 0.0605, dust: 0.0837, penalty: 38.3 },
  { label: "MLP — AOD", clean: 0.061, dust: 0.0928, penalty: 52.1 },
  { label: "RF — No AOD", clean: 0.0734, dust: 0.1184, penalty: 61.3 },
  { label: "RF — AOD", clean: 0.0752, dust: 0.1204, penalty: 60.1 },
];
