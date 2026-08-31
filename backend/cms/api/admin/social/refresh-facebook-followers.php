<?php
// cms/api/admin/social/refresh-facebook-followers.php
// Lightweight endpoint: fetches ONLY Facebook page follower count from API, no post sync.
// Use for dashboard load and periodic refresh without full sync.

require_once __DIR__ . '/../../../db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');

$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'https://omnicontact.biz',
    'https://www.omnicontact.biz',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000');
}

header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_capability('social.view_aggregates');

$pageId    = cms_config_string('facebook.page_id');
$pageToken = cms_config_string('facebook.page_access_token');
$version   = cms_config_string('facebook.graph_version', 'v19.0');

if (!$pageId || !$pageToken) {
    http_response_code(500);
    echo json_encode(['error' => 'FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN not configured']);
    exit;
}

$url = "https://graph.facebook.com/{$version}/{$pageId}?fields=fan_count,followers_count&access_token=" . urlencode($pageToken);
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 15,
]);
$body   = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status < 200 || $status >= 300) {
    $decoded = json_decode($body, true);
    $msg = $decoded['error']['message'] ?? $body;
    http_response_code($status);
    echo json_encode([
        'error' => 'Facebook API error',
        'message' => $msg,
        'status' => $status,
    ]);
    exit;
}

$data = json_decode($body, true);
if (!is_array($data)) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid response from Facebook']);
    exit;
}

$followerCount = (int) ($data['followers_count'] ?? $data['fan_count'] ?? 0);

try {
    $pdo = get_pdo();
    $stmt = $pdo->prepare('
        INSERT INTO social_platform_stats (platform, follower_count, updated_at)
        VALUES (\'facebook\', ?, NOW())
        ON DUPLICATE KEY UPDATE follower_count = VALUES(follower_count), updated_at = NOW()
    ');
    $stmt->execute([$followerCount]);
    echo json_encode([
        'success' => true,
        'facebook_followers' => $followerCount,
        'updated' => true,
    ]);
} catch (Throwable $e) {
    // Table may not exist - return count anyway so UI can show it; suggest running migration
    echo json_encode([
        'success' => true,
        'facebook_followers' => $followerCount,
        'updated' => false,
        'warning' => 'Could not save to database. Run migration: add_social_platform_stats.sql',
    ]);
}
