/**
 * js/support-search.js
 * Handles Live Search for the EireID Support Section.
 * VERSION: Offline-Compatible (no fetch, no imports to avoid CORS on file://)
 */

(function() {
    // --- CONFIGURATION ---
    const IMG_BASE_PATH = '../assets/img/faq_stickers/';
    const STICKER_IMAGES = [
        'sq1.png', 'sq2.png', 'sq3.png', 'sq4.png', 
        'sq5.png', 'sq6.png', 'sq7.png', 'sq8.png', 'sq9.png'
    ];
    const ALL_IMAGES = [...STICKER_IMAGES];

    // --- STATE ---
    let filteredData = [];
    let selectedCategories = [];

    // --- DOM ELEMENTS ---
    const searchInput = document.getElementById('support-search-input');
    const suggestionsContainer = document.querySelector('.hero__search-suggestions');
    const modal = document.getElementById('q-modal');
    const mQuestion = modal?.querySelector('.q-modal__question');
    const mAnswer = modal?.querySelector('.q-modal__answer');
    const mImage = modal?.querySelector('.q-modal__image img');

    // Filter Elements
    const filterBtn = document.getElementById('search-filter-btn');
    const filterDropdown = document.getElementById('search-filter-dropdown');
    const categoriesList = document.getElementById('filter-categories-list');

    /**
     * Helper: Smooth Open Modal
     */
    function openModalDirect(modal) {
        if (!modal) return;
        modal.style.display = 'block';
        requestAnimationFrame(() => {
            modal.classList.add('is-active');
        });
    }

    /**
     * Helper: Smooth Close Modal
     */
    function closeModalDirect(modal) {
        if (!modal) return;
        modal.classList.remove('is-active');
        setTimeout(() => {
            if (!modal.classList.contains('is-active')) {
                modal.style.display = 'none';
            }
        }, 400);
    }

    /**
     * Debounce Function
     */
    function debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    /**
     * Select a random mascot image for the modal.
     */
    function setRandomMascot() {
        if (!mImage) return;
        const randomIndex = Math.floor(Math.random() * ALL_IMAGES.length);
        const randomImg = ALL_IMAGES[randomIndex];
        mImage.src = `${IMG_BASE_PATH}${randomImg}`;
    }

    /**
     * Opens the answer modal with specific content.
     */
    function handleOpenModal(trigger) {
        if (!modal || !mQuestion || !mAnswer) return;

        const question = trigger.getAttribute('data-question');
        const answer = trigger.getAttribute('data-answer');

        // --- NEW GUARD: If already open for this question, don't re-trigger (avoids photo swap) ---
        if (modal.classList.contains('is-active') && mQuestion.textContent === question) {
            return;
        }

        mQuestion.textContent = question;
        mAnswer.textContent = answer;
        
        // Ensure standard mascot layout
        modal.classList.remove('q-modal--guideline');
        setRandomMascot();

        // Use fixed centering for consistency across scroll depths
        modal.style.left = '50%';
        modal.style.top = '50%';
        modal.style.transform = 'translate(-50%, -50%)';

        openModalDirect(modal);
    }

    /**
     * Opens the Guide modal for the guideline cards.
     */
    function handleOpenGuideModal(trigger) {
        if (!modal || !mQuestion || !mAnswer) return;

        const question = trigger.getAttribute('data-question');
        const answer = trigger.getAttribute('data-answer');

        // Guard: If already open for this question, don't re-trigger
        if (modal.classList.contains('is-active') && mQuestion.textContent === question) {
            return;
        }

        mQuestion.textContent = question;
        mAnswer.textContent = answer;

        const mStickerImg = modal.querySelector('.q-modal__sticker img');
        if (mStickerImg) {
            const randomIndex = Math.floor(Math.random() * STICKER_IMAGES.length);
            const randomImg = STICKER_IMAGES[randomIndex];
            mStickerImg.src = `${IMG_BASE_PATH}${randomImg}`;
        }

        modal.classList.add('q-modal--guideline');
        
        // Centered layout for guides
        modal.style.left = '50%';
        modal.style.top = '50%';
        modal.style.transform = 'translate(-50%, -50%)';

        openModalDirect(modal);
    }

    /**
     * Renders the filtered results.
     */
    function renderResults() {
        if (!suggestionsContainer) return;
        suggestionsContainer.innerHTML = '';

        if (filteredData.length === 0) {
            suggestionsContainer.innerHTML = '<p class="no-results" style="opacity: 0.5;">No results found reflecting your search.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        filteredData.slice(0, 6).forEach(item => {
            const button = document.createElement('button');
            button.className = 'search-suggestion-pill logo-box--glass';
            button.setAttribute('data-question', item.question);
            button.setAttribute('data-answer', item.answer);
            button.textContent = item.question;
            
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                handleOpenModal(button);
            });
            
            fragment.appendChild(button);
        });
        
        suggestionsContainer.appendChild(fragment);

        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }

    /**
     * Filter the FAQ data.
     */
    function performSearch() {
        const data = window.SUPPORT_FAQ_DATA || [];
        const query = searchInput?.value.toLowerCase().trim();
        
        filteredData = data.filter(item => {
            // Text Match
            let matchesText = true;
            if (query) {
                const inQuestion = item.question.toLowerCase().includes(query);
                const inAnswer = item.answer.toLowerCase().includes(query);
                const inKeywords = (item.keywords || []).some(kw => kw.toLowerCase().includes(query));
                matchesText = inQuestion || inAnswer || inKeywords;
            }

            // Category Match
            let matchesCategory = true;
            if (selectedCategories.length > 0) {
                matchesCategory = selectedCategories.includes(item.category);
            }

            return matchesText && matchesCategory;
        });
        
        renderResults();
    }

    /**
     * Initialize Filters: Categories extraction and list generation
     */
    function initFilters() {
        const data = window.SUPPORT_FAQ_DATA || [];
        if (!categoriesList || data.length === 0) return;

        // Extract unique categories
        const categories = [...new Set(data.map(item => item.category))].sort();

        // Render checkboxes
        categoriesList.innerHTML = '';
        categories.forEach(cat => {
            const label = document.createElement('label');
            label.className = 'filter-checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = cat;
            
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    selectedCategories.push(cat);
                } else {
                    selectedCategories = selectedCategories.filter(c => c !== cat);
                }
                performSearch();
            });

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(cat));
            categoriesList.appendChild(label);
        });

        // Toggle dropdown
        const filterBackdrop = document.getElementById('filter-backdrop');
        const searchContainer = document.querySelector('.hero__search-container');

        function toggleFilter(isOpenRequested) {
            const isOpen = isOpenRequested !== undefined ? isOpenRequested : !filterDropdown?.classList.contains('is-open');
            
            filterDropdown?.classList.toggle('is-open', isOpen);
            filterBackdrop?.classList.toggle('is-active', isOpen);
            searchContainer?.classList.toggle('has-open-filter', isOpen);
            filterBtn?.setAttribute('aria-expanded', isOpen);
        }

        filterBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFilter();
        });

        filterBackdrop?.addEventListener('click', () => {
            toggleFilter(false);
        });

        // Close dropdown on click outside
        document.addEventListener('click', (e) => {
            if (filterDropdown?.classList.contains('is-open') && !filterDropdown.contains(e.target) && e.target !== filterBtn) {
                toggleFilter(false);
            }
        });

        // ESC key logic (merged into global handler)
        window.closeAllFilters = () => toggleFilter(false);
    }

    /**
     * Initialize Support Search.
     */
    function initSupportSearch() {
        // Init Filters first
        initFilters();

        // Initial render
        performSearch();
        
        // Listeners for search input
        if (searchInput) {
            searchInput.addEventListener('input', debounce(performSearch, 300));
        }

        // Listeners for guideline cards
        const guidelineCards = document.querySelectorAll('.guideline-card');
        guidelineCards.forEach(card => {
            const triggerAction = () => {
                handleOpenGuideModal(card);
            };

            card.addEventListener('click', triggerAction);

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    triggerAction();
                }
            });
        });

        const mClose = modal?.querySelector('.q-modal__close');
        if (mClose) {
            mClose.addEventListener('click', (e) => {
                e.stopPropagation();
                closeModalDirect(modal);
            });
        }

        // Global Backdrop Closing
        document.addEventListener('click', (e) => {
            if (modal?.classList.contains('is-active') && !modal.contains(e.target)) {
                closeModalDirect(modal);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (modal?.classList.contains('is-active')) closeModalDirect(modal);
                if (window.closeAllFilters) window.closeAllFilters();
            }
        });
    }

    // Attach to DOM loading
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupportSearch);
    } else {
        initSupportSearch();
    }
})();
