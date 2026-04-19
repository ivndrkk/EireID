/* =============================================================================
   EireID Core Scripts
   Includes: Navigation, Hero Interactions, About Carousel, Animations,
   and Floating Rua AI Assistant.
   ============================================================================= */

function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function initScrollReveal() {
}

document.addEventListener("DOMContentLoaded", () => {
    window.scrollTo(0, 0);
    if (document.querySelector('[data-scroll-container]')) {
        document.querySelector('[data-scroll-container]').scrollTop = 0;
    }

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    const scroller = document.querySelector('[data-scroll-container]');
    let locoScroll = null;
    
    if (scroller) {
        const isMobile = window.innerWidth < 768;

        locoScroll = new LocomotiveScroll({
            el: scroller,
            smooth: true,
            lerp: isMobile ? 0.15 : 0.08,
            smartphone: {
                smooth: true,
                multiplier: 4.0
            },
            tablet: {
                smooth: true,
                multiplier: 3.0
            }
        });

        locoScroll.on("scroll", ScrollTrigger.update);

        ScrollTrigger.scrollerProxy(scroller, {
            scrollTop(value) {
                return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
            },
            getBoundingClientRect() {
                return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
            },
            pinType: scroller.style.transform ? "transform" : "fixed"
        });
        // ─── COMPARISON: Split Entry Animation ──────────────────
(function initComparisonAnim() {
  const grid = document.querySelector('.compare-grid');
  if (!grid) return;

  const labels = grid.querySelectorAll('.label-col');
  const eireID = grid.querySelectorAll('.eireid-col');
  const comps1 = grid.querySelectorAll('.comp-1');
  const comps2 = grid.querySelectorAll('.comp-2');
  const comps3 = grid.querySelectorAll('.comp-3');

  gsap.set(labels, { x: -50, opacity: 0 });
  gsap.set(eireID, {
    scale: 0.88, opacity: 0,
    transformOrigin: 'center center'
  });
  gsap.set([comps1, comps2, comps3], { x: 60, opacity: 0 });

  gsap.timeline({
    scrollTrigger: {
      trigger: '.comparison',
      start: 'top 70%',
      scroller: '[data-scroll-container]',
      once: true,
    }
  })
  .to(labels, {
    x: 0, opacity: 1,
    duration: 0.6,
    ease: 'power3.out',
  })
  .to(eireID, {
    scale: 1, opacity: 1,
    duration: 0.7,
    ease: 'back.out(1.7)',
  }, '<0.1')
  .to(comps1, {
    x: 0, opacity: 1,
    duration: 0.5, ease: 'power2.out',
  }, '<0.2')
  .to(comps2, {
    x: 0, opacity: 1,
    duration: 0.5, ease: 'power2.out',
  }, '<0.1')
  .to(comps3, {
    x: 0, opacity: 1,
    duration: 0.5, ease: 'power2.out',
  }, '<0.1');
        })();
        
        ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
    }

    window.locoScroll = locoScroll;

    initTeamCards();
    initFloatingPill();
    initMobileMenu();
    initDropdowns();
    
    initExploreButton(locoScroll);
    initHeroInteractions();
    
    initDocCarousel();
    initAboutFadeIn();
    initScrollReveal();
    initTextReveal();
    initStatCounters();
    initHowItWorksAnimation();
    initComparisonTable();
    
    initFloatingAssistant();
    initAIChat();
    
    initFAQAccordion();

    initGenesisModal();

    if (typeof initBMCInteractiveGrid === 'function') {
        initBMCInteractiveGrid();
    }

    if (typeof initGrowthRoadmap === 'function') {
        initGrowthRoadmap();
    }

    ScrollTrigger.refresh();

    window.scrollToTop = (smooth = true) => {
        if (window.locoScroll) {
            window.locoScroll.scrollTo(0, {
                duration: smooth ? 600 : 0,
                easing: [0.25, 0.0, 0.35, 1.0]
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    };

   window.scrollToTop(false);

// === WAITLIST MODAL ===
const waitlistModal = document.getElementById('waitlist-modal');
const waitlistTriggers = document.querySelectorAll('.waitlist-trigger');
const waitlistCloseBtn = document.getElementById('waitlist-modal-close');
const waitlistBackdrop = waitlistModal?.querySelector('[data-waitlist-close]');
const waitlistForm = document.getElementById('waitlist-form');
const waitlistSuccess = document.getElementById('waitlist-success');
const waitlistName = document.getElementById('waitlist-name');
const waitlistNameError = document.getElementById('waitlist-name-error');
const waitlistEmail = document.getElementById('waitlist-email');
const waitlistEmailError = document.getElementById('waitlist-email-error');

function openWaitlistModal(e) {
    if (e) e.preventDefault();
    if (!waitlistModal) return;
    waitlistModal.classList.add('is-open');
    waitlistModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (waitlistName) {
        setTimeout(() => waitlistName.focus(), 100);
    }
}

function closeWaitlistModal() {
    if (!waitlistModal) return;
    waitlistModal.classList.remove('is-open');
    waitlistModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    setTimeout(() => {
        if (waitlistForm) {
            waitlistForm.style.display = '';
            waitlistForm.style.opacity = '';
            waitlistForm.style.transform = '';

            const submitBtn = waitlistForm.querySelector('.waitlist-form__submit');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('is-loading');
                submitBtn.removeAttribute('aria-busy');
            }
        }
        if (waitlistSuccess) {
            waitlistSuccess.hidden = true;
            waitlistSuccess.style.opacity = '';
            waitlistSuccess.style.transform = '';
        }
        const modalTitle = document.getElementById('waitlist-modal-title');
        const modalSubtitle = document.getElementById('waitlist-modal-subtitle');
        if (modalTitle) modalTitle.style.display = '';
        if (modalSubtitle) modalSubtitle.style.display = '';
    }, 400);
}

waitlistTriggers.forEach(btn => {
    btn.addEventListener('click', openWaitlistModal);
});

if (waitlistCloseBtn) {
    waitlistCloseBtn.addEventListener('click', closeWaitlistModal);
}

if (waitlistBackdrop) {
    waitlistBackdrop.addEventListener('click', closeWaitlistModal);
}

if (waitlistModal) {
    waitlistModal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const focusableElements = waitlistModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
        if (e.key === 'Escape') closeWaitlistModal();
    });
}

if (waitlistForm) {
    waitlistForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        let hasError = false;

        if (waitlistName) {
            const isNameValid = waitlistName.value.trim().length > 0;
            waitlistNameError?.classList.toggle('is-visible', !isNameValid);
            if (!isNameValid) hasError = true;
        }

        if (waitlistEmail) {
            const isEmailValid = waitlistEmail.checkValidity();
            waitlistEmailError?.classList.toggle('is-visible', !isEmailValid);
            if (!isEmailValid) hasError = true;
        }

        if (hasError) return;

        const submitBtn = waitlistForm.querySelector('.waitlist-form__submit');
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
        submitBtn.setAttribute('aria-busy', 'true');

        const formData = {
            name: waitlistName?.value,
            email: waitlistEmail?.value,
            message: document.getElementById('waitlist-message')?.value
        };

        try {
            const response = await fetch('https://eireid-backend-9d25b1a7b372.herokuapp.com/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                waitlistForm.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                waitlistForm.style.opacity = '0';
                waitlistForm.style.transform = 'translateY(-10px)';

                setTimeout(() => {
                    waitlistForm.style.display = 'none';
                    const modalTitle = document.getElementById('waitlist-modal-title');
                    const modalSubtitle = document.getElementById('waitlist-modal-subtitle');
                    if (modalTitle) modalTitle.style.display = 'none';
                    if (modalSubtitle) modalSubtitle.style.display = 'none';

                    waitlistSuccess.textContent = "Almost there! We've sent a verification link to your email. Please check your inbox to confirm.";
                    waitlistSuccess.style.color = "#a4e5b7";
                    waitlistSuccess.hidden = false;
                    waitlistSuccess.style.opacity = '0';
                    waitlistSuccess.style.transform = 'translateY(10px)';
                    waitlistSuccess.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

                    requestAnimationFrame(() => {
                        waitlistSuccess.style.opacity = '1';
                        waitlistSuccess.style.transform = 'translateY(0)';
                    });
                }, 400);

                waitlistForm.reset();
            } else if (response.status === 409) {
                waitlistSuccess.textContent = "You are already on the waitlist!";
                waitlistSuccess.style.color = "#fbd38d";    
                waitlistSuccess.hidden = false;
            } else {
                throw new Error(data.error || 'Server error');
            }
        } catch (error) {
            console.error('Waitlist submission failed:', error);
            waitlistSuccess.textContent = "Something went wrong. Please try again.";
            waitlistSuccess.style.color = "#fc8181";
            waitlistSuccess.hidden = false;
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-loading');
            submitBtn.removeAttribute('aria-busy');
        }
    });
}

});

