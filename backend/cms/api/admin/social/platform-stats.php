<?php
// cms/api/admin/social/platform-stats.php
// Get or update platform follower counts (for manual entry of X/Instagram/LinkedIn)

require_once __DIR__ . '/../../../db.php';
require_once __DIR__ . '/../../../audit.php';

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

header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_capability('social.view_aggregates');

$validPlatforms = ['facebook', 'x', 'instagram', 'linkedin'];

try {
    $pdo = get_pdo();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stats = [];
        try {
            $stmt = $pdo->query('SELECT platform, follower_count, updated_at FROM social_platform_stats');
            if ($stmt) {
                while (($r = $stmt->fetch(PDO::FETCH_ASSOC)) !== false) {
                    $stats[$r['platform']] = [
                        'follower_count' => (int) ($r['follower_count'] ?? 0),
                        'updated_at' => $r['updated_at'] ?? null,
                    ];
                }
            }
        } catch (Throwable $e) {
            // Table may not exist
        }
        foreach ($validPlatforms as $p) {
            if (!isset($stats[$p])) {
                $stats[$p] = ['follower_count' => 0, 'updated_at' => null];
            }
        }
        echo json_encode(['platform_stats' => $stats]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_capability('social.manage_engagement');
        $raw = file_get_contents('php://input');
        $data = $raw ? json_decode($raw, true) : null;
        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON body']);
            exit;
        }
        $platform = isset($data['platform']) ? trim((string) $data['platform']) : '';
        $count = isset($data['follower_count']) ? (int) $data['follower_count'] : 0;
        if ($count < 0) {
            $count = 0;
        }
        if (!in_array($platform, $validPlatforms, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid platform required (facebook, x, instagram, linkedin)']);
            exit;
        }
        $stmt = $pdo->prepare('
            INSERT INTO social_platform_stats (platform, follower_count, updated_at)
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE follower_count = VALUES(follower_count), updated_at = NOW()
        ');
        $stmt->execute([$platform, $count]);
        audit_log('update_platform_stats', 'social_platform_stats', null, ['platform' => $platform, 'follower_count' => $count]);
        echo json_encode(['success' => true, 'platform' => $platform, 'follower_count' => $count]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
