<?php
// cms/api/admin/social/test-facebook-engaged-users.php
// Diagnostic: Returns JSON of users who engaged (liked/commented) on page posts.
// Use this to verify the API returns engagement data. No DB writes.

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
}

require_capability('social.view_aggregates');

$pageId    = cms_config_string('facebook.page_id');
$pageToken = cms_config_string('facebook.page_access_token');
$version   = cms_config_string('facebook.graph_version', 'v19.0');

if (!$pageId || !$pageToken) {
    http_response_code(500);
    echo json_encode(['error' => 'FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN not set']);
    exit;
}

$limit = max(5, min(50, (int)($_GET['limit'] ?? 25)));

function fb_get(string $url, array $params, string $version, string $pageToken): array {
    $base = "https://graph.facebook.com/{$version}";
    $params['access_token'] = $pageToken;
    $full = $base . $url . '?' . http_build_query($params);
    $ch = curl_init($full);
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

try {
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
            'posts'   => null,
        ]);
        exit;
    }

    $posts = $postsResponse['data'] ?? [];
    $engagedUsers = [];
    $byPost = [];

    foreach ($posts as $post) {
        $externalId = $post['id'] ?? '';
        $message = mb_substr($post['message'] ?? '', 0, 80);
        $createdTime = $post['created_time'] ?? null;

        if ($externalId === '') {
            continue;
        }

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

            $userKey = $rId;
            $user = ['facebook_id' => $rId, 'name' => $rName, 'type' => 'reaction', 'reaction_type' => $rType];

            $postData['reactions'][] = $user;
            if (!isset($engagedUsers[$userKey])) {
                $engagedUsers[$userKey] = ['facebook_id' => $rId, 'name' => $rName, 'reactions' => 0, 'comments' => 0];
            }
            $engagedUsers[$userKey]['reactions']++;
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

            $userKey = $cId ?: ('anon-' . ($c['id'] ?? ''));
            $user = ['facebook_id' => $cId, 'name' => $cName, 'type' => 'comment', 'message_preview' => $cMessage];

            $postData['comments'][] = $user;
            if ($cId && !isset($engagedUsers[$cId])) {
                $engagedUsers[$cId] = ['facebook_id' => $cId, 'name' => $cName, 'reactions' => 0, 'comments' => 0];
            }
            if ($cId) {
                $engagedUsers[$cId]['comments']++;
            }
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
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
