<?php
// cms/api/admin/social/engagement-history.php
// List engagement recording history (audit log)

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

header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_capability('social.manage_engagement');

$limit = min(100, max(10, (int)($_GET['limit'] ?? 50)));
$offset = max(0, (int)($_GET['offset'] ?? 0));
$platform = trim($_GET['platform'] ?? '');
$dateFrom = trim($_GET['date_from'] ?? '');
$dateTo = trim($_GET['date_to'] ?? '');

try {
    $pdo = get_pdo();

    // Check if table exists (migration may not have run)
    $tbl = $pdo->query("SHOW TABLES LIKE 'social_engagement_log'")->fetch();
    if (!$tbl) {
        echo json_encode(['history' => [], 'total' => 0]);
        exit;
    }

    $where = [];
    $params = [];
    if ($platform) {
        $where[] = 'l.platform = ?';
        $params[] = $platform;
    }
    if ($dateFrom) {
        $where[] = 'l.engagement_date >= ?';
        $params[] = $dateFrom;
    }
    if ($dateTo) {
        $where[] = 'l.engagement_date <= ?';
        $params[] = $dateTo;
    }
    $whereSql = empty($where) ? '' : ' WHERE ' . implode(' AND ', $where);

    $stmtCount = $pdo->prepare("SELECT COUNT(*) FROM social_engagement_log l {$whereSql}");
    $stmtCount->execute($params);
    $total = (int) $stmtCount->fetchColumn();

    $sql = "
        SELECT l.id, l.admin_id, l.action, l.platform, l.engagement_date, l.matched_count, l.total_input, l.created_at,
               a.name AS admin_name
        FROM social_engagement_log l
        LEFT JOIN admins a ON a.id = l.admin_id
        {$whereSql}
        ORDER BY l.created_at DESC
        LIMIT " . (int) $limit . " OFFSET " . (int) $offset . "
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'history' => $rows,
        'total' => $total,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log('Engagement history API Error: ' . $e->getMessage());
    echo json_encode(['error' => 'Server error']);
}
