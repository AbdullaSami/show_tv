// AdminLTE App
var AdminLTEOptions = {
    // Enable sidebar toggle
    sidebarToggleSelector: "[data-toggle='push-menu']",
    sidebarPushMenu: true,
    sidebarExpandOnHover: false,
    enableBoxRefresh: false,
    enableBSToppltip: false,
    controlSidebarOptions: {
        toggleBtnSelector: "[data-toggle='control-sidebar']",
        selector: ".control-sidebar",
        slide: true
    },
    enableBoxWidget: true,
    boxWidgetOptions: {
        boxWidgetIcons: {
            collapse: 'fa-minus',
            open: 'fa-plus',
            remove: 'fa-times'
        },
        boxWidgetSelectors: {
            remove: '[data-widget="remove"]',
            collapse: '[data-widget="collapse"]'
        }
    },
    directChat: {
        contactToggleSelector: '[data-widget="chat-pane-toggle"]',
        toggleSelector: '[data-widget="direct-chat"]'
    },
    colors: {
        lightBlue: "#3c8dbc",
        red: "#f56954",
        green: "#00a65a",
        aqua: "#00c0ef",
        yellow: "#f39c12",
        blue: "#0073b7",
        navy: "#001F3F",
        teal: "#39CCCC",
        olive: "#3D9970",
        lime: "#01FF70",
        orange: "#FF851B",
        fuchsia: "#F012BE",
        purple: "#8E24AA",
        maroon: "#D81B60",
        black: "#222",
        gray: "#d2d6de"
    },
    screenSizes: {
        xs: 480,
        sm: 768,
        md: 992,
        lg: 1200
    }
};

// Main application
$(function () {
    "use strict";

    // Enable sidebar toggle
    $("[data-toggle='push-menu']").on('click', function (e) {
        e.preventDefault();
        if ($(window).width() <= 767) {
            $("body").toggleClass('sidebar-open');
        } else {
            $("body").toggleClass('sidebar-collapse');
        }
    });

    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // Handle logout
    $('#btnLogout').on('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            // Clear any stored authentication data
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            // Redirect to login page
            window.location.href = 'login.html';
        }
    });

    // Navigation handling
    $('.nav-link').on('click', function() {
        const route = $(this).data('route');
        window.location.hash = route;
    });

    // Hash routing
    $(window).on('hashchange', function() {
        const hash = window.location.hash.substring(1) || 'dashboard';
        loadPage(hash);
    });

    // Initialize the dashboard (avoid redirect loop on login page)
    if (!window.location.pathname.endsWith('login.html')) {
        initDashboard();
    }
});

// Initialize dashboard
function initDashboard() {
    // Check if user is authenticated
    const token = localStorage.getItem('admin_token');
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

    if (!token) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }

    // Update admin info in the UI
    if (user.name) {
        $('#adminName').text(user.name);
    }
    if (user.email) {
        $('#adminEmail').text(user.email);
    }

    // Load the initial page based on the hash or default to dashboard
    const hash = window.location.hash.substring(1) || 'dashboard';
    loadPage(hash);
}

// Load page content
function loadPage(page) {
    showLoading();

    // Update active navigation
    $('.nav-link').parent().removeClass('active');
    $(`.nav-link[data-route="${page}"]`).parent().addClass('active');

    // Update page title
    const pageTitle = page.charAt(0).toUpperCase() + page.slice(1);
    $('#pageTitle').html(`
        ${pageTitle}
        <small>${page === 'dashboard' ? 'Control panel' : 'Management'}</small>
    `);

    // Update breadcrumb
    $('#breadcrumbActive').text(pageTitle);

    // Load the appropriate content
    const contentMap = {
        'dashboard': loadDashboard,
        'shows': loadShows,
        'seasons': loadSeasons,
        'episodes': loadEpisodes,
        'users': loadUsers
    };

    const loadFunction = contentMap[page] || loadDashboard;
    loadFunction();
}

// Show loading spinner
function showLoading() {
    $('.loading-spinner').css('display', 'flex');
}

// Hide loading spinner
function hideLoading() {
    $('.loading-spinner').hide();
}

// Show alert message
function showAlert(message, type = 'success') {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible">
            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>
            <h4><i class="icon fa fa-${type === 'success' ? 'check' : 'ban'}"></i> ${type.charAt(0).toUpperCase() + type.slice(1)}!</h4>
            ${message}
        </div>
    `;

    // If there's already an alert, remove it first
    $('.alert-dismissible').remove();

    // Add the new alert
    $('.content-header').after(alertHtml);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        $('.alert-dismissible').fadeOut('slow', function() {
            $(this).remove();
        });
    }, 5000);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Initialize the app when the document is ready
$(document).ready(function() {
    // Check if we're on the login page
    if (window.location.pathname.endsWith('login.html')) {
        // Initialize login page
        if (typeof handleLogin === 'function') {
            $('#loginForm').on('submit', handleLogin);
        }
    } else {
        // Initialize the admin dashboard
        initDashboard();
    }
});
