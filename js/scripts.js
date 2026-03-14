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

/* ─── Init ────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  initExploreButton();
  initHeroInteractions();
});
