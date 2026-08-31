<?php
/**
 * Simple file-based rate limiter.
 * Limits requests per IP per time window.
 * Use for public APIs to prevent abuse.
 */

/**
 * Check if the current client has exceeded the rate limit.
 *
 * @param string $key Unique key for this endpoint (e.g. 'airtime_purchase')
 * @param int $maxRequests Max requests allowed per window
 * @param int $windowSeconds Time window in seconds (default 60)
 * @return bool True if allowed, false if rate limited
 */
function rate_limit_check(string $key, int $maxRequests, int $windowSeconds = 60): bool {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
    }
    $clientKey = preg_replace('/[^a-zA-Z0-9._-]/', '', $ip);

    $dir = sys_get_temp_dir() . '/omni_rate_limit';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $file = $dir . '/' . $key . '_' . md5($clientKey) . '.json';

    $now = time();
    $data = ['count' => 0, 'start' => $now];

    if (file_exists($file)) {
        $raw = @file_get_contents($file);
        if ($raw) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded) && isset($decoded['count'], $decoded['start'])) {
                $data = $decoded;
                if ($now - $data['start'] >= $windowSeconds) {
                    $data = ['count' => 0, 'start' => $now];
                }
            }
        }
    }

    $data['count']++;
    @file_put_contents($file, json_encode($data), LOCK_EX);

    return $data['count'] <= $maxRequests;
}

/**
 * Send 429 Too Many Requests and exit if rate limited.
 */
function rate_limit_enforce(string $key, int $maxRequests, int $windowSeconds = 60): void {
    if (!rate_limit_check($key, $maxRequests, $windowSeconds)) {
        http_response_code(429);
        header('Retry-After: ' . $windowSeconds);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Too many requests. Please try again later.']);
        exit;
    }
}
