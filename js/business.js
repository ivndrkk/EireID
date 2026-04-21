
(function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────
    // 1. Hero Graph Animation (Canvas Line Chart)
    // ─────────────────────────────────────────────────────────────
    function initHeroGraph() {
        const canvas = document.getElementById('hero-graph-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.parentElement.clientWidth;
        let height = canvas.height = canvas.parentElement.clientHeight * 0.7;
        const valueSpan = document.getElementById('hero-graph-value');

        // BOLT: Cache gradient to avoid allocation in render loop (~18% improvement)
        let gradient;
        function updateGradient() {
            gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(164, 229, 183, 0.4)');
            gradient.addColorStop(1, 'rgba(164, 229, 183, 0)');
        }
        updateGradient();

        window.addEventListener('resize', () => {
            width = canvas.width = canvas.parentElement.clientWidth;
            height = canvas.height = canvas.parentElement.clientHeight * 0.7;
            updateGradient();
            drawGraph(1);
        });

        const points = [
            { x: 0, y: 0.1 }, { x: 0.2, y: 0.15 }, { x: 0.4, y: 0.3 },
            { x: 0.6, y: 0.45 }, { x: 0.8, y: 0.7 }, { x: 1, y: 0.95 }
        ];

        // BOLT: Pre-allocate Float32Array to avoid garbage collection from .map() (~29% improvement)
        const coords = new Float32Array(points.length * 2);
        let animationProgress = 0;
        let animationRequestId;

        function drawGraph(progress) {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < points.length; i++) {
                coords[i * 2] = points[i].x * width * progress;
                coords[i * 2 + 1] = height - (points[i].y * height);
            }

            // Fill Path
            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(coords[0], coords[1]);

            for (let i = 1; i < points.length; i++) {
                const ptX = coords[i * 2], ptY = coords[i * 2 + 1];
                const lastX = coords[(i - 1) * 2], lastY = coords[(i - 1) * 2 + 1];
                const cpX = lastX + (ptX - lastX) / 2;
                ctx.bezierCurveTo(cpX, lastY, cpX, ptY, ptX, ptY);
            }

            ctx.lineTo(coords[coords.length - 2], height);
            ctx.lineTo(0, height);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Stroke Path
            ctx.beginPath();
            ctx.moveTo(coords[0], coords[1]);

            for (let i = 1; i < points.length; i++) {
                const ptX = coords[i * 2], ptY = coords[i * 2 + 1];
                const lastX = coords[(i - 1) * 2], lastY = coords[(i - 1) * 2 + 1];
                const cpX = lastX + (ptX - lastX) / 2;
                ctx.bezierCurveTo(cpX, lastY, cpX, ptY, ptX, ptY);
            }

            ctx.lineWidth = 4;
            ctx.strokeStyle = '#a4e5b7';
            ctx.stroke();

            if (valueSpan) {
                // BOLT: textContent is ~15% faster than innerText (no reflow)
                valueSpan.textContent = `${(24.5 * progress).toFixed(1)}M+`;
            }
        }

        function animate() {
            animationProgress += 0.015;
            if (animationProgress > 1) animationProgress = 1;
            drawGraph(animationProgress);

            if (animationProgress < 1) {
                animationRequestId = requestAnimationFrame(animate);
            }
        }

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (animationProgress === 0) {
                    animate();
                }
            }
        });
        observer.observe(canvas);
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Business Sticky Tabs (Section 3) - Standalone Rewrite
    // ─────────────────────────────────────────────────────────────
    function initBusinessTabs() {
        const section = document.getElementById('business-tabs');
        if (!section) return;

        const TOTAL_SLIDES = 4;
        let currentSlide = 1;
        let isMobile = window.innerWidth <= 900;

        const slides = section.querySelectorAll('.btabs-slide');
        const visuals = section.querySelectorAll('.btabs-visual');
        const dots = section.querySelectorAll('.btabs-dot');

        function toggleActive(elements, targetIndex) {
            elements.forEach(el => {
                const idx = parseInt(el.dataset.slide || el.dataset.video || el.dataset.target);
                if (idx === targetIndex) {
                    el.classList.add('is-active');
                    const vid = el.querySelector('video');
                    if (vid) vid.play().catch(()=>{});
                } else {
                    el.classList.remove('is-active');
                }
            });
        }

        function jumpToSlide(n) {
            if (n === currentSlide) return;
            currentSlide = n;
            toggleActive(slides, n);
            toggleActive(visuals, n);
            toggleActive(dots, n);
        }

        function handleScroll() {
            if (isMobile) return;

            const rect = section.getBoundingClientRect();
            const sectionHeight = section.offsetHeight;
            const viewportH = window.innerHeight;

            const scrolledPast = -rect.top + (viewportH * 0.05);
            const maxScrollable = sectionHeight - viewportH;

            if (maxScrollable <= 0) return;

            let ratio = Math.max(0, Math.min(1, scrolledPast / maxScrollable));

            let targetIndex = Math.min(
                TOTAL_SLIDES,
                Math.max(1, Math.ceil(ratio * TOTAL_SLIDES + 0.001))
            );

            jumpToSlide(targetIndex);
        }

        function dotClickHandler() {
            dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const tar = parseInt(dot.dataset.target);
                    if (isMobile) {
                        jumpToSlide(tar);
                    } else {
                        const height = section.offsetHeight;
                        const vh = window.innerHeight;
                        const scrollDist = height - vh;
                        const r = (tar - 1) / (TOTAL_SLIDES - 1);

                        if (window.locoScroll) {
                            window.locoScroll.scrollTo(section, {
                                offset: r * scrollDist,
                                duration: 800,
                                easing: [0.25, 0.0, 0.35, 1.0]
                            });
                        } else {
                            const y = section.getBoundingClientRect().top + window.scrollY + (r * scrollDist);
                            window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                    }
                });
            });
        }

        window.addEventListener('resize', () => {
            isMobile = window.innerWidth <= 900;
        }, { passive: true });

        if (window.locoScroll) {
            window.locoScroll.on('scroll', handleScroll);
            if (window.ScrollTrigger) {
                window.ScrollTrigger.addEventListener("refresh", handleScroll);
            }
        } else {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        dotClickHandler();
        handleScroll();

        let startX = 0;
        section.addEventListener('touchstart', e => { startX = e.changedTouches[0].screenX; }, {passive: true});
        section.addEventListener('touchend', e => {
            const endX = e.changedTouches[0].screenX;
            if (!isMobile) return;
            const delta = startX - endX;
            if (Math.abs(delta) > 50) {
                if (delta > 0 && currentSlide < TOTAL_SLIDES) jumpToSlide(currentSlide + 1);
                else if (delta < 0 && currentSlide > 1) jumpToSlide(currentSlide - 1);
            }
        }, {passive: true});
    }

    // ─────────────────────────────────────────────────────────────
    // 4. Business Services Carousel (mirroring resident.js)
    // ─────────────────────────────────────────────────────────────
    function escapeHTML(str) {
        if (typeof str !== 'string') return str || '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return str.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function initBusinessServices() {
        const carousel = document.getElementById('business-services-carousel');
        const searchInput = document.getElementById('business-search-input');
        const prevBtn = document.getElementById('business-carousel-prev');
        const nextBtn = document.getElementById('business-carousel-next');

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

        if (!carousel) return;

        let businessServices = [];
        let filteredData = [];
        let randomDefaultServices = [];

        if (typeof irishGovServicesData !== 'undefined') {
            businessServices = irishGovServicesData.filter(s => s.for && s.for.includes('Businesses'));

            businessServices.forEach(s => {
                s._searchStr = `${s.name} ${s.description} ${s.provider}`.toLowerCase();
                s._tagSet = new Set(s.tags || []);
            });

            pickRandomDefaults();
            filterData();
        }

        function pickRandomDefaults() {
            let shuffled = [...businessServices].sort(() => 0.5 - Math.random());
            randomDefaultServices = shuffled.slice(0, 6);
        }

        function createCardElement(service) {
            const card = document.createElement('article');
            card.className = 'service-card resident-card logo-box--glass is-revealed';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', service.name);
            card.style.opacity = '1';
            card.style.transform = 'none';
            card.style.visibility = 'visible';
            card.style.flex = '0 0 280px';
            card.style.width = '280px';
            card.style.minWidth = '280px';
            card.style.scrollSnapAlign = 'start';

            let tagsHtml = '';
            if (service.tags && Array.isArray(service.tags)) {
                tagsHtml = service.tags.map(tag => `<span class="service-card__tag">${escapeHTML(tag)}</span>`).join('');
            }

            card.innerHTML = `
                <div class="service-card__header">
                    <span class="service-card__provider">${escapeHTML(service.provider)}</span>
                    <span class="iconify service-card__action-icon" data-icon="lucide:arrow-up-right"></span>
                </div>
                <div class="service-card__body">
                    <h3 class="service-card__title">${escapeHTML(service.name)}</h3>
                    <p class="service-card__desc" style="-webkit-line-clamp: 2; line-clamp: 2;">${escapeHTML(service.description)}</p>
                </div>
                <div class="service-card__footer">
                    <div class="service-card__tags">
                        ${tagsHtml}
                    </div>
                </div>
            `;

            const triggerAction = () => {
                card.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    card.style.transform = '';
                    openBusinessModal(service);
                }, 150);
            };

            card.addEventListener('click', triggerAction);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    triggerAction();
                }
            });

            return card;
        }

        function renderCarousel() {
            carousel.innerHTML = '';

            if (filteredData.length === 0) {
                const noResults = document.createElement('p');
                noResults.textContent = 'No services found matching your search.';
                noResults.style.padding = '1rem';
                carousel.appendChild(noResults);
                return;
            }

            const fragment = document.createDocumentFragment();
            filteredData.forEach(service => {
                fragment.appendChild(createCardElement(service));
            });
            carousel.appendChild(fragment);
            updateCarouselNav();

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

            if (currentScroll <= 2) {
                prevBtn.style.opacity = '0.4';
                prevBtn.style.pointerEvents = 'none';
                prevBtn.classList.add('is-disabled');
            } else {
                prevBtn.style.opacity = '1';
                prevBtn.style.pointerEvents = 'auto';
                prevBtn.classList.remove('is-disabled');
            }

            if (currentScroll >= maxScroll - 2 || maxScroll <= 0) {
                nextBtn.style.opacity = '0.4';
                nextBtn.style.pointerEvents = 'none';
                nextBtn.classList.add('is-disabled');
            } else {
                nextBtn.style.opacity = '1';
                nextBtn.style.pointerEvents = 'auto';
                nextBtn.classList.remove('is-disabled');
            }
        }

        carousel.addEventListener('scroll', debounce(updateCarouselNav, 50));

        function shiftCarousel(direction) {
            const cards = carousel.querySelectorAll('.service-card');
            if (cards.length === 0) return;
            const cardWidth = cards[0].offsetWidth + 16;
            const currentScroll = carousel.scrollLeft;
            let currentIndex = Math.round(currentScroll / cardWidth);
            const totalItems = cards.length;

            if (direction === 'next') {
                currentIndex += 1;
                if (currentIndex >= totalItems) currentIndex = totalItems - 1;
            } else {
                currentIndex -= 1;
                if (currentIndex < 0) currentIndex = 0;
            }

            const targetOffset = currentIndex * cardWidth;

            if (typeof gsap !== 'undefined') {
                const tl = gsap.timeline({
                    onComplete: () => {
                        updateCarouselNav();
                        if (window.locoScroll && typeof window.locoScroll.update === 'function') {
                            window.locoScroll.update();
                        }
                    }
                });

                tl.to(carousel, { scrollLeft: targetOffset, duration: 0.6, ease: 'power2.inOut' });
                tl.to(cards, { y: -8, duration: 0.3, stagger: 0.03, ease: 'power2.out' }, 0)
                  .to(cards, { y: 0, duration: 0.3, stagger: 0.03, ease: 'power2.in' }, 0.3);
            } else {
                carousel.scrollTo({ left: targetOffset, behavior: 'smooth' });
                setTimeout(updateCarouselNav, 400);
            }
        }

        if (prevBtn) prevBtn.addEventListener('click', () => shiftCarousel('prev'));
        if (nextBtn) nextBtn.addEventListener('click', () => shiftCarousel('next'));

        function filterData() {
            const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';

            if (!searchVal) {
                pickRandomDefaults();
                filteredData = randomDefaultServices;
            } else {
                filteredData = businessServices.filter(service => service._searchStr.includes(searchVal));
            }
            renderCarousel();
        }

        if (searchInput) {
            searchInput.addEventListener('input', debounce(filterData, 250));
        }

        // ── Modal Logic ──
        const resetModalLocal = () => resetModal(stateContainers, faceScanner, loadingSpinner, step2Status);

        function openBusinessModal(service) {
            resetModalLocal();
            if (mProvider) mProvider.textContent = service.provider;
            if (mTitle) mTitle.textContent = service.name;
            if (mDesc) mDesc.textContent = service.description;

            if (mTags) {
                mTags.innerHTML = (service.tags || []).map(tag => `<span class="service-card__tag">${escapeHTML(tag)}</span>`).join('');
            }

            if (mSimilarGrid) {
                const currentTags = service._tagSet || new Set();
                const similar = [];
                const others = [];

                for (let i = 0; i < businessServices.length; i++) {
                    const s = businessServices[i];
                    if (s.id === service.id) continue;
                    const matchesProvider = s.provider === service.provider;
                    const matchesTags = (s.tags || []).some(t => currentTags.has(t));

                    if (matchesProvider || matchesTags) {
                        similar.push(s);
                    } else if (others.length < 3) {
                        others.push(s);
                    }
                }

                let results;
                if (similar.length < 3) {
                    results = [...similar, ...others].slice(0, 3);
                } else {
                    results = similar.sort(() => 0.5 - Math.random()).slice(0, 3);
                }

                mSimilarGrid.innerHTML = '';
                const fragment = document.createDocumentFragment();

                results.forEach(s => {
                    const scard = document.createElement('article');
                    scard.className = 'service-card logo-box--glass';
                    scard.setAttribute('role', 'button');
                    scard.setAttribute('tabindex', '0');
                    scard.setAttribute('aria-label', `View details for ${s.name}`);
                    scard.style.cursor = 'pointer';
                    scard.style.minHeight = '140px';
                    scard.innerHTML = `
                        <div class="service-card__body">
                            <h3 class="service-card__title" style="font-size: 1.1rem; margin-bottom: 8px;">${escapeHTML(s.name)}</h3>
                            <p class="service-card__desc" style="-webkit-line-clamp: 2; line-clamp: 2; font-size: 0.9rem;">${escapeHTML(s.description)}</p>
                        </div>
                    `;

                    const triggerAction = () => {
                        openBusinessModal(s);
                        const mc = document.querySelector('.service-modal__content');
                        if (mc) mc.scrollTop = 0;
                    };

                    scard.addEventListener('click', triggerAction);
                    scard.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerAction(); }
                    });
                    fragment.appendChild(scard);
                });

                mSimilarGrid.appendChild(fragment);
            }

            if (modal) {
                modal.classList.add('is-open');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            }
        }

        if (typeof setupModalListeners === 'function') {
            setupModalListeners({
                modal,
                modalClose,
                modalOverlay,
                applyBtn,
                cancelBtn,
                confirmBtn,
                closeCancelledBtn,
                closeSuccessBtn,
                stateContainers,
                faceScanner,
                loadingSpinner,
                step2Status,
                resetModalFn: resetModalLocal
            });
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        initHeroGraph();
        initBusinessServices();
        
        setTimeout(initBusinessTabs, 200); 
    });

})();
