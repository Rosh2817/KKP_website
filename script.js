// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize portfolio functionality
    initializePortfolio();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize transparent navbar
    initializeTransparentNavbar();
    
    console.log('Portfolio script loaded successfully!');
});

// Portfolio initialization
function initializePortfolio() {
    // Add scroll effect to navbar
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(15, 15, 35, 0.98)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(15, 15, 35, 0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
        }
    });
}

// Form validation functionality
function initializeFormValidation() {
    const contactForm = document.getElementById('contactForm');
    const formFields = {
        name: document.getElementById('name'),
        mobile: document.getElementById('mobile'),
        subject: document.getElementById('subject'),
        message: document.getElementById('message')
    };
    
    // Validation rules
    const validationRules = {
        name: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-Z\s]+$/,
            message: 'Name must be 2-50 characters and contain only letters and spaces'
        },
        mobile: {
            required: true,
            minLength: 10,
            maxLength: 10,
            pattern: /^[6-9]\d{9}$/,
            message: 'Please enter a valid 10-digit mobile number starting with 6-9'
        },
        subject: {
            required: true,
            minLength: 5,
            maxLength: 100,
            message: 'Subject must be 5-100 characters'
        },
        message: {
            required: true,
            minLength: 10,
            maxLength: 500,
            message: 'Message must be 10-500 characters'
        }
    };
    
    // Add real-time validation
    Object.keys(formFields).forEach(fieldName => {
        const field = formFields[fieldName];
        const rules = validationRules[fieldName];
        
        // Add event listeners for real-time validation
        field.addEventListener('blur', () => validateField(field, rules, fieldName));
        field.addEventListener('input', () => {
            clearFieldError(field, fieldName);
            // Special handling for mobile number formatting
            if (fieldName === 'mobile') {
                formatMobileNumber(field);
            }
        });
    });
    
    // Form submission validation
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission('email');
    });
    
    // Add click listeners for both buttons
    const emailButton = contactForm.querySelector('[data-action="email"]');
    const whatsappButton = contactForm.querySelector('[data-action="whatsapp"]');
    
    emailButton.addEventListener('click', function(e) {
        e.preventDefault();
        handleFormSubmission('email');
    });
    
    whatsappButton.addEventListener('click', function(e) {
        e.preventDefault();
        handleFormSubmission('whatsapp');
    });
    
    // Handle form submission based on action type
    function handleFormSubmission(actionType) {
        let isFormValid = true;
        const formData = {};
        
        // Validate all fields
        Object.keys(formFields).forEach(fieldName => {
            const field = formFields[fieldName];
            const rules = validationRules[fieldName];
            
            if (!validateField(field, rules, fieldName)) {
                isFormValid = false;
            }
            
            formData[fieldName] = field.value.trim();
        });
        
        if (isFormValid) {
            if (actionType === 'email') {
                submitFormToServer(formData);
            } else if (actionType === 'whatsapp') {
                sendWhatsAppMessage(formData);
                showFormMessage('success', 'Opening WhatsApp to send your message...');
                contactForm.reset();
            }
        } else {
            showFormMessage('error', 'Please fix the errors below and try again.');
        }
    }
    
    // Field validation function
    function validateField(field, rules, fieldName) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Required validation
        if (rules.required && !value) {
            isValid = false;
            errorMessage = `${getFieldDisplayName(fieldName)} is required`;
        }
        // Length validation
        else if (value && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `${getFieldDisplayName(fieldName)} must be at least ${rules.minLength} characters`;
        }
        else if (value && rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = `${getFieldDisplayName(fieldName)} must be no more than ${rules.maxLength} characters`;
        }
        // Pattern validation
        else if (value && rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.message;
        }
        
        // Show/hide error
        if (!isValid) {
            showFieldError(field, errorMessage, fieldName);
        } else {
            clearFieldError(field, fieldName);
        }
        
        return isValid;
    }
    
    // Show field error
    function showFieldError(field, message, fieldName) {
        // Remove existing error
        clearFieldError(field, fieldName);
        
        // Add error class
        field.classList.add('error');
        
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.id = `error-${fieldName}`;
        
        // Insert error message after field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
        
        // Add shake animation
        field.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            field.style.animation = '';
        }, 500);
    }
    
    // Clear field error
    function clearFieldError(field, fieldName) {
        field.classList.remove('error');
        const existingError = document.getElementById(`error-${fieldName}`);
        if (existingError) {
            existingError.remove();
        }
    }
    
    // Format mobile number as user types
    function formatMobileNumber(field) {
        let value = field.value.replace(/\D/g, ''); // Remove non-digits
        
        // Limit to 10 digits
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        
        field.value = value;
    }
    
    // Get field display name
    function getFieldDisplayName(fieldName) {
        const names = {
            name: 'Name',
            mobile: 'Mobile Number',
            subject: 'Subject',
            message: 'Message'
        };
        return names[fieldName] || fieldName;
    }
    
    // Show form message
    function showFormMessage(type, message) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        
        // Insert message at top of form
        contactForm.insertBefore(messageElement, contactForm.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }
    
    // Submit form to server
    async function submitFormToServer(formData) {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.innerHTML = '<span>Sending...</span><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>';
        submitButton.disabled = true;
        
        try {
            const response = await fetch('http://localhost:3000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                showFormMessage('success', result.message);
                
                // Reset form
                contactForm.reset();
                
                // Log success
                console.log('Form submitted successfully:', result);
                
            } else {
                // Show error message
                showFormMessage('error', result.message || 'Failed to send message. Please try again.');
                
                // Show validation errors if any
                if (result.errors && result.errors.length > 0) {
                    result.errors.forEach(error => {
                        console.error('Validation error:', error);
                    });
                }
            }
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showFormMessage('error', 'Network error. Please check your connection and try again.');
        } finally {
            // Reset button state
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }

    // Send WhatsApp message function
    function sendWhatsAppMessage(formData) {
        const whatsappNumber = '7715855577'; // Komal's WhatsApp number
        const countryCode = '91'; // India country code
        
        // Format the message
        const message = formatWhatsAppMessage(formData);
        
        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/${countryCode}${whatsappNumber}?text=${encodeURIComponent(message)}`;
        
        // Check if user is on mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // On mobile, try to open WhatsApp app directly
            window.location.href = whatsappUrl;
        } else {
            // On desktop, open WhatsApp Web in new tab
            window.open(whatsappUrl, '_blank');
        }
        
        // Track the action
        console.log('WhatsApp message prepared:', {
            number: `${countryCode}${whatsappNumber}`,
            message: message,
            url: whatsappUrl,
            isMobile: isMobile
        });
        
        // Show additional instructions for desktop users
        if (!isMobile) {
            setTimeout(() => {
                showFormMessage('info', 'WhatsApp Web opened in new tab. If it doesn\'t open, please copy the message and send it manually to +91 7715855577');
            }, 1000);
        }
    }
    
    // Format the WhatsApp message
    function formatWhatsAppMessage(formData) {
        const currentDate = new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const message = `🎓 *New Contact Form Submission*

👤 *Name:* ${formData.name}
📱 *Mobile:* ${formData.mobile}
📍 *Location:* Lucknow, Uttar Pradesh

📝 *Subject:* ${formData.subject}

💬 *Message:*
${formData.message}

⏰ *Submitted on:* ${currentDate}

---
*This message was sent via Komal's Portfolio Website*`;
        
        return message;
    }
    
    // Simulate form submission
    function simulateFormSubmission() {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        submitButton.textContent = 'Opening WhatsApp...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 2000);
    }
}

// Smooth scrolling for navigation links
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Transparent Navbar functionality
function initializeTransparentNavbar() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}
