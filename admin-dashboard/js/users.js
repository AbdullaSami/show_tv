// Users management page
// Note: Your current backend does not expose a users listing endpoint in routes/api.php.
// This page still provides an "Add User" modal using /register, which can create users.

var AdminUsers = (function () {
    function renderPage() {
        var html = '';
        html += '<div class="box">';
        html += '  <div class="box-header with-border">';
        html += '    <div class="row">';
        html += '      <div class="col-sm-6">';
        html += '        <h3 class="box-title">Manage Users</h3>';
        html += '      </div>';
        html += '      <div class="col-sm-6 text-right">';
        html += '        <button class="btn btn-primary" id="btnAddUser"><i class="fa fa-user-plus"></i> Add User</button>';
        html += '      </div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="box-body">';
        html += '    <div class="alert alert-warning">';
        html += '      <strong>Heads up:</strong> No users listing endpoint was found in your current backend API. This page includes the UI and an Add User action via <code>/register</code>.';
        html += '    </div>';
        html += '    <div class="table-responsive">';
        html += '      <table class="table table-bordered table-hover" id="usersTable">';
        html += '        <thead>';
        html += '          <tr>';
        html += '            <th>Name</th>';
        html += '            <th>Email</th>';
        html += '            <th>Role</th>';
        html += '            <th>Followed Shows</th>';
        html += '            <th style="width:140px;">Actions</th>';
        html += '          </tr>';
        html += '        </thead>';
        html += '        <tbody><tr><td colspan="5" class="text-center">N/A</td></tr></tbody>';
        html += '      </table>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';

        html += renderModal();

        $('#mainContent').html(html);

        $('#btnAddUser').on('click', function () {
            $('#userForm')[0].reset();
            $('#userModal').modal('show');
        });

        $('#userForm').on('submit', onSubmit);
    }

    function renderModal() {
        return (
            '<div class="modal fade" id="userModal" tabindex="-1" role="dialog">' +
            '  <div class="modal-dialog" role="document">' +
            '    <div class="modal-content">' +
            '      <div class="modal-header">' +
            '        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '        <h4 class="modal-title">Add User</h4>' +
            '      </div>' +
            '      <form id="userForm">' +
            '        <div class="modal-body">' +
            '          <div class="form-group">' +
            '            <label>Name</label>' +
            '            <input type="text" class="form-control" id="userName" required>' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Email</label>' +
            '            <input type="email" class="form-control" id="userEmail" required>' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Password</label>' +
            '            <input type="password" class="form-control" id="userPassword" minlength="8" required>' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Confirm Password</label>' +
            '            <input type="password" class="form-control" id="userPasswordConfirm" minlength="8" required>' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Role</label>' +
            '            <select class="form-control" id="userRole">' +
            '              <option value="user">User</option>' +
            '              <option value="admin">Admin</option>' +
            '              <option value="moderator">Moderator</option>' +
            '            </select>' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>User Image</label>' +
            '            <input type="file" id="userImage" accept="image/*">' +
            '          </div>' +
            '        </div>' +
            '        <div class="modal-footer">' +
            '          <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>' +
            '          <button type="submit" class="btn btn-primary">Create</button>' +
            '        </div>' +
            '      </form>' +
            '    </div>' +
            '  </div>' +
            '</div>'
        );
    }

    function onSubmit(e) {
        e.preventDefault();

        var name = $('#userName').val();
        var email = $('#userEmail').val();
        var pass = $('#userPassword').val();
        var pass2 = $('#userPasswordConfirm').val();
        var role = $('#userRole').val();
        var img = $('#userImage')[0].files[0];

        if (pass !== pass2) {
            showAlert('Passwords do not match', 'danger');
            return;
        }

        var fd = new FormData();
        fd.append('name', name);
        fd.append('email', email);
        fd.append('password', pass);
        fd.append('password_confirmation', pass2);
        fd.append('role', role);
        if (img) fd.append('image', img);

        showLoading();
        ApiService.register(fd)
            .then(function () {
                $('#userModal').modal('hide');
                showAlert('User created successfully', 'success');
            })
            .fail(function (jqXHR) {
                showAlert(AdminUtils.getAjaxErrorMessage(jqXHR), 'danger');
            })
            .always(function () {
                hideLoading();
            });
    }

    return {
        load: renderPage
    };
})();

function loadUsers() {
    AdminUsers.load();
}
