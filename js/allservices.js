/**
 * js/allservices.js
 * Handles rendering and filtering for the Services Library.
 * VERSION: Offline-Compatible (no modules to avoid CORS on file://)
 */

(function() {
    // --- HELPER: HTML ESCAPING ---
    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Debounces a function call.
     */
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

    // --- MODAL HELPERS (re-implemented to avoid imports) ---
    function resetModalDirect(stateContainers, faceScanner, loadingSpinner, step2Status) {
        if (stateContainers) {
            stateContainers.forEach(container => {
                container.classList.remove('is-active');
                if (container.id === 'sm-content-details') {
                    container.classList.add('is-active');
                }
            });
        }
        if (faceScanner) faceScanner.classList.remove('is-scanning', 'is-loading', 'is-success');
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (step2Status) step2Status.textContent = 'Verifying identity...';
    }

    function setupModalListenersDirect(config) {
        const { modal, modalClose, modalOverlay, applyBtn, cancelBtn, confirmBtn, 
                closeCancelledBtn, closeSuccessBtn, stateContainers, 
                faceScanner, loadingSpinner, step2Status, resetModalFn } = config;

        const closeModal = () => {
            if (!modal) return;
            modal.classList.remove('is-active', 'is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            setTimeout(resetModalFn, 300);
        };

        const switchState = (targetId) => {
            if (!stateContainers) return;
            stateContainers.forEach(container => {
                container.classList.remove('is-active');
                if (container.id === targetId) {
                    container.classList.add('is-active');
                }
            });
        };

        if (modalClose) modalClose.addEventListener('click', closeModal);
        if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

        if (applyBtn) {
            applyBtn.addEventListener('click', () => switchState('sm-content-step1'));
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => switchState('sm-content-details'));
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                switchState('sm-content-step2');
                if (faceScanner) faceScanner.classList.add('is-scanning');
                
                setTimeout(() => {
                    if (faceScanner) {
                        faceScanner.classList.remove('is-scanning');
                        faceScanner.classList.add('is-loading');
                    }
                    if (loadingSpinner) loadingSpinner.style.display = 'block';
                    if (step2Status) step2Status.textContent = 'Analyzing biometrics...';

                    setTimeout(() => {
                        if (loadingSpinner) loadingSpinner.style.display = 'none';
                        if (faceScanner) {
                            faceScanner.classList.remove('is-loading');
                            faceScanner.classList.add('is-success');
                        }
                        if (step2Status) step2Status.textContent = 'Identity Verified';

                        setTimeout(() => switchState('sm-content-success'), 800);
                    }, 2000);
                }, 2500);
            });
        }

        if (closeCancelledBtn) closeCancelledBtn.addEventListener('click', closeModal);
        if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeModal);
    }

    document.addEventListener("DOMContentLoaded", () => {
        const grid = document.getElementById("services-grid");
        const searchInput = document.getElementById("search-input");
        const noResults = document.getElementById("no-results");
        const paginationContainer = document.getElementById('services-pagination');
        const loadMoreBtn = document.getElementById('load-more-btn');
        
        // Custom Dropdown Elements
        const providerDropdown = document.getElementById('provider-dropdown');
        const tagDropdown = document.getElementById('tag-dropdown');
        
        // Modal Elements
        const modal = document.getElementById('service-modal');
        const mProvider = document.getElementById('sm-provider');
        const mTitle = document.getElementById('sm-title');
        const mDesc = document.getElementById('sm-desc');
        const mTags = document.getElementById('sm-tags');
        const mSimilarGrid = document.getElementById('sm-similar-grid');
        const stateContainers = document.querySelectorAll('.sm-state-container');
        const faceScanner = document.getElementById('sm-face-scanner');
        const loadingSpinner = document.getElementById('sm-loading-spinner');
        const step2Status = document.getElementById('sm-step2-status');

        if (!grid) return;

        // State Management
        let allServices = [];
        let filteredData = [];
        let currentPage = 1;
        let currentProviderFilter = 'all';
        let currentTagFilter = 'all';

        /**
         * Custom Dropdown Logic
         */
        function setupCustomDropdown(dropdownEl, onSelectCallback) {
            const trigger = dropdownEl?.querySelector('.custom-dropdown__trigger');
            const label = dropdownEl?.querySelector('.custom-dropdown__label');
            const list = dropdownEl?.querySelector('.custom-dropdown__menu');
            if (!trigger || !list) return;

            let highlightedIndex = -1;

            function updateHighlightedItem(index) {
                const items = list.querySelectorAll('.custom-dropdown__item');
                items.forEach(li => li.classList.remove('is-highlighted'));
                
                if (index >= 0 && index < items.length) {
                    const item = items[index];
                    item.classList.add('is-highlighted');
                    trigger.setAttribute('aria-activedescendant', item.id || `opt-${index}`);
                    item.scrollIntoView({ block: 'nearest' });
                    highlightedIndex = index;
                } else {
                    trigger.removeAttribute('aria-activedescendant');
                    highlightedIndex = -1;
                }
            }

            function selectItem(item) {
                if (!item) return;
                list.querySelectorAll('.custom-dropdown__item').forEach(li => {
                    li.classList.remove('is-selected');
                    li.setAttribute('aria-selected', 'false');
                });
                item.classList.add('is-selected');
                item.setAttribute('aria-selected', 'true');
                
                if (label) label.textContent = item.textContent;
                dropdownEl.classList.remove('is-open');
                trigger.setAttribute('aria-expanded', 'false');
                
                const val = item.getAttribute('data-value');
                if (onSelectCallback) onSelectCallback(val);
            }

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = dropdownEl.classList.contains('is-open');
                
                // Close all others
                document.querySelectorAll('.custom-dropdown.is-open').forEach(el => {
                    if (el !== dropdownEl) {
                        el.classList.remove('is-open');
                        el.querySelector('.custom-dropdown__trigger')?.setAttribute('aria-expanded', 'false');
                    }
                });

                if (isOpen) {
                    dropdownEl.classList.remove('is-open');
                    trigger.setAttribute('aria-expanded', 'false');
                } else {
                    dropdownEl.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                    const items = Array.from(list.querySelectorAll('.custom-dropdown__item'));
                    const selectedIndex = items.findIndex(li => li.classList.contains('is-selected'));
                    updateHighlightedItem(selectedIndex >= 0 ? selectedIndex : 0);
                }
            });

            list.addEventListener('click', (e) => {
                const item = e.target.closest('.custom-dropdown__item');
                if (item) selectItem(item);
            });
        }

        // Close dropdowns on outside click
        document.addEventListener('click', () => {
            document.querySelectorAll('.custom-dropdown.is-open').forEach(el => {
                el.classList.remove('is-open');
                el.querySelector('.custom-dropdown__trigger')?.setAttribute('aria-expanded', 'false');
            });
        });

        /**
         * Populates the custom dropdown lists
         */
        function populateFilters(data) {
            const providers = new Set();
            const tags = new Set();
            
            data.forEach(s => {
                if (s.provider) providers.add(s.provider);
                if (s.tags) s.tags.forEach(t => tags.add(t));
            });

            const pList = document.getElementById('provider-list');
            const tList = document.getElementById('tag-list');
            if (!pList || !tList) return;

            // Optimization: Use DocumentFragment to batch multiple DOM insertions for filters
            const pFrag = document.createDocumentFragment();
            Array.from(providers).sort().forEach((p, i) => {
                const li = document.createElement("li");
                li.className = "custom-dropdown__item";
                li.id = `provider-opt-${i}`;
                li.setAttribute('role', 'option');
                li.setAttribute('data-value', p);
                li.textContent = p;
                pFrag.appendChild(li);
            });
            pList.appendChild(pFrag);

            const tFrag = document.createDocumentFragment();
            Array.from(tags).sort().forEach((t, i) => {
                const li = document.createElement("li");
                li.className = "custom-dropdown__item";
                li.id = `tag-opt-${i}`;
                li.setAttribute('role', 'option');
                li.setAttribute('data-value', t);
                li.textContent = t.charAt(0).toUpperCase() + t.slice(1);
                tFrag.appendChild(li);
            });
            tList.appendChild(tFrag);
        }

        /**
         * Creates a single service card
         */
        function createCardElement(service, isFeatured = false) {
            const card = document.createElement("article");
            card.className = "service-card logo-box--glass";
            if (isFeatured) card.classList.add("service-card--featured");
            
            card.innerHTML = `
                <div class="service-card__header">
                    <span class="service-card__provider">${escapeHTML(service.provider)}</span>
                    <span class="iconify" data-icon="lucide:arrow-up-right"></span>
                </div>
                <div class="service-card__body">
                    <h3 class="service-card__title">${escapeHTML(service.name)}</h3>
                    <p class="service-card__desc">${escapeHTML(service.description)}</p>
                </div>
                <div class="service-card__footer">
                    <div class="service-card__tags">
                        ${(service.tags || []).map(t => `<span class="service-card__tag">${escapeHTML(t)}</span>`).join('')}
                    </div>
                </div>
            `;
            
            card.addEventListener("click", () => openModal(service));
            return card;
        }

        /**
         * Renders the services grid with pagination
         */
        function renderPagination() {
            if (!grid) return;
            grid.innerHTML = "";
            const itemsPerPage = window.innerWidth >= 1024 ? 9 : 6;
            const limit = currentPage * itemsPerPage;
            const dataToShow = filteredData.slice(0, limit);

            if (dataToShow.length === 0) {
                noResults.style.display = "block";
                paginationContainer.style.display = "none";
                return;
            }
            noResults.style.display = "none";

            const fragment = document.createDocumentFragment();
            dataToShow.forEach((s, idx) => {
                const card = createCardElement(s, idx === 0 && currentPage === 1);
                fragment.appendChild(card);
            });
            grid.appendChild(fragment);

            paginationContainer.style.display = (limit >= filteredData.length) ? 'none' : 'flex';
            
            // Re-sync scroll height for Locomotive
            setTimeout(() => {
                if (window.locoScroll) window.locoScroll.update();
                if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            }, 150);
        }

        /**
         * Filters the list based on current UI state
         */
        function filterData() {
            const query = searchInput?.value.toLowerCase().trim();
            
            filteredData = allServices.filter(s => {
                const matchProv = currentProviderFilter === 'all' || s.provider === currentProviderFilter;
                const matchTag = currentTagFilter === 'all' || (s.tags && s.tags.includes(currentTagFilter));
                const matchSearch = !query || s._searchStr.includes(query);
                return matchProv && matchTag && matchSearch;
            });

            currentPage = 1;
            renderPagination();
        }

        /**
         * Opens the detailed service modal
         */
        function openModal(service) {
            resetModalDirect(stateContainers, faceScanner, loadingSpinner, step2Status);
            if (mProvider) mProvider.textContent = service.provider;
            if (mTitle) mTitle.textContent = service.name;
            if (mDesc) mDesc.textContent = service.description;
            if (mTags) {
                mTags.innerHTML = (service.tags || []).map(t => `<span class="service-card__tag">${escapeHTML(t)}</span>`).join('');
            }
            
            // Similar services logic: Optimized single-pass greedy collection
            const currentTags = service._tagSet || new Set();
            const similar = [];
            const others = [];

            for (let i = 0; i < allServices.length; i++) {
                const s = allServices[i];
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
                // Shuffle and pick 3
                results = similar.sort(() => 0.5 - Math.random()).slice(0, 3);
            }

            if (mSimilarGrid) {
                mSimilarGrid.innerHTML = '';
                // Optimization: Use DocumentFragment to batch DOM insertions for the similar grid
                const fragment = document.createDocumentFragment();

                results.forEach(s => {
                    const scard = document.createElement('article');
                    // Optimization: Remove data-scroll from cards inside modal to prevent layout issues
                    scard.className = 'service-card logo-box--glass';
                    scard.style.cursor = 'pointer';
                    scard.style.minHeight = '140px';
                    scard.innerHTML = `
                        <div class="service-card__body">
                            <h3 class="service-card__title" style="font-size: 1.1rem; margin-bottom: 8px;">${escapeHTML(s.name)}</h3>
                            <p class="service-card__desc" style="-webkit-line-clamp: 2; line-clamp: 2; font-size: 0.9rem;">${escapeHTML(s.description)}</p>
                        </div>
                    `;
                    scard.addEventListener('click', () => {
                        openModal(s);
                        const mContent = modal.querySelector('.service-modal__content');
                        if (mContent) mContent.scrollTo({ top: 0, behavior: 'smooth' });
                    });
                    fragment.appendChild(scard);
                });
                mSimilarGrid.appendChild(fragment);
            }

            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        // Initialize Data and Listeners
        if (typeof irishGovServicesData !== 'undefined') {
            allServices = irishGovServicesData;
            // Optimization: Pre-compute search strings and tag Sets for O(1) lookups
            allServices.forEach(s => {
                s._searchStr = `${s.name} ${s.description} ${s.provider}`.toLowerCase();
                s._tagSet = new Set(s.tags || []);
            });
            
            populateFilters(allServices);
            
            setupCustomDropdown(providerDropdown, (val) => {
                currentProviderFilter = val;
                filterData();
            });
            
            setupCustomDropdown(tagDropdown, (val) => {
                currentTagFilter = val;
                filterData();
            });

            filterData();
        }

        setupModalListenersDirect({
            modal, 
            modalClose: document.getElementById('sm-close'), 
            modalOverlay: document.getElementById('sm-overlay'),
            applyBtn: document.getElementById('sm-apply-btn'),
            cancelBtn: document.getElementById('sm-cancel-btn'),
            confirmBtn: document.getElementById('sm-confirm-btn'),
            closeCancelledBtn: document.getElementById('sm-close-cancelled-btn'),
            closeSuccessBtn: document.getElementById('sm-close-success-btn'),
            stateContainers, 
            faceScanner, 
            loadingSpinner, 
            step2Status,
            resetModalFn: () => resetModalDirect(stateContainers, faceScanner, loadingSpinner, step2Status)
        });

        if (searchInput) {
            // Optimization: Debounce search input to prevent redundant filtering and re-renders
            searchInput.addEventListener("input", debounce(() => {
                currentPage = 1;
                filterData();
            }, 250));
        }
        
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                currentPage++;
                renderPagination();
            });
        }
    });
})();
