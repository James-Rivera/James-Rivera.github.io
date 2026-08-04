export function initProjectRows() {
  const list = document.querySelector('[data-work-list]');
  const preview = document.querySelector('[data-work-preview]');
  if (!list) return;

  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let visible = false;
  if (preview) {
    const loop = () => {
      x += (targetX - x) * 0.13;
      y += (targetY - y) * 0.13;
      const tilt = Math.max(-9, Math.min(9, (targetX - x) * 0.18));
      preview.style.transform = `translate3d(${x - 180}px,${y - 122}px,0) rotate(${tilt.toFixed(2)}deg) scale(${visible ? 1 : 0.9})`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    list.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    });
    list.addEventListener('pointerenter', (event) => {
      visible = true;
      targetX = x = event.clientX;
      targetY = y = event.clientY;
      preview.style.opacity = '1';
    });
    list.addEventListener('pointerleave', () => {
      visible = false;
      preview.style.opacity = '0';
    });
  }

  list.querySelectorAll('[data-row]').forEach((row) => {
    row.addEventListener('pointerenter', () => {
      row.classList.add('is-hovered');
      if (preview) {
        preview.querySelector('strong').textContent = row.querySelector('[data-row-title]')?.textContent || '';
        preview.style.setProperty('--preview-accent', row.closest('.project-row')?.style.getPropertyValue('--project-accent') || 'var(--accent)');
      }
    });
    row.addEventListener('pointerleave', () => row.classList.remove('is-hovered'));
  });
}

export function initDetailRows() {
  const touch = matchMedia('(hover: none)').matches;
  document.querySelectorAll('[data-erow]').forEach((row) => {
    const open = () => row.classList.add('is-open');
    const close = () => row.classList.remove('is-open');
    if (touch) row.addEventListener('click', () => row.classList.toggle('is-open'));
    else {
      row.addEventListener('mouseenter', open);
      row.addEventListener('mouseleave', close);
    }
  });
}

export function initPrinciples() {
  const wrapper = document.querySelector('[data-principles]');
  const button = document.querySelector('[data-principle-next]');
  const items = [...document.querySelectorAll('[data-principle]')];
  const dots = [...(button?.querySelectorAll('i b') || [])];
  const count = document.querySelector('[data-principle-count]');
  if (!wrapper || !button || items.length < 2) return;
  let index = 0;
  let timer;
  const go = (next) => {
    index = (next + items.length) % items.length;
    wrapper.dataset.index = String(index);
    items.forEach((item, itemIndex) => item.classList.toggle('is-active', itemIndex === index));
    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
    if (count) count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  };
  const reset = () => {
    clearInterval(timer);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = window.setInterval(() => go(index + 1), 6500);
  };
  button.addEventListener('click', () => {
    go(index + 1);
    reset();
  });
  dots.forEach((dot, dotIndex) => dot.addEventListener('click', (event) => {
    event.stopPropagation();
    go(dotIndex);
    reset();
  }));
  wrapper.querySelectorAll('[data-swap]').forEach((swap) => swap.addEventListener('click', (event) => event.stopPropagation()));
  go(0);
  reset();
}

export function initQuestions() {
  const answer = document.querySelector('[data-answer]');
  const buttons = [...document.querySelectorAll('[data-question]')];
  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    if (!answer) return;
    answer.classList.add('is-changing');
    window.setTimeout(() => {
      answer.querySelector('h2').textContent = button.dataset.title || '';
      answer.querySelector('p').textContent = button.dataset.answerCopy || '';
      answer.classList.remove('is-changing');
    }, 180);
  }));
}

export function initSwaps() {
  document.querySelectorAll('[data-swap]').forEach((token) => {
    const word = token.querySelector('[data-swap-word]');
    const art = token.querySelector('[data-swap-art]');
    if (!word || !art) return;
    const graph = art.hasAttribute('data-graph');
    const measure = () => {
      token.style.width = 'auto';
      const wordWidth = Math.ceil(word.getBoundingClientRect().width);
      const artWidth = Math.ceil(art.getBoundingClientRect().width);
      token.dataset.wordWidth = String(wordWidth);
      token.dataset.artWidth = String(artWidth || wordWidth);
      token.style.width = `${token.classList.contains('is-open') ? (artWidth || wordWidth) : wordWidth}px`;
    };
    measure();
    document.fonts?.ready.then(measure);
    addEventListener('resize', measure, { passive: true });
    const resetGraph = () => art.querySelectorAll('[data-gnode],[data-gedge],[data-gcheck]').forEach((element) => element.classList.remove('is-active'));
    token.addEventListener('mouseenter', () => {
      measure();
      token.style.width = `${token.dataset.artWidth}px`;
      token.classList.add('is-open');
      if (graph) {
        art.querySelectorAll('[data-gnode]').forEach((node, index) => window.setTimeout(() => {
          node.classList.add('is-active');
          node.querySelector('[data-gcheck]')?.classList.add('is-active');
          [...art.querySelectorAll('[data-gedge]')].slice(index * 3, index * 3 + 3).forEach((edge) => edge.classList.add('is-active'));
        }, index * 260));
      }
    });
    token.addEventListener('mouseleave', () => {
      token.style.width = `${token.dataset.wordWidth}px`;
      token.classList.remove('is-open');
      if (graph) window.setTimeout(resetGraph, 300);
    });
  });
}

export function initCursorAndClock() {
  const cursor = document.querySelector('[data-cursor-dot]');
  const supportsCustomCursor = matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  if (cursor && supportsCustomCursor.matches) {
    document.documentElement.classList.add('has-custom-cursor');
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let targetX = x;
    let targetY = y;
    addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.style.opacity = '1';
    }, { passive: true });
    const loop = () => {
      x += (targetX - x) * 0.2;
      y += (targetY - y) * 0.2;
      cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    document.querySelectorAll('a,button,[data-cursor]').forEach((element) => {
      element.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
      element.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
    });
  }

  const clock = document.querySelector('[data-clock]');
  if (clock) {
    const tick = () => {
      clock.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Manila', hour12: false });
    };
    tick();
    window.setInterval(tick, 1000);
  }
}
