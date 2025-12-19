// Main Application Configuration
const config = {
    apiBaseUrl: 'http://localhost:8000/api', // Update this to your backend URL
    tokenKey: 'showtv_auth_token',
    userKey: 'showtv_user_data'
};

// State Management
const state = {
    currentUser: null,
    authToken: localStorage.getItem(config.tokenKey) || null
};

// Initialize the application when the DOM is fully loaded
$(document).ready(function() {
    checkAuthStatus();
    setupEventListeners();
    loadRandomShows();
    loadLatestEpisodes();
    handleNavigation();
});

// Check if user is authenticated
function checkAuthStatus() {
    const token = localStorage.getItem(config.tokenKey);
    const userData = localStorage.getItem(config.userKey);

    if (token && userData) {
        try {
            state.currentUser = JSON.parse(userData);
            updateAuthUI(true);
        } catch (e) {
            console.error('Error parsing user data:', e);
            logout();
        }
    } else {
        updateAuthUI(false);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    $('.home-link').on('click', function(e) {
        e.preventDefault();
        loadLatestEpisodes();
    });

    // Auth modals
    $('.login-link').on('click', function(e) {
        e.preventDefault();
        $('#loginModal').modal('show');
    });

    $('.register-link').on('click', function(e) {
        e.preventDefault();
        $('#registerModal').modal('show');
    });

    // Search form
    $('.search-form').on('submit', function(e) {
        e.preventDefault();
        const query = $('.search-input').val().trim();
        if (query) {
            searchShows(query);
        }
    });

    // Login form
    $('#loginForm').on('submit', handleLogin);

    // Register form
    $('#registerForm').on('submit', handleRegister);
}

// Update UI based on authentication status
function updateAuthUI(isAuthenticated) {
    if (isAuthenticated) {
        $('.login-link, .register-link').hide();
        $('.user-profile-link').show().find('img').attr('src', state.currentUser?.image || 'img/default-avatar.jpg');
    } else {
        $('.login-link, .register-link').show();
        $('.user-profile-link').hide();
    }
}

// Handle navigation
function handleNavigation() {
    $(document).on('click', '[data-route]', function(e) {
        e.preventDefault();
        const route = $(this).data('route');
        const id = $(this).data('id');

        switch(route) {
            case 'show':
                loadShowPage(id);
                break;
            case 'season':
                loadSeasonPage(id);
                break;
            case 'episode':
                loadEpisodePage(id);
                break;
            case 'profile':
                loadUserProfile();
                break;
        }
    });
}

// Show loading spinner
function showLoading() {
    $('.loading-spinner').show();
}

// Hide loading spinner
function hideLoading() {
    $('.loading-spinner').hide();
}

// Show alert message
function showAlert(message, type = 'success') {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade in" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            ${message}
        </div>
    `;

    $('.page-content').prepend(alertHtml);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        $('.alert').fadeOut('slow', function() {
            $(this).remove();
        });
    }, 5000);
}

// API Request Helper
async function apiRequest(url, method = 'GET', data = null, requiresAuth = true) {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    if (requiresAuth && state.authToken) {
        headers['Authorization'] = `Bearer ${state.authToken}`;
    }

    const options = {
        method,
        headers,
        body: data ? JSON.stringify(data) : null
    };

    try {
        const response = await fetch(`${config.apiBaseUrl}${url}`, options);
        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || 'Something went wrong');
        }

        return responseData;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Initialize the application
function init() {
    // Check authentication status
    const token = localStorage.getItem('auth_token');
    if (token) {
        // Set auth header for all requests
        $.ajaxSetup({
            headers: {
                'Authorization': 'Bearer ' + token,
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        updateAuthUI(true);
    } else {
        updateAuthUI(false);
    }
}

// Call init when document is ready
$(document).ready(init);
