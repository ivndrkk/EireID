/* =============================================================================
   EireID Core Scripts
   Includes: Navigation, Hero Interactions, About Carousel, Animations,
   and Floating AI Assistant.
   ============================================================================= */

document.addEventListener("DOMContentLoaded", () => {
    // Navigation & Menus
    initMobileMenu();
    initDropdowns();
    
    // UI Interactions
    initExploreButton();
    initHeroInteractions();
    
    // Section Specific
    initDocCarousel();
    initAboutFadeIn();
    initHowItWorksAnimation();
    
    // AI Assistant
    initFloatingAssistant();
    initAIChat();
});

/* ─── Navigation ─────────────────── */

function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navList = document.getElementById('nav-list');

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navList.classList.toggle('is-open');
        });
    }
}

function initDropdowns() {
    const dropdownItems = document.querySelectorAll('.nav__item--dropdown');
    
    dropdownItems.forEach(item => {
        const link = item.querySelector('.nav__link');
        
        if (link) {
            link.addEventListener('click', (e) => {
                // If on mobile/tablet where it might be a click to open
                if (window.innerWidth < 768) {
                    e.preventDefault();
                    item.classList.toggle('is-active');
                }
            });
        }
    });

    // Close all dropdowns if clicking outside
    document.addEventListener('click', (e) => {
        dropdownItems.forEach(item => {
            if (!item.contains(e.target)) {
                item.classList.remove('is-active');
            }
        });
    });
}

/* ─── Hero & Explore ─────────────────── */

function initExploreButton() {
    const exploreBtns = [
        document.getElementById("explore-btn"),
        document.getElementById("nav-about-btn")
    ];

    exploreBtns.forEach(btn => {
        if (!btn) return;
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            // Scroll to the #about section
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollBy({
                    top: window.innerHeight,
                    behavior: "smooth",
                });
            }
            
            // Close mobile menu if open
            const navList = document.getElementById('nav-list');
            const menuToggle = document.getElementById('mobile-menu-toggle');
            if (navList && navList.classList.contains('is-open')) {
                navList.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

function initHeroInteractions() {
    const logoBoxes = document.querySelectorAll(".logo-box");
    const ctaButtons = document.querySelectorAll(".hero__action, .nav__link");

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

/* ─── About Section ─────────────────── */

function initDocCarousel() {
    const track = document.getElementById('doc-carousel-track');
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
            caption.textContent = images[currentIndex].alt;
            caption.style.opacity = '1';
        }, 300);

    }, 10000); // Advance every 10 seconds
}

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


/**
 * initScrollReveal
 * Implements Apple-style scroll-linked animations for the About section tiles.
 * Directly links opacity and transform to the scroll position.
 */
function initScrollReveal() {
  const tiles = document.querySelectorAll('.about__tile');

  if (!tiles.length) return;

  function updateTiles() {
    const windowHeight = window.innerHeight;

    tiles.forEach(tile => {
      const rect = tile.getBoundingClientRect();
      const tileTop = rect.top;

      // Animation triggers based on the tile's position in the viewport
      // Starts appearing at 95% of viewport height, fully visible at 75%
      const startTrigger = windowHeight * 0.95;
      const endTrigger = windowHeight * 0.75;

      let progress = (startTrigger - tileTop) / (startTrigger - endTrigger);
      progress = Math.max(0, Math.min(1, progress));

      // 1:1 Scroll mapping
      tile.style.opacity = progress;
      tile.style.transform = `translateY(${30 * (1 - progress)}px)`;

      // Toggle class for hover states and other CSS interactions
      if (progress > 0.1) {
        tile.classList.add('is-visible');
      } else {
        tile.classList.remove('is-visible');
      }
    });
  }

  window.addEventListener('scroll', updateTiles);
  window.addEventListener('resize', updateTiles);
  updateTiles();
}


/**
 * initStatCounters
 * Handles the count-up animation for statistics in the About section.
 * Replays when scrolled back into view and resets when out of view.
 */
