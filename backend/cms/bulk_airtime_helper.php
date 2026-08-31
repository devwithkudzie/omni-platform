<?php
require_once __DIR__ . '/config.php';

/**
 * Bulk Airtime (OBAD) API helper.
 * Mirrors airtime-platform/src/services/bulkAirtime.js
 * Base URL: https://bulkairtime.omnicontact.biz/api/v1/obad/gateway/
 */

function get_obad_credentials(): ?array {
    $clientId = trim(cms_config_string('bulk_airtime.client_id'));
    $clientSecret = trim(cms_config_string('bulk_airtime.client_secret'));
    $apiKey = trim(cms_config_string('bulk_airtime.api_key'));
    if (!$clientId || !$clientSecret || !$apiKey) {
        return null;
    }
    return ['clientId' => $clientId, 'clientSecret' => $clientSecret, 'apiKey' => $apiKey];
}

function obad_request(string $method, string $path, ?array $body = null): array {
    $creds = get_obad_credentials();
    if (!$creds) {
        return ['success' => false, 'error' => 'Bulk Airtime credentials not configured'];
    }

    $baseUrl = rtrim(cms_config_string('bulk_airtime.base_url'), '/') . '/';
    $url = $baseUrl . ltrim($path, '/');
    $ch = curl_init($url);
    $headers = [
        'clientid: ' . $creds['clientId'],
        'clientsecret: ' . $creds['clientSecret'],
        'apikey: ' . $creds['apiKey'],
        'Content-Type: application/json',
    ];
    $cacert = __DIR__ . '/vendor/paynow/php-sdk/src/Http/cacert.pem';
    $opts = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
    ];
    if (file_exists($cacert)) {
        $opts[CURLOPT_CAINFO] = $cacert;
    }
    if ($method === 'GET') {
        $opts[CURLOPT_HTTPGET] = true;
    } else {
        $opts[CURLOPT_POST] = true;
        $opts[CURLOPT_POSTFIELDS] = json_encode($body ?? []);
    }
    curl_setopt_array($ch, $opts);
    $response = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        return ['success' => false, 'error' => 'OBAD request failed: ' . $curlError];
    }

    $data = json_decode($response, true);
    if ($httpCode >= 400) {
        return [
            'success' => false,
            'error' => $data['message'] ?? $data['error'] ?? 'OBAD API error',
            'httpCode' => $httpCode,
        ];
    }

    return ['success' => true, 'data' => $data];
}

/**
 * Get account balances from OBAD.
 * Returns ['success' => bool, 'details' => array] or ['success' => false, 'error' => string]
 */
function get_obad_account_balances(): array {
    $result = obad_request('GET', 'accounts');
    if (!$result['success']) {
        return $result;
    }
    $details = $result['data']['details'] ?? $result['data']['detials'] ?? [];
    return ['success' => true, 'details' => $details];
}

/**
 * Send airtime via OBAD.
 * $phone: receiver in format 2637XXXXXXXX
 * Returns ['success' => bool, 'data' => array] or ['success' => false, 'error' => string]
 */
function send_obad_airtime(string $phone, float $amount, string $currency = 'USD'): array {
    $payload = [
        'amount' => (float) $amount,
        'currency' => $currency,
        'reciever_number' => $phone, // API uses typo "reciever_number"
    ];
    $result = obad_request('POST', 'sell', $payload);
    if (!$result['success']) {
        return $result;
    }
    return ['success' => true, 'data' => $result['data']];
}

/**
 * Normalize receiver phone to 2637XXXXXXXX (Econet format).
 * Accepts: 0771234567, 263771234567, +263771234567, 771234567
 */
function normalize_receiver_phone(?string $raw): string {
    if (!$raw) return '';
    $digits = preg_replace('/\D/', '', $raw);
    if (str_starts_with($digits, '2637') && strlen($digits) === 12) return $digits;
    if (str_starts_with($digits, '0')) $digits = substr($digits, 1);
    if (str_starts_with($digits, '2637') && strlen($digits) === 12) return $digits;
    if (str_starts_with($digits, '7') && strlen($digits) === 9) return '263' . $digits;
    return $digits;
}
