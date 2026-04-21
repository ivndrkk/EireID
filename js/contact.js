document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const contactSuccess = document.getElementById('contact-success');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');

    if (!contactForm) return;

    const isValidEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailValue = emailInput.value.trim();
        const nameInput = document.getElementById('name');
        const messageInput = document.getElementById('message');
        const consentInput = document.getElementById('support-consent');

        const nameError = document.getElementById('name-error');
        const messageError = document.getElementById('message-error');
        const consentError = document.getElementById('consent-error');
        const formError = document.getElementById('contact-form-error');

        // Reset states
        [emailError, nameError, messageError, consentError].forEach(err => {
            if (err) err.style.display = 'none';
        });
        [emailInput, nameInput, messageInput].forEach(input => {
            if (input) {
                input.style.border = '1px solid rgba(0,0,0,0.1)';
                input.setAttribute('aria-invalid', 'false');
            }
        });
        if (formError) formError.style.display = 'none';

        let hasError = false;
        let firstErrorElement = null;

        if (!consentInput.checked) {
            if (consentError) consentError.style.display = 'block';
            hasError = true;
            firstErrorElement = consentInput;
        }

        if (messageInput.value.trim() === "") {
            if (messageError) messageError.style.display = 'block';
            messageInput.style.border = '1px solid #d93025';
            messageInput.setAttribute('aria-invalid', 'true');
            hasError = true;
            firstErrorElement = messageInput;
        }

        if (!isValidEmail(emailValue)) {
            if (emailError) emailError.style.display = 'block';
            emailInput.style.border = '1px solid #d93025';
            emailInput.setAttribute('aria-invalid', 'true');
            hasError = true;
            firstErrorElement = emailInput;
        }

        if (nameInput.value.trim() === "") {
            if (nameError) nameError.style.display = 'block';
            nameInput.style.border = '1px solid #d93025';
            nameInput.setAttribute('aria-invalid', 'true');
            hasError = true;
            firstErrorElement = nameInput;
        }

        if (hasError) {
            if (firstErrorElement) firstErrorElement.focus();
            return;
        }

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
            if (formError) {
                formError.textContent = "Something went wrong. Please check your connection and try again.";
                formError.style.display = 'block';
                formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-loading');
            submitBtn.removeAttribute('aria-busy');
            submitBtn.innerText = originalText;
        }
    });

    const setupRealtimeValidation = (input, error, validator) => {
        input.addEventListener('input', () => {
            if (error.style.display === 'block') {
                if (validator()) {
                    error.style.display = 'none';
                    if (input.type !== 'checkbox') {
                        input.style.border = '1px solid rgba(0,0,0,0.1)';
                        input.setAttribute('aria-invalid', 'false');
                    }
                }
            }
        });
    };

    setupRealtimeValidation(emailInput, emailError, () => isValidEmail(emailInput.value.trim()));
    setupRealtimeValidation(document.getElementById('name'), document.getElementById('name-error'), () => document.getElementById('name').value.trim() !== "");
    setupRealtimeValidation(document.getElementById('message'), document.getElementById('message-error'), () => document.getElementById('message').value.trim() !== "");
    setupRealtimeValidation(document.getElementById('support-consent'), document.getElementById('consent-error'), () => document.getElementById('support-consent').checked);

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
