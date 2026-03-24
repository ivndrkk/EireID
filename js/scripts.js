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
    const faqItems = document.querySelectorAll('.faq__item');
    
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq__question');
        
        questionBtn.addEventListener('click', () => {
            const isExpanded = questionBtn.getAttribute('aria-expanded') === 'true';
            
            // Close all items first
            faqItems.forEach(otherItem => {
                otherItem.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
                otherItem.classList.remove('is-active');
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