function activateElementsAbove() {
    const viewportBottom = window.innerHeight;

    document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < viewportBottom) {
            el.classList.add('is-revealed');
        }
    });

    document.querySelectorAll('[data-scroll-class="is-revealed"]:not(.is-revealed)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < viewportBottom) {
            el.classList.add('is-revealed');
        }
    });
}

window.addEventListener('load', () => {
    if (window.locoScroll) {
        window.locoScroll.update();
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }
    activateElementsAbove();
});

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.scrollTo(0, 0);
        if (window.locoScroll) {
            window.locoScroll.scrollTo(0, { duration: 0 });
            window.locoScroll.update();
        }
        setTimeout(activateElementsAbove, 100);
    }
});
window.escapeHTML = function(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

let textRevealObserver;

function initTextReveal() {
    const revealElements = document.querySelectorAll('[data-reveal]:not(.is-revealed)');
    
    if (!revealElements.length) return;

    if (!textRevealObserver) {
        textRevealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    textRevealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });
    }

    revealElements.forEach(el => textRevealObserver.observe(el));
}

// ─── Preloader Dismissal ────────────────────────────────────────────────
window.addEventListener("load", () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.remove();
            }, 800);
        }, 500); 
    }
});

/* ─── Navigation ─────────────────── */

function initTeamCards() {
    const cards = document.querySelectorAll('.team-id-card');
    if (!cards.length) return;

    cards.forEach(card => {
        const toggleFlip = (e) => {
            if (e.target.closest('a')) return;
            const isFlipped = card.classList.toggle('is-flipped');
            card.setAttribute('aria-expanded', isFlipped);
            cards.forEach(other => {
                if (other !== card && other.classList.contains('is-flipped')) {
                    other.classList.remove('is-flipped');
                    other.setAttribute('aria-expanded', 'false');
                }
            });
        };
        card.addEventListener('click', toggleFlip);
        card.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a')) {
                e.preventDefault(); toggleFlip(e);
            }
        });
    });
}

