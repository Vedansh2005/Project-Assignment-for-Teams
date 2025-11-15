// Simple utility functions - basic helpers only

// Form validation
function validateForm(formId) {
    var form = document.getElementById(formId);
    if (!form) return false;
    
    var inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    for (var i = 0; i < inputs.length; i++) {
        if (!inputs[i].value.trim()) {
            alert('Please fill in all required fields');
            inputs[i].focus();
            return false;
        }
    }
    return true;
}

// Confirmation
function confirmAction(message) {
    return confirm(message);
}

// Show/hide elements
function toggleElement(elementId) {
    var element = document.getElementById(elementId);
    if (element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
}

// Update progress display
function updateProgressDisplay(inputId, displayId) {
    var input = document.getElementById(inputId);
    var display = document.getElementById(displayId);
    if (input && display) {
        display.textContent = input.value + '%';
    }
}

// Signup Form Validation
function validateSignupForm() {
    var isValid = true;
    var errors = {};

    // Get form values
    var firstName = document.getElementsByName('firstName')[0].value.trim();
    var email = document.getElementsByName('email')[0].value.trim();
    var gender = document.getElementsByName('gender')[0].value;
    var experience = document.getElementsByName('experience')[0].value;
    var password = document.getElementsByName('password')[0].value;
    var confirmPassword = document.getElementsByName('confirmPassword')[0].value;
    var skills = document.getElementsByName('skills')[0].value.trim();

    // Clear previous errors
    clearSignupErrors();

    // Validate First Name
    if (!firstName) {
        errors.firstName = 'First name is required';
        isValid = false;
    } else if (firstName.length < 2) {
        errors.firstName = 'First name must be at least 2 characters';
        isValid = false;
    } else if (firstName.length > 50) {
        errors.firstName = 'First name must be less than 50 characters';
        isValid = false;
    } else if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
        errors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
        isValid = false;
    }

    // Validate Email
    if (!email) {
        errors.email = 'Email is required';
        isValid = false;
    } else {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        } else if (email.length > 100) {
            errors.email = 'Email must be less than 100 characters';
            isValid = false;
        }
    }

    // Validate Gender
    if (!gender) {
        errors.gender = 'Please select a gender';
        isValid = false;
    }

    // Validate Experience
    if (experience !== '') {
        var expNum = parseFloat(experience);
        if (isNaN(expNum) || expNum < 0) {
            errors.experience = 'Experience must be a valid number (0 or greater)';
            isValid = false;
        } else if (expNum > 100) {
            errors.experience = 'Experience cannot exceed 100 years';
            isValid = false;
        }
    }

    // Validate Password
    if (!password) {
        errors.password = 'Password is required';
        isValid = false;
    } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
        isValid = false;
    } else if (password.length > 50) {
        errors.password = 'Password must be less than 50 characters';
        isValid = false;
    }

    // Validate Confirm Password
    if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
        isValid = false;
    } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
        isValid = false;
    }

    // Validate Skills (optional but if provided, should be reasonable)
    if (skills && skills.length > 500) {
        errors.skills = 'Skills text is too long (maximum 500 characters)';
        isValid = false;
    }

    // Display errors
    displaySignupErrors(errors);

    return isValid;
}

// Display validation errors
function displaySignupErrors(errors) {
    for (var field in errors) {
        var errorElement = document.getElementById(field + 'Error');
        var inputElement = document.getElementsByName(field)[0];
        
        if (errorElement) {
            errorElement.textContent = errors[field];
            errorElement.style.display = 'block';
        }
        
        if (inputElement) {
            inputElement.style.borderColor = '#dc2626';
        }
    }
}

// Clear all validation errors
function clearSignupErrors() {
    var errorElements = document.querySelectorAll('.error-message');
    var inputs = document.querySelectorAll('input, select, textarea');
    
    for (var i = 0; i < errorElements.length; i++) {
        errorElements[i].textContent = '';
        errorElements[i].style.display = 'none';
    }
    
    for (var j = 0; j < inputs.length; j++) {
        inputs[j].style.borderColor = '';
    }
}

// Real-time validation on input
function setupSignupRealTimeValidation() {
    var firstNameInput = document.getElementsByName('firstName')[0];
    var emailInput = document.getElementsByName('email')[0];
    var genderSelect = document.getElementsByName('gender')[0];
    var experienceInput = document.getElementsByName('experience')[0];
    var passwordInput = document.getElementsByName('password')[0];
    var confirmPasswordInput = document.getElementsByName('confirmPassword')[0];

    if (firstNameInput) {
        firstNameInput.addEventListener('blur', function() {
            validateFirstName();
        });
        firstNameInput.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(220, 38, 38)') {
                validateFirstName();
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateEmail();
        });
        emailInput.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(220, 38, 38)') {
                validateEmail();
            }
        });
    }

    if (genderSelect) {
        genderSelect.addEventListener('change', function() {
            validateGender();
        });
    }

    if (experienceInput) {
        experienceInput.addEventListener('blur', function() {
            validateExperience();
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            validatePassword();
        });
        passwordInput.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(220, 38, 38)') {
                validatePassword();
            }
            // Re-validate confirm password when password changes
            if (confirmPasswordInput && confirmPasswordInput.value) {
                validateConfirmPassword();
            }
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('blur', function() {
            validateConfirmPassword();
        });
        confirmPasswordInput.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(220, 38, 38)') {
                validateConfirmPassword();
            }
        });
    }
}

