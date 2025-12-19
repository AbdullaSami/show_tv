// API Configuration
const API_CONFIG = {
    baseUrl: 'http://localhost:8000/api', // Update this to your backend API URL
    endpoints: {
        login: '/login',
        dashboard: {
            stats: null
        },
        shows: {
            list: '/shows',
            create: '/shows',
            show: (id) => `/shows/${id}`,
            update: (id) => `/shows/${id}`,
            delete: (id) => `/shows/${id}`
        },
        seasons: {
            list: '/seasons',
            create: '/seasons',
            show: (id) => `/seasons/${id}`,
            update: (id) => `/seasons/${id}`,
            delete: (id) => `/seasons/${id}`,
            byShow: (showId) => `/show/${showId}/seasons`
        },
        episodes: {
            list: '/episodes',
            create: '/episodes',
            show: (id) => `/episodes/${id}`,
            update: (id) => `/episodes/${id}`,
            delete: (id) => `/episodes/${id}`,
            bySeason: (seasonId) => `/season/${seasonId}/episodes`
        },
        users: {
            list: '/users',
            create: '/users',
            show: (id) => `/users/${id}`,
            update: (id) => `/users/${id}`,
            delete: (id) => `/users/${id}`
        },
        permissions: {
            list: '/permissions'
        }
    }
};

// API Service
const ApiService = {
    ajax(options) {
        const token = localStorage.getItem('admin_token');
        const headers = options.headers || {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return $.ajax({
            dataType: 'json',
            ...options,
            headers
        });
    },

    // Get auth headers
    getAuthHeaders() {
        const token = localStorage.getItem('admin_token');
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    },

    // Handle API response
    handleResponse(response) {
        return response.json().then(data => {
            if (!response.ok) {
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }
            return data;
        });
    },

    // Login
    login(credentials) {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(credentials)
        });
    },

    register(formData) {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}/register`,
            method: 'POST',
            processData: false,
            contentType: false,
            data: formData
        });
    },

    // Logout
    logout() {
        return $.Deferred().resolve({ status: 'success' }).promise();
    },

    // Dashboard Stats
    getDashboardStats() {
        var d = $.Deferred();

        this.getShows()
            .done(function (res) {
                var shows = (res && res.data) ? res.data : [];

                if (!shows.length) {
                    d.resolve({
                        total_shows: 0,
                        total_seasons: 0,
                        total_episodes: 0,
                        total_users: null
                    });
                    return;
                }

                var requests = shows.map(function (show) {
                    return ApiService.getSeasonsByShow(show.id);
                });

                $.when.apply($, requests)
                    .done(function () {
                        var args = Array.prototype.slice.call(arguments);
                        if (requests.length === 1) {
                            args = [arguments];
                        }

                        var seasonsTotal = 0;
                        var episodesTotal = 0;

                        args.forEach(function (triple) {
                            var payload = triple;
                            if (Array.isArray(triple) && triple.length) {
                                payload = triple[0];
                            }

                            var seasons = (payload && payload.data) ? payload.data : [];
                            seasonsTotal += seasons.length;

                            seasons.forEach(function (s) {
                                if (typeof s.episodes_count === 'number') {
                                    episodesTotal += s.episodes_count;
                                } else if (Array.isArray(s.episodes)) {
                                    episodesTotal += s.episodes.length;
                                }
                            });
                        });

                        d.resolve({
                            total_shows: shows.length,
                            total_seasons: seasonsTotal,
                            total_episodes: episodesTotal,
                            total_users: null
                        });
                    })
                    .fail(function (jqXHR) {
                        d.reject(jqXHR);
                    });
            })
            .fail(function (jqXHR) {
                d.reject(jqXHR);
            });

        return d.promise();
    },

    // Shows
    getShows(params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.shows.list}${query ? `?${query}` : ''}`;
        return this.ajax({
            url,
            method: 'GET'
        });
    },

    getShow(id) {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.shows.show(id)}`,
            method: 'GET'
        });
    },

    createShow(data) {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.shows.create}`,
            method: 'POST',
            processData: false,
            contentType: false,
            data
        });
    },

    updateShow(id, data) {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return this.ajax({
                url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.shows.update(id)}`,
                method: 'POST',
                processData: false,
                contentType: false,
                data
            });
        }

        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.shows.update(id)}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data)
        });
    },

    deleteShow(id) {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.shows.delete(id)}`,
            method: 'DELETE'
        });
    },

    // Seasons
    getSeasons(params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.seasons.list}${query ? `?${query}` : ''}`;
        return this.ajax({
            url,
            method: 'GET'
        });
    },

    getSeasonsByShow(showId) {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.seasons.byShow(showId)}`,
            method: 'GET'
        });
    },

    getSeason(id) {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.seasons.show(id)}`,
            method: 'GET'
        });
    },

    createSeason(data) {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.seasons.create}`,
            method: 'POST',
            processData: false,
            contentType: false,
            data
        });
    },

    updateSeason(id, data) {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return this.ajax({
                url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.seasons.update(id)}`,
                method: 'POST',
                processData: false,
                contentType: false,
                data
            });
        }

        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.seasons.update(id)}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data)
        });
    },

    deleteSeason(id) {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.seasons.delete(id)}`,
            method: 'DELETE'
        });
    },

    // Episodes
    getEpisodes(params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.episodes.list}${query ? `?${query}` : ''}`;
        return this.ajax({
            url,
            method: 'GET'
        });
    },

    getEpisodesBySeason(seasonId) {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.episodes.bySeason(seasonId)}`,
            method: 'GET'
        });
    },

    getEpisode(id) {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.episodes.show(id)}`,
            method: 'GET'
        });
    },

    createEpisode(data) {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.episodes.create}`,
            method: 'POST',
            processData: false,
            contentType: false,
            data
        });
    },

    updateEpisode(id, data) {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
        }

        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.episodes.update(id)}`,
            method: 'POST',
            processData: false,
            contentType: false,
            data
        });
    },

    deleteEpisode(id) {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.episodes.delete(id)}`,
            method: 'DELETE'
        });
    },

    // Users
    getUsers(params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.list}${query ? `?${query}` : ''}`;
        return this.ajax({
            url,
            method: 'GET'
        });
    },

    getUser(id) {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.show(id)}`,
            method: 'GET'
        });
    },

    createUser(data) {
        if (data instanceof FormData) {
            return this.ajax({
                url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.create}`,
                method: 'POST',
                processData: false,
                contentType: false,
                data
            });
        }

        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.create}`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data)
        });
    },

    updateUser(id, data) {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return this.ajax({
                url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.update(id)}`,
                method: 'POST',
                processData: false,
                contentType: false,
                data
            });
        }

        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.update(id)}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data)
        });
    },

    deleteUser(id) {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users.delete(id)}`,
            method: 'DELETE'
        });
    },

    // Permissions
    getPermissions() {
        return this.ajax({
            url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.permissions.list}`,
            method: 'GET'
        });
    }
};