function initStatCounters() {
  const stats = document.querySelectorAll('.stat-bar__number');

  if (!stats.length) return;

  // Pre-capture target values to prevent loss during initial IntersectionObserver callback
  stats.forEach(el => {
    if (!el.getAttribute('data-target')) {
      el.setAttribute('data-target', el.innerText.trim());
    }
  });

  /**
   * animateCount
   * Smoothly increments a number from 0 to its target value.
   * @param {HTMLElement} el - The element containing the number.
   * @param {number} index - The index of the stat for variable duration.
   */
  function animateCount(el, index) {
    const targetText = el.getAttribute('data-target');
    const targetValue = parseFloat(targetText.replace(/[^0-9.]/g, '')) || 0;
    const suffix = targetText.replace(/[0-9.]/g, '');

    if (targetValue === 0) return; // Nothing to animate
    const duration = 1000 + (index * 500); // 1s, 1.5s, 2s, 2.5s, 3s
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = Math.floor(easeProgress * targetValue);

      // Preserve unit/suffix if it exists in a span
      const unitSpan = el.querySelector('.stat-bar__unit');
      if (unitSpan) {
        if (el.childNodes[0] && el.childNodes[0].nodeType === 3) {
          el.childNodes[0].textContent = currentValue;
        } else {
          // Fallback if structure is unexpected
          el.innerHTML = currentValue + unitSpan.outerHTML;
        }
      } else {
        el.innerText = currentValue + suffix;
      }

      if (progress < 1) {
        el._animationFrame = requestAnimationFrame(update);
      }
    }

    el._animationFrame = requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;

        if (entry.isIntersecting) {
          if (el.getAttribute('data-counted') !== 'true') {
            const allStats = Array.from(stats);
            const statIndex = allStats.indexOf(el);
            animateCount(el, statIndex);
            el.setAttribute('data-counted', 'true');
            // Ensure animation happens only once
            observer.unobserve(el);
          }
        }
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach(stat => observer.observe(stat));
}


/* ─── Init ────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  initExploreButton();
  initHeroInteractions();
  initDocCarousel();
  initAboutFadeIn();
  initScrollReveal();
  initStatCounters();
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

      // Check if this is the last step
      const isLastStep = index === numSteps - 1;

      if (!isLastStep && scrollProgress >= stepEnd) {
        // Step is in the past
        step.classList.add('is-past');
        // Check if it's the one immediately before the active one
        if (scrollProgress < (index + 2) * stepInterval) {
          step.classList.add('is-past-immediate');
        }
      } else if (scrollProgress >= stepStart) {
        // Step is currently active
        step.classList.add('is-active');
      } else {
        // Step is in the future
        step.classList.add('is-upcoming');
        // If it's more than one step away, hide it for a cleaner transition
        if (scrollProgress < (index - 1) * stepInterval) {
          step.classList.add('is-hidden-upcoming');
        }
      }
    });
  }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                window.addEventListener('scroll', updateTimeline);
                updateTimeline();
            } else {
                window.removeEventListener('scroll', updateTimeline);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(section);
}

/* ─── AI Assistant Logic ─────────────────── */

function initFloatingAssistant() {
    const fab = document.getElementById('ai-fab');
    const modal = document.getElementById('ai-modal');
    const closeBtn = document.getElementById('ai-modal-close');

    if (!fab || !modal) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight / 2) {
            fab.classList.add('is-visible');
        } else {
            fab.classList.remove('is-visible');
            if (modal.classList.contains('is-open')) {
                modal.classList.remove('is-open');
                modal.setAttribute('aria-hidden', 'true');
            }
        }
    });

    fab.addEventListener('click', () => {
        const isOpen = modal.classList.contains('is-open');
        if (isOpen) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        } else {
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        });
    }
}

function initAIChat() {
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-chat-input');
    const body = document.getElementById('ai-modal-body');
    const initialTimeEl = document.getElementById('ai-initial-time');

    if (!form || !input || !body) return;

    const STORAGE_KEY = 'eireid_ai_chat_messages';
    let messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    function renderMessage(text, timeStr, isUser = true) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-message ${isUser ? 'ai-message--user' : ''}`;
        
        const contentHtml = `
           <div class="ai-message__bubble">
              <div class="ai-message__text-container" style="max-height: none;">
                 <p class="ai-message__text">${text}</p>
              </div>
              <div class="ai-message__time">${timeStr}</div>
           </div>
        `;

        msgDiv.innerHTML = contentHtml;
        body.appendChild(msgDiv);
    }

    if (initialTimeEl) {
        const now = new Date();
        initialTimeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    messages.forEach(msg => {
        renderMessage(msg.text, msg.time, msg.isUser);
    });
    
    setTimeout(() => {
        body.scrollTop = body.scrollHeight;
    }, 100);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const text = input.value.trim();
        if (!text) return;

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messages.push({ text, time: timeStr, isUser: true });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));

        renderMessage(text, timeStr, true);
        input.value = '';
        body.scrollTop = body.scrollHeight;
    });
}
