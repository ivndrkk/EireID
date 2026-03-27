/* =============================================================================
   EireID Core Scripts
   Includes: Navigation, Hero Interactions, About Carousel, Animations,
   and Floating Rua AI Assistant.
   ============================================================================= */

document.addEventListener("DOMContentLoaded", () => {
    // 0. Initialize Locomotive Scroll & GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    const scroller = document.querySelector('[data-scroll-container]');
    let locoScroll = null;
    
    if (scroller) {
        // Use a higher lerp (0.12) for mobile devices for better responsiveness
        // while maintaining the default smooth 0.05 for desktop and tablet.
        const isMobile = window.innerWidth < 768;

        locoScroll = new LocomotiveScroll({
            el: scroller,
            smooth: true,
            lerp: isMobile ? 0.12 : 0.05,
            smartphone: {
                smooth: true,
                multiplier: 1.2 // Slightly faster on mobile
            },
            tablet: { smooth: true }
        });

        // Each time Locomotive Scroll updates, tell ScrollTrigger to update too
        locoScroll.on("scroll", ScrollTrigger.update);

        // Tell ScrollTrigger to use these proxy methods for the ".data-scroll-container" element
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

  // Начальные скрытые состояния
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
      scroller: '[data-scroll-container]', // Locomotive proxy
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
    ease: 'back.out(1.7)', // фирменный bounce как у logo-box
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
        
        // Each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll. 
        ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
    }

    window.locoScroll = locoScroll; // Make globally accessible if needed

    // Navigation & Menus
    initFloatingPill();
    initMobileMenu();
    initDropdowns();
    
    // UI Interactions
    initExploreButton(locoScroll);
    initHeroInteractions();
    
    // Section Specific
    initDocCarousel();
    initAboutFadeIn();
    initScrollReveal();
    initTextReveal();
    initStatCounters();
    initHowItWorksAnimation();
    initComparisonTable();
    
    // Rua AI Assistant
    initFloatingAssistant();
    initAIChat();
    
    // FAQ
    initFAQAccordion();

    // Genesis Modal
    initGenesisModal();

    // Business Model Canvas Grid
    if (typeof initBMCInteractiveGrid === 'function') {
        initBMCInteractiveGrid();
    }

    // Growth Roadmap
    if (typeof initGrowthRoadmap === 'function') {
        initGrowthRoadmap();
    }

    // Final Refresh
    ScrollTrigger.refresh();

    // Global Scroll to Top Helper
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

    // Initial scroll to top on page load
    window.scrollToTop(true);
});

// Added to prevent crashes if certain animations are missing or renamed in other files
function initScrollReveal() {
    // Placeholder - handled by Locomotive Scroll's data-scroll-class directly
    console.log("initScrollReveal: Using native Locomotive Scroll revealing");
}

// Optimization: Use a singleton IntersectionObserver for text reveals to prevent memory leaks
// and redundant observer instances when re-initializing (e.g., after pagination).
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
        // Allow a small delay for branding visibility
        setTimeout(() => {
            preloader.classList.add('fade-out');
            // Remove from DOM after fade animation
            setTimeout(() => {
                preloader.remove();
            }, 800);
        }, 500); 
    }
});

/* ─── Navigation ─────────────────── */

