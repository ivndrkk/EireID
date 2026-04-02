
function switchModalState(stateId, stateContainers) {
    stateContainers.forEach(container => {
        container.classList.remove('is-active');
        if (container.id === stateId) {
            container.classList.add('is-active');
        }
    });

    const modalContent = document.querySelector('.service-modal__content');
    if (modalContent) modalContent.scrollTop = 0;
}

function resetModal(stateContainers, faceScanner, loadingSpinner, step2Status) {
    switchModalState('sm-content-details', stateContainers);
    if (faceScanner) {
        faceScanner.classList.remove('is-scanning', 'is-loading', 'is-success');
    }
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (step2Status) step2Status.textContent = 'Verifying identity...';
}

function startFaceVerification(stateContainers, faceScanner, loadingSpinner, step2Status) {
    switchModalState('sm-content-step2', stateContainers);
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

            setTimeout(() => {
                switchModalState('sm-content-success', stateContainers);
            }, 800);
        }, 2000);

    }, 2500);
}

function openModal(modal) {
    if (!modal) return;
    modal.style.display = 'block';
    requestAnimationFrame(() => {
        modal.classList.add('is-active');
    });
}

function closeModal(modal, resetModalFn) {
    if (!modal) return;
    modal.classList.remove('is-active');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    if (resetModalFn && typeof resetModalFn === 'function') {
        setTimeout(resetModalFn, 300);
    } else {
        setTimeout(() => {
            modal.style.display = 'none';
        }, 400);
    }
}

function setupModalListeners({
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
