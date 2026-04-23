document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const contactSuccess = document.getElementById('contact-success');
    const contactErrorContainer = document.getElementById('contact-error');
    const emailInput = document.getElementById('email');
    const nameInput = document.getElementById('name');
    const messageInput = document.getElementById('message');
    const consentInput = document.getElementById('support-consent');

    const emailError = document.getElementById('email-error');
    const nameError = document.getElementById('name-error');
    const messageError = document.getElementById('message-error');
    const consentError = document.getElementById('consent-error');

    if (!contactForm) return;

    const isValidEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const toggleError = (input, errorEl, show, message) => {
        if (errorEl) {
            errorEl.style.display = show ? 'block' : 'none';
            if (message && show) errorEl.textContent = message;
        }
        if (input && input.type !== 'checkbox') {
            input.style.border = show ? '1px solid #d93025' : '1px solid rgba(0,0,0,0.1)';
            input.setAttribute('aria-invalid', show ? 'true' : 'false');
        }
    };

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (contactErrorContainer) contactErrorContainer.style.display = 'none';

        const emailValue = emailInput.value.trim();
        const nameValue = nameInput.value.trim();
        const messageValue = messageInput.value.trim();
        const isConsentChecked = consentInput ? consentInput.checked : true;

        let hasError = false;

        if (!nameValue) {
            toggleError(nameInput, nameError, true);
            if (!hasError) nameInput.focus();
            hasError = true;
        } else {
            toggleError(nameInput, nameError, false);
        }

        if (!isValidEmail(emailValue)) {
            toggleError(emailInput, emailError, true);
            if (!hasError) emailInput.focus();
            hasError = true;
        } else {
            toggleError(emailInput, emailError, false);
        }

        if (!messageValue) {
            toggleError(messageInput, messageError, true);
            if (!hasError) messageInput.focus();
            hasError = true;
        } else {
            toggleError(messageInput, messageError, false);
        }

        if (!isConsentChecked) {
            toggleError(consentInput, consentError, true);
            hasError = true;
        } else {
            toggleError(consentInput, consentError, false);
        }

        if (hasError) return;

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.innerText = 'Transmitting...';

        try {
            const response = await fetch('https://eireid-backend-9d25b1a7b372.herokuapp.com/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: nameValue,
                    email: emailValue,
                    message: messageValue
                })
            });

            if (!response.ok) {
                throw new Error('Server returned an error');
            }

            contactForm.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            contactForm.style.opacity = '0';
            contactForm.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                contactForm.style.display = 'none';
                
                contactSuccess.style.display = 'flex';
                contactSuccess.style.opacity = '0';
                contactSuccess.style.transform = 'translateY(20px)';
                
                contactSuccess.offsetHeight; 
                
                contactSuccess.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                contactSuccess.style.opacity = '1';
                contactSuccess.style.transform = 'translateY(0)';

                const title = document.getElementById('contact-title');
                const subtitle = title ? title.nextElementSibling : null;
                if (title) title.style.display = 'none';
                if (subtitle) subtitle.style.display = 'none';

                contactSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);

        } catch (error) {
            console.error('Support submission failed:', error);
            if (contactErrorContainer) contactErrorContainer.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-loading');
            submitBtn.removeAttribute('aria-busy');
            submitBtn.innerText = originalText;
        }
    });

    [nameInput, emailInput, messageInput].forEach(input => {
        input.addEventListener('input', () => {
            const errorEl = document.getElementById(`${input.id}-error`);
            if (errorEl && errorEl.style.display === 'block') {
                const isValid = input.id === 'email' ? isValidEmail(input.value.trim()) : input.value.trim() !== '';
                if (isValid) {
                    toggleError(input, errorEl, false);
                }
            }
        });
    });

    if (consentInput) {
        consentInput.addEventListener('change', () => {
            if (consentInput.checked) {
                toggleError(consentInput, consentError, false);
            }
        });
    }

    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'translateX(5px)';
            input.parentElement.style.transition = 'transform 0.3s ease';
        });
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'translateX(0)';
        });
    });
});
