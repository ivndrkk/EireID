
(function () {
  'use strict';

  const section = document.getElementById('resident-tabs');
  if (!section) return;

  const TOTAL_SLIDES = 3;
  let currentSlide = 1;
  let isMobile = window.innerWidth <= 900;

  // ── Optimization: Cache DOM references & measurements ──
  let slides = [];
  let videos = [];
  let dots = [];
  let sectionTop = 0;
  let sectionH = 0;
  let viewportH = window.innerHeight;

  function updateMeasurements() {
    if (isMobile) return;
    const rect = section.getBoundingClientRect();
    sectionTop = rect.top + window.scrollY;
    sectionH = section.offsetHeight;
    viewportH = window.innerHeight;
  }

  function cacheDOMElements() {
    slides = Array.from(document.querySelectorAll('.rtabs-slide')).map(el => ({
      el,
      index: parseInt(el.dataset.slide)
    }));
    videos = Array.from(document.querySelectorAll('.rtabs-video')).map(el => ({
      el,
      index: parseInt(el.dataset.video)
    }));
    dots = Array.from(document.querySelectorAll('.rtabs-dot')).map(el => ({
      el,
      index: parseInt(el.dataset.target)
    }));
  }

  function setActive(cachedItems, matchFn) {
    for (let i = 0, len = cachedItems.length; i < len; i++) {
      const item = cachedItems[i];
      item.el.classList.toggle('is-active', matchFn(item.index));
    }
  }

  function switchTo(n) {
    if (n === currentSlide) return;
    currentSlide = n;

    setActive(slides, idx => idx === n);
    setActive(videos, idx => idx === n);
    setActive(dots,   idx => idx === n);
  }

  // ── scroll handler (desktop only) ────────────────────────
  function onScroll() {
    if (isMobile) return;

    const scrolled = (window.scrollY - sectionTop) + (viewportH * 0.05);
    const scrollable = sectionH - viewportH;

    if (scrollable <= 0) return;

    const progress = Math.max(0, Math.min(1, scrolled / scrollable));
    const slideIndex = Math.min(
      TOTAL_SLIDES,
      Math.max(1, Math.ceil(progress * TOTAL_SLIDES + 0.001))
    );

    switchTo(slideIndex);
  }

  function dotScrollTo(targetSlide) {
    const scrollable = sectionH - viewportH;
    const ratio = (targetSlide - 1) / (TOTAL_SLIDES - 1);

    if (window.locoScroll) {
      window.locoScroll.scrollTo(section, {
        offset: ratio * scrollable,
        duration: 1000,
        easing: [0.25, 0.00, 0.35, 1.00]
      });
    } else {
      const scrollTo = sectionTop + ratio * scrollable;
      window.scrollTo({ top: scrollTo, behavior: 'smooth' });
    }
  }

  // ── on resize: update mobile flag ────────────────────────
  window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 900;
    updateMeasurements();
  }, { passive: true });

  function init() {
    cacheDOMElements();
    updateMeasurements();

    dots.forEach(item => {
      item.el.addEventListener('click', () => {
        if (isMobile) {
          switchTo(item.index);
        } else {
          dotScrollTo(item.index);
        }
      });
    });

    if (window.locoScroll) {
      window.locoScroll.on('scroll', onScroll);
      ScrollTrigger.addEventListener("refresh", () => {
        updateMeasurements();
        onScroll();
      });
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    onScroll();
  }

  // ── Swipe Detection (Mobile) ─────────────────────────────
  let touchStartX = 0;
  let touchEndX = 0;

  section.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  section.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    if (!isMobile) return;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) < 50) return;

    if (diff > 0) {
      if (currentSlide < TOTAL_SLIDES) switchTo(currentSlide + 1);
    } else {
      if (currentSlide > 1) switchTo(currentSlide - 1);
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(init, 100);
  } else {
    window.addEventListener('load', init);
  }

})();
