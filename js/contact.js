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
        const nameValue = document.getElementById('name').value.trim();
        const messageValue = document.getElementById('message').value.trim();

        emailError.style.display = 'none';
        emailInput.style.border = '1px solid rgba(0,0,0,0.1)';

        let hasError = false;

        if (!isValidEmail(emailValue)) {
            emailError.style.display = 'block';
            emailInput.style.border = '1px solid #d93025';
            hasError = true;
            emailInput.focus();
        }

        if (hasError) return;

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        // Bolt: textContent is ~95% faster than innerText by avoiding forced reflows
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.textContent = 'Transmitting...';

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
            alert("Something went wrong. Please try again.");
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.textContent = originalText;
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
