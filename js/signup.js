var skills = [];

function addSkill() {
    var skillInput = document.getElementById('skillInput');
    var skill = skillInput.value.trim();
    if (skill && skills.indexOf(skill) === -1) {
        skills.push(skill);
        updateSkillsDisplay();
        skillInput.value = '';
    }
}

function removeSkill(skill) {
    var index = skills.indexOf(skill);
    if (index > -1) {
        skills.splice(index, 1);
        updateSkillsDisplay();
    }
}

function updateSkillsDisplay() {
    var skillsList = document.getElementById('skillsList');
    skillsList.innerHTML = '';
    for (var i = 0; i < skills.length; i++) {
        var tag = document.createElement('span');
        tag.className = 'skill-tag';
        var skillName = skills[i];
        var removeBtn = document.createElement('span');
        removeBtn.textContent = ' ×';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.color = '#666';
        removeBtn.onclick = (function(skill) {
            return function() {
                removeSkill(skill);
            };
        })(skillName);
        tag.textContent = skillName;
        tag.appendChild(removeBtn);
        skillsList.appendChild(tag);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var skillInput = document.getElementById('skillInput');
    var addSkillBtn = document.getElementById('addSkillBtn');
    
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', addSkill);
    }
    
    if (skillInput) {
        skillInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
            }
        });
    }
    
    var signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var firstName = document.getElementById('firstName').value.trim();
            var email = document.getElementById('email').value.trim();
            var gender = document.getElementById('gender').value;
            var experience = document.getElementById('experience').value;
            var qualifications = document.getElementById('qualifications').value.trim();
            var password = document.getElementById('password').value;
            var confirmPassword = document.getElementById('confirmPassword').value;
            var errorMessage = document.getElementById('errorMessage');
            var successMessage = document.getElementById('successMessage');
            
            errorMessage.classList.remove('show');
            successMessage.classList.remove('show');
            
            if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match';
                errorMessage.classList.add('show');
                return;
            }
            
            if (password.length < 6) {
                errorMessage.textContent = 'Password must be at least 6 characters long';
                errorMessage.classList.add('show');
                return;
            }
            
            var qualificationsList = qualifications.split('\n').filter(function(q) {
                return q.trim().length > 0;
            });
            
            var formData = new FormData();
            formData.append('action', 'signup');
            formData.append('firstName', firstName);
            formData.append('email', email);
            formData.append('gender', gender);
            formData.append('password', password);
            formData.append('experience', experience);
            formData.append('skills', JSON.stringify(skills));
            formData.append('qualifications', JSON.stringify(qualificationsList));
            
            fetch('users.php', {
                method: 'POST',
                body: formData
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(result) {
                if (result.success) {
                    successMessage.textContent = 'Account created successfully! Redirecting to login...';
                    successMessage.classList.add('show');
                    setTimeout(function() {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    errorMessage.textContent = result.message;
                    errorMessage.classList.add('show');
                }
            })
            .catch(function(error) {
                errorMessage.textContent = 'Error connecting to server';
                errorMessage.classList.add('show');
            });
        });
    }
});