function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navList = document.getElementById('nav-list');

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            menuToggle.setAttribute('aria-label', !isExpanded ? 'Close menu' : 'Open menu');
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
                menuToggle.setAttribute('aria-label', 'Open menu');
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

    const carouselInterval = setInterval(() => {
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

    faders.forEach(el => {
        if (!el.dataset.observed) {
            observer.observe(el);
            el.dataset.observed = 'true';
        }
    });
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

    // Optimization: Pre-cache elements and text nodes outside the animation loop to prevent layout thrashing
    // Pre-cache elements and text nodes outside the animation loop to prevent layout thrashing
    const unitSpan = el.querySelector('.stat-bar__unit');
    const firstNode = el.childNodes[0];
    const isTextNode = firstNode && firstNode.nodeType === 3;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = Math.floor(easeProgress * targetValue);

      // Preserve unit/suffix if it exists in a span
      if (unitSpan) {
        if (isTextNode) {
          firstNode.textContent = currentValue;
        } else {
          // Fallback if structure is unexpected (only runs if childNodes[0] is not a text node)
          el.innerHTML = currentValue + unitSpan.outerHTML;
        }
      } else {
        // Use textContent for better performance (no layout/reflow)
        el.textContent = currentValue + suffix;
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

    // 1. Step Activation using ScrollTrigger (Fixes Locomotive Translation offset issues)
    steps.forEach((step, index) => {
        ScrollTrigger.create({
            trigger: step,
            scroller: "[data-scroll-container]",
            start: "top 85%",
            onEnter: () => {
                setTimeout(() => {
                    step.classList.add('is-active');
                }, 150 * (index % 3)); // Stylish stagger
            },
            once: true
        });
    });

    // 2. pure GSAP Timeline Progress Line Refactor
    let maxProgress = 0;
    
    // Create paused timeline mapping progressing from 0 to 1
    let tl = gsap.timeline({ paused: true });
    tl.to(progressLine, { scaleY: 1, duration: 1, ease: "none" }, 0);
    tl.to(progressDot, { top: "100%", duration: 1, ease: "none" }, 0);
    // Keep dot visible initially
    tl.to(progressDot, { opacity: 1, duration: 0.01 }, 0);
    
    // Ensure translation for the dot is kept centered over the line
    gsap.set(progressDot, { xPercent: -50, yPercent: -50 });

    ScrollTrigger.create({
        trigger: timelineWrapper,
        scroller: "[data-scroll-container]",
        start: "top 50%",      // Start when wrapper hits screen center
        end: "bottom 50%",   // End when wrapper bottom hits screen center
        onUpdate: self => {
            // Ensure the progress only grows (no scrub backward over completed active items)
            maxProgress = Math.max(maxProgress, self.progress);
            tl.progress(maxProgress);
        }
    });
}

/* ─── Comparison Table Mobile Logic ─────────────────── */
function initComparisonTable() {
    if (window.innerWidth >= 1024) return; // Only run on mobile/tablet

    const comp1 = document.querySelectorAll('.comp-1');
    const comp2 = document.querySelectorAll('.comp-2');
    const comp3 = document.querySelectorAll('.comp-3');
    
    const competitors = [comp1, comp2, comp3];
    let currentIndex = 0;

    const comparisonInterval = setInterval(() => {
        // Hide current competitor columns
        competitors[currentIndex].forEach(cell => cell.classList.remove('is-active'));
        
        // Move to next competitor
        currentIndex = (currentIndex + 1) % competitors.length;
        
        // Show new competitor columns
        competitors[currentIndex].forEach(cell => cell.classList.add('is-active'));
    }, 10000); // 10 seconds
}



/* ─── Rua AI Assistant Logic ─────────────────── */

function initFloatingAssistant() {
    const fab = document.getElementById('ai-fab');
    const modal = document.getElementById('ai-modal');
    const closeBtn = document.getElementById('ai-modal-close');

    if (!fab || !modal) return;

    let ticking = false;
    let windowHeight = window.innerHeight;

    function updateFloatingAssistant(scrollY) {
        if (scrollY > windowHeight / 2) {
            fab.classList.add('is-visible');
        } else {
            fab.classList.remove('is-visible');
            if (modal.classList.contains('is-open')) {
                modal.classList.remove('is-open');
                modal.setAttribute('aria-hidden', 'true');
            }
        }
        ticking = false;
    }

    if (window.locoScroll) {
        window.locoScroll.on('scroll', (args) => {
            updateFloatingAssistant(args.scroll.y);
        });
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateFloatingAssistant(window.scrollY);
            });
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        windowHeight = window.innerHeight;
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

    // Рендер сообщения пользователя
    function renderUserMessage(text, timeStr) {
        const div = document.createElement('div');
        div.className = 'ai-message ai-message--user';
        div.innerHTML = `
            <div class="ai-message__bubble">
                <div class="ai-message__text-container">
                    <p class="ai-message__text">${text}</p>
                </div>
                <div class="ai-message__time">${timeStr}</div>
            </div>`;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    }

    // Рендер ответа ассистента (с аватаром)
    function renderBotMessage(text, timeStr, sources = []) {
        // Форматируем: переносы строк → <br>
        const formatted = text.replace(/\n/g, '<br>');

        // Источники
        const sourcesHtml = sources.length > 0
            ? `<div class="ai-message__sources">
                 <p class="ai-message__sources-label">Sources:</p>
                 ${sources.map(s => `<a href="${s.url}" target="_blank" class="ai-message__source-link">${s.title}</a>`).join('')}
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
                <div class="ai-message__time">${timeStr}</div>
            </div>`;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    }

    // Индикатор загрузки ("печатает...")
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

    // Отправка
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const text = input.value.trim();
        if (!text) return;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        renderUserMessage(text, timeStr);
        input.value = '';
        showTyping();

        // Блокируем input пока ждём ответ
        input.disabled = true;
        form.querySelector('button').disabled = true;

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
            form.querySelector('button').disabled = false;
            input.focus();
        }
    });
}

