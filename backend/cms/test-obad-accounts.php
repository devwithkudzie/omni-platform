<?php
/**
 * Test script: verify Bulk Airtime (OBAD) API connection.
 * Run from project root: php cms/test-obad-accounts.php (CLI only)
 */
require_once __DIR__ . '/require_cli.php';
require_once __DIR__ . '/config.php';

$clientId = trim(cms_config_string('bulk_airtime.client_id'));
$clientSecret = trim(cms_config_string('bulk_airtime.client_secret'));
$apiKey = trim(cms_config_string('bulk_airtime.api_key'));

echo "BULKAIRTIME_CLIENTID: " . ($clientId ? substr($clientId, 0, 4) . '...' : '(empty)') . "\n";
echo "BULKAIRTIME_CLIENTSECRET: " . ($clientSecret ? '***' : '(empty)') . "\n";
echo "BULKAIRTIME_APIKEY: " . ($apiKey ? substr($apiKey, 0, 4) . '...' : '(empty)') . "\n\n";

if (!$clientId || !$clientSecret || !$apiKey) {
    echo "ERROR: Credentials not configured. Check backend/config/app.php\n";
    exit(1);
}

$url = rtrim(cms_config_string('bulk_airtime.base_url'), '/') . '/accounts';
$ch = curl_init($url);
$opts = [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPGET => true,
    CURLOPT_HTTPHEADER => [
        'clientid: ' . $clientId,
        'clientsecret: ' . $clientSecret,
        'apikey: ' . $apiKey,
        'Content-Type: application/json',
    ],
];
$cacert = __DIR__ . '/vendor/paynow/php-sdk/src/Http/cacert.pem';
if (file_exists($cacert)) {
    $opts[CURLOPT_CAINFO] = $cacert;
}
curl_setopt_array($ch, $opts);

$response = curl_exec($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "HTTP Status: $httpCode\n";
if ($curlError) {
    echo "CURL Error: $curlError\n";
    exit(1);
}

echo "Raw response: $response\n\n";
$data = json_decode($response, true);
echo "Parsed: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