// Individual field validators
function validateFirstName() {
    var firstName = document.getElementsByName('firstName')[0].value.trim();
    var errorElement = document.getElementById('firstNameError');
    var inputElement = document.getElementsByName('firstName')[0];
    
    if (errorElement) errorElement.style.display = 'none';
    if (inputElement) inputElement.style.borderColor = '';
    
    if (!firstName) {
        showFieldError('firstName', 'First name is required');
        return false;
    } else if (firstName.length < 2) {
        showFieldError('firstName', 'First name must be at least 2 characters');
        return false;
    } else if (firstName.length > 50) {
        showFieldError('firstName', 'First name must be less than 50 characters');
        return false;
    } else if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
        showFieldError('firstName', 'First name can only contain letters, spaces, hyphens, and apostrophes');
        return false;
    }
    return true;
}

function validateEmail() {
    var email = document.getElementsByName('email')[0].value.trim();
    var errorElement = document.getElementById('emailError');
    var inputElement = document.getElementsByName('email')[0];
    
    if (errorElement) errorElement.style.display = 'none';
    if (inputElement) inputElement.style.borderColor = '';
    
    if (!email) {
        showFieldError('email', 'Email is required');
        return false;
    }
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFieldError('email', 'Please enter a valid email address');
        return false;
    } else if (email.length > 100) {
        showFieldError('email', 'Email must be less than 100 characters');
        return false;
    }
    return true;
}

function validateGender() {
    var gender = document.getElementsByName('gender')[0].value;
    var errorElement = document.getElementById('genderError');
    var inputElement = document.getElementsByName('gender')[0];
    
    if (errorElement) errorElement.style.display = 'none';
    if (inputElement) inputElement.style.borderColor = '';
    
    if (!gender) {
        showFieldError('gender', 'Please select a gender');
        return false;
    }
    return true;
}

function validateExperience() {
    var experience = document.getElementsByName('experience')[0].value;
    var errorElement = document.getElementById('experienceError');
    var inputElement = document.getElementsByName('experience')[0];
    
    if (errorElement) errorElement.style.display = 'none';
    if (inputElement) inputElement.style.borderColor = '';
    
    if (experience !== '') {
        var expNum = parseFloat(experience);
        if (isNaN(expNum) || expNum < 0) {
            showFieldError('experience', 'Experience must be a valid number (0 or greater)');
            return false;
        } else if (expNum > 100) {
            showFieldError('experience', 'Experience cannot exceed 100 years');
            return false;
        }
    }
    return true;
}

function validatePassword() {
    var password = document.getElementsByName('password')[0].value;
    var errorElement = document.getElementById('passwordError');
    var inputElement = document.getElementsByName('password')[0];
    
    if (errorElement) errorElement.style.display = 'none';
    if (inputElement) inputElement.style.borderColor = '';
    
    if (!password) {
        showFieldError('password', 'Password is required');
        return false;
    } else if (password.length < 6) {
        showFieldError('password', 'Password must be at least 6 characters long');
        return false;
    } else if (password.length > 50) {
        showFieldError('password', 'Password must be less than 50 characters');
        return false;
    }
    return true;
}

function validateConfirmPassword() {
    var password = document.getElementsByName('password')[0].value;
    var confirmPassword = document.getElementsByName('confirmPassword')[0].value;
    var errorElement = document.getElementById('confirmPasswordError');
    var inputElement = document.getElementsByName('confirmPassword')[0];
    
    if (errorElement) errorElement.style.display = 'none';
    if (inputElement) inputElement.style.borderColor = '';
    
    if (!confirmPassword) {
        showFieldError('confirmPassword', 'Please confirm your password');
        return false;
    } else if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Passwords do not match');
        return false;
    }
    return true;
}

// Helper function to show field error
function showFieldError(fieldName, message) {
    var errorElement = document.getElementById(fieldName + 'Error');
    var inputElement = document.getElementsByName(fieldName)[0];
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    if (inputElement) {
        inputElement.style.borderColor = '#dc2626';
    }
}

// Initialize signup form validation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementsByName('firstName').length > 0) {
            setupSignupRealTimeValidation();
        }
    });
} else {
    if (document.getElementsByName('firstName').length > 0) {
        setupSignupRealTimeValidation();
    }
}
