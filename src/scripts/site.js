const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const themeLabel = document.querySelector('[data-theme-label]');
const railLabel = document.querySelector('[data-rail-label]');
const railFill = document.querySelector('[data-rail-fill]');
const cursor = document.querySelector('[data-cursor-dot]');
const sections = [...document.querySelectorAll('[data-screen-label]')];

const updateThemeLabel = () => {
  if (themeLabel) themeLabel.textContent = root.dataset.theme === 'light' ? 'Light' : 'Dark';
};

themeButton?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.themeAnim = 'true';
  localStorage.setItem('portfolio-theme', root.dataset.theme);
  updateThemeLabel();
  setTimeout(() => delete root.dataset.themeAnim, 550);
});
updateThemeLabel();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));

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
  if (heroBody && scrollY < viewport) {
    const progress = Math.max(0, Math.min(1, scrollY / viewport));
    heroBody.style.transform = `translateY(${-progress * 90}px)`;
    heroBody.style.opacity = String(Math.max(0, 1 - progress * 1.5));
    if (heroNav) heroNav.style.opacity = String(Math.max(0, 1 - progress * 2.2));
  }
};
addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }, { passive: true });
addEventListener('resize', updateScroll, { passive: true });
updateScroll();

const spine = document.querySelector('.timeline-spine');
if (spine) {
  const spineFill = spine.querySelector('b');
  const spineObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) spineFill?.classList.add('is-running');
  }, { threshold: 0.15 });
  spineObserver.observe(spine);
}

const principleRoot = document.querySelector('[data-principles]');
const principleButton = document.querySelector('[data-principle-next]');
const principleItems = [...document.querySelectorAll('[data-principle]')];
const principleCount = document.querySelector('[data-principle-count]');
principleButton?.addEventListener('click', () => {
  const current = Number(principleRoot?.dataset.index || 0);
  const next = (current + 1) % principleItems.length;
  principleItems[current]?.classList.remove('is-active');
  principleItems[next]?.classList.add('is-active');
  if (principleRoot) principleRoot.dataset.index = String(next);
  if (principleCount) principleCount.textContent = `${String(next + 1).padStart(2, '0')} / ${String(principleItems.length).padStart(2, '0')}`;
  principleButton.querySelectorAll('i b').forEach((item, index) => item.classList.toggle('is-active', index === next));
});
principleButton?.querySelector('i b')?.classList.add('is-active');

const answer = document.querySelector('[data-answer]');
const questionButtons = [...document.querySelectorAll('[data-question]')];
questionButtons.forEach((button) => button.addEventListener('click', () => {
  questionButtons.forEach((item) => item.classList.toggle('is-active', item === button));
  if (!answer) return;
  answer.classList.add('is-changing');
  setTimeout(() => {
    const heading = answer.querySelector('h2');
    const copy = answer.querySelector('p');
    if (heading) heading.textContent = button.dataset.title || '';
    if (copy) copy.textContent = button.dataset.answerCopy || '';
    answer.classList.remove('is-changing');
  }, 180);
}));

if (cursor && matchMedia('(hover:hover)').matches) {
  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let targetX = x;
  let targetY = y;
  addEventListener('pointermove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    cursor.style.opacity = '1';
  }, { passive: true });
  const cursorLoop = () => {
    x += (targetX - x) * 0.2;
    y += (targetY - y) * 0.2;
    cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
    requestAnimationFrame(cursorLoop);
  };
  requestAnimationFrame(cursorLoop);
  document.querySelectorAll('a,button,[data-cursor]').forEach((element) => {
    element.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
    element.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
  });
}

const clock = document.querySelector('[data-clock]');
if (clock) {
  const tick = () => { clock.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Manila', hour12: false }); };
  tick();
  setInterval(tick, 1000);
}
