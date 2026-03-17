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
  initHowItWorksAnimation();
});

/* =============================================================================
   how-it-works.js — EireID How It Works Section
   Handles scroll-driven animations for the vertical timeline.
   ============================================================================= */

function initHowItWorksAnimation() {
  const section = document.querySelector('.how-it-works');
  const timeline = document.querySelector('.how-it-works__timeline');
  const progressLine = document.getElementById('timeline-progress');
  const progressDot = document.getElementById('timeline-dot');
  const steps = document.querySelectorAll('.timeline-step');

  if (!section || !timeline || !progressLine || !steps.length) return;

  /**
   * updateTimeline
   * Calculates the scroll progress within the timeline container
   * and updates the vertical line and active step states.
   */
  function updateTimeline() {
    const timelineRect = timeline.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate how much of the timeline is above the center of the viewport
    const startPoint = windowHeight * 0.5;
    const timelineTop = timelineRect.top;
    const timelineHeight = timelineRect.height;

    // Progress is 0 at the start of the timeline and 1 at the end (relative to viewport center)
    let progress = (startPoint - timelineTop) / timelineHeight;
    progress = Math.max(0, Math.min(1, progress));

    // Update the progress line and dot
    progressLine.style.height = `${progress * 100}%`;
    progressDot.style.top = `${progress * 100}%`;

    if (progress > 0) {
      progressDot.style.opacity = '1';
    } else {
      progressDot.style.opacity = '0';
    }

    // Update steps based on their position relative to the viewport center
    steps.forEach((step, index) => {
      const stepRect = step.getBoundingClientRect();
      const stepCenter = stepRect.top + stepRect.height / 2;

      if (stepCenter < startPoint) {
        // Step is above the viewport center
        step.classList.add('is-past');
        step.classList.remove('is-active');
      } else if (stepRect.top < startPoint + 50) {
        // Step is near the viewport center (active)
        step.classList.add('is-active');
        step.classList.remove('is-past');
      } else {
        // Step is below
        step.classList.remove('is-active', 'is-past');
      }
    });
  }

  // Use IntersectionObserver to only listen to scroll when section is visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        window.addEventListener('scroll', updateTimeline);
        updateTimeline(); // Initial call
      } else {
        window.removeEventListener('scroll', updateTimeline);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(section);
}
