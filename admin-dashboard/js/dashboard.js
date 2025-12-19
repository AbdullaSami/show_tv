// Dashboard Module
function loadDashboard() {
    const content = `
        <div class="row">
            <!-- Stats Row -->
            <div class="col-lg-3 col-xs-6">
                <div class="small-box bg-aqua">
                    <div class="inner">
                        <h3 id="totalShows">0</h3>
                        <p>TV Shows</p>
                    </div>
                    <div class="icon">
                        <i class="fa fa-television"></i>
                    </div>
                    <a href="#shows" class="small-box-footer">
                        More info <i class="fa fa-arrow-circle-right"></i>
                    </a>
                </div>
            </div>

            <div class="col-lg-3 col-xs-6">
                <div class="small-box bg-green">
                    <div class="inner">
                        <h3 id="totalSeasons">0</h3>
                        <p>Seasons</p>
                    </div>
                    <div class="icon">
                        <i class="fa fa-list-ol"></i>
                    </div>
                    <a href="#seasons" class="small-box-footer">
                        More info <i class="fa fa-arrow-circle-right"></i>
                    </a>
                </div>
            </div>

            <div class="col-lg-3 col-xs-6">
                <div class="small-box bg-yellow">
                    <div class="inner">
                        <h3 id="totalEpisodes">0</h3>
                        <p>Episodes</p>
                    </div>
                    <div class="icon">
                        <i class="fa fa-film"></i>
                    </div>
                    <a href="#episodes" class="small-box-footer">
                        More info <i class="fa fa-arrow-circle-right"></i>
                    </a>
                </div>
            </div>

            <div class="col-lg-3 col-xs-6">
                <div class="small-box bg-red">
                    <div class="inner">
                        <h3 id="totalUsers">0</h3>
                        <p>Users</p>
                    </div>
                    <div class="icon">
                        <i class="fa fa-users"></i>
                    </div>
                    <a href="#users" class="small-box-footer">
                        More info <i class="fa fa-arrow-circle-right"></i>
                    </a>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <div class="box">
                    <div class="box-header with-border">
                        <h3 class="box-title">Quick Actions</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="col-md-3 col-sm-6">
                                <a href="#shows" class="btn btn-app" data-route="shows" data-action="add">
                                    <i class="fa fa-plus"></i> Add Show
                                </a>
                            </div>
                            <div class="col-md-3 col-sm-6">
                                <a href="#seasons" class="btn btn-app" data-route="seasons" data-action="add">
                                    <i class="fa fa-plus"></i> Add Season
                                </a>
                            </div>
                            <div class="col-md-3 col-sm-6">
                                <a href="#episodes" class="btn btn-app" data-route="episodes" data-action="add">
                                    <i class="fa fa-plus"></i> Add Episode
                                </a>
                            </div>
                            <div class="col-md-3 col-sm-6">
                                <a href="#users" class="btn btn-app" data-route="users" data-action="add">
                                    <i class="fa fa-user-plus"></i> Add User
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="box box-info">
                    <div class="box-header with-border">
                        <h3 class="box-title">Recent Shows</h3>
                        <div class="box-tools pull-right">
                            <button type="button" class="btn btn-box-tool" data-widget="collapse">
                                <i class="fa fa-minus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="box-body">
                        <div class="table-responsive">
                            <table class="table no-margin" id="recentShows">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Seasons</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="3" class="text-center">Loading...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="box box-danger">
                    <div class="box-header with-border">
                        <h3 class="box-title">Recent Episodes</h3>
                        <div class="box-tools pull-right">
                            <button type="button" class="btn btn-box-tool" data-widget="collapse">
                                <i class="fa fa-minus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="box-body">
                        <ul class="products-list product-list-in-box" id="recentEpisodes">
                            <li class="item">Loading...</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#mainContent').html(content);

    // Load dashboard stats
    loadDashboardStats();

    // Load recent shows and episodes
    loadRecentShows();
    loadRecentEpisodes();
}

// Load dashboard statistics
function loadDashboardStats() {
    showLoading();

    ApiService.getDashboardStats()
        .done(function (data) {
            $('#totalShows').text((data && data.total_shows) || 0);
            $('#totalSeasons').text((data && data.total_seasons) || 0);
            $('#totalEpisodes').text((data && data.total_episodes) || 0);
            $('#totalUsers').text((data && data.total_users) == null ? 'N/A' : data.total_users);
        })
        .fail(function (jqXHR) {
            console.error('Error loading dashboard stats:', jqXHR);
            showAlert('Failed to load dashboard statistics', 'danger');
        })
        .always(function () {
            hideLoading();
        });
}

// Load recent shows
function loadRecentShows() {
    ApiService.getShows({ limit: 5, order_by: 'created_at', order: 'desc' })
        .done(function (data) {
            const tbody = $('#recentShows tbody');
            tbody.empty();

            if (data.data && data.data.length > 0) {
                data.data.slice(0, 5).forEach(show => {
                    tbody.append(`
                        <tr>
                            <td>
                                <a href="#shows" class="nav-link" data-route="shows" data-id="${show.id}">
                                    ${show.title}
                                </a>
                            </td>
                            <td>${Array.isArray(show.seasons) ? show.seasons.length : (show.seasons_count || 0)}</td>
                            <td>
                                <span class="label label-default">
                                    N/A
                                </span>
                            </td>
                        </tr>
                    `);
                });
            } else {
                tbody.append('<tr><td colspan="3" class="text-center">No shows found</td></tr>');
            }
        })
        .fail(function (jqXHR) {
            console.error('Error loading recent shows:', jqXHR);
            $('#recentShows tbody').html(`
                <tr>
                    <td colspan="3" class="text-center text-danger">
                        Failed to load shows. Please try again.
                    </td>
                </tr>
            `);
        });
}

// Load recent episodes
function loadRecentEpisodes() {
    const container = $('#recentEpisodes');
    container.html('<li class="item">Loading...</li>');

    ApiService.getShows()
        .done(function (res) {
            const shows = (res && res.data) ? res.data : [];

            if (!shows.length) {
                container.html('<li class="item text-center">No episodes found</li>');
                return;
            }

            var requests = shows.map(function (show) {
                return ApiService.getSeasonsByShow(show.id)
                    .then(function (r) {
                        return { show: show, seasons: (r && r.data) ? r.data : [] };
                    }, function () {
                        return { show: show, seasons: [] };
                    });
            });

            $.when.apply($, requests)
                .done(function () {
                    var items = Array.prototype.slice.call(arguments);
                    if (requests.length === 1) {
                        items = [arguments[0]];
                    }

                    var allEpisodes = [];
                    items.forEach(function (item) {
                        if (!item) return;
                        var show = item.show;
                        var seasons = item.seasons || [];

                        seasons.forEach(function (season) {
                            var eps = Array.isArray(season.episodes) ? season.episodes : [];
                            eps.forEach(function (ep) {
                                allEpisodes.push(
                                    $.extend({}, ep, {
                                        _showTitle: show.title,
                                        _seasonNumber: season.season_number
                                    })
                                );
                            });
                        });
                    });

                    allEpisodes.sort(function (a, b) {
                        return (b.id || 0) - (a.id || 0);
                    });

                    var top = allEpisodes.slice(0, 5);
                    container.empty();

                    if (!top.length) {
                        container.append('<li class="item text-center">No episodes found</li>');
                        return;
                    }

                    top.forEach(function (episode) {
                        container.append(
                            '<li class="item">' +
                            '  <div class="product-img">' +
                            '    <img src="' + (episode.thumbnail || 'img/default-thumbnail.jpg') + '" alt="Episode Thumbnail" class="thumb-50">' +
                            '  </div>' +
                            '  <div class="product-info">' +
                            '    <a href="#episodes" class="product-title nav-link" data-route="episodes" data-id="' + episode.id + '">' +
                                 (episode.title || '') +
                            '    </a>' +
                            '    <span class="product-description">' +
                                 (episode._showTitle || 'Unknown Show') +
                                 ' - S' + (episode._seasonNumber || 'N/A') + 'E' + (episode.episode_number || 'N/A') +
                            '    </span>' +
                            '  </div>' +
                            '</li>'
                        );
                    });
                })
                .fail(function () {
                    container.html('<li class="item text-center text-danger">Failed to load episodes. Please try again.</li>');
                });
        })
        .fail(function (jqXHR) {
            console.error('Error loading recent episodes:', jqXHR);
            container.html('<li class="item text-center text-danger">Failed to load episodes. Please try again.</li>');
        });
}