function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navList = document.getElementById('nav-list');

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            const newState = !isExpanded;
            menuToggle.setAttribute('aria-expanded', newState);
            menuToggle.setAttribute('aria-label', newState ? 'Close menu' : 'Open menu');
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
                if (window.innerWidth < 768) {
                    e.preventDefault();
                    item.classList.toggle('is-active');
                }
            });
        }
    });

    document.addEventListener('click', (e) => {
        dropdownItems.forEach(item => {
            if (!item.contains(e.target)) {
                item.classList.remove('is-active');
            }
        });
    });
}

/* ─── Hero & Explore ─────────────────── */

function initExploreButton(locoScroll) {
    const exploreBtns = [
        document.getElementById("explore-btn"),
        document.getElementById("nav-about-btn")
    ];

    exploreBtns.forEach(btn => {
        if (!btn) return;
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const aboutSection = document.getElementById('about');
            if (aboutSection && locoScroll) {
                locoScroll.scrollTo(aboutSection);
            } else if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
            }
            
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
    let carouselInterval = null;
    let slideWidth = images[0].offsetWidth;

    window.addEventListener('resize', () => {
        slideWidth = images[0].offsetWidth;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    });

    function startCarousel() {
        if (carouselInterval) return;
        carouselInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

            caption.style.opacity = '0';
            setTimeout(() => {
                caption.textContent = images[currentIndex].alt;
                caption.style.opacity = '1';
            }, 300);
        }, 10000);
    }

    function stopCarousel() {
        if (carouselInterval) {
            clearInterval(carouselInterval);
            carouselInterval = null;
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) startCarousel();
            else stopCarousel();
        });
    }, { threshold: 0.1 });

    observer.observe(track);
}

function initAboutFadeIn() {
    const faders = document.querySelectorAll('.fade-in');

    if (!faders.length) return;

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('appear');
                    obs.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }
    );

    faders.forEach(el => {
        if (!el.dataset.observed) {
            observer.observe(el);
            el.dataset.observed = 'true';
        }
    });
}

