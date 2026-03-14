/* =============================================================================
   hero.js — EireID Hero Section
   Handles two interactions owned entirely by the hero:
     1. "Explore EireID" button — smooth-scrolls one viewport down
     2. Logo boxes + CTA buttons — tactile press scale feedback
   ============================================================================= */

/**
 * initExploreButton
 * Wires up the "Explore EireID" CTA to scroll one full viewport height
 * downward, landing the user at the top of the About section.
 */
function initExploreButton() {
  const exploreBtn = document.getElementById("explore-btn");

  if (!exploreBtn) return;

  exploreBtn.addEventListener("click", () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: "smooth",
    });
  });
}

/**
 * initHeroInteractions
 * Adds a brief scale-down press effect to logo boxes and CTA buttons,
 * giving them a tactile, physical feel on click.
 */
function initHeroInteractions() {
  const logoBoxes = document.querySelectorAll(".logo-box");
  const ctaButtons = document.querySelectorAll(".hero__action");

  logoBoxes.forEach((el) => {
    el.addEventListener("click", function () {
      this.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.style.transform = "";
      }, 150);
    });
  });

  ctaButtons.forEach((el) => {
    el.addEventListener("click", function () {
      this.style.transform = "scale(0.98)";
      setTimeout(() => {
        this.style.transform = "";
      }, 150);
    });
  });
}
/* =============================================================================
   about.js — EireID About / Bento Grid Section
   Handles two interactions owned entirely by the about section:
     1. initDocCarousel  — auto-advances the document carousel in Tile 1
     2. initAboutFadeIn  — triggers .fade-in reveal on tiles as they scroll into view
   ============================================================================= */


/**
 * initDocCarousel
 * Advances the document carousel inside the Phone Mockup tile every 10 seconds.
 * Updates the accessible caption below the mockup with a small opacity fade.
 */
function initDocCarousel() {
  const track   = document.getElementById('doc-carousel-track');
  const caption = document.getElementById('doc-caption');

  if (!track || !caption) return;

  const images = Array.from(track.querySelectorAll('img'));
  if (images.length === 0) return;

  let currentIndex = 0;

  setInterval(() => {
    currentIndex = (currentIndex + 1) % images.length;

    // Exact pixel offset based on the rendered image width
    const slideWidth = images[0].offsetWidth;
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

    // Fade caption out → update text → fade back in
    caption.style.opacity = '0';
    setTimeout(() => {
      caption.textContent  = images[currentIndex].alt;
      caption.style.opacity = '1';
    }, 300);

  }, 10000); // Advance every 10 seconds
}


/**
 * initAboutFadeIn
 * Uses IntersectionObserver to add the `.appear` class to any element
 * carrying `.fade-in` once it enters the viewport.
 * Add class="fade-in" to any about tile or child element you want to
 * animate in on scroll — the CSS transition is handled in about.css.
 */
function initAboutFadeIn() {
  const faders = document.querySelectorAll('.fade-in');

  if (!faders.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('appear');
          obs.unobserve(entry.target); // Trigger once only
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  faders.forEach(el => observer.observe(el));
}


/* ─── Init ────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  initExploreButton();
    initHeroInteractions();
    initDocCarousel();
    initAboutFadeIn();
});
