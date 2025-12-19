# ShowTV

ShowTV is a Laravel-based backend API with two static frontends:

- `Frontend/` - end-user web app (browse shows/episodes, auth, etc.)
- `admin-dashboard/` - admin panel (manage shows, seasons, episodes, users, roles/permissions)

The backend exposes a JSON REST API under `/api` and uses:

- Laravel 12
- Laravel Sanctum (API tokens)
- Spatie Laravel Permission (roles & permissions)

## Full functionalities

### Backend API

- Authentication
  - `POST /api/register` register a user (supports image upload)
  - `POST /api/login` login and receive a Sanctum `access_token`
  - `GET /api/user` get authenticated user (requires `auth:sanctum`)

- Users management (protected)
  - `GET /api/users` list users (requires `auth:sanctum` + `permission:view users`)
  - `POST /api/users` create user (requires `permission:create users`)
  - `GET /api/users/{id}` show user (requires `permission:view users`)
  - `PUT /api/users/{id}` update user (requires `permission:edit users`)
  - `DELETE /api/users/{id}` delete user (requires `permission:delete users`)
  - Supports:
    - Role assignment (`role`)
    - Permission assignment (`permissions[]` as an array of permission IDs)
    - Optional profile image upload

- Permissions
  - `GET /api/permissions` list available permissions (used by admin dashboard)

- Content
  - Shows: `Route::apiResource('shows', ...)`
  - Seasons: `Route::apiResource('seasons', ...)` + `GET /api/show/{show}/seasons`
  - Episodes: `Route::apiResource('episodes', ...)` + `GET /api/season/{season}/episodes`

- Social features
  - Follow/unfollow shows (requires `auth:sanctum`)
    - `GET /api/followed-shows`
    - `POST /api/follow`
    - `DELETE /api/unfollow`
  - Reactions (requires `auth:sanctum`)
    - `POST /api/reaction/like`
    - `POST /api/reaction/dislike`
    - `DELETE /api/reaction`

### Admin dashboard (`admin-dashboard/`)

- Login using API token (stored in `localStorage` as `admin_token`)
- Manage:
  - TV shows (CRUD)
  - Seasons (CRUD)
  - Episodes (CRUD)
  - Users (CRUD)
    - Assign role
    - Assign permissions via `GET /api/permissions`

### Frontend (`Frontend/`)

- Static web UI built with Bootstrap/jQuery
- Auth (login/register)
- Browse content via the API

## Project structure

- `routes/api.php` API routes
- `app/Http/Controllers` controllers
- `app/Logic` domain logic (e.g. `UserLogic` for roles/permissions)
- `database/seeders` seeders (roles/permissions + demo content)
- `admin-dashboard/` static admin panel
- `Frontend/` static user-facing site

## Requirements

- PHP `^8.2`
- Composer
- Node.js + npm
- MySQL (default in `.env.example`)

## Installation

1) Install PHP dependencies

```bash
composer install
```

2) Setup environment

```bash
cp .env.example .env
php artisan key:generate
```

Update `.env` database settings:

- `DB_DATABASE=showtv`
- `DB_USERNAME=...`
- `DB_PASSWORD=...`

3) Run migrations

```bash
php artisan migrate
```

4) Seed roles/permissions + default admin

```bash
php artisan db:seed --class=Database\\Seeders\\RolesAndPermissions
```

Optional: seed demo content (if desired):

```bash
php artisan db:seed --class=Database\\Seeders\\ShowSeeder
php artisan db:seed --class=Database\\Seeders\\SeasonSeeder
php artisan db:seed --class=Database\\Seeders\\EpisodeSeeder
php artisan db:seed --class=Database\\Seeders\\FollowSeeder
php artisan db:seed --class=Database\\Seeders\\ReactionSeeder
```

5) Create public storage symlink (for uploaded images)

```bash
php artisan storage:link
```

6) Install frontend build dependencies (for Vite/Tailwind resources)

```bash
npm install
```

## Running the project

### Backend API

```bash
php artisan serve
```

Default API base URL: `http://localhost:8000/api`

### Admin dashboard

1) Open `admin-dashboard/login.html` in a browser.
2) Ensure the API base URL matches your backend:
   - `admin-dashboard/js/api.js` -> `API_CONFIG.baseUrl`

Default seeded admin credentials (if you ran the `RolesAndPermissions` seeder):

- Email: `admin@show.tv`
- Password: `password123`

### Frontend

1) Open `Frontend/index.html` in a browser.
2) Ensure the API base URL matches your backend:
   - `Frontend/js/main.js` -> `config.apiBaseUrl`

## Notes / troubleshooting

- **403 on `/api/users`**: the logged-in user must have the required permissions:
  - `view users`, `create users`, `edit users`, `delete users`
- **User permissions submission**: the admin dashboard sends `permissions[]` as an array of **permission IDs**; backend converts IDs to Spatie Permission models before syncing.

## License

This project is licensed under the MIT License.