function initStatCounters() {
  const stats = document.querySelectorAll('.stat-bar__number');
  if (!stats.length) return;

  // Bolt: Pre-calculate indices and cache target values to avoid O(N) searches
  // and redundant DOM/parsing work during high-frequency animation frames.
  stats.forEach((el, index) => {
    el._statIndex = index;
    const targetText = el.getAttribute('data-target') || el.textContent.trim();
    if (!el.getAttribute('data-target')) {
      el.setAttribute('data-target', targetText);
    }
    el._targetValue = parseFloat(targetText.replace(/[^0-9.]/g, '')) || 0;
    el._suffix = targetText.replace(/[0-9.]/g, '');
  });

  function animateCount(el) {
    const targetValue = el._targetValue;
    const suffix = el._suffix;
    if (targetValue === 0) return;

    const duration = 1000 + (el._statIndex * 500);
    const startTime = performance.now();

    const unitSpan = el.querySelector('.stat-bar__unit');
    const firstNode = el.childNodes[0];
    const isTextNode = firstNode && firstNode.nodeType === 3;

    let renderFn;
    if (unitSpan) {
      if (isTextNode) {
        renderFn = (val) => { firstNode.textContent = val; };
      } else {
        const unitHtml = unitSpan.outerHTML;
        renderFn = (val) => { el.innerHTML = val + unitHtml; };
      }
    } else {
      renderFn = (val) => { el.textContent = val + suffix; };
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = Math.floor(easeProgress * targetValue);

      renderFn(currentValue);

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
        if (entry.isIntersecting && el.getAttribute('data-counted') !== 'true') {
          animateCount(el);
          el.setAttribute('data-counted', 'true');
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach(stat => observer.observe(stat));
}

/* ─── Init ────────────────────────────────────────────────────────────────── */

/* =============================================================================
   how-it-works.js — EireID How It Works Section
   Handles scroll-driven timeline progress and step activation.
   ============================================================================= */

function initHowItWorksAnimation() {
    const section = document.querySelector('.how-it-works');
    const timelineWrapper = document.querySelector('.how-it-works__timeline-wrapper');
    const progressLine = document.getElementById('timeline-progress');
    const progressDot = document.getElementById('timeline-dot');
    const steps = document.querySelectorAll('.timeline-step');

    if (!section || !timelineWrapper || !progressLine || !steps.length) return;

    steps.forEach((step, index) => {
        ScrollTrigger.create({
            trigger: step,
            scroller: "[data-scroll-container]",
            start: "top 85%",
            onEnter: () => {
                setTimeout(() => {
                    step.classList.add('is-active');
                }, 150 * (index % 3));
            },
            once: true
        });
    });

    let maxProgress = 0;
    
    let tl = gsap.timeline({ paused: true });
    tl.to(progressLine, { scaleY: 1, duration: 1, ease: "none" }, 0);
    tl.to(progressDot, { top: "100%", duration: 1, ease: "none" }, 0);
    tl.to(progressDot, { opacity: 1, duration: 0.01 }, 0);
    
    gsap.set(progressDot, { xPercent: -50, yPercent: -50 });

    ScrollTrigger.create({
        trigger: timelineWrapper,
        scroller: "[data-scroll-container]",
        start: "top 50%",
        end: "bottom 50%",
        onUpdate: self => {
            maxProgress = Math.max(maxProgress, self.progress);
            tl.progress(maxProgress);
        }
    });
}

/* ─── Comparison Table Mobile Logic ─────────────────── */
function initComparisonTable() {
    if (window.innerWidth >= 1024) return;

    const comp1 = document.querySelectorAll('.comp-1');
    const comp2 = document.querySelectorAll('.comp-2');
    const comp3 = document.querySelectorAll('.comp-3');
    
    const competitors = [comp1, comp2, comp3];
    let currentIndex = 0;

    const comparisonInterval = setInterval(() => {
        competitors[currentIndex].forEach(cell => cell.classList.remove('is-active'));
        
        currentIndex = (currentIndex + 1) % competitors.length;
        
        competitors[currentIndex].forEach(cell => cell.classList.add('is-active'));
    }, 10000);
}

/* ─── Rua AI Assistant Logic ─────────────────── */

function initFloatingAssistant() {
    const fab = document.getElementById('ai-fab');
    const modal = document.getElementById('ai-modal');
    const closeBtn = document.getElementById('ai-modal-close');

    if (!fab || !modal || typeof ScrollTrigger === 'undefined') return;

    ScrollTrigger.create({
        trigger: 'body',
        scroller: '[data-scroll-container]',
        start: 'top -50%',
        onToggle: self => {
            if (self.isActive) {
                fab.classList.add('is-visible');
            } else {
                fab.classList.remove('is-visible');
                if (modal.classList.contains('is-open')) {
                    modal.classList.remove('is-open');
                    modal.setAttribute('aria-hidden', 'true');
                }
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
    const form     = document.getElementById('ai-chat-form');
    const input    = document.getElementById('ai-chat-input');
    const body     = document.getElementById('ai-modal-body');
    const initialTimeEl = document.getElementById('ai-initial-time');

    if (!form || !input || !body) return;

    const BACKEND_URL = 'https://eireid-backend-9d25b1a7b372.herokuapp.com/chat';

    if (initialTimeEl) {
        initialTimeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function renderUserMessage(text, timeStr) {
        const div = document.createElement('div');
        div.className = 'ai-message ai-message--user';
        div.innerHTML = `
            <div class="ai-message__bubble">
                <div class="ai-message__text-container">
                    <p class="ai-message__text">${escapeHTML(text)}</p>
                </div>
                <div class="ai-message__time">${escapeHTML(timeStr)}</div>
            </div>`;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    }

    function renderBotMessage(text, timeStr, sources = []) {
        const formatted = escapeHTML(text).replace(/\n/g, '<br>');

        const sourcesHtml = sources.length > 0
            ? `<div class="ai-message__sources">
                 <p class="ai-message__sources-label">Sources:</p>
                 ${sources.map(s => `<a href="${escapeHTML(s.url)}" target="_blank" class="ai-message__source-link">${escapeHTML(s.title)}</a>`).join('')}
               </div>`
            : '';

        const div = document.createElement('div');
        div.className = 'ai-message';
        div.innerHTML = `
            <div class="ai-message__avatar-container">
                <img src="assets/img/mascot_2.png" alt="Rua AI" class="ai-message__avatar" style="mix-blend-mode: multiply;">
            </div>
            <div class="ai-message__bubble">
                <div class="ai-message__text-container">
                    <p class="ai-message__text">${formatted}</p>
                    ${sourcesHtml}
                </div>
                <div class="ai-message__time">${escapeHTML(timeStr)}</div>
            </div>`;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'ai-message';
        div.id = 'ai-typing';
        div.innerHTML = `
            <div class="ai-message__avatar-container">
                <img src="assets/img/mascot_2.png" alt="Rua AI" class="ai-message__avatar" style="mix-blend-mode: multiply;">
            </div>
            <div class="ai-message__bubble">
                <div class="ai-message__text-container">
                    <p class="ai-message__text" style="opacity:0.5">Thinking...</p>
                </div>
            </div>`;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    }

    function removeTyping() {
        document.getElementById('ai-typing')?.remove();
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const text = input.value.trim();
        if (!text) return;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        renderUserMessage(text, timeStr);
        input.value = '';
        showTyping();

        input.disabled = true;
        const submitBtn = form.querySelector('button');
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
        submitBtn.setAttribute('aria-busy', 'true');

        try {
            const res = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await res.json();
            removeTyping();

            const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            renderBotMessage(data.reply || 'Sorry, something went wrong.', replyTime, data.sources || []);

        } catch (err) {
            removeTyping();
            const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            renderBotMessage('Sorry, I couldn\'t connect to the server. Please try again.', replyTime);
        } finally {
            input.disabled = false;
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-loading');
            submitBtn.removeAttribute('aria-busy');
            input.focus();
        }
    });
}

/* ─── FAQ Accordion ─────────────────── */
function initFAQAccordion() {
    let activeItemObj = null;

    const faqItems = Array.from(document.querySelectorAll('.faq__item')).map(item => ({
        element: item,
        button: item.querySelector('.faq__question')
    }));
    
    faqItems.forEach(itemObj => {
        const { element: item, button: questionBtn } = itemObj;
        if (!questionBtn) return;
        
        if (questionBtn.getAttribute('aria-expanded') === 'true') {
            activeItemObj = itemObj;
        }

        questionBtn.addEventListener('click', () => {
            const isExpanding = questionBtn.getAttribute('aria-expanded') !== 'true';
            
            if (activeItemObj && activeItemObj !== itemObj) {
                activeItemObj.button.setAttribute('aria-expanded', 'false');
                activeItemObj.element.classList.remove('is-active');
            }
            
            if (isExpanding) {
                questionBtn.setAttribute('aria-expanded', 'true');
                item.classList.add('is-active');
                activeItemObj = itemObj;
            } else {
                questionBtn.setAttribute('aria-expanded', 'false');
                item.classList.remove('is-active');
                activeItemObj = null;
            }
        });
    });
}

/* ─── Floating Menu Pill ─────────────────── */
function initFloatingPill() {
    const header = document.querySelector('.header');
    const originalNavList = document.getElementById('nav-list');
    
    if (!header || !originalNavList) return;
    
    const pill = document.createElement('nav');
    pill.id = 'floating-pill';
    pill.className = 'floating-pill logo-box--glass';
    pill.setAttribute('aria-label', 'Quick Navigation');
    
    const pd = document.createElement('div');
    pd.className = 'floating-pill__desktop';
    
    const clonedList = originalNavList.cloneNode(true);
    clonedList.id = 'floating-nav-list';

    clonedList.querySelectorAll('[id]').forEach(el => {
        el.removeAttribute('id');
    });

    pd.appendChild(clonedList);
    
    pill.appendChild(pd);
    
    document.body.appendChild(pill);
    
    if (typeof ScrollTrigger === 'undefined') return;

    ScrollTrigger.create({
        trigger: 'body',
        scroller: '[data-scroll-container]',
        start: () => `top -${header.offsetHeight}px`,
        onToggle: self => {
            if (self.isActive) {
                pill.classList.add('is-visible');
            } else {
                pill.classList.remove('is-visible');
            }
        },
        invalidateOnRefresh: true
    });
}

/* ─── Genesis Modal Expansion ─────────────────── */
function initGenesisModal() {
    const cta = document.getElementById('genesis-cta');
    const modal = document.getElementById('genesis-modal');
    const closeBtn = document.getElementById('genesis-modal-close');
    const container = document.querySelector('.genesis-security__container');

    if (!cta || !modal || !container) return;

    const originalContent = container.querySelectorAll('.genesis-matrix, .genesis-security__grid');
    const manifestoHeadline = modal.querySelector('.genesis-manifesto__headline');
    const manifestoLead = document.getElementById('genesis-manifesto-text');
    const bentoCards = modal.querySelectorAll('.genesis-bento__card');
    const scanLine = modal.querySelector('.genesis-scan');
    const interactiveLayers = modal.querySelectorAll('.interactive-layer');
    const vaultTooltip = document.getElementById('vault-tooltip');

    const leadText = manifestoLead ? manifestoLead.textContent.trim() : "";

    function handleTilt(e) {
        const card = e.currentTarget;
        if (!card._rect) card._rect = card.getBoundingClientRect();
        const rect = card._rect;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const percentX = (x - centerX) / centerX;
        const percentY = (y - centerY) / centerY;
        
        if (card._tiltX) card._tiltX(-percentY * 5);
        if (card._tiltY) card._tiltY(percentX * 5);
    }

    function resetTilt(e) {
        const card = e.currentTarget;
        if (card._tiltX) card._tiltX(0);
        if (card._tiltY) card._tiltY(0);
    }

    const modalScroller = document.getElementById('genesis-scroller');

    bentoCards.forEach(card => {
        card._tiltX = gsap.quickTo(card, "rotateX", { duration: 0.4, ease: "power2.out" });
        card._tiltY = gsap.quickTo(card, "rotateY", { duration: 0.4, ease: "power2.out" });

        card.addEventListener('mouseenter', () => {
            card._rect = card.getBoundingClientRect();
        });

        card.addEventListener('mousemove', handleTilt);
        card.addEventListener('mouseleave', resetTilt);
    });

    if (modalScroller) {
        const invalidateCache = () => {
            bentoCards.forEach(card => { card._rect = null; });
        };
        modalScroller.addEventListener('scroll', invalidateCache, { passive: true });
        window.addEventListener('resize', invalidateCache, { passive: true });
    }

    interactiveLayers.forEach(layer => {
        layer.addEventListener('mouseenter', () => {
            const title = layer.getAttribute('data-layer');
            const desc = layer.getAttribute('data-desc');
            if (vaultTooltip) {
                gsap.to(vaultTooltip, { opacity: 0, duration: 0.2, onComplete: () => {
                    vaultTooltip.innerHTML = `<strong>${escapeHTML(title)}:</strong> ${escapeHTML(desc)}`;
                    gsap.to(vaultTooltip, { opacity: 1, duration: 0.2 });
                }});
            }
        });
    });

    const techItems = modal.querySelectorAll('.tech-item');
    const connectors = modal.querySelectorAll('.connector-pulse');
    
    techItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(connectors, { scale: 2, filter: "blur(4px)", duration: 0.3, stagger: 0.1 });
        });
        item.addEventListener('mouseleave', () => {
            gsap.to(connectors, { scale: 1, filter: "blur(2px)", duration: 0.3 });
        });
    });

    cta.addEventListener('click', () => {
        const rect = container.getBoundingClientRect();
        
        if (window.locoScroll) window.locoScroll.stop();

        modal.classList.add('is-active');
        modal.setAttribute('aria-hidden', 'false');

        const modalScroller = document.getElementById('genesis-scroller');
        if (modalScroller) modalScroller.scrollTop = 0;

        gsap.set(modal, { 
            visibility: 'visible',
            opacity: 1,
            clipPath: `inset(${rect.top}px ${window.innerWidth - rect.right}px ${window.innerHeight - rect.bottom}px ${rect.left}px round 32px)`
        });

        if (manifestoLead) manifestoLead.textContent = "";

        const tl = gsap.timeline();

        tl.to(originalContent, {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: "power2.inOut"
        });

        tl.to(modal, {
            clipPath: `inset(0px 0px 0px 0px round 0px)`,
            duration: 1,
            ease: "expo.inOut"
        }, "-=0.3");

        tl.fromTo(scanLine, 
            { top: "0%", opacity: 0 },
            { top: "100%", opacity: 0.8, duration: 1.2, ease: "power1.inOut" },
            "-=0.5"
        );
        tl.set(scanLine, { opacity: 0 });

        tl.fromTo([manifestoHeadline, manifestoLead], 
            { opacity: 0, y: 40, filter: "blur(10px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, stagger: 0.2, ease: "power4.out" },
            "-=0.8"
        );

        tl.add(() => {
            if (manifestoLead) {
                let i = 0;
                const typing = setInterval(() => {
                    manifestoLead.textContent += leadText[i];
                    i++;
                    if (i === leadText.length) {
                        clearInterval(typing);
                        gsap.to(manifestoLead, { borderRightColor: "transparent", duration: 0.5, delay: 1 });
                    }
                }, 20);
            }
        }, "-=0.4");

        const vaultModule = modal.querySelector('[data-vault-module]');
        if (vaultModule) {
            tl.fromTo(vaultModule,
                { opacity: 0, y: 50, filter: "blur(15px)" },
                { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.4, ease: "power3.out" },
                "-=0.6"
            );
        }

        const entranceItems = Array.from(modal.querySelectorAll('[data-item], .section-header, .section-lead'))
                                   .filter(el => el !== vaultModule);
        
        tl.fromTo(entranceItems, 
            { opacity: 0, y: 30 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 1, 
                stagger: 0.08, 
                ease: "power2.out",
                clearProps: "transform" 
            }, 
            "-=0.8" 
        );
    });

    const techTrigger = document.getElementById('genesis-tech-expander');
    const techPanel = document.getElementById('genesis-tech-panel');
    
    if (techTrigger && techPanel) {
        techTrigger.addEventListener('click', () => {
            techPanel.classList.toggle('is-active');
            const isActive = techPanel.classList.contains('is-active');
            techTrigger.querySelector('.bento-badge').textContent = isActive ? "- HIDE SPECIFICATIONS" : "+ VIEW TECHNICAL SPECIFICATIONS";
            
            if (isActive) {
                gsap.from(techPanel.querySelectorAll('.tech-spec-item'), {
                    opacity: 0,
                    x: -10,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: "power2.out"
                });
            }
        });
    }

    closeBtn.addEventListener('click', () => {
        const rect = container.getBoundingClientRect();
        const tlClose = gsap.timeline();

        const allContent = modal.querySelectorAll('.genesis-manifesto__headline, #genesis-manifesto-text, .genesis-bento__card, .genesis-hub-section');

        tlClose.to(allContent, {
            opacity: 0,
            y: 20,
            duration: 0.4,
            ease: "power2.in",
            stagger: 0.03
        });

        tlClose.to(modal, {
            clipPath: `inset(${rect.top}px ${window.innerWidth - rect.right}px ${window.innerHeight - rect.bottom}px ${rect.left}px round 32px)`,
            duration: 0.8,
            ease: "expo.inOut",
            onComplete: () => {

                gsap.set(modal, { visibility: 'hidden', opacity: 0 });
                modal.classList.remove('is-active');
                modal.setAttribute('aria-hidden', 'true');
                
                if (window.locoScroll) {
                    window.locoScroll.start();
                    window.locoScroll.update();
                }

                gsap.set(originalContent, { y: -20 });
                gsap.to(originalContent, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power2.out"
                });
            }
        });
    });
}

/* ─── BMC Interactive Grid ─────────────────── */
function initBMCInteractiveGrid() {
    const tiles = document.querySelectorAll('.bmc-tile');
    
    if (!tiles.length) return;

    tiles.forEach(tile => {
        tile.addEventListener('click', (e) => {
            const cell = tile.closest('.bmc-cell');
            if (!cell) return;
            const isExpanded = cell.classList.contains('is-expanded');
            const expandDirectionRaw = tile.getAttribute('data-expand');
            const isMobile = window.innerWidth < 1024;
            const expandDirection = isMobile ? 'none' : expandDirectionRaw;
            
            document.querySelectorAll('.bmc-cell.is-expanded').forEach(otherCell => {
                if (otherCell !== cell) {
                    otherCell.classList.remove('is-expanded');
                    const otherTile = otherCell.querySelector('.bmc-tile');
                    const otherExpandRaw = otherTile.getAttribute('data-expand');
                    
                    if (otherExpandRaw !== 'none' && !isMobile) {
                        gsap.to(otherTile, {
                            width: "100%",
                            left: 0,
                            right: 0,
                            duration: 0.5,
                            ease: "expo.out",
                            clearProps: "all"
                        });
                    } else if (isMobile) {
                        gsap.set(otherTile, { clearProps: "width,left,right" });
                    }
                    
                    const otherContent = otherTile.querySelector('.bmc-tile-content');
                    if(otherContent) {
                        gsap.killTweensOf(otherContent);
                        gsap.to(otherContent, { opacity: 0, duration: 0.2, onComplete: () => {
                            gsap.set(otherContent, { display: "none" });
                        }});
                    }
                }
            });

            if (!isExpanded) {
                cell.classList.add('is-expanded');
                
                if (expandDirection !== 'none') {
                    const gap = 24; 
                    
                    let animProps = {
                        width: `calc(200% + ${gap}px)`,
                        duration: 0.8,
                        ease: "elastic.out(1, 0.7)"                    };
                    
                    if (expandDirection === "left") {
                        gsap.set(tile, { left: "auto", right: 0 });
                        gsap.set(tile, { transformOrigin: "right center" });
                    } else {
                        gsap.set(tile, { left: 0, right: "auto" });
                        gsap.set(tile, { transformOrigin: "left center" });
                    }
                    
                    gsap.to(tile, animProps);
                } else {
                    gsap.fromTo(tile, { scale: 0.98 }, { scale: 1, duration: 0.4, ease: "back.out(1.5)" });
                }
                
                const content = tile.querySelector('.bmc-tile-content');
                if(content) {
                    gsap.killTweensOf(content);
                    gsap.set(content, { display: "flex", opacity: 0, y: 10 });
                    gsap.to(content, { opacity: 1, y: 0, duration: 0.4, delay: expandDirection !== 'none' ? 0.2 : 0, ease: "power2.out" });
                }
                
            } else {
                cell.classList.remove('is-expanded');
                
                if (expandDirection !== 'none') {
                    gsap.to(tile, {
                        width: "100%",
                        duration: 0.5,
                        ease: "expo.out",
                        clearProps: "all"
                    });
                }
                
                const content = tile.querySelector('.bmc-tile-content');
                if(content) {
                    gsap.killTweensOf(content);
                    gsap.to(content, { opacity: 0, duration: 0.2, onComplete: () => {
                        gsap.set(content, { display: "none" });
                    }});
                }
            }
        });
    });
}

/* ─── Growth Roadmap (Investor Page) ──────────────── */
function initGrowthRoadmap() {
    const trackFill = document.querySelector('.cyber-track-fill');
    const particle = document.querySelector('.track-particle');
    const nodes = document.querySelectorAll('.roadmap-node');
    const containers = document.querySelectorAll('.roadmap-node-wrapper');
    
    if (!trackFill) return;

    const isDesktop = window.innerWidth >= 1024;
    
    gsap.to(trackFill, {
        scrollTrigger: {
            trigger: '.growth-roadmap-inner',
            start: 'top 70%',
            end: 'bottom 80%',
            scrub: 1.5,
            scroller: '[data-scroll-container]',
        },
        height: isDesktop ? '4px' : '100%',
        width: isDesktop ? '100%' : '4px',
        ease: "none"
    });

    if (particle) {
        gsap.to(particle, {
            scrollTrigger: {
                trigger: '.growth-roadmap-inner',
                start: 'top 70%',
                end: 'bottom 80%',
                scrub: 1,
                scroller: '[data-scroll-container]',
            },
            left: isDesktop ? "100%" : "20px",
            top: isDesktop ? "20px" : "100%",
            opacity: [0, 1, 1, 1, 0], 
            ease: "none"
        });
    }

    containers.forEach((wrapper, i) => {
        const node = wrapper.querySelector('.roadmap-node');
        if (!node) return;
        
        gsap.from(node, {
            scrollTrigger: {
                trigger: wrapper,
                start: 'top 90%',
                toggleActions: "play none none reverse",
                scroller: '[data-scroll-container]',
            },
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            delay: isDesktop ? (i * 0.1) : 0
        });
    });
}

function checkVerificationStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
        const popup = document.createElement('div');
        popup.id = 'verified-toast';
        popup.className = 'verified-toast logo-box--glass';
        popup.innerHTML = `
            <div class="verified-toast__content">
                <span class="iconify" data-icon="lucide:check-circle"></span>
                <p>Success! Your email has been verified. Welcome to EireID!</p>
            </div>
        `;
        document.body.appendChild(popup);

        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('verified');
        window.history.replaceState({}, document.title, currentUrl.pathname + currentUrl.search);

        setTimeout(() => popup.classList.add('is-visible'), 100);

        setTimeout(() => {
            popup.classList.remove('is-visible');
            setTimeout(() => popup.remove(), 500);
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', checkVerificationStatus);

document.addEventListener('DOMContentLoaded', checkVerificationStatus);

