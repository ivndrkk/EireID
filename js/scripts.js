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

/* ─── How It Works (Timeline) ─────────────────── */

function initHowItWorksAnimation() {
    const section = document.querySelector('.how-it-works');
    const timeline = document.querySelector('.how-it-works__timeline');
    const progressLine = document.getElementById('timeline-progress');
    const progressDot = document.getElementById('timeline-dot');
    const steps = document.querySelectorAll('.timeline-step');

    if (!section || !timeline || !progressLine || !steps.length) return;

    function updateTimeline() {
        const timelineRect = timeline.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        const startPoint = windowHeight * 0.5;
        const timelineTop = timelineRect.top;
        const timelineHeight = timelineRect.height;

        let progress = (startPoint - timelineTop) / timelineHeight;
        progress = Math.max(0, Math.min(1, progress));

        progressLine.style.height = `${progress * 100}%`;
        progressDot.style.top = `${progress * 100}%`;

        if (progress > 0) {
            progressDot.style.opacity = '1';
        } else {
            progressDot.style.opacity = '0';
        }

        steps.forEach((step) => {
            const stepRect = step.getBoundingClientRect();
            const stepCenter = stepRect.top + stepRect.height / 2;

            if (stepCenter < startPoint) {
                step.classList.add('is-past');
                step.classList.remove('is-active');
            } else if (stepRect.top < startPoint + 50) {
                step.classList.add('is-active');
                step.classList.remove('is-past');
            } else {
                step.classList.remove('is-active', 'is-past');
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
