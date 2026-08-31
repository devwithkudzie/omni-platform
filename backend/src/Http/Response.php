<?php

namespace OmniContact\Http;

final class Response
{
    public static function json(array $data = [], int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'ok' => $status >= 200 && $status < 400,
            'data' => $data,
            'error' => null,
        ], JSON_UNESCAPED_SLASHES);
    }

    public static function error(string $code, string $message, int $status = 400): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'ok' => false,
            'data' => null,
            'error' => [
                'code' => $code,
                'message' => $message,
            ],
        ], JSON_UNESCAPED_SLASHES);
    }
}

