document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("services-grid");
    const searchInput = document.getElementById("search-input");
    const noResults = document.getElementById("no-results");
    const paginationContainer = document.getElementById('services-pagination');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    const providerDropdown = document.getElementById('provider-dropdown');
    const tagDropdown = document.getElementById('tag-dropdown');
    
    let currentProviderFilter = 'all';
    let currentTagFilter = 'all';
    
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

    if (!grid) return;

    let allServices = [];
    let filteredData = [];
    let currentPage = 1;

    function setupCustomDropdown(dropdownEl, onSelectCallback) {
        const trigger = dropdownEl.querySelector('.custom-dropdown__trigger');
        const label = dropdownEl.querySelector('.custom-dropdown__label');
        const list = dropdownEl.querySelector('.custom-dropdown__menu');
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdownEl.classList.contains('is-open');
            document.querySelectorAll('.custom-dropdown.is-open').forEach(el => {
                el.classList.remove('is-open');
                el.querySelector('.custom-dropdown__trigger').setAttribute('aria-expanded', 'false');
            });
            
            if (!isOpen) {
                dropdownEl.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });

        list.addEventListener('click', (e) => {
            const item = e.target.closest('.custom-dropdown__item');
            if (!item) return;

            list.querySelectorAll('.custom-dropdown__item').forEach(li => li.classList.remove('is-selected', 'aria-selected'));
            item.classList.add('is-selected');
            item.setAttribute('aria-selected', 'true');
            
            label.textContent = item.textContent;
            
            dropdownEl.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
            
            const val = item.getAttribute('data-value');
            if (onSelectCallback) onSelectCallback(val);
        });
    }

    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-dropdown.is-open').forEach(el => {
            el.classList.remove('is-open');
            el.querySelector('.custom-dropdown__trigger').setAttribute('aria-expanded', 'false');
        });
    });

    /* Note: Data is loaded via a global variable (irishGovServicesData) instead of fetch()
       to avoid CORS errors when running via the file:// protocol. */
    if (typeof irishGovServicesData !== 'undefined') {
        allServices = irishGovServicesData;
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
    } else {
        console.error("Failed to load services data structure.");
    }

    function getItemsPerPage() {
        return window.innerWidth >= 1024 ? 9 : 6;
    }

    function populateFilters(data) {
        const providers = new Set();
        const tags = new Set();

        data.forEach(service => {
            if (service.provider) providers.add(service.provider);
            if (service.tags && Array.isArray(service.tags)) {
                service.tags.forEach(tag => tags.add(tag));
            }
        });

        const providerList = document.getElementById('provider-list');
        const tagList = document.getElementById('tag-list');

        Array.from(providers).sort().forEach(provider => {
            const li = document.createElement("li");
            li.className = "custom-dropdown__item";
            li.setAttribute('role', 'option');
            li.setAttribute('data-value', provider);
            li.textContent = provider;
            providerList.appendChild(li);
        });

        Array.from(tags).sort().forEach(tag => {
            const li = document.createElement("li");
            li.className = "custom-dropdown__item";
            li.setAttribute('role', 'option');
            li.setAttribute('data-value', tag);
            li.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
            tagList.appendChild(li);
        });
    }

    function createCardElement(service, isFeatured = false) {
        const card = document.createElement("article");
        card.className = "service-card logo-box--glass";
        
        if (isFeatured) {
            card.classList.add("service-card--featured");
        }
        
        let tagsHtml = '';
        if (service.tags && Array.isArray(service.tags)) {
            tagsHtml = service.tags.map(tag => `<span class="service-card__tag" data-reveal>${tag}</span>`).join('');
        }
        
        const contentHtml = `
            <div class="service-card__header">
                <span class="service-card__provider" data-reveal>${service.provider}</span>
                <span class="iconify service-card__action-icon" data-icon="lucide:arrow-up-right"></span>
            </div>
            <div class="service-card__body">
                <h3 class="service-card__title" data-reveal>${service.name}</h3>
                <p class="service-card__desc" data-reveal>${service.description}</p>
            </div>
            <div class="service-card__footer">
                <div class="service-card__tags">
                    ${tagsHtml}
                </div>
            </div>
        `;
        
        card.innerHTML = contentHtml;
        
        card.addEventListener("click", () => {
            card.style.transform = "scale(0.98)";
            setTimeout(() => {
                card.style.transform = "";
                openModal(service);
            }, 150);
        });

        return card;
    }

    function renderPagination(append = false) {
        const itemsPerPage = getItemsPerPage();
        const limit = currentPage * itemsPerPage;
        const start = append ? (currentPage - 1) * itemsPerPage : 0;
        const dataToShow = filteredData.slice(start, limit);
        
        if (!append) {
            grid.innerHTML = "";
            if (filteredData.length === 0) {
                noResults.style.display = "block";
                paginationContainer.style.display = "none";
                return;
            } else {
                noResults.style.display = "none";
            }
        }

        dataToShow.forEach((service, index) => {
            const actualIndex = start + index;
            const isFeatured = actualIndex === 0;
            const card = createCardElement(service, isFeatured);
            card.style.animationDelay = `${(index % 10) * 0.05}s`;
            grid.appendChild(card);
        });

        if (limit >= filteredData.length) {
            paginationContainer.style.display = 'none';
        } else {
            paginationContainer.style.display = 'flex';
        }

        if (typeof initTextReveal === 'function') {
            initTextReveal();
        }
    }

    function filterData() {
        const searchVal = searchInput.value.toLowerCase();

        filteredData = allServices.filter(service => {
            let matchProvider = true;
            let matchTag = true;
            let matchSearch = true;

            if (currentProviderFilter !== "all") {
                matchProvider = service.provider === currentProviderFilter;
            }

            if (currentTagFilter !== "all") {
                matchTag = service.tags && service.tags.includes(currentTagFilter);
            }

            if (searchVal) {
                const searchStr = `${service.name} ${service.description} ${service.provider}`.toLowerCase();
                matchSearch = searchStr.includes(searchVal);
            }

            return matchProvider && matchTag && matchSearch;
        });

        currentPage = 1;
        renderPagination();
    }

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
            faceScanner.style.display = 'none';
            loadingSpinner.style.display = 'block';
            step2Status.textContent = 'Processing application...';
            
            setTimeout(() => {
                switchModalState('sm-content-success');
            }, 5000);
            
        }, 3000);
    }

    function openModal(service) {
        resetModal();
        mProvider.textContent = service.provider;
        mTitle.textContent = service.name;
        mDesc.textContent = service.description;

        const tagsHtml = (service.tags || []).map(tag => `<span class="service-card__tag">${tag}</span>`).join('');
        mTags.innerHTML = tagsHtml;

        let similar = allServices.filter(s => {
            if (s.id === service.id) return false;
            const matchesProvider = s.provider === service.provider;
            const matchesTags = (s.tags || []).some(t => (service.tags || []).includes(t));
            return matchesProvider || matchesTags;
        });
        
        if (similar.length < 3) {
            const others = allServices.filter(s => s.id !== service.id && !similar.includes(s));
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
                document.querySelector('.service-modal__content').scrollTop = 0;
            });
            mSimilarGrid.appendChild(scard);
        });

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setTimeout(resetModal, 300);
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', () => switchModalState('sm-content-step1'));
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => switchModalState('sm-content-cancelled'));
    }
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => startFaceVerification());
    }
    if (closeCancelledBtn) {
        closeCancelledBtn.addEventListener('click', closeModal);
    }
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', closeModal);
    }

    searchInput.addEventListener("input", filterData);
    
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        renderPagination(true);
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            renderPagination();
        }, 150);
    });
});
