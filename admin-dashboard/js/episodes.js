// Episodes management page

var AdminEpisodes = (function () {
    var state = {
        shows: [],
        seasons: [],
        episodes: [],
        selectedShowId: '',
        selectedSeasonId: ''
    };

    function renderPage() {
        var html = '';
        html += '<div class="box">';
        html += '  <div class="box-header with-border">';
        html += '    <div class="row">';
        html += '      <div class="col-sm-6">';
        html += '        <h3 class="box-title">Manage Episodes</h3>';
        html += '      </div>';
        html += '      <div class="col-sm-6 text-right">';
        html += '        <button class="btn btn-primary" id="btnAddEpisode"><i class="fa fa-plus"></i> Add Episode</button>';
        html += '      </div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="box-body">';
        html += '    <div class="row" style="margin-bottom:10px;">';
        html += '      <div class="col-sm-6">';
        html += '        <label>TV Show</label>';
        html += '        <select class="form-control" id="episodeShowSelect"></select>';
        html += '      </div>';
        html += '      <div class="col-sm-6">';
        html += '        <label>Season</label>';
        html += '        <select class="form-control" id="episodeSeasonSelect"></select>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div class="table-responsive">';
        html += '      <table class="table table-bordered table-hover" id="episodesTable">';
        html += '        <thead>';
        html += '          <tr>';
        html += '            <th>#</th>';
        html += '            <th>Title</th>';
        html += '            <th>Season</th>';
        html += '            <th>Show</th>';
        html += '            <th>Likes</th>';
        html += '            <th style="width:140px;">Actions</th>';
        html += '          </tr>';
        html += '        </thead>';
        html += '        <tbody><tr><td colspan="6" class="text-center">Select a season</td></tr></tbody>';
        html += '      </table>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';

        html += renderModal();

        $('#mainContent').html(html);

        $('#btnAddEpisode').on('click', function () {
            openModal(null);
        });

        $('#episodeForm').on('submit', onSubmit);

        loadShows();
    }

    function renderModal() {
        return (
            '<div class="modal fade" id="episodeModal" tabindex="-1" role="dialog">' +
            '  <div class="modal-dialog" role="document">' +
            '    <div class="modal-content">' +
            '      <div class="modal-header">' +
            '        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '        <h4 class="modal-title" id="episodeModalTitle">Add Episode</h4>' +
            '      </div>' +
            '      <form id="episodeForm">' +
            '        <div class="modal-body">' +
            '          <input type="hidden" id="episodeId">' +
            '          <div class="form-group">' +
            '            <label>Season</label>' +
            '            <select class="form-control" id="episodeSeason" required></select>' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Episode Number</label>' +
            '            <input type="number" class="form-control" id="episodeNumber" min="1" required>' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Title</label>' +
            '            <input type="text" class="form-control" id="episodeTitle" required>' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Description</label>' +
            '            <textarea class="form-control" id="episodeDescription" rows="3"></textarea>' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Duration (minutes)</label>' +
            '            <input type="number" class="form-control" id="episodeDuration" min="1">' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Air Time (HH:mm)</label>' +
            '            <input type="text" class="form-control" id="episodeAirTime" placeholder="20:30">' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Thumbnail</label>' +
            '            <input type="file" id="episodeThumbnail" accept="image/*">' +
            '          </div>' +
            '          <div class="form-group">' +
            '            <label>Video File</label>' +
            '            <input type="file" id="episodeVideo" accept="video/*">' +
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
                AdminUtils.setSelectOptions($('#episodeShowSelect'), state.shows, 'id', 'title', 'Select show');

                $('#episodeShowSelect').off('change').on('change', function () {
                    state.selectedShowId = $(this).val();
                    state.selectedSeasonId = '';
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
            AdminUtils.setSelectOptions($('#episodeSeasonSelect'), [], 'id', 'title', 'Select season');
            $('#episodesTable tbody').html('<tr><td colspan="6" class="text-center">Select a season</td></tr>');
            return;
        }

        showLoading();
        ApiService.getSeasonsByShow(state.selectedShowId)
            .then(function (res) {
                state.seasons = (res && res.data) ? res.data : [];

                var seasonOptions = state.seasons.map(function (s) {
                    return { id: s.id, title: 'Season ' + s.season_number + ' - ' + (s.title || '') };
                });

                AdminUtils.setSelectOptions($('#episodeSeasonSelect'), seasonOptions, 'id', 'title', 'Select season');
                AdminUtils.setSelectOptions($('#episodeSeason'), seasonOptions, 'id', 'title', 'Select season');

                $('#episodeSeasonSelect').off('change').on('change', function () {
                    state.selectedSeasonId = $(this).val();
                    loadEpisodes();
                });

                hideLoading();
            })
            .fail(function (jqXHR) {
                hideLoading();
                showAlert(AdminUtils.getAjaxErrorMessage(jqXHR), 'danger');
            });
    }

    function loadEpisodes() {
        if (!state.selectedSeasonId) {
            $('#episodesTable tbody').html('<tr><td colspan="6" class="text-center">Select a season</td></tr>');
            return;
        }

        showLoading();
        ApiService.getEpisodesBySeason(state.selectedSeasonId)
            .then(function (res) {
                state.episodes = (res && res.data) ? res.data : [];
                renderTable();
            })
            .fail(function (jqXHR) {
                showAlert(AdminUtils.getAjaxErrorMessage(jqXHR), 'danger');
                $('#episodesTable tbody').html('<tr><td colspan="6" class="text-center text-danger">Failed to load episodes</td></tr>');
            })
            .always(function () {
                hideLoading();
            });
    }

    function renderTable() {
        var show = state.shows.find(function (s) { return String(s.id) === String(state.selectedShowId); });
        var showTitle = show ? show.title : '';
        var season = state.seasons.find(function (s) { return String(s.id) === String(state.selectedSeasonId); });
        var seasonNumber = season ? season.season_number : '';

        if (!state.episodes.length) {
            $('#episodesTable tbody').html('<tr><td colspan="6" class="text-center">No episodes found</td></tr>');
            return;
        }

        var rows = '';
        state.episodes.forEach(function (e) {
            rows += '<tr>';
            rows += '  <td>' + (e.episode_number || '') + '</td>';
            rows += '  <td>' + (e.title || '') + '</td>';
            rows += '  <td>' + (seasonNumber || '') + '</td>';
            rows += '  <td>' + (showTitle || '') + '</td>';
            rows += '  <td>N/A</td>';
            rows += '  <td>';
            rows += '    <button class="btn btn-xs btn-info btnEditEpisode" data-id="' + e.id + '"><i class="fa fa-pencil"></i> Edit</button> ';
            rows += '    <button class="btn btn-xs btn-danger btnDeleteEpisode" data-id="' + e.id + '"><i class="fa fa-trash"></i> Delete</button>';
            rows += '  </td>';
            rows += '</tr>';
        });

        $('#episodesTable tbody').html(rows);

        $('.btnEditEpisode').off('click').on('click', function () {
            var id = $(this).data('id');
            var episode = state.episodes.find(function (x) { return x.id === id; }) || null;
            openModal(episode);
        });

        $('.btnDeleteEpisode').off('click').on('click', function () {
            var id = $(this).data('id');
            if (!confirm('Delete this episode?')) return;

            showLoading();
            ApiService.deleteEpisode(id)
                .then(function () {
                    showAlert('Episode deleted', 'success');
                    loadEpisodes();
                })
                .fail(function (jqXHR) {
                    showAlert(AdminUtils.getAjaxErrorMessage(jqXHR), 'danger');
                })
                .always(function () {
                    hideLoading();
                });
        });
    }

    function openModal(episode) {
        $('#episodeId').val(episode ? episode.id : '');
        $('#episodeNumber').val(episode ? episode.episode_number : '');
        $('#episodeTitle').val(episode ? episode.title : '');
        $('#episodeDescription').val(episode ? (episode.description || '') : '');
        $('#episodeDuration').val(episode ? (episode.duration || '') : '');
        $('#episodeAirTime').val(episode ? (episode.air_time || '') : '');
        $('#episodeThumbnail').val('');
        $('#episodeVideo').val('');

        var seasonId = state.selectedSeasonId || (episode ? episode.season_id : '');
        $('#episodeSeason').val(seasonId);

        $('#episodeModalTitle').text(episode ? 'Edit Episode' : 'Add Episode');
        $('#episodeModal').modal('show');
    }

    function onSubmit(e) {
        e.preventDefault();

        var id = $('#episodeId').val();
        var seasonId = $('#episodeSeason').val();
        var number = $('#episodeNumber').val();
        var title = $('#episodeTitle').val();
        var description = $('#episodeDescription').val();
        var duration = $('#episodeDuration').val();
        var airTime = $('#episodeAirTime').val();

        var thumbFile = $('#episodeThumbnail')[0].files[0];
        var videoFile = $('#episodeVideo')[0].files[0];

        var fd = new FormData();
        fd.append('season_id', seasonId);
        fd.append('episode_number', number);
        fd.append('title', title);
        if (description) fd.append('description', description);
        if (duration) fd.append('duration', duration);
        if (airTime) fd.append('air_time', airTime);
        if (thumbFile) fd.append('thumbnail', thumbFile);
        if (videoFile) fd.append('video_url', videoFile);

        showLoading();

        var req;
        if (id) {
            req = ApiService.updateEpisode(id, fd);
        } else {
            req = ApiService.createEpisode(fd);
        }

        req.then(function () {
                $('#episodeModal').modal('hide');
                showAlert('Saved successfully', 'success');

                state.selectedSeasonId = seasonId;
                $('#episodeSeasonSelect').val(seasonId);

                loadEpisodes();
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

function loadEpisodes() {
    AdminEpisodes.load();
}
