import { useEffect, useRef, useState } from 'react';

const monoLinks = [
  ['Work', '#work'],
  ['About', '#about'],
  ['Contact', '#contact']
];

export default function HeroMotion() {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const loaderRef = useRef(null);
  const loaderBrandRef = useRef(null);
  const loadNumberRef = useRef(null);
  const loadTrackRef = useRef(null);
  const loadBarRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let width = 1;
    let height = 1;
    let dpr = 1;
    let start = performance.now();
    let last = 0;
    let ripple = null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const move = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = (event.clientX - rect.left) / rect.width;
      pointer.ty = (event.clientY - rect.top) / rect.height;
    };

    const click = (event) => {
      const rect = canvas.getBoundingClientRect();
      ripple = { x: event.clientX - rect.left, born: performance.now() };
    };

    const draw = (now) => {
      frameRef.current = requestAnimationFrame(draw);
      if (now - last < 32) return;
      last = now;
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;

      const dark = document.documentElement.dataset.theme !== 'light';
      const sky = dark ? '#0A0D12' : '#F7F6F3';
      const top = dark ? '#18232F' : '#DCE4EC';
      const deep = dark ? '#05070B' : '#9FAEBE';
      const line = dark ? '239,236,228' : '20,22,26';
      const t = reduced ? 0 : (now - start) / 1000;
      const level = Number.isFinite(window.__pfLevel) ? window.__pfLevel : 0.44;
      const base = height * level;
      const amp = height * 0.052;
      const k = Math.PI * 2 / (width / 1.25);
      const px = pointer.x * width;
      const py = pointer.y * height;

      const surface = (x, phase = t, depth = 0) => {
        let y = base
          + amp * Math.sin(k * x - phase * 0.72)
          + amp * 0.46 * Math.sin(k * 1.9 * x - phase * 1.12 + 1.3)
          + amp * 0.3 * Math.sin(k * 0.55 * x - phase * 0.4 + 0.7);
        const pointerDistance = (x - px) / (width * 0.13);
        y += Math.exp(-pointerDistance * pointerDistance) * Math.max(-1, Math.min(1, (py - y) / (height * 0.45))) * height * 0.04;
        if (ripple) {
          const age = Math.min(1, (now - ripple.born) / 1800);
          const radius = age * 620;
          const distance = Math.abs(x - ripple.x);
          y -= Math.exp(-Math.pow((distance - radius) / 92, 2)) * (1 - age) * height * 0.05 * Math.cos((distance - radius) / 30);
          if (age >= 1) ripple = null;
        }
        return y + depth;
      };

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = sky;
      context.fillRect(0, 0, width, height);

      context.beginPath();
      context.moveTo(0, surface(0));
      for (let x = 6; x <= width; x += 6) context.lineTo(x, surface(x));
      context.lineTo(width, height);
      context.lineTo(0, height);
      context.closePath();
      const gradient = context.createLinearGradient(0, base - amp * 1.8, 0, height);
      gradient.addColorStop(0, top);
      gradient.addColorStop(1, deep);
      context.fillStyle = gradient;
      context.fill();

      context.save();
      context.clip();
      for (let index = 1; index <= 26; index += 1) {
        const factor = index / 26;
        const offset = Math.pow(factor, 1.5) * height * 0.6;
        const lag = t - factor * 2.6;
        const alpha = 0.34 * Math.exp(-factor * 2.1) + 0.012;
        context.beginPath();
        for (let x = 0; x <= width; x += 7) {
          const y = surface(x, lag) * (1 - factor * 0.55) + base * (factor * 0.55) + offset;
          if (x === 0) context.moveTo(x, y); else context.lineTo(x, y);
        }
        context.lineWidth = index < 4 ? 1 : 0.7;
        context.strokeStyle = index % 9 === 3 ? `rgba(31,95,239,${alpha})` : `rgba(${line},${alpha})`;
        context.stroke();
      }

      for (let row = 0; row < 17; row += 1) {
        for (let column = 0; column < 70; column += 1) {
          const x = (column / 69) * width + Math.sin(row * 9.7 + column) * 3;
          const depth = Math.pow((row + 1) / 17, 1.7) * height * 0.58;
          const decay = Math.exp(-k * depth * 1.05);
          if (decay < 0.06) continue;
          const y = surface(x, t) + depth + amp * decay * 0.7 * Math.sin(k * x - t);
          context.beginPath();
          context.arc(x, y, 0.45 + decay, 0, Math.PI * 2);
          context.fillStyle = `rgba(${line},${0.3 * decay})`;
          context.fill();
        }
      }
      context.restore();

      context.beginPath();
      for (let x = 0; x <= width; x += 5) {
        const y = surface(x);
        if (x === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.lineWidth = 1.15;
      context.strokeStyle = `rgba(${line},${dark ? 0.5 : 0.42})`;
      context.stroke();

      const fade = context.createLinearGradient(0, height * 0.76, 0, height);
      fade.addColorStop(0, dark ? 'rgba(10,13,18,0)' : 'rgba(247,246,243,0)');
      fade.addColorStop(0.72, dark ? 'rgba(10,13,18,.94)' : 'rgba(247,246,243,.94)');
      fade.addColorStop(1, sky);
      context.fillStyle = fade;
      context.fillRect(0, height * 0.72, width, height * 0.28);
    };

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const nav = document.querySelector('[data-hero-nav]');
    const navBrand = document.querySelector('[data-nav-brand]');
    const timers = new Set();
    let loaderFrame = 0;
    let finished = false;

    const later = (callback, delay) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
      return timer;
    };

    const restoreScroll = () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };

    const showHero = () => {
      document.documentElement.classList.add('portfolio-ready');
      dispatchEvent(new Event('portfolio:ready'));
    };

    const done = () => {
      if (finished) return;
      finished = true;
      window.__pfLoaded = true;
      if (loaderRef.current) loaderRef.current.style.opacity = '0';
      if (nav) {
        nav.style.transition = 'opacity .8s ease';
        nav.style.opacity = '1';
      }
      restoreScroll();
      later(showHero, 180);
      later(() => setReady(true), 700);
    };

    const flyBrand = () => {
      const loadBrand = loaderBrandRef.current;
      if (!loadBrand || !navBrand) {
        done();
        return;
      }
      const from = loadBrand.getBoundingClientRect();
      const to = navBrand.getBoundingClientRect();
      if (nav) nav.style.opacity = '1';
      loadBrand.style.transition = 'transform 1s cubic-bezier(.16,1,.3,1), font-size 1s ease';
      loadBrand.style.transform = `translate(${(to.left - from.left).toFixed(1)}px,${(to.top - from.top).toFixed(1)}px)`;
      later(() => {
        navBrand.style.transition = 'opacity .3s ease';
        navBrand.style.opacity = '1';
        done();
      }, 1000);
    };

    const settle = () => {
      const started = performance.now();
      const duration = 900;
      if (loadNumberRef.current) {
        loadNumberRef.current.style.transition = 'opacity .5s ease, transform .7s cubic-bezier(.16,1,.3,1)';
        loadNumberRef.current.style.opacity = '0';
        loadNumberRef.current.style.transform = 'translateY(18px)';
      }
      if (loadTrackRef.current) {
        loadTrackRef.current.style.transition = 'opacity .5s ease';
        loadTrackRef.current.style.opacity = '0';
      }
      const ease = (now) => {
        const progress = Math.min(1, (now - started) / duration);
        const amount = 1 - Math.pow(1 - progress, 3);
        window.__pfLevel = 0.395 + (0.44 - 0.395) * amount;
        if (progress < 1) loaderFrame = requestAnimationFrame(ease);
        else flyBrand();
      };
      loaderFrame = requestAnimationFrame(ease);
    };

    const runLoader = () => {
      document.documentElement.classList.remove('portfolio-ready');
      if (nav) nav.style.opacity = '0';
      if (navBrand) navBrand.style.opacity = '0';

      if (window.__pfLoaded) {
        window.__pfLevel = 0.44;
        if (nav) nav.style.opacity = '1';
        if (navBrand) navBrand.style.opacity = '1';
        showHero();
        setReady(true);
        return;
      }

      if (reduced) {
        window.__pfLevel = 0.44;
        if (loadNumberRef.current) loadNumberRef.current.textContent = '100';
        if (loadBarRef.current) loadBarRef.current.style.width = '100%';
        if (navBrand) navBrand.style.opacity = '1';
        done();
        return;
      }

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
      window.__pfLevel = 1.04;
      const started = performance.now();
      const duration = 2600;
      const rise = (now) => {
        const progress = Math.min(1, (now - started) / duration);
        const amount = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        window.__pfLevel = 1.04 + (0.395 - 1.04) * amount;
        const value = Math.round(amount * 100);
        if (loadNumberRef.current) loadNumberRef.current.textContent = String(value).padStart(3, '0');
        if (loadBarRef.current) loadBarRef.current.style.width = `${(amount * 100).toFixed(1)}%`;
        if (progress < 1) loaderFrame = requestAnimationFrame(rise);
        else later(settle, 200);
      };
      loaderFrame = requestAnimationFrame(rise);
      later(() => {
        if (!finished) {
          window.__pfLevel = 0.44;
          done();
        }
      }, 7000);
    };

    window.__pfLevel = window.__pfLoaded || reduced ? 0.44 : 1.04;
    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', move, { passive: true });
    canvas.addEventListener('click', click);
    frameRef.current = requestAnimationFrame(draw);
    runLoader();

    return () => {
      cancelAnimationFrame(frameRef.current);
      cancelAnimationFrame(loaderFrame);
      timers.forEach((timer) => clearTimeout(timer));
      restoreScroll();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('click', click);
    };
  }, []);

  return (
    <section className="hero" data-screen-label="Hero" id="top">
      <canvas ref={canvasRef} className="water-canvas" aria-hidden="true" />
      {!ready && (
        <div ref={loaderRef} className="loader" data-loader aria-live="polite">
          <div><span ref={loaderBrandRef} className="mono-brand" data-load-brand><img src="/images/Logo Cleaned - White.png" alt="" data-logo /> James Carlo Rivera</span><strong ref={loadNumberRef} data-load-num>000</strong></div>
          <span ref={loadTrackRef} className="loader-track"><i ref={loadBarRef} data-load-bar /></span>
        </div>
      )}
      <nav className="hero-nav" data-hero-nav aria-label="Primary navigation">
        <a className="mono-brand" data-nav-brand href="#top"><img src="/images/Logo Cleaned - White.png" alt="" data-logo /><span>James Carlo Rivera</span></a>
        <span>{monoLinks.map(([label, href]) => <a key={href} href={href} className={label === 'Contact' ? 'active' : ''}>{label}</a>)}</span>
      </nav>
      <div className="hero-body">
        <div>
          <h1><span>Products,</span><span>not demos.</span></h1>
          <p className="hero-lead">I design and build complete systems for real operational problems — from the interface to the server they run on.</p>
          <div className="hero-links">
            <a href="#contact">Contact me</a><a href="#work">Selected systems ↓</a><a href="https://github.com/James-Rivera" target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
        </div>
         <div className="hero-meta"><span>Batangas, Philippines</span><span>4th-year BSIT · PUP Sto. Tomas</span><span>● Open to internships & product engineering roles</span></div>
      </div>
      <div className="hero-scroll">Scroll <span>↓</span></div>
    </section>
  );
}
