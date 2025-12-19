// TV Shows management page

var AdminShows = (function () {
    var state = {
        shows: [],
        query: ''
    };

    function renderPage() {
        var html = '';
        html += '<div class="box">';
        html += '  <div class="box-header with-border">';
        html += '    <div class="row">';
        html += '      <div class="col-sm-6">';
        html += '        <h3 class="box-title">Manage TV Shows</h3>';
        html += '      </div>';
        html += '      <div class="col-sm-6 text-right">';
        html += '        <button class="btn btn-primary" id="btnAddShow"><i class="fa fa-plus"></i> Add TV Show</button>';
        html += '      </div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="box-body">';
        html += '    <div class="row" style="margin-bottom:10px;">';
        html += '      <div class="col-sm-6">';
        html += '        <input type="text" class="form-control" id="showSearch" placeholder="Search by title or description">';
        html += '      </div>';
        html += '    </div>';
        html += '    <div class="table-responsive">';
        html += '      <table class="table table-bordered table-hover" id="showsTable">';
        html += '        <thead>';
        html += '          <tr>';
        html += '            <th>Title</th>';
        html += '            <th>Description</th>';
        html += '            <th>Seasons</th>';
        html += '            <th>Likes</th>';
        html += '            <th>Followers</th>';
        html += '            <th style="width:140px;">Actions</th>';
        html += '          </tr>';
        html += '        </thead>';
        html += '        <tbody><tr><td colspan="6" class="text-center">Loading...</td></tr></tbody>';
        html += '      </table>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';

        html += renderModal();

        $('#mainContent').html(html);

        $('#showSearch').on('keyup', AdminUtils.debounce(function () {
            state.query = ($('#showSearch').val() || '').toLowerCase();
            renderTable();
        }, 200));

        $('#btnAddShow').on('click', function () {
            openModal(null);
        });

        $('#showForm').on('submit', onSubmit);

        loadShows();
    }

    function renderModal() {
        var days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
        var daysHtml = days.map(function (d) {
            return '<label class="checkbox-inline"><input type="checkbox" name="air_days" value="' + d + '"> ' + d + '</label>';
        }).join('');

        return (
            '<div class="modal fade" id="showModal" tabindex="-1" role="dialog">' +
            '  <div class="modal-dialog" role="document">' +
            '    <div class="modal-content">' +
            '      <div class="modal-header">' +
            '        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '        <h4 class="modal-title" id="showModalTitle">Add TV Show</h4>' +
            '      </div>' +
            '      <form id="showForm">' +
            '        <div class="modal-body">' +
            '          <input type="hidden" id="showId">' +
            '          <div class="form-group">' +
            '            <label>Title</label>' +
            '            <input type="text" class="form-control" id="showTitle" required>' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Description</label>' +
            '            <textarea class="form-control" id="showDescription" rows="3"></textarea>' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Air Time (HH:mm)</label>' +
            '            <input type="text" class="form-control" id="showAirTime" placeholder="20:30" required>' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Air Days</label><br>' +
                         daysHtml +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Poster</label>' +
            '            <input type="file" id="showPoster" accept="image/*">' +
            '          </div>' +
            '        </div>' +
            '        <div class="modal-footer">' +
            '          <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>' +
            '          <button type="submit" class="btn btn-primary" id="btnSaveShow">Save</button>' +
            '        </div>' +
            '      </form>' +
            '    </div>' +
            '  </div>' +
            '</div>'
        );
    }

    function openModal(show) {
        $('#showId').val(show ? show.id : '');
        $('#showTitle').val(show ? show.title : '');
        $('#showDescription').val(show ? (show.description || '') : '');
        $('#showAirTime').val(show ? (show.air_time || '') : '');
        $('#showPoster').val('');

        $('input[name="air_days"]').prop('checked', false);
        if (show && Array.isArray(show.air_days)) {
            show.air_days.forEach(function (d) {
                $('input[name="air_days"][value="' + d + '"]').prop('checked', true);
            });
        }

        if (show && Array.isArray(show.airDays)) {
            show.airDays.forEach(function (obj) {
                $('input[name="air_days"][value="' + obj.day + '"]').prop('checked', true);
            });
        }

        $('#showModalTitle').text(show ? 'Edit TV Show' : 'Add TV Show');
        $('#showModal').modal('show');
    }

    function loadShows() {
        showLoading();
        ApiService.getShows()
            .then(function (res) {
                state.shows = (res && res.data) ? res.data : [];
                renderTable();
            })
            .fail(function (jqXHR) {
                var msg = AdminUtils.getAjaxErrorMessage(jqXHR);
                showAlert(msg, 'danger');
                $('#showsTable tbody').html('<tr><td colspan="6" class="text-center text-danger">Failed to load shows</td></tr>');
            })
            .always(function () {
                hideLoading();
            });
    }

    function getFiltered() {
        if (!state.query) return state.shows;
        return state.shows.filter(function (s) {
            var title = (s.title || '').toLowerCase();
            var desc = (s.description || '').toLowerCase();
            return title.indexOf(state.query) !== -1 || desc.indexOf(state.query) !== -1;
        });
    }

    function renderTable() {
        var rows = '';
        var list = getFiltered();

        if (!list.length) {
            rows = '<tr><td colspan="6" class="text-center">No shows found</td></tr>';
            $('#showsTable tbody').html(rows);
            return;
        }

        list.forEach(function (s) {
            var seasonsCount = Array.isArray(s.seasons) ? s.seasons.length : (s.seasons_count || 0);
            var likes = (typeof s.likesCount === 'number') ? s.likesCount : (s.likes_count || 0);
            rows += '<tr>';
            rows += '  <td>' + (s.title || '') + '</td>';
            rows += '  <td>' + (s.description || '') + '</td>';
            rows += '  <td>' + seasonsCount + '</td>';
            rows += '  <td>' + likes + '</td>';
            rows += '  <td>N/A</td>';
            rows += '  <td>';
            rows += '    <button class="btn btn-xs btn-info btnEditShow" data-id="' + s.id + '"><i class="fa fa-pencil"></i> Edit</button> ';
            rows += '    <button class="btn btn-xs btn-danger btnDeleteShow" data-id="' + s.id + '"><i class="fa fa-trash"></i> Delete</button>';
            rows += '  </td>';
            rows += '</tr>';
        });

        $('#showsTable tbody').html(rows);

        $('.btnEditShow').off('click').on('click', function () {
            var id = $(this).data('id');
            var show = state.shows.find(function (x) { return x.id === id; }) || null;
            openModal(show);
        });

        $('.btnDeleteShow').off('click').on('click', function () {
            var id = $(this).data('id');
            if (!confirm('Delete this show?')) return;

            showLoading();
            ApiService.deleteShow(id)
                .then(function () {
                    showAlert('Show deleted', 'success');
                    loadShows();
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

        var id = $('#showId').val();
        var title = $('#showTitle').val();
        var description = $('#showDescription').val();
        var airTime = $('#showAirTime').val();

        var days = [];
        $('input[name="air_days"]:checked').each(function () {
            days.push($(this).val());
        });

        var posterFile = $('#showPoster')[0].files[0];

        var fd = new FormData();
        fd.append('title', title);
        fd.append('description', description);
        fd.append('air_time', airTime);
        days.forEach(function (d) { fd.append('air_days[]', d); });
        if (posterFile) fd.append('poster', posterFile);

        showLoading();

        var req;
        if (id) {
            req = ApiService.updateShow(id, fd);
        } else {
            req = ApiService.createShow(fd);
        }

        req.then(function () {
                $('#showModal').modal('hide');
                showAlert('Saved successfully', 'success');
                loadShows();
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

function loadShows() {
    AdminShows.load();
}
