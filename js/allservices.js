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
        const providerDropdown = document.getElementById('provider-dropdown');
        const tagDropdown = document.getElementById('tag-dropdown');
        const modal = document.getElementById('service-modal');
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

        if (!grid) return;

        let allServices = [];
        let filteredData = [];
        let currentPage = 1;

        // Custom Dropdown Logic
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
                    trigger.setAttribute('aria-activedescendant', item.id);
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
                document.querySelectorAll('.custom-dropdown.is-open').forEach(el => {
                    el.classList.remove('is-open');
                    el.querySelector('.custom-dropdown__trigger')?.setAttribute('aria-expanded', 'false');
                });
                if (!isOpen) {
                    dropdownEl.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                    const items = Array.from(list.querySelectorAll('.custom-dropdown__item'));
                    const selIdx = items.findIndex(li => li.classList.contains('is-selected'));
                    updateHighlightedItem(selIdx >= 0 ? selIdx : 0);
                }
            });

            list.addEventListener('click', (e) => {
                const item = e.target.closest('.custom-dropdown__item');
                if (item) selectItem(item);
            });
        }

        document.addEventListener('click', () => {
            document.querySelectorAll('.custom-dropdown.is-open').forEach(el => {
                el.classList.remove('is-open');
                el.querySelector('.custom-dropdown__trigger')?.setAttribute('aria-expanded', 'false');
            });
        });

        // Initialize Data
        if (typeof irishGovServicesData !== 'undefined') {
            allServices = irishGovServicesData;
            allServices.forEach(s => {
                s._searchStr = `${s.name} ${s.description} ${s.provider}`.toLowerCase();
            });
            populateFilters(allServices);
            setupCustomDropdown(providerDropdown, (val) => { window.currentProviderFilter = val; filterData(); });
            setupCustomDropdown(tagDropdown, (val) => { window.currentTagFilter = val; filterData(); });
            window.currentProviderFilter = 'all';
            window.currentTagFilter = 'all';
            filterData();
        } else {
            console.error("Data 'irishGovServicesData' not found.");
        }

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

            Array.from(providers).sort().forEach((p, i) => {
                const li = document.createElement("li");
                li.className = "custom-dropdown__item";
                li.setAttribute('data-value', p);
                li.textContent = p;
                pList.appendChild(li);
            });
            Array.from(tags).sort().forEach((t, i) => {
                const li = document.createElement("li");
                li.className = "custom-dropdown__item";
                li.setAttribute('data-value', t);
                li.textContent = t.charAt(0).toUpperCase() + t.slice(1);
                tList.appendChild(li);
            });
        }

        function filterData() {
            const query = searchInput?.value.toLowerCase().trim();
            const prov = window.currentProviderFilter || 'all';
            const tag = window.currentTagFilter || 'all';

            filteredData = allServices.filter(s => {
                const mP = prov === 'all' || s.provider === prov;
                const mT = tag === 'all' || (s.tags && s.tags.includes(tag));
                const mS = !query || s._searchStr.includes(query);
                return mP && mT && mS;
            });

            currentPage = 1;
            renderPagination();
        }

        function renderPagination() {
            if (!grid) return;
            grid.innerHTML = "";
            const limit = currentPage * (window.innerWidth >= 1024 ? 9 : 6);
            const dataToShow = filteredData.slice(0, limit);

            if (dataToShow.length === 0) {
                noResults.style.display = "block";
                paginationContainer.style.display = "none";
                return;
            }
            noResults.style.display = "none";

            dataToShow.forEach((s, idx) => {
                const card = document.createElement("article");
                card.className = "service-card logo-box--glass";
                card.innerHTML = `
                    <div class="service-card__header">
                        <span class="service-card__provider">${escapeHTML(s.provider)}</span>
                        <span class="iconify" data-icon="lucide:arrow-up-right"></span>
                    </div>
                    <div class="service-card__body">
                        <h3 class="service-card__title">${escapeHTML(s.name)}</h3>
                        <p class="service-card__desc">${escapeHTML(s.description)}</p>
                    </div>
                    <div class="service-card__footer">
                        <div class="service-card__tags">
                            ${(s.tags || []).map(t => `<span class="service-card__tag">${escapeHTML(t)}</span>`).join('')}
                        </div>
                    </div>
                `;
                card.addEventListener("click", () => openModal(s));
                grid.appendChild(card);
            });

            paginationContainer.style.display = (limit >= filteredData.length) ? 'none' : 'flex';
            
            // Re-sync scroll
            setTimeout(() => {
                if (window.locoScroll) window.locoScroll.update();
                if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            }, 100);
        }

        function openModal(service) {
            resetModalDirect(stateContainers, faceScanner, loadingSpinner, step2Status);
            if (mProvider) mProvider.textContent = service.provider;
            if (mTitle) mTitle.textContent = service.name;
            if (mDesc) mDesc.textContent = service.description;
            if (mTags) mTags.innerHTML = (service.tags || []).map(t => `<span class="service-card__tag">${escapeHTML(t)}</span>`).join('');
            
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }

        setupModalListenersDirect({
            modal, modalClose: document.getElementById('sm-close'), 
            modalOverlay: document.getElementById('sm-overlay'),
            applyBtn, cancelBtn, confirmBtn, closeCancelledBtn, closeSuccessBtn,
            stateContainers, faceScanner, loadingSpinner, step2Status,
            resetModalFn: () => resetModalDirect(stateContainers, faceScanner, loadingSpinner, step2Status)
        });

        if (searchInput) searchInput.addEventListener("input", () => { currentPage = 1; filterData(); });
        if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => { currentPage++; renderPagination(); });
    });
})();
