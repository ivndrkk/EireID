/**
 * business.js
 * Contains logic for:
 * 1. Hero Graph Animation (Canvas)
 * 2. Expanding Industry Grid (Section 4)
 * 3. Business Sticky Tabs (Section 3) - standalone rewrite of resident-tabs logic
 */

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

        window.addEventListener('resize', () => {
            width = canvas.width = canvas.parentElement.clientWidth;
            height = canvas.height = canvas.parentElement.clientHeight * 0.7;
            drawGraph(1); // Redraw at 100% on resize
        });

        // Mock data points curving upwards
        const points = [
            { x: 0, y: 0.1 },
            { x: 0.2, y: 0.15 },
            { x: 0.4, y: 0.3 },
            { x: 0.6, y: 0.45 },
            { x: 0.8, y: 0.7 },
            { x: 1, y: 0.95 }
        ];

        let animationProgress = 0;
        let animationRequestId;

        function drawGraph(progress) {
            ctx.clearRect(0, 0, width, height);

            // Create gradient for fill
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(164, 229, 183, 0.4)'); // brand green
            gradient.addColorStop(1, 'rgba(164, 229, 183, 0)');

            ctx.beginPath();
            ctx.moveTo(0, height);

            let lastX = 0;
            let lastY = height - (points[0].y * height);

            ctx.lineTo(lastX, lastY);

            const drawnPoints = points.slice(1).map(p => ({
                x: p.x * width * progress,
                y: height - (p.y * height)
            }));

            // Draw smooth curve using bezier curves
            for (let i = 0; i < drawnPoints.length; i++) {
                const pt = drawnPoints[i];
                const cp1x = lastX + (pt.x - lastX) / 2;
                const cp1y = lastY;
                const cp2x = lastX + (pt.x - lastX) / 2;
                const cp2y = pt.y;

                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pt.x, pt.y);
                
                lastX = pt.x;
                lastY = pt.y;
            }

            // Fill area
            ctx.lineTo(lastX, height);
            ctx.lineTo(0, height);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw line
            ctx.beginPath();
            lastX = 0;
            lastY = height - (points[0].y * height);
            ctx.moveTo(lastX, lastY);

            for (let i = 0; i < drawnPoints.length; i++) {
                const pt = drawnPoints[i];
                const cp1x = lastX + (pt.x - lastX) / 2;
                const cp1y = lastY;
                const cp2x = lastX + (pt.x - lastX) / 2;
                const cp2y = pt.y;

                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pt.x, pt.y);
                
                lastX = pt.x;
                lastY = pt.y;
            }

            ctx.lineWidth = 4;
            ctx.strokeStyle = '#a4e5b7'; // brand green
            ctx.stroke();

            // Animate value text
            const valueSpan = document.getElementById('hero-graph-value');
            if (valueSpan) {
                const maxVal = 24.5; // M
                const currentVal = (maxVal * progress).toFixed(1);
                valueSpan.innerText = `${currentVal}M+`;
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

        // Trigger animation when canvas comes into view
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
    // 2. Expanding Industry Grid (Section 4)
    // ─────────────────────────────────────────────────────────────
    function initIndustryGrid() {
        const tiles = document.querySelectorAll('.industry-tile');
        if (tiles.length === 0) return;

        tiles.forEach(tile => {
            tile.addEventListener('click', function () {
                const wasExpanded = this.classList.contains('is-expanded');

                // Collapse all
                tiles.forEach(t => t.classList.remove('is-expanded'));

                // If the clicked one wasn't expanded, expand it
                if (!wasExpanded) {
                    this.classList.add('is-expanded');
                    
                    // Optional: Scroll tile into view if necessary
                    setTimeout(() => {
                        const top = this.getBoundingClientRect().top;
                        if (top < 100 && window.locoScroll) {
                            window.locoScroll.scrollTo(this, { offset: -100, duration: 600 });
                        }
                    }, 400); // Wait for CSS transition
                }
            });
        });
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
                    // If visual is a video, ensure it plays
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

            const scrolledPast = -rect.top + (viewportH * 0.05); // 5vh offset to match sticky top
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
                        // Scroll to position
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

        // Connect scroll events smoothly depending on Locomotive availability
        if (window.locoScroll) {
            window.locoScroll.on('scroll', handleScroll);
            if (window.ScrollTrigger) {
                window.ScrollTrigger.addEventListener("refresh", handleScroll);
            }
        } else {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        dotClickHandler();
        handleScroll(); // Init Check

        // Mobile swipe logic
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

    // Initialize all logic
    window.addEventListener('DOMContentLoaded', () => {
        initHeroGraph();
        initIndustryGrid();
        
        // Timeout ensures Locomotive scroll is attached properly by scripts.js
        setTimeout(initBusinessTabs, 200); 
    });

})();
