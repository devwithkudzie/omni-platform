<?php

declare(strict_types=1);

spl_autoload_register(static function (string $class): void {
    $prefix = 'OmniContact\\';

    if (!str_starts_with($class, $prefix)) {
        return;
    }

    $relative = str_replace('\\', '/', substr($class, strlen($prefix)));
    $file = dirname(__DIR__) . '/src/' . $relative . '.php';

    if (is_file($file)) {
        require $file;
    }
});

use OmniContact\Http\Cors;
use OmniContact\Http\Response;

$config = require dirname(__DIR__) . '/config/app.php';
Cors::apply($config['allowed_origins']);

$routes = require dirname(__DIR__) . '/routes/api.php';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

foreach ($routes as $route) {
    if ($route['method'] !== $method) {
        continue;
    }

    if (preg_match($route['pattern'], $path, $matches)) {
        $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
        $route['handler']($params, $config);
        exit;
    }
}

Response::error('NOT_FOUND', 'The requested endpoint does not exist.', 404);
