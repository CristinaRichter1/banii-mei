(() => {
  const rail = document.querySelector('[data-showcase-rail]');
  if (!rail) return;

  const cards = [...rail.querySelectorAll('[data-showcase-card]')];
  const previous = document.querySelector('[data-showcase-previous]');
  const next = document.querySelector('[data-showcase-next]');
  const position = document.querySelector('[data-showcase-position]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let drag = null;
  let updateQueued = false;

  function closestIndex() {
    const left = rail.getBoundingClientRect().left + parseFloat(getComputedStyle(rail).paddingLeft);
    return cards.reduce((best, card, index) =>
      Math.abs(card.getBoundingClientRect().left - left) <
      Math.abs(cards[best].getBoundingClientRect().left - left) ? index : best, 0);
  }

  function update() {
    updateQueued = false;
    const index = closestIndex();
    previous.disabled = index === 0;
    next.disabled = index === cards.length - 1;
    position.textContent = `${index + 1} / ${cards.length}`;
  }

  function queueUpdate() {
    if (updateQueued) return;
    updateQueued = true;
    requestAnimationFrame(update);
  }

  function goTo(index) {
    const card = cards[Math.max(0, Math.min(index, cards.length - 1))];
    const padding = parseFloat(getComputedStyle(rail).paddingLeft);
    const left = rail.scrollLeft + card.getBoundingClientRect().left - rail.getBoundingClientRect().left - padding;
    rail.scrollTo({ left, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  previous.addEventListener('click', () => goTo(closestIndex() - 1));
  next.addEventListener('click', () => goTo(closestIndex() + 1));
  rail.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    goTo(closestIndex() + (event.key === 'ArrowRight' ? 1 : -1));
  });

  rail.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('a, button')) return;
    drag = { x: event.clientX, left: rail.scrollLeft, moved: false };
    rail.setPointerCapture(event.pointerId);
    rail.classList.add('is-dragging');
  });
  rail.addEventListener('pointermove', event => {
    if (!drag) return;
    const distance = event.clientX - drag.x;
    if (Math.abs(distance) > 3) drag.moved = true;
    if (drag.moved) {
      rail.scrollLeft = drag.left - distance;
      event.preventDefault();
    }
  });
  function finishDrag() {
    if (!drag) return;
    drag = null;
    rail.classList.remove('is-dragging');
    queueUpdate();
  }
  rail.addEventListener('pointerup', finishDrag);
  rail.addEventListener('pointercancel', finishDrag);
  rail.addEventListener('scroll', queueUpdate, { passive: true });
  window.addEventListener('resize', queueUpdate);
  update();
})();
