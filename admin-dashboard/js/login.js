// Admin login page logic

(function () {
    function showLoginAlert(message, type) {
        var html = '';
        html += '<div class="alert alert-' + (type || 'danger') + ' alert-dismissible">';
        html += '  <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>';
        html += message;
        html += '</div>';
        $('#loginAlert').html(html);
    }

    function showLoadingLocal() {
        $('.loading-spinner').css('display', 'flex');
    }

    function hideLoadingLocal() {
        $('.loading-spinner').hide();
    }

    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        var email = $('#loginEmail').val();
        var password = $('#loginPassword').val();

        showLoadingLocal();
        ApiService.login({ email: email, password: password })
            .then(function (res) {
                if (!res || !res.access_token) {
                    showLoginAlert('Login failed', 'danger');
                    return;
                }

                localStorage.setItem('admin_token', res.access_token);
                localStorage.setItem(
                    'admin_user',
                    JSON.stringify({
                        name: res.user_name || 'Admin',
                        email: res.user_email || email,
                        image: res.user_image || null
                    })
                );

                window.location.href = 'index.html#dashboard';
            })
            .fail(function (jqXHR) {
                showLoginAlert(AdminUtils.getAjaxErrorMessage(jqXHR), 'danger');
            })
            .always(function () {
                hideLoadingLocal();
            });
    });
})();
