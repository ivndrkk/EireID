
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
    let lastFocusedElement = null;

    // --- DOM ELEMENTS (Assigned in init) ---
    let searchInput, suggestionsContainer, modal, mQuestion, mAnswer, mImage;
    let filterBtn, filterDropdown, categoriesList;

    function openModalDirect(modalEl) {
        if (!modalEl) return;
        lastFocusedElement = document.activeElement;
        modalEl.style.display = 'block';
        modalEl.setAttribute('aria-hidden', 'false');

        requestAnimationFrame(() => {
            modalEl.classList.add('is-active');
            const closeBtn = modalEl.querySelector('.q-modal__close');
            if (closeBtn) {
                setTimeout(() => closeBtn.focus(), 100);
            }
        });
    }

    function closeModalDirect(modalEl) {
        if (!modalEl) return;
        modalEl.classList.remove('is-active');
        modalEl.setAttribute('aria-hidden', 'true');

        setTimeout(() => {
            if (!modalEl.classList.contains('is-active')) {
                modalEl.style.display = 'none';
                if (lastFocusedElement) {
                    lastFocusedElement.focus();
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
        searchInput = document.getElementById('support-search-input');
        suggestionsContainer = document.querySelector('.hero__search-suggestions');
        modal = document.getElementById('q-modal');
        mQuestion = modal?.querySelector('.q-modal__question');
        mAnswer = modal?.querySelector('.q-modal__answer');
        mImage = modal?.querySelector('.q-modal__image img');

        filterBtn = document.getElementById('search-filter-btn');
        filterDropdown = document.getElementById('search-filter-dropdown');
        categoriesList = document.getElementById('filter-categories-list');

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
            if (e.key === 'Escape') {
                if (modal?.classList.contains('is-active')) closeModalDirect(modal);
                if (window.closeAllFilters) window.closeAllFilters();
            }

            if (e.key === 'Tab' && modal && modal.classList.contains('is-active')) {
                const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusable.length === 0) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupportSearch);
    } else {
        initSupportSearch();
    }
})();
