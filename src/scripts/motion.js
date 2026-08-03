const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initReveals() {
  const elements = [...document.querySelectorAll('[data-reveal], [data-rise]')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  elements.forEach((element) => observer.observe(element));
}

function wrapWords(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement?.closest('[data-swap-art]')) continue;
    if (node.parentElement?.closest('[data-swap-word]')) continue;
    if (node.textContent.trim()) textNodes.push(node);
  }

  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((token) => {
      if (!token) return;
      if (/^\s+$/.test(token)) {
        fragment.appendChild(document.createTextNode(token));
        return;
      }
      const outer = document.createElement('span');
      const inner = document.createElement('span');
      outer.className = 'scroll-word';
      inner.textContent = token;
      outer.appendChild(inner);
      fragment.appendChild(outer);
    });
    node.replaceWith(fragment);
  });
}

export function initScrollWords() {
  const groups = [...document.querySelectorAll('[data-scroll-words]')];
  groups.forEach(wrapWords);
  const prepared = groups.map((element) => ({ element, words: [...element.querySelectorAll('.scroll-word')] }));
  if (!prepared.length) return;

  const paint = () => {
    const viewport = innerHeight || 1;
    prepared.forEach(({ element, words }) => {
      const rect = element.getBoundingClientRect();
      const span = Math.max(1, viewport * 0.5 + rect.height * 0.5);
      let progress = (viewport * 0.8 - rect.top) / span;
      if (reducedMotion) progress = 1;
      progress = Math.max(0, Math.min(1, progress));
      const head = progress * (words.length + 7);
      words.forEach((outer, index) => {
        const inner = outer.firstElementChild;
        let amount = Math.max(0, Math.min(1, (head - index) / 7));
        amount = amount * amount * (3 - 2 * amount);
        inner.style.opacity = String(0.11 + 0.89 * amount);
        inner.style.transform = amount > 0.999 ? 'none' : `translateY(${((1 - amount) * 9).toFixed(2)}px)`;
      });
    });
  };
  addEventListener('scroll', paint, { passive: true });
  addEventListener('resize', paint, { passive: true });
  paint();
}

export function initCounters() {
  const counters = [...document.querySelectorAll('[data-count]')];
  if (!counters.length) return;
  const run = (element) => {
    const target = parseInt(element.dataset.count || '0', 10);
    const suffix = element.dataset.suffix || '';
    const start = performance.now();
    const draw = (now) => {
      const progress = Math.min(1, (now - start) / 1300);
      const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      element.textContent = `${target < 10 && value < 10 ? '0' : ''}${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  };
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    run(entry.target);
    observer.unobserve(entry.target);
  }), { threshold: 0.6 });
  counters.forEach((counter) => observer.observe(counter));
}

export function initSteps() {
  const wrapper = document.querySelector('[data-steps]');
  const steps = [...(wrapper?.querySelectorAll('[data-step]') || [])];
  if (!wrapper || !steps.length) return;
  const paint = () => {
    const viewport = innerHeight || 1;
    const rect = wrapper.getBoundingClientRect();
    let progress = (viewport * 0.78 - rect.top) / Math.max(1, viewport * 0.42 + rect.height * 0.42);
    if (reducedMotion) progress = 1;
    progress = Math.max(0, Math.min(1, progress));
    const head = progress * (steps.length + 1.2);
    steps.forEach((step, index) => {
      const amount = Math.max(0, Math.min(1, head - index));
      step.style.opacity = String(0.22 + 0.78 * amount);
      step.querySelector('[data-step-fill]')?.style.setProperty('width', `${amount * 100}%`);
    });
  };
  addEventListener('scroll', paint, { passive: true });
  addEventListener('resize', paint, { passive: true });
  paint();
}

export function initTiles() {
  const tiles = [...document.querySelectorAll('[data-tile]')];
  if (!tiles.length) return;
  const show = (tile) => {
    tile.classList.add('is-shown');
    tile.dataset.shown = 'true';
  };
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    show(entry.target);
    observer.unobserve(entry.target);
  }), { threshold: 0.18 });
  tiles.forEach((tile) => {
    observer.observe(tile);
    tile.addEventListener('mouseenter', () => tile.classList.add('is-hovered'));
    tile.addEventListener('mouseleave', () => tile.classList.remove('is-hovered'));
  });
}

export function initPipeline() {
  document.querySelectorAll('[data-pipe]').forEach((pipeline) => {
    const nodes = [...pipeline.querySelectorAll('[data-node]')];
    const fills = [...pipeline.querySelectorAll('[data-link-fill]')];
    const run = () => nodes.forEach((node, index) => {
      window.setTimeout(() => {
        node.classList.add('is-lit');
        window.setTimeout(() => fills[index]?.classList.add('is-lit'), 380);
      }, index * 520);
    });
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      run();
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(pipeline);
  });
}
