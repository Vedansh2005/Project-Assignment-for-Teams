document.addEventListener('DOMContentLoaded', function() {
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var username = document.getElementById('username').value.trim();
            var password = document.getElementById('password').value;
            var errorMessage = document.getElementById('errorMessage');
            
            errorMessage.classList.remove('show');
            
            var formData = new FormData();
            formData.append('action', 'login');
            formData.append('username', username);
            formData.append('password', password);
            
            fetch('auth.php', {
                method: 'POST',
                body: formData
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(result) {
                if (result.success) {
                    // Store session info for compatibility
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userType', result.userType);
                    localStorage.setItem('username', username);
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('userType', result.userType);
                    sessionStorage.setItem('username', username);
                    
                    if (result.userType === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
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

