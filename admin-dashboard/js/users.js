// Users management page

var AdminUsers = (function () {
    var state = {
        users: [],
        query: '',
        permissions: [],
        selectedPermissionIds: []
    };

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
        html += '    <div class="row" style="margin-bottom:10px;">';
        html += '      <div class="col-sm-6">';
        html += '        <input type="text" class="form-control" id="userSearch" placeholder="Search by name or email">';
        html += '      </div>';
        html += '    </div>';
        html += '    <div class="table-responsive">';
        html += '      <table class="table table-bordered table-hover" id="usersTable">';
        html += '        <thead>';
        html += '          <tr>';
        html += '            <th>Name</th>';
        html += '            <th>Email</th>';
        html += '            <th>Role</th>';
        html += '            <th style="width:140px;">Actions</th>';
        html += '          </tr>';
        html += '        </thead>';
        html += '        <tbody><tr><td colspan="4" class="text-center">Loading...</td></tr></tbody>';
        html += '      </table>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';

        html += renderModal();

        $('#mainContent').html(html);

        $('#userSearch').on('keyup', AdminUtils.debounce(function () {
            state.query = ($('#userSearch').val() || '').toLowerCase();
            renderTable();
        }, 200));

        $('#btnAddUser').on('click', function () {
            openModal(null);
        });

        $('#userForm').on('submit', onSubmit);

        loadPermissionsList();
        loadUsersList();
    }

    function renderModal() {
        return (
            '<div class="modal fade" id="userModal" tabindex="-1" role="dialog">' +
            '  <div class="modal-dialog" role="document">' +
            '    <div class="modal-content">' +
            '      <div class="modal-header">' +
            '        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '        <h4 class="modal-title" id="userModalTitle">Add User</h4>' +
            '      </div>' +
            '      <form id="userForm">' +
            '        <div class="modal-body">' +
            '          <input type="hidden" id="userId">' +
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
            '            <input type="password" class="form-control" id="userPassword" minlength="8">' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Confirm Password</label>' +
            '            <input type="password" class="form-control" id="userPasswordConfirm" minlength="8">' +
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
            '          <div class="form-group">' +
            '            <label>Permissions</label>' +
            '            <div id="permissionsContainer" style="max-height:200px;overflow:auto;"></div>' +
            '          </div>' +
            '        </div>' +
            '        <div class="modal-footer">' +
            '          <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>' +
            '          <button type="submit" class="btn btn-primary" id="btnSaveUser">Save</button>' +
            '        </div>' +
            '      </form>' +
            '    </div>' +
            '  </div>' +
            '</div>'
        );
    }

    function openModal(user) {
        $('#userId').val(user ? user.id : '');
        $('#userName').val(user ? (user.name || '') : '');
        $('#userEmail').val(user ? (user.email || '') : '');
        $('#userRole').val(getRoleValue(user));
        $('#userImage').val('');
        $('#userPassword').val('');
        $('#userPasswordConfirm').val('');

        state.selectedPermissionIds = getUserPermissionIds(user);
        renderPermissions(state.selectedPermissionIds);

        $('#userModalTitle').text(user ? 'Edit User' : 'Add User');
        $('#btnSaveUser').text(user ? 'Save' : 'Create');
        $('#userModal').modal('show');
    }

    function getUserPermissionIds(user) {
        if (!user) return [];
        if (Array.isArray(user.permissions)) {
            return user.permissions
                .map(function (p) { return p ? (p.id || p.permission_id) : null; })
                .filter(function (x) { return x !== null && x !== undefined; })
                .map(function (x) { return String(x); });
        }
        return [];
    }

    function normalizePermissionsResponse(res) {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        return [];
    }

    function loadPermissionsList() {
        ApiService.getPermissions()
            .then(function (res) {
                state.permissions = normalizePermissionsResponse(res);
                if ($('#userModal').hasClass('in')) {
                    renderPermissions(state.selectedPermissionIds);
                }
            })
            .fail(function (jqXHR) {
                showAlert(AdminUtils.getAjaxErrorMessage(jqXHR), 'danger');
                state.permissions = [];
            });
    }

    function renderPermissions(selectedIds) {
        var ids = (selectedIds || []).map(function (x) { return String(x); });

        if (!state.permissions || !state.permissions.length) {
            $('#permissionsContainer').html('<div class="text-muted">No permissions loaded</div>');
            return;
        }

        var html = '';
        state.permissions.forEach(function (p) {
            var id = p && (p.id !== undefined ? p.id : p.permission_id);
            if (id === undefined || id === null) return;
            var checked = ids.indexOf(String(id)) !== -1 ? 'checked' : '';
            var label = (p && p.name) ? p.name : String(id);
            html += '<label class="checkbox-inline" style="margin-right:10px;">';
            html += '<input type="checkbox" class="userPermission" value="' + id + '" ' + checked + '> ' + label;
            html += '</label>';
        });

        $('#permissionsContainer').html(html);
    }

    function normalizeUsersResponse(res) {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        return [];
    }

    function getRoleValue(user) {
        if (!user) return 'user';
        if (user.role && typeof user.role === 'string') return user.role;
        if (user.role_name && typeof user.role_name === 'string') return user.role_name;
        if (Array.isArray(user.roles) && user.roles.length && user.roles[0] && user.roles[0].name) {
            return user.roles[0].name;
        }
        return 'user';
    }

    function getRoleLabel(user) {
        if (!user) return 'N/A';
        if (user.role && typeof user.role === 'string') return user.role;
        if (user.role_name && typeof user.role_name === 'string') return user.role_name;
        if (Array.isArray(user.roles) && user.roles.length) {
            var names = user.roles
                .map(function (r) { return (r && r.name) ? r.name : null; })
                .filter(Boolean);
            if (names.length) return names.join(', ');
        }
        return 'N/A';
    }

    function loadUsersList() {
        showLoading();
        ApiService.getUsers()
            .then(function (res) {
                state.users = normalizeUsersResponse(res);
                renderTable();
            })
            .fail(function (jqXHR) {
                var msg = AdminUtils.getAjaxErrorMessage(jqXHR);
                showAlert(msg, 'danger');
                $('#usersTable tbody').html('<tr><td colspan="4" class="text-center text-danger">Failed to load users</td></tr>');
            })
            .always(function () {
                hideLoading();
            });
    }

    function getFiltered() {
        if (!state.query) return state.users;
        return state.users.filter(function (u) {
            var name = (u.name || '').toLowerCase();
            var email = (u.email || '').toLowerCase();
            return name.indexOf(state.query) !== -1 || email.indexOf(state.query) !== -1;
        });
    }

    function renderTable() {
        var rows = '';
        var list = getFiltered();

        if (!list.length) {
            rows = '<tr><td colspan="4" class="text-center">No users found</td></tr>';
            $('#usersTable tbody').html(rows);
            return;
        }

        list.forEach(function (u) {
            rows += '<tr>';
            rows += '  <td>' + (u.name || '') + '</td>';
            rows += '  <td>' + (u.email || '') + '</td>';
            rows += '  <td>' + getRoleLabel(u) + '</td>';
            rows += '  <td>';
            rows += '    <button class="btn btn-xs btn-info btnEditUser" data-id="' + u.id + '"><i class="fa fa-pencil"></i> Edit</button> ';
            rows += '    <button class="btn btn-xs btn-danger btnDeleteUser" data-id="' + u.id + '"><i class="fa fa-trash"></i> Delete</button>';
            rows += '  </td>';
            rows += '</tr>';
        });

        $('#usersTable tbody').html(rows);

        $('.btnEditUser').off('click').on('click', function () {
            var id = $(this).data('id');
            var user = state.users.find(function (x) { return x.id === id; }) || null;
            openModal(user);
        });

        $('.btnDeleteUser').off('click').on('click', function () {
            var id = $(this).data('id');
            if (!confirm('Delete this user?')) return;

            showLoading();
            ApiService.deleteUser(id)
                .then(function () {
                    showAlert('User deleted', 'success');
                    loadUsersList();
                })
                .fail(function (jqXHR) {
                    showAlert(AdminUtils.getAjaxErrorMessage(jqXHR), 'danger');
                })
                .always(function () {
                    hideLoading();
                });
        });
    }

    function onSubmit(e) {
        e.preventDefault();

        var id = $('#userId').val();
        var name = $('#userName').val();
        var email = $('#userEmail').val();
        var pass = $('#userPassword').val();
        var pass2 = $('#userPasswordConfirm').val();
        var role = $('#userRole').val();
        var img = $('#userImage')[0].files[0];

        if (!id && !pass) {
            showAlert('Password is required', 'danger');
            return;
        }

        if ((pass || pass2) && pass !== pass2) {
            showAlert('Passwords do not match', 'danger');
            return;
        }

        if (pass && pass.length < 8) {
            showAlert('Password must be at least 8 characters', 'danger');
            return;
        }

        var fd = new FormData();
        fd.append('name', name);
        fd.append('email', email);
        fd.append('role', role);
        if (pass) fd.append('password', pass);
        if (img) fd.append('image', img);

        var permIds = [];
        $('.userPermission:checked').each(function () {
            permIds.push($(this).val());
        });
        permIds.forEach(function (pid) {
            fd.append('permissions[]', pid);
        });

        showLoading();
        var req;
        if (id) {
            req = ApiService.updateUser(id, fd);
        } else {
            req = ApiService.createUser(fd);
        }

        req.then(function () {
                $('#userModal').modal('hide');
                showAlert('Saved successfully', 'success');
                loadUsersList();
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
