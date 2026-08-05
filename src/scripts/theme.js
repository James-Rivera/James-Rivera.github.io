const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let waveCanvas;
let waveFrame;
let themeTimer;
let themeControlsWired = false;

function toRgb(hex) {
  const value = String(hex).replace('#', '');
  const number = parseInt(value.length === 3 ? value.split('').map((part) => part + part).join('') : value, 16);
  if (Number.isNaN(number)) return '31,95,239';
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255].join(',');
}

function hash(a, b) {
  const value = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function applyTheme(mode) {
  root.dataset.theme = mode;
  document.querySelectorAll('[data-theme-label]').forEach((label) => {
    label.textContent = mode === 'light' ? 'Light' : 'Dark';
  });
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'light' ? '#F7F6F3' : '#0A0D12');
  try {
    localStorage.setItem('pf-theme', mode);
    localStorage.setItem('portfolio-theme', mode);
  } catch {}
}

function fadeTheme(mode) {
  clearTimeout(themeTimer);
  root.dataset.themeAnim = 'true';
  applyTheme(mode);
  themeTimer = window.setTimeout(() => delete root.dataset.themeAnim, 700);
}

function themeWave(mode, flip) {
  if (!waveCanvas) {
    waveCanvas = document.createElement('canvas');
    waveCanvas.dataset.themeWave = '1';
    waveCanvas.setAttribute('aria-hidden', 'true');
    waveCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:200;pointer-events:none;';
    document.body.appendChild(waveCanvas);
  }

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const width = window.innerWidth;
  const height = window.innerHeight;
  waveCanvas.width = Math.round(width * dpr);
  waveCanvas.height = Math.round(height * dpr);
  waveCanvas.style.display = 'block';

  const context = waveCanvas.getContext('2d');
  const dark = mode !== 'light';
  const colors = dark
    ? { top: '#18232F', deep: '#05070B', line: '239,236,228', foam: '255,255,255', foamAlpha: 0.55, lineAlpha: 0.34 }
    : { top: '#DCE4EC', deep: '#8FA0B2', line: '20,22,26', foam: '255,255,255', foamAlpha: 0.34, lineAlpha: 0.3 };
  const accent = toRgb('#1F5FEF');
  const amplitude = Math.max(26, height * 0.055);
  const waveLength = (Math.PI * 2) / (width / 1.15);
  const ease = (progress) => progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  const edge = (x, base, phase) => base
    + amplitude * Math.sin(waveLength * x - phase)
    + amplitude * 0.45 * Math.sin(waveLength * 1.9 * x - phase * 1.35 + 1.3)
    + amplitude * 0.22 * Math.sin(waveLength * 0.6 * x - phase * 0.5 + 0.6);

  const duration = 1550;
  const span = height + amplitude * 5;
  const step = 8;
  const started = performance.now();
  let flipped = false;
  cancelAnimationFrame(waveFrame);

  const draw = (now) => {
    const progress = Math.min(1, (now - started) / duration);
    const phase = ((now - started) / 1000) * 2.3;
    const leading = height + amplitude * 2.5 - ease(Math.min(1, progress / 0.5)) * span;
    const trailing = height + amplitude * 2.5 - ease(Math.max(0, (progress - 0.46) / 0.54)) * span;

    if (!flipped && progress >= 0.5) {
      flipped = true;
      flip();
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    context.save();
    context.beginPath();
    for (let x = -step; x <= width + step; x += step) {
      const y = edge(x, leading, phase);
      if (x === -step) context.moveTo(x, y); else context.lineTo(x, y);
    }
    for (let x = width + step; x >= -step; x -= step) context.lineTo(x, edge(x, trailing, phase * 0.8 + 2.1));
    context.closePath();

    const gradient = context.createLinearGradient(0, leading - amplitude, 0, leading + height * 0.85);
    gradient.addColorStop(0, colors.top);
    gradient.addColorStop(1, colors.deep);
    context.fillStyle = gradient;
    context.fill();
    context.clip();
    context.lineCap = 'round';

    for (let index = 1; index <= 22; index += 1) {
      const factor = index / 22;
      const offset = Math.pow(factor, 1.45) * height * 0.72;
      const alpha = colors.lineAlpha * Math.exp(-factor * 2) + 0.014;
      context.beginPath();
      for (let x = -step; x <= width + step; x += step) {
        const y = edge(x, leading, phase - factor * 2.4) * (1 - factor * 0.5) + leading * factor * 0.5 + offset;
        if (x === -step) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.lineWidth = index < 4 ? 1 : 0.7;
      context.strokeStyle = `rgba(${index % 8 === 3 ? accent : colors.line},${alpha.toFixed(3)})`;
      context.stroke();
    }
    context.restore();

    context.beginPath();
    for (let x = -step; x <= width + step; x += step) {
      const y = edge(x, leading, phase);
      if (x === -step) context.moveTo(x, y); else context.lineTo(x, y);
    }
    context.lineWidth = 1.15;
    context.strokeStyle = `rgba(${colors.line},${dark ? 0.5 : 0.42})`;
    context.stroke();

    context.beginPath();
    for (let x = 0; x <= width; x += 3) {
      const left = edge(x - 6, leading, phase);
      const right = edge(x + 6, leading, phase);
      const slope = Math.max(0, Math.abs((right - left) / 12) - 0.12) * 3.2;
      if (slope <= 0) continue;
      const noise = hash(Math.floor(x * 0.5), Math.floor(phase * 3));
      if (noise > slope) continue;
      const y = edge(x, leading, phase) + (noise - 0.5) * 7;
      context.moveTo(x, y);
      context.lineTo(x + 1.6, y);
    }
    context.lineWidth = 1.6;
    context.strokeStyle = `rgba(${dark ? colors.foam : colors.line},${colors.foamAlpha})`;
    context.stroke();

    if (trailing < height + amplitude) {
      context.beginPath();
      for (let x = -step; x <= width + step; x += step) {
        const y = edge(x, trailing, phase * 0.8 + 2.1);
        if (x === -step) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.lineWidth = 1.4;
      context.strokeStyle = `rgba(${colors.line},${dark ? 0.42 : 0.34})`;
      context.stroke();
    }

    if (progress < 1) {
      waveFrame = requestAnimationFrame(draw);
      return;
    }
    if (!flipped) flip();
    context.clearRect(0, 0, width, height);
    waveCanvas.style.display = 'none';
    waveFrame = 0;
  };

  waveFrame = requestAnimationFrame(draw);
}

export function initTheme() {
  let saved = 'dark';
  try { saved = localStorage.getItem('pf-theme') || localStorage.getItem('portfolio-theme') || 'dark'; } catch {}
  applyTheme(saved);

  if (themeControlsWired) return;
  themeControlsWired = true;
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('[data-theme-toggle], .theme-toggle')) return;
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    if (!reducedMotion) themeWave(next, () => fadeTheme(next));
    else fadeTheme(next);
  });
}
