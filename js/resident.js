document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.getElementById("resident-services-carousel");
    const searchInput = document.getElementById("resident-search-input");
    const prevBtn = document.getElementById("resident-carousel-prev");
    const nextBtn = document.getElementById("resident-carousel-next");
    
    // Modal Elements
    const modal = document.getElementById('service-modal');
    const modalClose = document.getElementById('sm-close');
    const modalOverlay = document.getElementById('sm-overlay');
    const mProvider = document.getElementById('sm-provider');
    const mTitle = document.getElementById('sm-title');
    const mDesc = document.getElementById('sm-desc');
    const mTags = document.getElementById('sm-tags');
    const mSimilarGrid = document.getElementById('sm-similar-grid');

    const stateContainers = document.querySelectorAll('.sm-state-container');
    const applyBtn = document.getElementById('sm-apply-btn');
    const cancelBtn = document.getElementById('sm-cancel-btn');
    const confirmBtn = document.getElementById('sm-confirm-btn');
    const closeCancelledBtn = document.getElementById('sm-close-cancelled-btn');
    const closeSuccessBtn = document.getElementById('sm-close-success-btn');
    const faceScanner = document.getElementById('sm-face-scanner');
    const loadingSpinner = document.getElementById('sm-loading-spinner');
    const step2Status = document.getElementById('sm-step2-status');

    // Cyber Card auto-updating date
    const timeDisplay = document.getElementById("cyber-updated-time");
    if (timeDisplay) {
        function formatCyberDate(date) {
            const pad = num => num.toString().padStart(2, '0');
            return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
        }
        
        timeDisplay.textContent = formatCyberDate(new Date());

        function scheduleNextUpdate() {
            const minMs = 5 * 60 * 1000;
            const maxMs = 10 * 60 * 1000;
            const randomDelay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

            setTimeout(() => {
                timeDisplay.textContent = formatCyberDate(new Date());
                scheduleNextUpdate();
            }, randomDelay);
        }

        scheduleNextUpdate();
    }

    // --- GSAP ID Card Floating Animation ---
    const cyberContainer = document.querySelector(".cyber-container");
    if (cyberContainer) {
        gsap.to(cyberContainer, {
            y: -15,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });
    }

    // --- GSAP How It Works ScrollTrigger Sequence ---
    const howItWorksSection = document.getElementById("how-it-works");
    const flowSteps = document.querySelectorAll(".how-it-works__step");
    const scrollContainer = document.querySelector("[data-scroll-container]");
    const trackSection = document.getElementById("how-it-works-track");

    if (howItWorksSection && flowSteps.length === 3 && trackSection && typeof ScrollTrigger !== 'undefined') {
        // Устанавливаем изначальные тусклые состояния
        gsap.set(flowSteps, { opacity: 0.3, scale: 0.95 });

        const mm = gsap.matchMedia();

        // Desktop: Нативный Locomotive-трек + GSAP scrub
        mm.add("(min-width: 992px)", () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: trackSection,
                    scroller: scrollContainer,
                    pin: false, 
                    start: "top top", 
                    end: "bottom bottom", 
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });

            flowSteps.forEach((step, i) => {
                const iconWrap = step.querySelector(".flow-icon");

                tl.to(step, {
                    opacity: 1,
                    scale: 1.05,
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
                    border: "1px solid rgba(164, 229, 183, 0.6)",
                    duration: 1,
                    ease: "power2.out"
                })
                .to(iconWrap, {
                    backgroundColor: "var(--color-bg-primary)",
                    color: "#000000",
                    duration: 0.5,
                    ease: "power2.out"
                }, "<");

                if (i < flowSteps.length - 1) {
                    tl.to(step, {
                        opacity: 0.5,
                        scale: 1,
                        backgroundColor: "transparent",
                        boxShadow: "none",
                        border: "1px solid transparent",
                        duration: 1,
                        ease: "power2.inOut"
                    }, "+=0.3"); 
                }
            });

            tl.to(flowSteps, {
                opacity: 1,
                scale: 1,
                backgroundColor: "transparent",
                boxShadow: "none",
                border: "1px solid transparent",
                duration: 1,
                ease: "power2.inOut"
            }, "+=0.3");
        });

        // Mobile: Обычный скролл сверху вниз, активация по одному
        mm.add("(max-width: 991px)", () => {
            flowSteps.forEach((step) => {
                const iconWrap = step.querySelector(".flow-icon");

                gsap.to(step, {
                    scrollTrigger: {
                        trigger: step,
                        scroller: scrollContainer,
                        start: "top 80%", 
                        end: "bottom 20%",
                        toggleActions: "play reverse play reverse"
                    },
                    opacity: 1,
                    scale: 1, 
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)",
                    border: "1px solid rgba(164, 229, 183, 0.6)",
                    duration: 0.5,
                    ease: "power2.out"
                });

                gsap.to(iconWrap, {
                    scrollTrigger: {
                        trigger: step,
                        scroller: scrollContainer,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play reverse play reverse"
                    },
                    backgroundColor: "var(--color-bg-primary)",
                    color: "#000000",
                    duration: 0.5,
                    ease: "power2.out"
                });
            });
        });

        // Обновляем GSAP после того как всё отрендерилось, чтобы он понял высоты
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);
    }

    if (!carousel) return;

    let residentServices = [];
    let filteredData = [];
    let randomDefaultServices = [];

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    if (typeof irishGovServicesData !== 'undefined') {
        // Filter ONLY services that are for residents
        residentServices = irishGovServicesData.filter(s => s.for && s.for.includes("Residents"));

        residentServices.forEach(s => {
            s._searchStr = `${s.name} ${s.description} ${s.provider}`.toLowerCase();
        });

        // Pick 6 random services to show by default
        pickRandomDefaults();
        
        filterData();
    } else {
        console.error("Failed to load services data structure.");
    }

    function pickRandomDefaults() {
        // Shuffle and pick 6
        let shuffled = [...residentServices].sort(() => 0.5 - Math.random());
        randomDefaultServices = shuffled.slice(0, 6);
    }

    function createCardElement(service) {
        const card = document.createElement("article");
        // MUST have data-scroll and data-scroll-class="is-revealed" so CSS opacity reveals it
        card.className = "service-card resident-card logo-box--glass is-revealed";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", service.name);
        // ensure card appears without relying on scroll trigger if user is at top
        card.style.opacity = "1";
        card.style.transform = "none";
        card.style.visibility = "visible";
        
        // Use static sizing to prevent parent containers from infinitely stretching
        card.style.flex = "0 0 280px";
        card.style.width = "280px";
        card.style.minWidth = "280px";
        card.style.scrollSnapAlign = "start";
        
        let tagsHtml = '';
        if (service.tags && Array.isArray(service.tags)) {
            tagsHtml = service.tags.map(tag => `<span class="service-card__tag">${tag}</span>`).join('');
        }
        
        const contentHtml = `
            <div class="service-card__header">
                <span class="service-card__provider">${service.provider}</span>
                <span class="iconify service-card__action-icon" data-icon="lucide:arrow-up-right" data-scroll data-scroll-direction="horizontal" data-scroll-speed="-1"></span>
            </div>
            <div class="service-card__body">
                <h3 class="service-card__title" data-scroll data-scroll-direction="vertical" data-scroll-speed="0.2">${service.name}</h3>
                <p class="service-card__desc" style="-webkit-line-clamp: 2; line-clamp: 2;">${service.description}</p>
            </div>
            <div class="service-card__footer">
                <div class="service-card__tags">
                    ${tagsHtml}
                </div>
            </div>
        `;
        
        card.innerHTML = contentHtml;
        
        const triggerAction = () => {
            card.style.transform = "scale(0.98)";
            setTimeout(() => {
                card.style.transform = "";
                openModal(service);
            }, 150);
        };

        card.addEventListener("click", triggerAction);
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                triggerAction();
            }
        });

        return card;
    }

    function renderCarousel() {
        carousel.innerHTML = "";
        
        if (filteredData.length === 0) {
            const noResults = document.createElement("p");
            noResults.textContent = "No services found matching your search.";
            noResults.style.padding = "1rem";
            carousel.appendChild(noResults);
            return;
        }

        const fragment = document.createDocumentFragment();
        filteredData.forEach((service) => {
            const card = createCardElement(service);
            fragment.appendChild(card);
        });
        carousel.appendChild(fragment);
        updateCarouselNav();

        // Update scroll stuff if available
        setTimeout(() => {
            if (window.locoScroll && typeof window.locoScroll.update === 'function') {
                window.locoScroll.update();
            }
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        }, 150);
    }

    function updateCarouselNav() {
        if (!prevBtn || !nextBtn) return;
        const currentScroll = carousel.scrollLeft;
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        
        if (currentScroll <= 0) {
            prevBtn.style.opacity = '0.5';
            prevBtn.style.pointerEvents = 'none';
        } else {
            prevBtn.style.opacity = '1';
            prevBtn.style.pointerEvents = 'auto';
        }
        
        if (currentScroll >= maxScroll - 1 || maxScroll <= 0) {
            nextBtn.style.opacity = '0.5';
            nextBtn.style.pointerEvents = 'none';
        } else {
            nextBtn.style.opacity = '1';
            nextBtn.style.pointerEvents = 'auto';
        }
    }

    // Attach scroll event to dynamically handle fade of prev/next buttons
    carousel.addEventListener('scroll', debounce(updateCarouselNav, 50));

    function shiftCarousel(direction) {
        const cards = carousel.querySelectorAll('.service-card');
        if (cards.length === 0) return;
        
        // Include gap in width calculation (approx 16px)
        const cardWidth = cards[0].offsetWidth + 16; 
        const isMobile = window.innerWidth < 768;
        const visibleItems = isMobile ? 1 : 3;
        
        // Find current nearest index using scrollLeft
        const currentScroll = carousel.scrollLeft;
        let currentIndex = Math.round(currentScroll / cardWidth);
        const totalItems = filteredData.length;
        
        if (direction === 'next') {
            currentIndex += visibleItems;
            if (currentIndex > totalItems - visibleItems) {
                currentIndex = totalItems - visibleItems;
            }
        } else {
            currentIndex -= visibleItems;
            if (currentIndex < 0) currentIndex = 0;
        }

        const targetOffset = currentIndex * cardWidth;
        
        // Move container using smooth scrolling
        carousel.scrollTo({ left: targetOffset, behavior: 'smooth' });
        
        // Removed buggy Locomotive vertical translation
        
        setTimeout(updateCarouselNav, 400);

        // Recalculate locoScroll to register offsets for parallax components
        setTimeout(() => {
            if (window.locoScroll && typeof window.locoScroll.update === 'function') {
                window.locoScroll.update();
            }
        }, 400);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => shiftCarousel('prev'));
    if (nextBtn) nextBtn.addEventListener('click', () => shiftCarousel('next'));

    function filterData() {
        if (!searchInput) return;
        
        const searchVal = searchInput.value.toLowerCase().trim();

        if (!searchVal) {
            // Pick 6 random default cards if nothing is typed
            // (The user said: pick random services from json each time)
            pickRandomDefaults();
            filteredData = randomDefaultServices;
        } else {
            // Filter
            filteredData = residentServices.filter(service => {
                return service._searchStr.includes(searchVal);
            });
        }

        renderCarousel();
    }

    if (searchInput) {
        searchInput.addEventListener("input", debounce(filterData, 250));
    }

    // Modal logic (copied from allservices.js to provide exactly the same functionality)
    function switchModalState(stateId) {
        stateContainers.forEach(container => {
            container.classList.remove('is-active');
            if (container.id === stateId) {
                container.classList.add('is-active');
            }
        });
        
        const modalContent = document.querySelector('.service-modal__content');
        if (modalContent) modalContent.scrollTop = 0;
    }

    function resetModal() {
        switchModalState('sm-content-details');
        if (faceScanner) faceScanner.style.display = 'flex';
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (step2Status) step2Status.textContent = 'Verifying identity...';
    }

    function startFaceVerification() {
        switchModalState('sm-content-step2');
        setTimeout(() => {
            if (faceScanner) faceScanner.style.display = 'none';
            if (loadingSpinner) loadingSpinner.style.display = 'block';
            if (step2Status) step2Status.textContent = 'Processing application...';
            
            setTimeout(() => {
                switchModalState('sm-content-success');
            }, 5000);
            
        }, 3000);
    }

    function openModal(service) {
        resetModal();
        if (mProvider) mProvider.textContent = service.provider;
        if (mTitle) mTitle.textContent = service.name;
        if (mDesc) mDesc.textContent = service.description;

        if (mTags) {
            const tagsHtml = (service.tags || []).map(tag => `<span class="service-card__tag">${tag}</span>`).join('');
            mTags.innerHTML = tagsHtml;
        }

        if (mSimilarGrid) {
            let similar = residentServices.filter(s => {
                if (s.id === service.id) return false;
                const matchesProvider = s.provider === service.provider;
                const matchesTags = (s.tags || []).some(t => (service.tags || []).includes(t));
                return matchesProvider || matchesTags;
            });
            
            if (similar.length < 3) {
                const others = residentServices.filter(s => s.id !== service.id && !similar.includes(s));
                similar = [...similar, ...others].slice(0, 3);
            } else {
                similar.sort(() => 0.5 - Math.random());
                similar = similar.slice(0, 3);
            }

            mSimilarGrid.innerHTML = '';
            similar.forEach(s => {
                const scard = document.createElement('article');
                scard.className = 'service-card logo-box--glass';
                scard.style.cursor = 'pointer';
                scard.style.minHeight = '140px';
                scard.innerHTML = `
                    <div class="service-card__body">
                        <h3 class="service-card__title" style="font-size: 1.1rem; margin-bottom: 8px;">${s.name}</h3>
                        <p class="service-card__desc" style="-webkit-line-clamp: 2; line-clamp: 2; font-size: 0.9rem;">${s.description}</p>
                    </div>
                `;
                scard.addEventListener('click', () => {
                    openModal(s);
                    const mc = document.querySelector('.service-modal__content');
                    if (mc) mc.scrollTop = 0;
                });
                mSimilarGrid.appendChild(scard);
            });
        }

        if (modal) {
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            setTimeout(resetModal, 300);
        }
    }

    if (applyBtn) applyBtn.addEventListener('click', () => switchModalState('sm-content-step1'));
    if (cancelBtn) cancelBtn.addEventListener('click', () => switchModalState('sm-content-cancelled'));
    if (confirmBtn) confirmBtn.addEventListener('click', () => startFaceVerification());
    if (closeCancelledBtn) closeCancelledBtn.addEventListener('click', closeModal);
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeModal);

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
});
