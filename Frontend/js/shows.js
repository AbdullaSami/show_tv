// Load and display random shows in the navbar
async function loadRandomShows() {
    try {
        let followedShowIds = {};
        if (state.authToken) {
            try {
                const followsRes = await fetch(`${config.apiBaseUrl}/followed-shows`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${state.authToken}`
                    }
                });
                const followsCt = followsRes.headers.get('content-type') || '';
                const followsData = followsCt.includes('application/json')
                    ? await followsRes.json()
                    : { data: [] };

                if (followsRes.ok && Array.isArray(followsData.data)) {
                    followedShowIds = followsData.data.reduce(function (acc, id) {
                        acc[String(id)] = true;
                        return acc;
                    }, {});
                }
            } catch (e) {
                // ignore
            }
        }

        const response = await fetch(`${config.apiBaseUrl}/shows?random=5`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to load shows');
        }

        const showsList = $('#random-shows');
        showsList.empty();

        data.data.forEach(show => {
            const isFollowing = !!followedShowIds[String(show.id)];
            showsList.append(`
                <div class="col-sm-6 col-md-4 col-lg-2">
                    <div class="show-card">
                        <img src="${show.poster || 'img/default-poster.jpg'}" alt="${show.title}">
                        <div class="card-body">
                            <h5 class="card-title">${show.title}</h5>
                            <div class="btn-group">
                                <a href="#" class="btn btn-sm btn-primary" data-route="show" data-id="${show.id}">View</a>
                                ${state.authToken ? `
                                    <button class="btn btn-sm btn-follow ${isFollowing ? 'following' : ''}" data-show-id="${show.id}">
                                        <i class="far fa-star"></i> ${isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });

    } catch (error) {
        console.error('Error loading random shows:', error);
    }
}

// Load and display latest episodes on the homepage
async function loadLatestEpisodes() {
    try {
        showLoading();
        $('.page-content').html('<h2>Latest Episodes</h2><div class="row" id="latest-episodes"></div>');

        const response = await fetch(`${config.apiBaseUrl}/episodes?latest=10`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to load latest episodes');
        }

        const episodesContainer = $('#latest-episodes');

        if (data.data.length === 0) {
            episodesContainer.html('<p>No episodes found.</p>');
            return;
        }

        data.data.forEach(episode => {
            episodesContainer.append(`
                <div class="col-sm-6 col-md-4">
                    <div class="episode-card">
                        <div class="episode-thumbnail">
                            <img src="${episode.thumbnail || 'img/default-thumbnail.jpg'}" alt="${episode.title}">
                            <div class="overlay">
                                <a href="#" class="btn btn-play" data-route="episode" data-id="${episode.id}">
                                    <i class="fas fa-play"></i>
                                </a>
                            </div>
                        </div>
                        <div class="episode-info">
                            <h4>${episode.title}</h4>
                            <p class="show-title">${episode.season?.show?.title || 'Unknown Show'}</p>
                            <p class="episode-meta">S${String(episode.season?.season_number || '0').padStart(2, '0')}E${String(episode.episode_number).padStart(2, '0')}</p>
                        </div>
                    </div>
                </div>
            `);
        });

    } catch (error) {
        console.error('Error loading latest episodes:', error);
        // showAlert('Failed to load latest episodes', 'danger');
    } finally {
        hideLoading();
    }
}

// Load and display a single show page
async function loadShowPage(showId) {
    try {
        showLoading();
        $('.page-content').html('<div id="show-details"></div>');

        let isFollowing = false;
        if (state.authToken) {
            try {
                const followsRes = await fetch(`${config.apiBaseUrl}/followed-shows`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${state.authToken}`
                    }
                });
                const followsCt = followsRes.headers.get('content-type') || '';
                const followsData = followsCt.includes('application/json')
                    ? await followsRes.json()
                    : { data: [] };

                if (followsRes.ok && Array.isArray(followsData.data)) {
                    isFollowing = followsData.data.map(String).indexOf(String(showId)) !== -1;
                }
            } catch (e) {
                // ignore
            }
        }

        const response = await fetch(`${config.apiBaseUrl}/shows/${showId}`);
        const { data: show } = await response.json();

        if (!response.ok) {
            throw new Error('Failed to load show details');
        }

        const likesCount = (show.likes_count !== undefined ? show.likes_count : show.likesCount) || 0;
        const dislikesCount = (show.dislikes_count !== undefined ? show.dislikes_count : show.dislikesCount) || 0;

        const showDetails = $('#show-details');
        showDetails.html(`
            <div class="show-header" style="background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${show.poster || 'img/default-background.jpg'}');">
                <div class="container">
                    <div class="row">
                        <div class="col-md-3">
                            <img src="${show.poster || 'img/default-poster.jpg'}" class="show-poster" alt="${show.title}">
                        </div>
                        <div class="col-md-9">
                            <h1>${show.title}</h1>
                            <p class="show-description">${show.description || 'No description available'}</p>
                            <div class="show-actions">
                                ${state.authToken ? `
                                    <button class="btn btn-follow ${isFollowing ? 'following' : ''}" data-show-id="${show.id}">
                                        <i class="far fa-star"></i> ${isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                    <button class="btn btn-like ${show.user_reaction === 'like' ? 'active' : ''}" data-type="show" data-id="${show.id}" data-action="like">
                                        <i class="fas fa-thumbs-up"></i> <span>${likesCount}</span>
                                    </button>
                                    <button class="btn btn-dislike ${show.user_reaction === 'dislike' ? 'active' : ''}" data-type="show" data-id="${show.id}" data-action="dislike">
                                        <i class="fas fa-thumbs-down"></i> <span>${dislikesCount}</span>
                                    </button>
                                ` : `
                                    <a href="#login" class="btn btn-primary login-link">Login to follow and rate</a>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="seasons-section">
                <h2>Seasons</h2>
                <div class="row" id="seasons-list"></div>
            </div>
        `);

        // Load seasons
        const seasonsResponse = await fetch(`${config.apiBaseUrl}/show/${showId}/seasons`);
        const seasonsData = await seasonsResponse.json();

        if (seasonsResponse.ok && seasonsData.data && seasonsData.data.length > 0) {
            const seasonsList = $('#seasons-list');

            seasonsData.data.forEach(season => {
                seasonsList.append(`
                    <div class="col-sm-6 col-md-4 col-lg-3">
                        <div class="season-card">
                            <div class="season-poster">
                                <img src="${season.poster || 'img/default-season.jpg'}" alt="Season ${season.season_number}">
                                <div class="overlay">
                                    <a href="#" class="btn btn-play" data-route="season" data-id="${season.id}">
                                        View Episodes
                                    </a>
                                </div>
                            </div>
                            <div class="season-info">
                                <h4>Season ${season.season_number}</h4>
                                <p>${season.episodes_count || 0} Episodes</p>
                            </div>
                        </div>
                    </div>
                `);
            });
        } else {
            $('#seasons-list').html('<p>No seasons available for this show.</p>');
        }

    } catch (error) {
        console.error('Error loading show:', error);
        showAlert('Failed to load show details', 'danger');
    } finally {
        hideLoading();
    }
}

// Load and display a season page
async function loadSeasonPage(seasonId) {
    try {
        showLoading();
        $('.page-content').html('<div id="season-details"></div>');

        const response = await fetch(`${config.apiBaseUrl}/seasons/${seasonId}`);
        const seasonPayload = await response.json();
        const season = seasonPayload && seasonPayload.data ? seasonPayload.data : seasonPayload;

        if (!response.ok) {
            throw new Error('Failed to load season details');
        }

        if (!season) {
            throw new Error('Season response is empty');
        }

        const seasonDetails = $('#season-details');
        seasonDetails.html(`
            <div class="season-header">
                <div class="container">
                    <h1>${season.show?.title || 'Unknown Show'} - Season ${season.season_number}</h1>
                    ${state.authToken ? `
                        <div class="season-actions">
                            <button class="btn btn-like ${season.user_reaction === 'like' ? 'active' : ''}" data-type="season" data-id="${season.id}" data-action="like">
                                <i class="fas fa-thumbs-up"></i> <span>${season.likes_count || 0}</span>
                            </button>
                            <button class="btn btn-dislike ${season.user_reaction === 'dislike' ? 'active' : ''}" data-type="season" data-id="${season.id}" data-action="dislike">
                                <i class="fas fa-thumbs-down"></i> <span>${season.dislikes_count || 0}</span>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="episodes-list">
                <h2>Episodes</h2>
                <div class="list-group" id="episodes-list"></div>
            </div>
        `);

        // Load episodes
        let episodes = Array.isArray(season.episodes) ? season.episodes : null;

        if (!episodes) {
            const episodesHeaders = state.authToken
                ? { 'Accept': 'application/json', 'Authorization': `Bearer ${state.authToken}` }
                : { 'Accept': 'application/json' };

            const episodesResponse = await fetch(`${config.apiBaseUrl}/season/${seasonId}/episodes`, {
                headers: episodesHeaders
            });
            const episodesPayload = await episodesResponse.json();
            episodes = episodesPayload && episodesPayload.data ? episodesPayload.data : episodesPayload;

            if (!episodesResponse.ok) {
                episodes = [];
            }
        }

        if (Array.isArray(episodes) && episodes.length > 0) {
            const episodesList = $('#episodes-list');

            episodes.forEach(episode => {
                episodesList.append(`
                    <div class="list-group-item episode-item">
                        <div class="row">
                            <div class="col-sm-2">
                                <img src="${episode.thumbnail || 'img/default-thumbnail.jpg'}" class="img-responsive" alt="${episode.title}">
                            </div>
                            <div class="col-sm-8">
                                <h4 class="list-group-item-heading">${episode.episode_number}. ${episode.title}</h4>
                                <p class="list-group-item-text">${episode.description || 'No description available'}</p>
                                <p class="episode-meta">
                                    ${episode.duration ? `<span><i class="far fa-clock"></i> ${episode.duration} min</span>` : ''}
                                    ${episode.air_time ? `<span><i class="far fa-calendar-alt"></i> ${episode.air_time}</span>` : ''}
                                </p>
                            </div>
                            <div class="col-sm-2 text-right">
                                <a href="#" class="btn btn-primary" data-route="episode" data-id="${episode.id}">
                                    Watch <i class="fas fa-chevron-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `);
            });
        } else {
            $('#episodes-list').html('<p>No episodes available for this season.</p>');
        }

    } catch (error) {
        console.error('Error loading season:', error);
        showAlert('Failed to load season details', 'danger');
    } finally {
        hideLoading();
    }
}

// Load and display an episode page
async function loadEpisodePage(episodeId) {
    try {
        showLoading();
        $('.page-content').html('<div id="episode-details"></div>');

        const response = await fetch(`${config.apiBaseUrl}/episodes/${episodeId}`);
        const episodePayload = await response.json();
        const episode = episodePayload && episodePayload.data ? episodePayload.data : episodePayload;

        if (!response.ok) {
            throw new Error('Failed to load episode details');
        }

        if (!episode) {
            throw new Error('Episode response is empty');
        }

        if (!episode.season && episode.season_id) {
            try {
                const seasonHeaders = state.authToken
                    ? { 'Accept': 'application/json', 'Authorization': `Bearer ${state.authToken}` }
                    : { 'Accept': 'application/json' };

                const seasonRes = await fetch(`${config.apiBaseUrl}/seasons/${episode.season_id}`, {
                    headers: seasonHeaders
                });
                const seasonPayload = await seasonRes.json();
                const season = seasonPayload && seasonPayload.data ? seasonPayload.data : seasonPayload;
                if (seasonRes.ok && season) {
                    episode.season = season;
                }
            } catch (e) {
                // ignore
            }
        }

        const episodeDetails = $('#episode-details');
        episodeDetails.html(`
            <div class="episode-header">
                <div class="container">
                    <h1>${episode.season?.show?.title || 'Unknown Show'} - S${String(episode.season?.season_number || '0').padStart(2, '0')}E${String(episode.episode_number).padStart(2, '0')}</h1>
                    <h2>${episode.title}</h2>
                </div>
            </div>

            <div class="container">
                <div class="row">
                    <div class="col-md-8">
                        <div class="video-container">
                            ${episode.video_url ? `
                                <video controls class="video-player">
                                    <source src="${episode.video_url}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                            ` : '<div class="alert alert-info">No video available for this episode.</div>'}
                        </div>

                        <div class="episode-actions">
                            ${state.authToken ? `
                                <div class="btn-group" role="group">
                                    <button class="btn btn-like ${episode.user_reaction === 'like' ? 'active' : ''}" data-type="episode" data-id="${episode.id}" data-action="like">
                                        <i class="fas fa-thumbs-up"></i> <span>${episode.likes_count || 0}</span>
                                    </button>
                                    <button class="btn btn-dislike ${episode.user_reaction === 'dislike' ? 'active' : ''}" data-type="episode" data-id="${episode.id}" data-action="dislike">
                                        <i class="fas fa-thumbs-down"></i> <span>${episode.dislikes_count || 0}</span>
                                    </button>
                                </div>
                            ` : `
                                <a href="#login" class="btn btn-primary login-link">Login to rate this episode</a>
                            `}
                        </div>

                        <div class="episode-description">
                            <h3>About this episode</h3>
                            <p>${episode.description || 'No description available.'}</p>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="episode-meta">
                            <h3>Details</h3>
                            <ul class="list-unstyled">
                                <li><strong>Show:</strong> ${episode.season?.show?.title || 'N/A'}</li>
                                <li><strong>Season:</strong> ${episode.season?.season_number || 'N/A'}</li>
                                <li><strong>Episode:</strong> ${episode.episode_number || 'N/A'}</li>
                                ${episode.duration ? `<li><strong>Duration:</strong> ${episode.duration} min</li>` : ''}
                                ${episode.air_time ? `<li><strong>Aired:</strong> ${episode.air_time}</li>` : ''}
                            </ul>
                        </div>

                        <div class="related-episodes">
                            <h3>More Episodes</h3>
                            <div id="related-episodes-list"></div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        // Load related episodes (other episodes from the same season)
        if (episode.season_id) {
            const relatedHeaders = state.authToken
                ? { 'Accept': 'application/json', 'Authorization': `Bearer ${state.authToken}` }
                : { 'Accept': 'application/json' };

            const relatedResponse = await fetch(`${config.apiBaseUrl}/season/${episode.season_id}/episodes`, {
                headers: relatedHeaders
            });
            const relatedPayload = await relatedResponse.json();
            const relatedEpisodes = relatedPayload && relatedPayload.data ? relatedPayload.data : relatedPayload;

            if (relatedResponse.ok && Array.isArray(relatedEpisodes) && relatedEpisodes.length > 0) {
                const relatedList = $('#related-episodes-list');

                relatedEpisodes
                    .filter(e => e.id !== episode.id) // Exclude current episode
                    .slice(0, 5) // Limit to 5 episodes
                    .forEach(related => {
                        relatedList.append(`
                            <div class="related-episode">
                                <a href="#" class="related-episode-link" data-route="episode" data-id="${related.id}">
                                    <img src="${related.thumbnail || 'img/default-thumbnail.jpg'}" alt="${related.title}">
                                    <span class="episode-number">E${String(related.episode_number).padStart(2, '0')}</span>
                                    <span class="episode-title">${related.title}</span>
                                </a>
                            </div>
                        `);
                    });
            }
        }

    } catch (error) {
        console.error('Error loading episode:', error);
        showAlert('Failed to load episode details', 'danger');
    } finally {
        hideLoading();
    }
}

// Search for shows and episodes
async function searchShows(query) {
    try {
        showLoading();
        $('.page-content').html('<h2>Search Results for "' + query + '"</h2><div id="search-results"></div>');

        // Search shows
        const showsResponse = await fetch(`${config.apiBaseUrl}/shows?search=${encodeURIComponent(query)}`);
        const showsData = await showsResponse.json();

        // Search episodes
        const episodesResponse = await fetch(`${config.apiBaseUrl}/episodes?search=${encodeURIComponent(query)}`);
        const episodesData = await episodesResponse.json();

        const searchResults = $('#search-results');

        // Display show results
        if (showsData.data && showsData.data.length > 0) {
            searchResults.append('<h3>Shows</h3><div class="row" id="show-results"></div>');

            showsData.data.forEach(show => {
                $('#show-results').append(`
                    <div class="col-sm-6 col-md-4 col-lg-3">
                        <div class="search-result-item">
                            <img src="${show.poster || 'img/default-poster.jpg'}" class="img-responsive" alt="${show.title}">
                            <h4><a href="#" data-route="show" data-id="${show.id}">${show.title}</a></h4>
                            <p>${show.description ? show.description.substring(0, 100) + '...' : 'No description available'}</p>
                        </div>
                    </div>
                `);
            });
        }

        // Display episode results
        if (episodesData.data && episodesData.data.length > 0) {
            searchResults.append('<h3>Episodes</h3><div id="episode-results"></div>');

            episodesData.data.forEach(episode => {
                $('#episode-results').append(`
                    <div class="search-result-item">
                        <div class="row">
                            <div class="col-sm-2">
                                <img src="${episode.thumbnail || 'img/default-thumbnail.jpg'}" class="img-responsive" alt="${episode.title}">
                            </div>
                            <div class="col-sm-10">
                                <h4>
                                    <a href="#" data-route="episode" data-id="${episode.id}">
                                        ${episode.season?.show?.title || 'Unknown Show'} - S${String(episode.season?.season_number || '0').padStart(2, '0')}E${String(episode.episode_number).padStart(2, '0')}: ${episode.title}
                                    </a>
                                </h4>
                                <p>${episode.description ? episode.description.substring(0, 200) + '...' : 'No description available'}</p>
                            </div>
                        </div>
                    </div>
                `);
            });
        }

        if ((!showsData.data || showsData.data.length === 0) && (!episodesData.data || episodesData.data.length === 0)) {
            searchResults.html('<div class="alert alert-info">No results found for your search.</div>');
        }

    } catch (error) {
        console.error('Search error:', error);
        showAlert('Failed to perform search', 'danger');
    } finally {
        hideLoading();
    }
}

// Handle follow/unfollow actions
async function handleFollow(showId) {
    if (!state.authToken) {
        showAlert('Please login to follow shows', 'warning');
        $('#loginModal').modal('show');
        return;
    }

    try {
        const button = $(`[data-show-id="${showId}"]`);
        const isFollowing = button.hasClass('following');

        const response = await fetch(`${config.apiBaseUrl}/${isFollowing ? 'unfollow' : 'follow'}`, {
            method: isFollowing ? 'DELETE' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.authToken}`
            },
            body: JSON.stringify({ show_id: showId })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update follow status');
        }

        // Update button state
        button.toggleClass('following', !isFollowing);
        button.html(`<i class="far fa-star"></i> ${!isFollowing ? 'Following' : 'Follow'}`);

        showAlert(`Show ${!isFollowing ? 'added to' : 'removed from'} your favorites`, 'success');

    } catch (error) {
        console.error('Follow error:', error);
        showAlert(error.message || 'Failed to update follow status', 'danger');
    }
}

// Handle like/dislike actions
async function handleReaction(type, id, action) {
    if (!state.authToken) {
        showAlert('Please login to rate content', 'warning');
        $('#loginModal').modal('show');
        return;
    }

    try {
        const button = $(`[data-type="${type}"][data-id="${id}"][data-action="${action}"]`);
        const isActive = button.hasClass('active');
        const oppositeAction = action === 'like' ? 'dislike' : 'like';
        const oppositeButton = $(`[data-type="${type}"][data-id="${id}"][data-action="${oppositeAction}"]`);

        // If clicking the same button, remove the reaction
        if (isActive) {
            action = 'remove';
        }

        const endpoint = action === 'remove'
            ? `${config.apiBaseUrl}/reaction`
            : `${config.apiBaseUrl}/reaction/${action}`;

        const response = await fetch(endpoint, {
            method: action === 'remove' ? 'DELETE' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${state.authToken}`
            },
            body: JSON.stringify({
                reactable_type: type,
                reactable_id: id
            })
        });

        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json')
            ? await response.json()
            : { message: await response.text() };

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update reaction');
        }

        // Update UI
        if (action === 'remove') {
            button.removeClass('active');
        } else {
            button.addClass('active');
            oppositeButton.removeClass('active');
        }

        // Update counts
        if (data.likes_count !== undefined) {
            $(`[data-type="${type}"][data-id="${id}"][data-action="like"] span`).text(data.likes_count || 0);
        }
        if (data.dislikes_count !== undefined) {
            $(`[data-type="${type}"][data-id="${id}"][data-action="dislike"] span`).text(data.dislikes_count || 0);
        }

    } catch (error) {
        console.error('Reaction error:', error);
        showAlert(error.message || 'Failed to update reaction', 'danger');
    }
}

// Event delegation for dynamic content
$(document)
    .on('click', '.btn-follow', function() {
        const showId = $(this).data('show-id');
        handleFollow(showId);
    })
    .on('click', '.btn-like', function(e) {
        e.preventDefault();
        const type = $(this).data('type');
        const id = $(this).data('id');
        handleReaction(type, id, 'like');
    })
    .on('click', '.btn-dislike', function(e) {
        e.preventDefault();
        const type = $(this).data('type');
        const id = $(this).data('id');
        handleReaction(type, id, 'dislike');
    });
