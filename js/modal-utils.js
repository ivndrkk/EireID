/**
 * js/modal-utils.js
 * Shared modal logic for EireID services pages.
 */

/**
 * Switches the active state of the modal by toggling 'is-active' class on containers.
 * @param {string} stateId - The ID of the container to activate.
 * @param {NodeList} stateContainers - The list of modal state containers.
 */
export function switchModalState(stateId, stateContainers) {
    stateContainers.forEach(container => {
        container.classList.remove('is-active');
        if (container.id === stateId) {
            container.classList.add('is-active');
        }
    });

    // Reset scroll position when switching states
    const modalContent = document.querySelector('.service-modal__content');
    if (modalContent) modalContent.scrollTop = 0;
}

/**
 * Resets the modal to its initial state.
 * @param {NodeList} stateContainers
 * @param {HTMLElement} faceScanner
 * @param {HTMLElement} loadingSpinner
 * @param {HTMLElement} step2Status
 */
export function resetModal(stateContainers, faceScanner, loadingSpinner, step2Status) {
    switchModalState('sm-content-details', stateContainers);
    if (faceScanner) faceScanner.style.display = 'flex';
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (step2Status) step2Status.textContent = 'Verifying identity...';
}

/**
 * Simulates a face verification process.
 * @param {NodeList} stateContainers
 * @param {HTMLElement} faceScanner
 * @param {HTMLElement} loadingSpinner
 * @param {HTMLElement} step2Status
 */
export function startFaceVerification(stateContainers, faceScanner, loadingSpinner, step2Status) {
    switchModalState('sm-content-step2', stateContainers);

    // Phase 1: Scanning (3s)
    setTimeout(() => {
        if (faceScanner) faceScanner.style.display = 'none';
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (step2Status) step2Status.textContent = 'Processing application...';

        // Phase 2: Loading (5s)
        setTimeout(() => {
            switchModalState('sm-content-success', stateContainers);
        }, 5000);

    }, 3000);
}

/**
 * Closes the modal and triggers a reset.
 * @param {HTMLElement} modal
 * @param {Function} resetModalFn - Callback to reset the modal state.
 */
export function closeModal(modal, resetModalFn) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Small delay to reset state after animation finishes
    setTimeout(resetModalFn, 300);
}

/**
 * Sets up event listeners for standard modal controls.
 */
export function setupModalListeners({
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
    resetModalFn
}) {
    if (applyBtn) {
        applyBtn.addEventListener('click', () => switchModalState('sm-content-step1', stateContainers));
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => switchModalState('sm-content-cancelled', stateContainers));
    }
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => startFaceVerification(stateContainers, faceScanner, loadingSpinner, step2Status));
    }
    if (closeCancelledBtn) {
        closeCancelledBtn.addEventListener('click', () => closeModal(modal, resetModalFn));
    }
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => closeModal(modal, resetModalFn));
    }

    if (modalClose) modalClose.addEventListener('click', () => closeModal(modal, resetModalFn));
    if (modalOverlay) modalOverlay.addEventListener('click', () => closeModal(modal, resetModalFn));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
            closeModal(modal, resetModalFn);
        }
    });
}
