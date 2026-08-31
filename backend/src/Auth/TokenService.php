<?php

namespace OmniContact\Auth;

final class TokenService
{
    public static function issue(array $admin, string $secret, int $ttlSeconds = 43200): string
    {
        $now = time();
        $payload = [
            'sub' => (int) $admin['id'],
            'email' => $admin['email'],
            'role' => $admin['role'] ?? 'author',
            'iat' => $now,
            'exp' => $now + $ttlSeconds,
        ];

        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $segments = [
            self::base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES)),
            self::base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES)),
        ];

        $signature = hash_hmac('sha256', implode('.', $segments), $secret, true);
        $segments[] = self::base64UrlEncode($signature);

        return implode('.', $segments);
    }

    public static function verify(string $token, string $secret): ?array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parts;
        $expected = self::base64UrlEncode(hash_hmac('sha256', "{$header}.{$payload}", $secret, true));

        if (!hash_equals($expected, $signature)) {
            return null;
        }

        $decoded = json_decode(self::base64UrlDecode($payload), true);

        if (!is_array($decoded) || empty($decoded['sub']) || empty($decoded['exp']) || time() >= (int) $decoded['exp']) {
            return null;
        }

        return $decoded;
    }

    private static function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $value): string
    {
        return base64_decode(strtr($value, '-_', '+/')) ?: '';
    }
}
