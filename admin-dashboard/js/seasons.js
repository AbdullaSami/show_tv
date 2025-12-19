// Seasons management page

var AdminSeasons = (function () {
    var state = {
        shows: [],
        seasons: [],
        selectedShowId: ''
    };

    function renderPage() {
        var html = '';
        html += '<div class="box">';
        html += '  <div class="box-header with-border">';
        html += '    <div class="row">';
        html += '      <div class="col-sm-6">';
        html += '        <h3 class="box-title">Manage Seasons</h3>';
        html += '      </div>';
        html += '      <div class="col-sm-6 text-right">';
        html += '        <button class="btn btn-primary" id="btnAddSeason"><i class="fa fa-plus"></i> Add Season</button>';
        html += '      </div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="box-body">';
        html += '    <div class="row" style="margin-bottom:10px;">';
        html += '      <div class="col-sm-6">';
        html += '        <label>TV Show</label>';
        html += '        <select class="form-control" id="seasonShowSelect"></select>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div class="table-responsive">';
        html += '      <table class="table table-bordered table-hover" id="seasonsTable">';
        html += '        <thead>';
        html += '          <tr>';
        html += '            <th>Season #</th>';
        html += '            <th>Title</th>';
        html += '            <th>Show</th>';
        html += '            <th>Episodes</th>';
        html += '            <th style="width:140px;">Actions</th>';
        html += '          </tr>';
        html += '        </thead>';
        html += '        <tbody><tr><td colspan="5" class="text-center">Select a show</td></tr></tbody>';
        html += '      </table>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';

        html += renderModal();

        $('#mainContent').html(html);

        $('#btnAddSeason').on('click', function () {
            openModal(null);
        });

        $('#seasonForm').on('submit', onSubmit);

        loadShows();
    }

    function renderModal() {
        return (
            '<div class="modal fade" id="seasonModal" tabindex="-1" role="dialog">' +
            '  <div class="modal-dialog" role="document">' +
            '    <div class="modal-content">' +
            '      <div class="modal-header">' +
            '        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '        <h4 class="modal-title" id="seasonModalTitle">Add Season</h4>' +
            '      </div>' +
            '      <form id="seasonForm">' +
            '        <div class="modal-body">' +
            '          <input type="hidden" id="seasonId">' +
            '          <div class="form-group">' +
            '            <label>TV Show</label>' +
            '            <select class="form-control" id="seasonShow" required></select>' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Season Number</label>' +
            '            <input type="number" class="form-control" id="seasonNumber" min="1" required>' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Title</label>' +
            '            <input type="text" class="form-control" id="seasonTitle" required>' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Poster</label>' +
            '            <input type="file" id="seasonPoster" accept="image/*">' +
            '          </div>' +
            '        </div>' +
            '        <div class="modal-footer">' +
            '          <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>' +
            '          <button type="submit" class="btn btn-primary">Save</button>' +
            '        </div>' +
            '      </form>' +
            '    </div>' +
            '  </div>' +
            '</div>'
        );
    }

    function loadShows() {
        showLoading();
        ApiService.getShows()
            .then(function (res) {
                state.shows = (res && res.data) ? res.data : [];
                AdminUtils.setSelectOptions($('#seasonShowSelect'), state.shows, 'id', 'title', 'Select show');
                AdminUtils.setSelectOptions($('#seasonShow'), state.shows, 'id', 'title', 'Select show');

                $('#seasonShowSelect').off('change').on('change', function () {
                    state.selectedShowId = $(this).val();
                    loadSeasons();
                });

                hideLoading();
            })
            .fail(function (jqXHR) {
                hideLoading();
                showAlert(AdminUtils.getAjaxErrorMessage(jqXHR), 'danger');
            });
    }

    function loadSeasons() {
        if (!state.selectedShowId) {
            $('#seasonsTable tbody').html('<tr><td colspan="5" class="text-center">Select a show</td></tr>');
            return;
        }

        showLoading();
        ApiService.getSeasonsByShow(state.selectedShowId)
            .then(function (res) {
                state.seasons = (res && res.data) ? res.data : [];
                renderTable();
            })
            .fail(function (jqXHR) {
                showAlert(AdminUtils.getAjaxErrorMessage(jqXHR), 'danger');
                $('#seasonsTable tbody').html('<tr><td colspan="5" class="text-center text-danger">Failed to load seasons</td></tr>');
            })
            .always(function () {
                hideLoading();
            });
    }

    function renderTable() {
        var showTitle = '';
        var show = state.shows.find(function (s) { return String(s.id) === String(state.selectedShowId); });
        if (show) showTitle = show.title;

        if (!state.seasons.length) {
            $('#seasonsTable tbody').html('<tr><td colspan="5" class="text-center">No seasons found</td></tr>');
            return;
        }

        var rows = '';
        state.seasons.forEach(function (s) {
            var episodesCount = (typeof s.episodes_count === 'number') ? s.episodes_count : (Array.isArray(s.episodes) ? s.episodes.length : 0);

            rows += '<tr>';
            rows += '  <td>' + (s.season_number || '') + '</td>';
            rows += '  <td>' + (s.title || '') + '</td>';
            rows += '  <td>' + (showTitle || '') + '</td>';
            rows += '  <td>' + episodesCount + '</td>';
            rows += '  <td>';
            rows += '    <button class="btn btn-xs btn-info btnEditSeason" data-id="' + s.id + '"><i class="fa fa-pencil"></i> Edit</button> ';
            rows += '    <button class="btn btn-xs btn-danger btnDeleteSeason" data-id="' + s.id + '"><i class="fa fa-trash"></i> Delete</button>';
            rows += '  </td>';
            rows += '</tr>';
        });

        $('#seasonsTable tbody').html(rows);

        $('.btnEditSeason').off('click').on('click', function () {
            var id = $(this).data('id');
            var season = state.seasons.find(function (x) { return x.id === id; }) || null;
            openModal(season);
        });

        $('.btnDeleteSeason').off('click').on('click', function () {
            var id = $(this).data('id');
            if (!confirm('Delete this season?')) return;

            showLoading();
            ApiService.deleteSeason(id)
                .then(function () {
                    showAlert('Season deleted', 'success');
                    loadSeasons();
                })
                .fail(function (jqXHR) {
                    showAlert(AdminUtils.getAjaxErrorMessage(jqXHR), 'danger');
                })
                .always(function () {
                    hideLoading();
                });
        });
    }

    function openModal(season) {
        $('#seasonId').val(season ? season.id : '');
        $('#seasonShow').val(state.selectedShowId || (season ? season.show_id : ''));
        $('#seasonNumber').val(season ? season.season_number : '');
        $('#seasonTitle').val(season ? season.title : '');
        $('#seasonPoster').val('');

        $('#seasonModalTitle').text(season ? 'Edit Season' : 'Add Season');
        $('#seasonModal').modal('show');
    }

    function onSubmit(e) {
        e.preventDefault();

        var id = $('#seasonId').val();
        var showId = $('#seasonShow').val();
        var seasonNumber = $('#seasonNumber').val();
        var title = $('#seasonTitle').val();
        var posterFile = $('#seasonPoster')[0].files[0];

        var fd = new FormData();
        if (!id) fd.append('show_id', showId);
        fd.append('season_number', seasonNumber);
        fd.append('title', title);
        if (posterFile) fd.append('poster', posterFile);

        showLoading();

        var req;
        if (id) {
            req = ApiService.updateSeason(id, fd);
        } else {
            req = ApiService.createSeason(fd);
        }

        req.then(function () {
                $('#seasonModal').modal('hide');
                showAlert('Saved successfully', 'success');
                state.selectedShowId = showId;
                $('#seasonShowSelect').val(showId);
                loadSeasons();
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

function loadSeasons() {
    AdminSeasons.load();
}
