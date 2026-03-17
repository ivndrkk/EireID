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
    const sectionRect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // How much of the total section height has been scrolled past the top of viewport
    // Section height is 600vh, we want to start animation when top hits 0 and end when bottom hits windowHeight
    const totalScrollable = sectionRect.height - windowHeight;
    let scrollProgress = -sectionRect.top / totalScrollable;
    scrollProgress = Math.max(0, Math.min(1, scrollProgress));

    // Update the progress line and dot based on the OVERALL section progress
    progressLine.style.height = `${scrollProgress * 100}%`;
    progressDot.style.top = `${scrollProgress * 100}%`;
    progressDot.style.opacity = scrollProgress > 0 ? '1' : '0';

    // Calculate which step is active based on 5 steps
    const numSteps = steps.length;
    // We divide the 0-1 progress into ranges for each step
    const stepInterval = 1 / numSteps;

    steps.forEach((step, index) => {
      const stepStart = index * stepInterval;
      const stepEnd = (index + 1) * stepInterval;

      // Reset specific classes
      step.classList.remove('is-past', 'is-active', 'is-upcoming', 'is-past-immediate', 'is-hidden-upcoming');

      if (scrollProgress >= stepEnd) {
        step.classList.add('is-past');
        // Check if it's the one immediately before the active one
        if (scrollProgress < (index + 2) * stepInterval) {
          step.classList.add('is-past-immediate');
        }
      } else if (scrollProgress >= stepStart) {
        step.classList.add('is-active');
      } else {
        step.classList.add('is-upcoming');
        // If it's more than one step away, hide it
        if (scrollProgress < (index - 1) * stepInterval) {
          step.classList.add('is-hidden-upcoming');
        }
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
