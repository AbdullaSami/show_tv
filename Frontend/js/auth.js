// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();

    const email = $('#loginEmail').val().trim();
    const password = $('#loginPassword').val();

    if (!email || !password) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }

    try {
        showLoading();

        const response = await fetch(`${config.apiBaseUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Save token and user data
        localStorage.setItem(config.tokenKey, data.access_token);
        localStorage.setItem(config.userKey, JSON.stringify({
            name: data.user_name,
            email: data.user_email,
            image: data.user_image
        }));

        // Update state
        state.authToken = data.access_token;
        state.currentUser = {
            name: data.user_name,
            email: data.user_email,
            image: data.user_image
        };

        // Update UI
        updateAuthUI(true);
        $('#loginModal').modal('hide');
        showAlert('Login successful!', 'success');

        // Reset form
        $('#loginForm')[0].reset();

        // Reload content that requires authentication
        loadRandomShows();
        loadLatestEpisodes();

    } catch (error) {
        console.error('Login error:', error);
        showAlert(error.message || 'Login failed. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Handle registration form submission
async function handleRegister(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', $('#registerName').val().trim());
    formData.append('email', $('#registerEmail').val().trim());
    formData.append('password', $('#registerPassword').val());
    formData.append('password_confirmation', $('#registerPasswordConfirm').val());

    // Add profile image if selected
    const imageInput = $('#registerImage')[0];
    if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }

    // Basic validation
    if (!formData.get('name') || !formData.get('email') || !formData.get('password')) {
        showAlert('Please fill in all required fields', 'danger');
        return;
    }

    if (formData.get('password') !== formData.get('password_confirmation')) {
        showAlert('Passwords do not match', 'danger');
        return;
    }

    try {
        showLoading();

        const response = await fetch(`${config.apiBaseUrl}/register`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Auto-login after registration
        localStorage.setItem(config.tokenKey, data.access_token);
        localStorage.setItem(config.userKey, JSON.stringify({
            name: data.user_name,
            email: data.user_email,
            image: data.user_image
        }));

        // Update state
        state.authToken = data.access_token;
        state.currentUser = {
            name: data.user_name,
            email: data.user_email,
            image: data.user_image
        };

        // Update UI
        updateAuthUI(true);
        $('#registerModal').modal('hide');
        showAlert('Registration successful!', 'success');

        // Reset form
        $('#registerForm')[0].reset();

        // Reload content that requires authentication
        loadRandomShows();
        loadLatestEpisodes();

    } catch (error) {
        console.error('Registration error:', error);
        showAlert(error.message || 'Registration failed. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Handle logout
function handleLogout() {
    // Clear auth data
    localStorage.removeItem(config.tokenKey);
    localStorage.removeItem(config.userKey);

    // Reset state
    state.authToken = null;
    state.currentUser = null;

    // Update UI
    updateAuthUI(false);
    showAlert('You have been logged out', 'info');

    // Reload the page to reset the application state
    window.location.href = '/';
}

// Add logout functionality to the logout button
$(document).on('click', '.logout-link', function(e) {
    e.preventDefault();
    handleLogout();
});
