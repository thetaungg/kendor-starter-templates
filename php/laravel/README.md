# Laravel app (PHP)

A Laravel 11 app with a SQLite database, plus Vite for the frontend assets. Both start by themselves.
The preview shows the Laravel app, and changes appear when you refresh it.

## Run it

Two terminal tabs are running:

- `app` runs `php artisan serve`, the Laravel app in the preview.
- `vite` builds CSS and JavaScript from `resources/`.

Useful commands, in a new terminal (**+**):

```bash
php artisan route:list          # list the routes
php artisan make:controller X   # create a controller
php artisan migrate             # apply database migrations
```

## Test it

```bash
php artisan test
```

Or click **Run tests** in the Tests view. That runs the same tests used for grading.

## Files

- `routes/web.php` defines the pages, the place to start.
- `app/Http/Controllers/` holds the controllers.
- `resources/views/` holds the Blade templates.
- `database/migrations/` defines the database tables.
- `tests/` holds the tests.
