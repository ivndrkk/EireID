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

    // --- DOM ELEMENTS ---
    const searchInput = document.getElementById('support-search-input');
    const suggestionsContainer = document.querySelector('.hero__search-suggestions');
    const modal = document.getElementById('q-modal');
    const mQuestion = modal?.querySelector('.q-modal__question');
    const mAnswer = modal?.querySelector('.q-modal__answer');
    const mImage = modal?.querySelector('.q-modal__image img');

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
        setRandomMascot();

        if (suggestionsContainer) {
            const pillRect = trigger.getBoundingClientRect();
            const containerRect = suggestionsContainer.getBoundingClientRect();
            
            // Positioning logic mirroring the CSS transform
            const left = pillRect.left - containerRect.left + (pillRect.width / 2);
            const top = pillRect.bottom - containerRect.top + 100;
            
            modal.style.left = `${left}px`;
            modal.style.top = `${top}px`;
        }

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
        // Access global window.SUPPORT_FAQ_DATA (provided by data/support_faq.js)
        const data = window.SUPPORT_FAQ_DATA || [];
        const query = searchInput?.value.toLowerCase().trim();
        
        if (!query) {
            filteredData = data.slice(0, 6);
        } else {
            filteredData = data.filter(item => {
                const inQuestion = item.question.toLowerCase().includes(query);
                const inAnswer = item.answer.toLowerCase().includes(query);
                const inKeywords = (item.keywords || []).some(kw => kw.toLowerCase().includes(query));
                return inQuestion || inAnswer || inKeywords;
            });
        }
        
        renderResults();
    }

    /**
     * Initialize Support Search.
     */
    function initSupportSearch() {
        // Initial render
        performSearch();
        
        // Listeners
        if (searchInput) {
            searchInput.addEventListener('input', debounce(performSearch, 300));
        }

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
            if (e.key === 'Escape' && modal?.classList.contains('is-active')) {
                closeModalDirect(modal);
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
