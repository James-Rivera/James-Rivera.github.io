import React from 'react';

const { useEffect, useMemo, useRef, useState } = React;

const beats = [
  ['1 / span 7', '4 / 3', '0px'],
  ['9 / span 4', '4 / 5', 'clamp(50px,8vw,140px)'],
  ['2 / span 5', '1 / 1', '0px'],
  ['8 / span 5', '5 / 4', 'clamp(60px,10vw,180px)']
];

export default function WorkIndex({ projects }) {
  const [filter, setFilterState] = useState('all');
  const [view, setViewState] = useState('list');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const previewRef = useRef(null);
  const inputRef = useRef(null);
  const paletteRef = useRef(null);

  const setFilter = (next) => { setFilterState(next); localStorage.setItem('pf-work-filter', next); };
  const setView = (next) => { setViewState(next); localStorage.setItem('pf-work-view', next); };

  useEffect(() => {
    const savedFilter = localStorage.getItem('pf-work-filter');
    const savedView = localStorage.getItem('pf-work-view');
    if (['all', 'systems', 'school'].includes(savedFilter)) setFilterState(savedFilter);
    if (['list', 'grid'].includes(savedView)) setViewState(savedView);
  }, []);

  useEffect(() => {
    if (!paletteOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => inputRef.current?.focus());
    const trapFocus = (event) => {
      if (event.key !== 'Tab' || !paletteRef.current) return;
      const focusable = [...paletteRef.current.querySelectorAll('input,button,[href]')].filter((element) => !element.disabled);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    addEventListener('keydown', trapFocus);
    return () => {
      removeEventListener('keydown', trapFocus);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [paletteOpen]);

  const visible = filter === 'all' ? projects : projects.filter((project) => project.group === filter);
  const openProject = (project) => project.external ? window.open(project.href, '_blank', 'noreferrer') : (window.location.href = project.href);
  const entries = useMemo(() => [
    ...projects.map((project) => ({ label: project.title, hint: project.external ? 'Live ↗' : 'Case study', terms: `${project.title} ${project.label} ${project.group} ${project.year}`, run: () => openProject(project) })),
    ...['all', 'systems', 'school'].map((value) => ({ label: `Filter: ${value[0].toUpperCase()}${value.slice(1)}`, hint: 'Filter', terms: `filter ${value}`, run: () => setFilter(value) })),
    { label: 'View as list', hint: 'View', terms: 'view list rows', run: () => setView('list') },
    { label: 'View as grid', hint: 'View', terms: 'view grid covers images', run: () => setView('grid') },
    { label: 'Toggle light / dark', hint: 'Theme', terms: 'theme light dark appearance', run: () => document.querySelector('[data-theme-toggle]')?.click() },
    { label: 'Go to index', hint: 'Page', terms: 'index home', run: () => (window.location.href = '/') },
    { label: 'Go to about', hint: 'Page', terms: 'about profile', run: () => (window.location.href = '/#about') },
    { label: 'Go to contact', hint: 'Page', terms: 'contact email', run: () => (window.location.href = '/#contact') }
  ], [projects]);
  const results = entries.filter((entry) => `${entry.label} ${entry.terms}`.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const onKey = (event) => {
      const typing = /input|textarea/i.test(document.activeElement?.tagName || '');
      if ((event.key === '/' && !typing) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault(); setPaletteOpen(true); setQuery(''); setActive(0); return;
      }
      if (!paletteOpen) return;
      if (event.key === 'Escape') setPaletteOpen(false);
      if (event.key === 'ArrowDown') { event.preventDefault(); setActive((value) => results.length ? (value + 1) % results.length : 0); }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActive((value) => results.length ? (value - 1 + results.length) % results.length : 0); }
      if (event.key === 'Enter' && results[active]) { event.preventDefault(); results[active].run(); setPaletteOpen(false); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [paletteOpen, results, active]);

  useEffect(() => {
    if (view !== 'list' || matchMedia('(hover: none)').matches) return;
    const box = previewRef.current;
    if (!box) return;
    let x = 0, y = 0, tx = 0, ty = 0, frame = 0, on = false;
    const move = (event) => { tx = event.clientX; ty = event.clientY; if (!on) { x = tx; y = ty; } };
    const tick = () => { x += (tx - x) * .14; y += (ty - y) * .14; const tilt = Math.max(-7, Math.min(7, (tx - x) * .14)); box.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) rotate(${tilt}deg) scale(${on ? 1 : .9})`; frame = requestAnimationFrame(tick); };
    const rows = [...document.querySelectorAll('[data-work-row]')];
    const enter = (event) => { on = true; box.dataset.active = event.currentTarget.dataset.slug; box.style.opacity = '1'; };
    const leave = () => { on = false; box.style.opacity = '0'; };
    rows.forEach((row) => { row.addEventListener('pointerenter', enter); row.addEventListener('pointerleave', leave); });
    addEventListener('mousemove', move, { passive: true }); frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); removeEventListener('mousemove', move); rows.forEach((row) => { row.removeEventListener('pointerenter', enter); row.removeEventListener('pointerleave', leave); }); };
  }, [view, filter]);

  const runResult = (entry) => { entry.run(); setPaletteOpen(false); };
  return <>
    <div className="work-controls" data-controls>
      <div className="work-filters" role="group" aria-label="Filter by kind">
        {[['all', 'All'], ['systems', 'Systems'], ['school', 'School']].map(([value, label]) => <button key={value} type="button" className={filter === value ? 'is-active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}><span>{label}</span><span>{String(value === 'all' ? projects.length : projects.filter((p) => p.group === value).length).padStart(2, '0')}</span></button>)}
      </div>
      <div className="work-view" role="group" aria-label="View">
        <button type="button" className={view === 'list' ? 'is-active' : ''} aria-pressed={view === 'list'} onClick={() => setView('list')}>List</button><span>/</span><button type="button" className={view === 'grid' ? 'is-active' : ''} aria-pressed={view === 'grid'} onClick={() => setView('grid')}>Grid</button>
      </div>
    </div>
    {view === 'list' ? <div className="work-list">
      {visible.map((project, index) => <a href={project.href} target={project.external ? '_blank' : undefined} rel={project.external ? 'noreferrer' : undefined} className="work-row" data-work-row data-slug={project.slug} style={{ animationDelay: `${index * 40}ms` }} key={project.slug}><span>{project.number}</span><strong>{project.title}</strong><span>{project.label}</span><span>{project.year} {project.external ? '↗' : '→'}</span></a>)}
      <div className="work-preview-box" ref={previewRef} aria-hidden="true">{visible.map((project) => <div className="work-preview-layer" data-slug={project.slug} key={project.slug}>{project.cover && <img src={project.cover} alt="" />}</div>)}</div>
    </div> : <div className="work-grid">
      {visible.map((project, index) => { const beat = beats[index % 4]; return <a href={project.href} target={project.external ? '_blank' : undefined} rel={project.external ? 'noreferrer' : undefined} className="work-card" data-work-card style={{ gridColumn: beat[0], marginTop: beat[2], animationDelay: `${index * 40}ms` }} key={project.slug}><div className="work-cover" style={{ aspectRatio: beat[1] }}>{project.cover && <img src={project.cover} alt={project.imageAlt || ''} />}</div><div><strong>{project.title}</strong><span>{project.year}</span></div><p>{project.label}</p></a>; })}
    </div>}
    <footer className="work-footer"><a href="/">← Index</a><button type="button" onClick={() => { setPaletteOpen(true); setQuery(''); setActive(0); }}>Press / to search</button><a href="https://github.com/James-Rivera" target="_blank" rel="noreferrer">GitHub ↗</a></footer>
    {paletteOpen && <div className="palette-overlay" onMouseDown={() => setPaletteOpen(false)}><div className="palette" ref={paletteRef} role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(event) => event.stopPropagation()}><div className="palette-search"><span>›</span><input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} placeholder="Search projects, filters, pages…" aria-label="Search projects and pages" /><span>Esc</span></div><div className="palette-results">{results.map((entry, index) => <button type="button" className={active === index ? 'is-active' : ''} onMouseEnter={() => setActive(index)} onClick={() => runResult(entry)} key={`${entry.label}-${index}`}><i></i><span>{entry.label}</span><span>{entry.hint}</span></button>)}</div><div className="palette-help"><span>↑↓ Move</span><span>↵ Open</span><span>{String(results.length).padStart(2, '0')} results</span></div></div></div>}
  </>;
}
