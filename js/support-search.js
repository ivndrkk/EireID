
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
    let selectedCategories = new Set();
    let lastActiveElement = null;

    // --- DOM ELEMENTS ---
    const searchInput = document.getElementById('support-search-input');
    const suggestionsContainer = document.querySelector('.hero__search-suggestions');
    const modal = document.getElementById('q-modal');
    const mQuestion = modal?.querySelector('.q-modal__question');
    const mAnswer = modal?.querySelector('.q-modal__answer');
    const mImage = modal?.querySelector('.q-modal__image img');

    const filterBtn = document.getElementById('search-filter-btn');
    const filterDropdown = document.getElementById('search-filter-dropdown');
    const categoriesList = document.getElementById('filter-categories-list');

    function openModalDirect(modal) {
        if (!modal) return;
        lastActiveElement = document.activeElement;
        modal.style.display = 'block';
        requestAnimationFrame(() => {
            modal.classList.add('is-active');
            const closeBtn = modal.querySelector('.q-modal__close');
            if (closeBtn) {
                setTimeout(() => closeBtn.focus(), 100);
            }
        });
    }

    function closeModalDirect(modal) {
        if (!modal) return;
        modal.classList.remove('is-active');
        setTimeout(() => {
            if (!modal.classList.contains('is-active')) {
                modal.style.display = 'none';
                if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
                    lastActiveElement.focus();
                }
            }
        }, 400);
    }

    function debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    function setRandomMascot() {
        if (!mImage) return;
        const randomIndex = Math.floor(Math.random() * ALL_IMAGES.length);
        const randomImg = ALL_IMAGES[randomIndex];
        mImage.src = `${IMG_BASE_PATH}${randomImg}`;
    }

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
        
        modal.classList.remove('q-modal--guideline');
        setRandomMascot();

        modal.style.left = '50%';
        modal.style.top = '50%';
        modal.style.transform = 'translate(-50%, -50%)';

        openModalDirect(modal);
    }

    function handleOpenGuideModal(trigger) {
        if (!modal || !mQuestion || !mAnswer) return;

        const question = trigger.getAttribute('data-question');
        const answer = trigger.getAttribute('data-answer');

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
        
        modal.style.left = '50%';
        modal.style.top = '50%';
        modal.style.transform = 'translate(-50%, -50%)';

        openModalDirect(modal);
    }

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

    function performSearch() {
        const data = window.SUPPORT_FAQ_DATA || [];
        const query = searchInput?.value.toLowerCase().trim();
        const hasFilters = selectedCategories.size > 0;
        
        filteredData = data.filter(item => {
            const matchesText = !query || item._searchStr.includes(query);
            const matchesCategory = !hasFilters || selectedCategories.has(item.category);
            return matchesText && matchesCategory;
        });
        
        renderResults();
    }

    function initFilters() {
        const data = window.SUPPORT_FAQ_DATA || [];
        if (!categoriesList || data.length === 0) return;

        const categories = [...new Set(data.map(item => item.category))].sort();

        categoriesList.innerHTML = '';
        categories.forEach(cat => {
            const label = document.createElement('label');
            label.className = 'filter-checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = cat;
            
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    selectedCategories.add(cat);
                } else {
                    selectedCategories.delete(cat);
                }
                performSearch();
            });

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(cat));
            categoriesList.appendChild(label);
        });

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

        document.addEventListener('click', (e) => {
            if (filterDropdown?.classList.contains('is-open') && !filterDropdown.contains(e.target) && e.target !== filterBtn) {
                toggleFilter(false);
            }
        });

        window.closeAllFilters = () => toggleFilter(false);
    }

    function initSupportSearch() {
        const data = window.SUPPORT_FAQ_DATA || [];
        data.forEach(item => {
            item._searchStr = `${item.question} ${item.answer} ${(item.keywords || []).join(' ')}`.toLowerCase();
        });

        initFilters();

        performSearch();
        
        if (searchInput) {
            searchInput.addEventListener('input', debounce(performSearch, 300));
        }

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

        document.addEventListener('click', (e) => {
            if (modal?.classList.contains('is-active') && !modal.contains(e.target)) {
                closeModalDirect(modal);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && modal?.classList.contains('is-active')) {
                const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusableElements.length > 0) {
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
            }
            if (e.key === 'Escape') {
                if (modal?.classList.contains('is-active')) closeModalDirect(modal);
                if (window.closeAllFilters) window.closeAllFilters();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupportSearch);
    } else {
        initSupportSearch();
    }
})();
