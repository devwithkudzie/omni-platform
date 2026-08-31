<?php
// cms/fb-engaged-users-test.php
// Returns JSON of users who engaged – CLI only. Run: php cms/fb-engaged-users-test.php
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

$limit = max(5, min(50, (int)($_GET['limit'] ?? 25)));

function fb_get(string $path, array $params, string $version, string $token): array {
    $url = "https://graph.facebook.com/{$version}{$path}?" . http_build_query($params + ['access_token' => $token]);
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
    ]);
    $body   = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($status < 200 || $status >= 300) {
        return ['error' => true, 'status' => $status, 'body' => $body];
    }
    $data = json_decode($body, true);
    return is_array($data) ? $data : ['error' => true, 'body' => $body];
}

$postsResponse = fb_get("/{$pageId}/posts", [
    'fields' => 'id,message,created_time,permalink_url',
    'limit'  => $limit,
], $version, $pageToken);

if (!empty($postsResponse['error'])) {
    $body = $postsResponse['body'] ?? 'Unknown error';
    $decoded = is_string($body) ? json_decode($body, true) : null;
    $msg = $decoded['error']['message'] ?? $body;
    http_response_code($postsResponse['status'] ?? 500);
    echo json_encode([
        'error'   => 'Facebook API error',
        'message' => $msg,
    ], JSON_PRETTY_PRINT);
    exit;
}

$posts = $postsResponse['data'] ?? [];
$engagedUsers = [];
$byPost = [];

foreach ($posts as $post) {
    $externalId = $post['id'] ?? '';
    $message = mb_substr($post['message'] ?? '', 0, 80);
    $createdTime = $post['created_time'] ?? null;

    if ($externalId === '') continue;

    $postData = [
        'id' => $externalId,
        'message_preview' => $message . (strlen($post['message'] ?? '') > 80 ? '...' : ''),
        'created_time' => $createdTime,
        'reactions' => [],
        'comments' => [],
    ];

    // Reactions (likes)
    $reactionsResponse = fb_get("/{$externalId}/reactions", [
        'fields' => 'id,name,type',
        'limit'  => 500,
    ], $version, $pageToken);
    $reactions = $reactionsResponse['data'] ?? [];

    foreach ($reactions as $r) {
        $rId = $r['id'] ?? '';
        $rName = $r['name'] ?? null;
        $rType = $r['type'] ?? 'LIKE';
        if ($rId === '') continue;

        $postData['reactions'][] = ['facebook_id' => $rId, 'name' => $rName, 'type' => $rType];
        if (!isset($engagedUsers[$rId])) {
            $engagedUsers[$rId] = ['facebook_id' => $rId, 'name' => $rName, 'reactions' => 0, 'comments' => 0];
        }
        $engagedUsers[$rId]['reactions']++;
    }

    // Comments
    $commentsResponse = fb_get("/{$externalId}/comments", [
        'fields' => 'id,from{name,id},created_time,message',
        'limit'  => 500,
    ], $version, $pageToken);
    $comments = $commentsResponse['data'] ?? [];

    foreach ($comments as $c) {
        $from = $c['from'] ?? [];
        $cName = is_array($from) ? ($from['name'] ?? null) : null;
        $cId = is_array($from) && isset($from['id']) ? (string) $from['id'] : null;
        $cMessage = mb_substr($c['message'] ?? '', 0, 50);

        $displayName = $cName ?? '(unidentified - profile restricted)';
        $postData['comments'][] = ['facebook_id' => $cId, 'name' => $displayName, 'message_preview' => $cMessage];
        $ukey = $cId ?: ('anon-' . ($c['id'] ?? uniqid()));
        if (!isset($engagedUsers[$ukey])) {
            $engagedUsers[$ukey] = ['facebook_id' => $cId, 'name' => $displayName, 'reactions' => 0, 'comments' => 0];
        }
        $engagedUsers[$ukey]['comments']++;
    }

    $byPost[] = $postData;
}

$engagedList = array_values($engagedUsers);

echo json_encode([
    'success' => true,
    'posts_fetched' => count($posts),
    'posts_with_engagement' => count(array_filter($byPost, fn($p) => count($p['reactions']) > 0 || count($p['comments']) > 0)),
    'total_engaged_users' => count($engagedList),
    'engaged_users' => $engagedList,
    'by_post' => $byPost,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