/* ─── FAQ Accordion ─────────────────── */
function initFAQAccordion() {
    const faqItems = Array.from(document.querySelectorAll('.faq__item')).map(item => ({
        element: item,
        button: item.querySelector('.faq__question')
    }));
    
    faqItems.forEach(itemObj => {
        const { element: item, button: questionBtn } = itemObj;
        if (!questionBtn) return;
        
        questionBtn.addEventListener('click', () => {
            const isExpanded = questionBtn.getAttribute('aria-expanded') === 'true';
            
            // Close all items first
            faqItems.forEach(otherItemObj => {
                otherItemObj.button.setAttribute('aria-expanded', 'false');
                otherItemObj.element.classList.remove('is-active');
            });
            
            // If the clicked item was not expanded, open it
            if (!isExpanded) {
                questionBtn.setAttribute('aria-expanded', 'true');
                item.classList.add('is-active');
            }
        });
    });
}

/* ─── Floating Menu Pill ─────────────────── */
function initFloatingPill() {
    const header = document.querySelector('.header');
    const originalNavList = document.getElementById('nav-list');
    
    if (!header || !originalNavList) return;
    
    // Create the pill overlay
    const pill = document.createElement('nav');
    pill.id = 'floating-pill';
    pill.className = 'floating-pill logo-box--glass';
    pill.setAttribute('aria-label', 'Quick Navigation');
    
    // Desktop layout wrapper
    const pd = document.createElement('div');
    pd.className = 'floating-pill__desktop';
    
    // Clone original nav list
    const clonedList = originalNavList.cloneNode(true);
    clonedList.id = 'floating-nav-list';

    // Remove IDs from cloned elements to avoid duplicates
    clonedList.querySelectorAll('[id]').forEach(el => {
        el.removeAttribute('id');
    });

    pd.appendChild(clonedList);
    
    // Desktop layout wrapper ONLY. The floating burger is fully removed for mobile devices.
    pill.appendChild(pd);
    
    document.body.appendChild(pill);
    
    let ticking = false;
    let triggerPoint = 0;

    function cacheHeaderOffset() {
        triggerPoint = header.offsetTop + header.offsetHeight + 50;
    }
    
    function togglePill(scrollY) {
        if (scrollY > triggerPoint) {
            pill.classList.add('is-visible');
        } else {
            pill.classList.remove('is-visible');
        }
    }

    if (window.locoScroll) {
        window.locoScroll.on('scroll', (args) => {
            togglePill(args.scroll.y);
        });
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                togglePill(window.scrollY);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', cacheHeaderOffset);
    cacheHeaderOffset();
}

/* ─── Genesis Modal Expansion ─────────────────── */
function initGenesisModal() {
    const cta = document.getElementById('genesis-cta');
    const modal = document.getElementById('genesis-modal');
    const closeBtn = document.getElementById('genesis-modal-close');
    const container = document.querySelector('.genesis-security__container');

    if (!cta || !modal || !container) return;

    // Cache elements
    const originalContent = container.querySelectorAll('.genesis-matrix, .genesis-security__grid');
    const manifestoHeadline = modal.querySelector('.genesis-manifesto__headline');
    const manifestoLead = document.getElementById('genesis-manifesto-text');
    const bentoCards = modal.querySelectorAll('.genesis-bento__card');
    const scanLine = modal.querySelector('.genesis-scan');
    const interactiveLayers = modal.querySelectorAll('.interactive-layer');
    const vaultTooltip = document.getElementById('vault-tooltip');

    const leadText = manifestoLead ? manifestoLead.textContent.trim() : "";

    // 1. 3D Tilt Logic
    function handleTilt(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const percentX = (x - centerX) / centerX;
        const percentY = (y - centerY) / centerY;

        gsap.to(card, {
            rotateX: -percentY * 5,
            rotateY: percentX * 5,
            duration: 0.4,
            ease: "power2.out"
        });
    }

    function resetTilt(e) {
        gsap.to(e.currentTarget, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.6,
            ease: "power2.out"
        });
    }

    bentoCards.forEach(card => {
        card.addEventListener('mousemove', handleTilt);
        card.addEventListener('mouseleave', resetTilt);
    });

    // 2. SVG Ring Interactivity
    interactiveLayers.forEach(layer => {
        layer.addEventListener('mouseenter', () => {
            const title = layer.getAttribute('data-layer');
            const desc = layer.getAttribute('data-desc');
            if (vaultTooltip) {
                gsap.to(vaultTooltip, { opacity: 0, duration: 0.2, onComplete: () => {
                    vaultTooltip.innerHTML = `<strong>${title}:</strong> ${desc}`;
                    gsap.to(vaultTooltip, { opacity: 1, duration: 0.2 });
                }});
            }
        });
    });

    // 3. Tech Stack Interactivity (Path Pulses)
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

        // Initial set
        gsap.set(modal, {
            visibility: 'visible',
            opacity: 1,
            clipPath: `inset(${rect.top}px ${window.innerWidth - rect.right}px ${window.innerHeight - rect.bottom}px ${rect.left}px round 32px)`
        });

        if (manifestoLead) manifestoLead.textContent = "";

        const tl = gsap.timeline();

        // Section content fade
        tl.to(originalContent, {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: "power2.inOut"
        });

        // Window Expansion
        tl.to(modal, {
            clipPath: `inset(0px 0px 0px 0px round 0px)`,
            duration: 1,
            ease: "expo.inOut"
        }, "-=0.3");

        // Entrance Laser Scan (PRESERVED)
        tl.fromTo(scanLine,
            { top: "0%", opacity: 0 },
            { top: "100%", opacity: 0.8, duration: 1.2, ease: "power1.inOut" },
            "-=0.5"
        );
        tl.set(scanLine, { opacity: 0 });

        // 4. Reveal Headline & Subtitle Container (Ensures visibility on subsequent opens)
        tl.fromTo([manifestoHeadline, manifestoLead],
            { opacity: 0, y: 40, filter: "blur(10px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, stagger: 0.2, ease: "power4.out" },
            "-=0.8"
        );

        // Typewriting lead
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

        // 5. Special Reveal for Digital Vault (Blurred entrance like Title)
        const vaultModule = modal.querySelector('[data-vault-module]');
        if (vaultModule) {
            tl.fromTo(vaultModule,
                { opacity: 0, y: 50, filter: "blur(15px)" },
                { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.4, ease: "power3.out" },
                "-=0.6"
            );
        }

        // 6. Staggered Content Entrance for all other cards & headers
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

    // 4. Tech Spec Expander Logic
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

        // Target all content for fade out on close
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
        console.log("Adding click listener to BMC tile:", tile);
        tile.addEventListener('click', (e) => {
            console.log("BMC tile clicked:", tile);
            const cell = tile.closest('.bmc-cell');
            if (!cell) return;
            const isExpanded = cell.classList.contains('is-expanded');
            const expandDirectionRaw = tile.getAttribute('data-expand');
            const isMobile = window.innerWidth < 1024;
            // Force no expansion on mobile
            const expandDirection = isMobile ? 'none' : expandDirectionRaw;

            // Close all other expanded cells
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

            // Toggle this cell
            if (!isExpanded) {
                cell.classList.add('is-expanded');

                if (expandDirection !== 'none') {
                    // Get gap from CSS (1.5rem = 24px typically)
                    const gap = 24;

                    let animProps = {
                        width: `calc(200% + ${gap}px)`,
                        duration: 0.8,
                        ease: "elastic.out(1, 0.7)" // Smooth, modern, apple-styled spring effect
                    };

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

                // Animate content appearance for ALL cases (including none)
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

    // Check if desktop layout (matches the CSS media query)
    const isDesktop = window.innerWidth >= 1024;

    // Animate the neon track fill
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

    // Animate the glowing particle along the track
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

    // Animate the roadmap nodes coming in one-by-one by using wrappers as trigger to avoid node conflicts
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
