import { initTheme } from './theme.js';
import { initCounters, initPipeline, initReveals, initScrollWords, initSteps, initTiles } from './motion.js';
import { initAskOverlay, initCursorAndClock, initDetailRows, initPrinciples, initProjectRows, initQuestions, initSwaps } from './interactions.js';

initTheme();
initReveals();
initScrollWords();
initCounters();
initSteps();
initTiles();
initPipeline();
initProjectRows();
initDetailRows();
initPrinciples();
initQuestions();
initAskOverlay();
initSwaps();
initCursorAndClock();

const railLabel = document.querySelector('[data-rail-label]');
const railFill = document.querySelector('[data-rail-fill]');
const sections = [...document.querySelectorAll('[data-screen-label]')];
let scrollFrame = 0;

const updateScroll = () => {
  scrollFrame = 0;
  const viewport = innerHeight;
  const distance = document.documentElement.scrollHeight - viewport;
  if (railFill) railFill.style.height = `${Math.max(0, Math.min(1, scrollY / Math.max(1, distance))) * 100}%`;
  if (railLabel) {
    let current = 'Hero';
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= viewport * 0.45) current = section.dataset.screenLabel;
    });
    railLabel.textContent = current;
  }
  const heroBody = document.querySelector('.hero-body');
  const heroNav = document.querySelector('.hero-nav');
  if (heroBody && scrollY < viewport && document.documentElement.classList.contains('portfolio-ready')) {
    const progress = Math.max(0, Math.min(1, scrollY / viewport));
    heroBody.style.transform = `translateY(${-progress * 90}px)`;
    heroBody.style.opacity = String(Math.max(0, 1 - progress * 1.5));
    if (heroNav) heroNav.style.opacity = String(Math.max(0, 1 - progress * 2.2));
  }
};

addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }, { passive: true });
addEventListener('resize', updateScroll, { passive: true });
addEventListener('portfolio:ready', updateScroll);
updateScroll();

const spine = document.querySelector('.timeline-spine');
if (spine) {
  const fill = spine.querySelector('b');
  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    fill?.classList.add('is-running');
    observer.disconnect();
  }, { threshold: 0.15 }).observe(spine);
}
