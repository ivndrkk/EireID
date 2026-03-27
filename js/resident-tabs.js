/**
 * resident-tabs.js
 * Scroll-driven sticky tab section — switches slides based on scroll progress.
 * Works with the .rtabs-* classes in resident-tabs.css
 */

(function () {
  'use strict';

  const section = document.getElementById('resident-tabs');
  if (!section) return;

  const TOTAL_SLIDES = 3;
  let currentSlide = 1;
  let isMobile = window.innerWidth <= 900;

  // ── helpers ──────────────────────────────────────────────

  function getSlides()  { return document.querySelectorAll('.rtabs-slide'); }
  function getVideos()  { return document.querySelectorAll('.rtabs-video'); }
  function getDots()    { return document.querySelectorAll('.rtabs-dot'); }

  function setActive(elements, matchFn) {
    elements.forEach(el => {
      const n = parseInt(el.dataset.slide || el.dataset.video || el.dataset.target);
      el.classList.toggle('is-active', matchFn(n));
    });
  }

  function switchTo(n) {
    if (n === currentSlide) return;
    currentSlide = n;

    setActive(getSlides(), idx => idx === n);
    setActive(getVideos(), idx => idx === n);
    setActive(getDots(),   idx => idx === n);
  }

  // ── scroll handler (desktop only) ────────────────────────

  // ── scroll handler (desktop only) ────────────────────────
  function onScroll() {
    if (isMobile) return;

    const rect       = section.getBoundingClientRect();
    const sectionH   = section.offsetHeight;
    const viewportH  = window.innerHeight;

    // scrolled: how many pixels past the top of the section we are.
    // rect.top is current viewport position. Sticky should start at 5vh (40-100px) but 0 is simpler.
    // If it's sticky, rect.top stays around 5vh.
    // Actually, simple progress based on section top relative to container:
    const scrolled   = -rect.top + (viewportH * 0.05);
    const scrollable = sectionH - viewportH;

    if (scrollable <= 0) return;

    const progress = Math.max(0, Math.min(1, scrolled / scrollable));

    const slideIndex = Math.min(
      TOTAL_SLIDES,
      Math.max(1, Math.ceil(progress * TOTAL_SLIDES + 0.001))
    );

    switchTo(slideIndex);
  }

  // ── dot click: smoothly scroll to that slide's position ──
  function dotScrollTo(targetSlide) {
    const sectionH    = section.offsetHeight;
    const viewportH   = window.innerHeight;
    const scrollable  = sectionH - viewportH;
    const ratio       = (targetSlide - 1) / (TOTAL_SLIDES - 1);

    // If Locomotive is active, use its API
    if (window.locoScroll) {
      window.locoScroll.scrollTo(section, {
        offset: ratio * scrollable,
        duration: 1000,
        easing: [0.25, 0.00, 0.35, 1.00]
      });
    } else {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const scrollTo   = sectionTop + ratio * scrollable;
      window.scrollTo({ top: scrollTo, behavior: 'smooth' });
    }
  }

  getDots().forEach(dot => {
    dot.addEventListener('click', () => {
      const t = parseInt(dot.dataset.target);
      if (isMobile) {
        switchTo(t);
      } else {
        dotScrollTo(t);
      }
    });
  });

  // ── on resize: update mobile flag ────────────────────────
  window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 900;
  }, { passive: true });

  function init() {
    // Check if Locomotive is already available or wait for it
    if (window.locoScroll) {
      window.locoScroll.on('scroll', onScroll);
      // Also listen for refresh to update our listeners
      ScrollTrigger.addEventListener("refresh", () => onScroll());
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Run once on load
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
    if (Math.abs(diff) < 50) return; // threshold to prevent accidental taps triggering swipe

    if (diff > 0) {
      // Swipe left → Next
      if (currentSlide < TOTAL_SLIDES) switchTo(currentSlide + 1);
    } else {
      // Swipe right → Prev
      if (currentSlide > 1) switchTo(currentSlide - 1);
    }
  }

  // To ensure window.locoScroll from scripts.js is ready:
  if (document.readyState === 'complete') {
    setTimeout(init, 100);
  } else {
    window.addEventListener('load', init);
  }

})();
