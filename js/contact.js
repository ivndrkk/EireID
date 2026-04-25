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
        const nameError = document.getElementById('name-error');
        const messageError = document.getElementById('message-error');
        const submitBtn = contactForm.querySelector('button[type="submit"]');

        // Reset states
        [emailError, nameError, messageError].forEach(err => err && (err.style.display = 'none'));
        [emailInput, nameInput, messageInput].forEach(inp => {
            inp.style.border = '';
            inp.setAttribute('aria-invalid', 'false');
        });

        let hasError = false;
        let firstErrorField = null;

        if (!nameInput.value.trim()) {
            nameError.style.display = 'block';
            nameInput.style.border = '1px solid #d93025';
            nameInput.setAttribute('aria-invalid', 'true');
            hasError = true;
            firstErrorField = nameInput;
        }

        if (!isValidEmail(emailValue)) {
            emailError.style.display = 'block';
            emailInput.style.border = '1px solid #d93025';
            emailInput.setAttribute('aria-invalid', 'true');
            hasError = true;
            if (!firstErrorField) firstErrorField = emailInput;
        }

        if (!messageInput.value.trim()) {
            messageError.style.display = 'block';
            messageInput.style.border = '1px solid #d93025';
            messageInput.setAttribute('aria-invalid', 'true');
            hasError = true;
            if (!firstErrorField) firstErrorField = messageInput;
        }

        if (hasError) {
            firstErrorField.focus();
            return;
        }

        const originalText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.innerText = 'Transmitting...';

        let isSuccess = false;
        try {
            const response = await fetch('https://eireid-backend-9d25b1a7b372.herokuapp.com/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: nameInput.value.trim(),
                    email: emailValue,
                    message: messageInput.value.trim()
                })
            });

            if (!response.ok) throw new Error('Server returned an error');

            isSuccess = true;
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
            alert("Something went wrong. Please try again.");
        } finally {
            if (!isSuccess) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('is-loading');
                submitBtn.removeAttribute('aria-busy');
                submitBtn.innerText = originalText;
            }
        }
    });

    emailInput.addEventListener('input', () => {
        if (emailError.style.display === 'block') {
            if (isValidEmail(emailInput.value.trim())) {
                emailError.style.display = 'none';
                emailInput.style.border = '1px solid rgba(0,0,0,0.1)';
            }
        }
    });

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
