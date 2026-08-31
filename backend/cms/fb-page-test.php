<?php
// cms/fb-page-test.php
// Simple test – CLI only. Run: php cms/fb-page-test.php
require_once __DIR__ . '/require_cli.php';
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$pageId    = cms_config_string('facebook.page_id');
$pageToken = cms_config_string('facebook.page_access_token');
$version   = cms_config_string('facebook.graph_version', 'v19.0');

if (!$pageId || !$pageToken) {
    http_response_code(500);
    echo json_encode([
        'error' => 'FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN is not set. Check backend/config/app.php.',
    ], JSON_PRETTY_PRINT);
    exit;
}

$url = "https://graph.facebook.com/{$version}/{$pageId}";
$params = http_build_query([
    'access_token' => $pageToken,
    'fields' => 'id,name,link,fan_count,followers_count,about,category',
]);

$ch = curl_init("{$url}?{$params}");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
]);
$body = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);
curl_close($ch);

if ($status < 200 || $status >= 300) {
    http_response_code($status);
    echo json_encode([
        'error' => 'Facebook API error',
        'status' => $status,
        'message' => $body ?: $err,
    ], JSON_PRETTY_PRINT);
    exit;
}

$data = json_decode($body, true);
if (!is_array($data)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Invalid JSON from Facebook',
        'raw' => $body,
    ], JSON_PRETTY_PRINT);
    exit;
}

echo json_encode($data, JSON_PRETTY_PRINT);
