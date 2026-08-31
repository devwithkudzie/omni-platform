<?php

namespace OmniContact\Http;

final class Cors
{
    public static function apply(array $allowedOrigins): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        $isAllowedLocalDev = (bool) preg_match('#^https?://(localhost|127\.0\.0\.1):\d+$#', $origin);

        if ($origin && (in_array($origin, $allowedOrigins, true) || $isAllowedLocalDev)) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Vary: Origin');
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
