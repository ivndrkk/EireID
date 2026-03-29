document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const contactSuccess = document.getElementById('contact-success');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');

    if (!contactForm) return;

    /**
     * Robust email validation
     * @param {string} email 
     * @returns {boolean}
     */
    const isValidEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const emailValue = emailInput.value.trim();
        const nameValue = document.getElementById('name').value.trim();
        const messageValue = document.getElementById('message').value.trim();

        // Reset errors
        emailError.style.display = 'none';
        emailInput.style.border = '1px solid rgba(0,0,0,0.1)';

        let hasError = false;

        // Email Validation Logic
        if (!isValidEmail(emailValue)) {
            emailError.style.display = 'block';
            emailInput.style.border = '1px solid #d93025';
            hasError = true;
            emailInput.focus();
        }

        if (hasError) return;

        // Premium simulated submission
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.innerText = 'Transmitting...';

        // Simulate network delay
        setTimeout(() => {
            // Elegant transition to success state
            contactForm.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            contactForm.style.opacity = '0';
            contactForm.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                contactForm.style.display = 'none';
                
                // Show success card with animation
                contactSuccess.style.display = 'flex';
                contactSuccess.style.opacity = '0';
                contactSuccess.style.transform = 'translateY(20px)';
                
                // Trigger reflow
                contactSuccess.offsetHeight; 
                
                contactSuccess.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                contactSuccess.style.opacity = '1';
                contactSuccess.style.transform = 'translateY(0)';

                // Update UI context - hide initial headings
                const title = document.getElementById('contact-title');
                const subtitle = title ? title.nextElementSibling : null;
                if (title) title.style.display = 'none';
                if (subtitle) subtitle.style.display = 'none';

                // Smooth scroll to feedback
                contactSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }, 1800);
    });

    // Clean up error state as user types
    emailInput.addEventListener('input', () => {
        if (emailError.style.display === 'block') {
            if (isValidEmail(emailInput.value.trim())) {
                emailError.style.display = 'none';
                emailInput.style.border = '1px solid rgba(0,0,0,0.1)';
            }
        }
    });

    // Focus state enhancements (synced with CSS)
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
