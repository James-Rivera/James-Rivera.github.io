const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initSegmentedControls(scope = document) {
  scope.querySelectorAll('[data-segmented]').forEach((switcher) => {
    if (switcher.dataset.wired) return;
    switcher.dataset.wired = 'true';
    const tabs = [...switcher.querySelectorAll('[data-segmented-tab]')];
    const panels = [...switcher.querySelectorAll('[data-segmented-panel]')];
    if (!tabs.length || !panels.length) return;

    const activate = (value, focus = false) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.segmentedTab === value;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });
      panels.forEach((panel) => {
        const active = panel.dataset.segmentedPanel === value;
        panel.classList.toggle('is-active', active);
        if (active) panel.removeAttribute('aria-hidden');
        else panel.setAttribute('aria-hidden', 'true');
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab.dataset.segmentedTab));
      tab.addEventListener('keydown', (event) => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(tabs[next].dataset.segmentedTab, true);
      });
    });
  });
}

function splitPrincipleWords(root) {
  if (root.dataset.wordsSplit) return;
  let order = 0;
  const visit = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.textContent?.trim()) return;
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) fragment.append(part);
        else {
          const word = document.createElement('span');
          word.className = 'principle-word';
          word.style.setProperty('--word-order', String(order++));
          word.textContent = part;
          fragment.append(word);
        }
      });
      node.replaceWith(fragment);
      return;
    }
    if (!(node instanceof Element)) return;
    if (node.matches('.hover-swap')) {
      node.classList.add('principle-word', 'principle-word--interactive');
      node.style.setProperty('--word-order', String(order++));
      return;
    }
    [...node.childNodes].forEach(visit);
  };
  [...root.childNodes].forEach(visit);
  root.dataset.wordsSplit = 'true';
}

export function initPrincipleCarousels(scope = document) {
  scope.querySelectorAll('[data-principles-carousel]').forEach((carousel) => {
    if (carousel.dataset.wired) return;
    carousel.dataset.wired = 'true';
    const cards = [...carousel.querySelectorAll('[data-principle-card]')];
    const tabs = [...carousel.querySelectorAll('[data-principle-tab]')];
    const nextButtons = [...carousel.querySelectorAll('[data-principle-next]')];
    const count = carousel.querySelector('[data-principle-count]');
    if (cards.length < 2 || tabs.length !== cards.length) return;

    cards.forEach((card) => {
      const text = card.querySelector('[data-principle-text]');
      if (text) splitPrincipleWords(text);
    });

    let index = 0;
    let timer = 0;
    let visible = false;
    let paused = false;

    const stop = () => {
      clearTimeout(timer);
      timer = 0;
    };

    const schedule = () => {
      stop();
      if (!visible || paused || document.hidden || reducedMotion()) return;
      timer = window.setTimeout(() => activate(index + 1), 11000);
    };

    const startReading = () => {
      cards[index].classList.remove('is-reading');
      if (!visible) return;
      requestAnimationFrame(() => cards[index].classList.add('is-reading'));
    };

    const activate = (next, focus = false) => {
      index = (next + cards.length) % cards.length;
      cards.forEach((card, cardIndex) => {
        const active = cardIndex === index;
        card.classList.toggle('is-active', active);
        card.classList.remove('is-reading');
        if (active) card.removeAttribute('aria-hidden');
        else card.setAttribute('aria-hidden', 'true');
      });
      tabs.forEach((tab, tabIndex) => {
        const active = tabIndex === index;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });
      if (count) count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
      startReading();
      schedule();
    };

    tabs.forEach((tab, tabIndex) => {
      tab.addEventListener('click', () => activate(tabIndex));
      tab.addEventListener('keydown', (event) => {
        let next = tabIndex;
        if (event.key === 'ArrowRight') next = (tabIndex + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (tabIndex - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(next, true);
      });
    });

    nextButtons.forEach((button) => {
      button.addEventListener('click', () => activate(index + 1));
    });

    const setPaused = (value) => {
      paused = value;
      if (paused) stop();
      else schedule();
    };
    carousel.addEventListener('mouseenter', () => setPaused(true));
    carousel.addEventListener('mouseleave', () => setPaused(false));
    carousel.addEventListener('focusin', () => setPaused(true));
    carousel.addEventListener('focusout', (event) => {
      if (!carousel.contains(event.relatedTarget)) setPaused(false);
    });
    document.addEventListener('visibilitychange', schedule);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        startReading();
        schedule();
      }
      else stop();
    }, { threshold: 0.25 });
    observer.observe(carousel);
    activate(0);
  });
}
