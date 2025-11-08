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
