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

export function initAskOverlay() {
  const button = document.querySelector('[data-ask-toggle]');
  const overlay = document.querySelector('[data-ask-overlay]');
  if (!button || !overlay || overlay.dataset.wired) return;
  overlay.dataset.wired = 'true';
  const label = button.querySelector('[data-ask-label]');
  const dot = button.querySelector('[data-ask-dot]');
  const stage = overlay.querySelector('[data-ask-stage]');
  const list = overlay.querySelector('[data-ask-list]');
  const back = overlay.querySelector('[data-ask-back]');
  const questions = [...overlay.querySelectorAll('[data-ask-question]')];
  const answers = [...overlay.querySelectorAll('[data-ask-answer]')];
  const lines = [...overlay.querySelectorAll('[data-ask-line]')];
  let open = false;
  let currentAnswer = -1;
  let revealTimer = 0;
  let previousFocus = null;
  let previousHtmlOverflow = '';
  let previousBodyOverflow = '';

  const revealPill = () => {
    button.style.opacity = '1';
    button.style.pointerEvents = 'auto';
    button.style.transform = 'none';
    button.tabIndex = 0;
  };
  if (document.documentElement.classList.contains('portfolio-ready')) revealPill();
  else addEventListener('portfolio:ready', revealPill, { once: true });

  const revealLines = (visible) => {
    clearTimeout(revealTimer);
    lines.forEach((element, index) => {
      element.style.transitionDelay = visible ? `${(0.16 + index * 0.055).toFixed(3)}s` : '0s';
      element.style.opacity = visible ? '1' : '0';
      element.style.transform = visible ? 'none' : 'translateY(14px)';
    });
    if (visible) revealTimer = window.setTimeout(() => lines.forEach((element) => { element.style.transitionDelay = '0s'; }), 700);
  };

  const showAnswer = (index, moveFocus = true) => {
    currentAnswer = index;
    const showingAnswer = index >= 0;
    answers.forEach((answer, answerIndex) => {
      const selected = answerIndex === index;
      answer.style.opacity = selected ? '1' : '0';
      answer.style.transform = selected ? 'none' : 'translateY(16px)';
      answer.style.pointerEvents = selected ? 'auto' : 'none';
    });
    list.style.opacity = showingAnswer ? '0' : '1';
    list.style.transform = showingAnswer ? 'translateY(-12px)' : 'none';
    list.style.pointerEvents = showingAnswer ? 'none' : 'auto';
    list.inert = showingAnswer;
    back.style.opacity = showingAnswer ? '1' : '0';
    back.style.pointerEvents = showingAnswer ? 'auto' : 'none';
    back.tabIndex = showingAnswer ? 0 : -1;
    if (moveFocus) requestAnimationFrame(() => (showingAnswer ? back : questions[0])?.focus());
  };

  const setOpen = (value) => {
    open = value;
    if (value) {
      previousFocus = document.activeElement;
      previousHtmlOverflow = document.documentElement.style.overflow;
      previousBodyOverflow = document.body.style.overflow;
    }
    overlay.style.opacity = value ? '1' : '0';
    overlay.style.pointerEvents = value ? 'auto' : 'none';
    overlay.inert = !value;
    overlay.setAttribute('aria-hidden', String(!value));
    button.setAttribute('aria-expanded', String(value));
    button.setAttribute('aria-label', value ? 'Close questions' : 'Ask me something');
    label.textContent = value ? 'Close' : 'Ask';
    dot.style.transform = value ? 'scale(.42)' : 'none';
    button.style.color = value ? 'var(--fg)' : 'var(--fg-62)';
    button.style.borderColor = value ? 'var(--accent)' : 'var(--line)';
    document.documentElement.style.overflow = value ? 'hidden' : previousHtmlOverflow;
    document.body.style.overflow = value ? 'hidden' : previousBodyOverflow;
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const reach = Math.ceil(Math.hypot(Math.max(centerX, innerWidth - centerX), Math.max(centerY, innerHeight - centerY)) + 40);
    const clip = `circle(${value ? reach : 0}px at ${centerX.toFixed(1)}px ${centerY.toFixed(1)}px)`;
    overlay.style.clipPath = clip;
    overlay.style.transitionDelay = value ? '0s,0s' : '0s,.25s';
    if (value) {
      showAnswer(-1, false);
      revealLines(false);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!open) return;
        revealLines(true);
        questions[0]?.focus();
      }));
    } else {
      revealLines(false);
      currentAnswer = -1;
      if (previousFocus instanceof HTMLElement) requestAnimationFrame(() => previousFocus.focus());
    }
  };

  button.addEventListener('click', () => setOpen(!open));
  back.addEventListener('click', () => showAnswer(-1));
  questions.forEach((question, index) => {
    const mark = question.querySelector('[data-ask-mark]');
    const enter = () => { question.style.color = 'var(--fg)'; question.style.transform = 'translateX(5px)'; mark.style.opacity = '1'; };
    const leave = () => { question.style.color = 'var(--fg-50)'; question.style.transform = 'none'; mark.style.opacity = '0'; };
    question.addEventListener('click', () => showAnswer(index));
    question.addEventListener('mouseenter', enter);
    question.addEventListener('mouseleave', leave);
    question.addEventListener('focus', enter);
    question.addEventListener('blur', leave);
  });
  overlay.addEventListener('click', (event) => { if (event.target === overlay || event.target === stage) setOpen(false); });
  addEventListener('keydown', (event) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      if (currentAnswer >= 0) showAnswer(-1); else setOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...overlay.querySelectorAll('button')].filter((element) => getComputedStyle(element).pointerEvents !== 'none');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
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
