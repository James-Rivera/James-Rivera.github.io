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

function splitScrollWords(element) {
  if (element.dataset.splitDone) return;

  const tokens = [];
  [...element.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      const leadingPunctuation = text.match(/^[.,;:!?’'"\)\]]+/);
      let body = text;
      if (leadingPunctuation && tokens.length) {
        tokens.at(-1).tail += leadingPunctuation[0];
        body = text.slice(leadingPunctuation[0].length);
      }
      body.trim().split(/\s+/).filter(Boolean).forEach((word) => {
        tokens.push({ value: word, tail: '' });
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      tokens.push({ value: node, tail: '' });
    }
  });

  element.dataset.splitDone = 'true';
  element.replaceChildren();
  tokens.forEach((token, index) => {
    const outer = document.createElement('span');
    const inner = document.createElement('span');
    outer.className = 'scroll-word';
    outer.style.overflow = typeof token.value === 'string' ? 'hidden' : 'visible';

    if (typeof token.value === 'string') {
      inner.textContent = token.value + token.tail;
    } else {
      inner.append(token.value);
      if (token.tail) inner.append(document.createTextNode(token.tail));
    }

    outer.append(inner);
    element.append(outer);
    if (index < tokens.length - 1) element.append(document.createTextNode(' '));
  });
}

export function initScrollWords() {
  const groups = [...document.querySelectorAll('[data-scroll-words]')];
  groups.forEach(splitScrollWords);
  const prepared = groups.map((element) => ({
    element,
    words: [...element.children].filter((node) => node.matches('.scroll-word'))
  }));
  if (!prepared.length) return;

  prepared.forEach(({ words }) => words.forEach((outer) => {
    outer.style.overflow = 'visible';
    const inner = outer.firstElementChild;
    if (!inner) return;
    inner.style.transition = 'none';
    inner.style.willChange = 'opacity, transform';
  }));

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
  let animationFrame = 0;
  let running = false;
  const tick = () => {
    paint();
    animationFrame = running ? requestAnimationFrame(tick) : 0;
  };
  const start = () => {
    if (running) return;
    running = true;
    if (!animationFrame) animationFrame = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    paint();
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) start();
      else stop();
    }), { rootMargin: '60% 0px 60% 0px' });
    prepared.forEach(({ element }) => observer.observe(element));
  } else {
    start();
  }

  const paintWhenIdle = () => {
    if (!running) paint();
  };
  addEventListener('scroll', paintWhenIdle, { passive: true });
  addEventListener('resize', paintWhenIdle, { passive: true });
  document.fonts?.ready.then(paint, paint);
  [0, 250, 900, 2200].forEach((delay) => window.setTimeout(paint, delay));
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
    if (tile.dataset.shown) return;
    tile.classList.add('is-shown');
    tile.dataset.shown = 'true';
    observer?.unobserve(tile);
  };
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    show(entry.target);
  }), { threshold: 0.18 });
  const showVisible = () => tiles.forEach((tile) => {
    if (tile.dataset.shown) return;
    const rect = tile.getBoundingClientRect();
    if (rect.top < innerHeight * 0.92 && rect.bottom > 0) show(tile);
  });
  tiles.forEach((tile) => {
    observer.observe(tile);
    tile.addEventListener('mouseenter', () => tile.classList.add('is-hovered'));
    tile.addEventListener('mouseleave', () => tile.classList.remove('is-hovered'));
  });
  addEventListener('scroll', showVisible, { passive: true });
  addEventListener('resize', showVisible, { passive: true });
  requestAnimationFrame(showVisible);
  window.setTimeout(() => tiles.forEach(show), 6000);
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
