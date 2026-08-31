<?php
// cms/api/admin/social/top-engagers.php
// Returns top engagers based on engagement count

require_once __DIR__ . '/../../../db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');

// CORS: Allow localhost for development, production domain for production
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

// Person-level view of engagement; require appropriate capability
require_capability('social.view_person_detail');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $pdo = get_pdo();
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $platform = isset($_GET['platform']) ? strtolower(trim($_GET['platform'])) : null;
    $category = isset($_GET['category']) ? trim($_GET['category']) : null;
    $dateFrom = isset($_GET['date_from']) ? trim($_GET['date_from']) : null;
    $dateTo = isset($_GET['date_to']) ? trim($_GET['date_to']) : null;

    $validCategories = ['employee', 'client', 'prospect', 'partner', 'other'];
    if ($category && !in_array($category, $validCategories, true)) {
        $category = null;
    }

    $where = [];
    $params = [];
    if ($platform && in_array($platform, ['facebook', 'x', 'instagram', 'linkedin'], true)) {
        $where[] = 'e.platform = ?';
        $params[] = $platform;
    }
    if ($category) {
        $where[] = 'p.category = ?';
        $params[] = $category;
    }
    if ($dateFrom) {
        $where[] = 'e.engagement_date >= ?';
        $params[] = $dateFrom;
    }
    if ($dateTo) {
        $where[] = 'e.engagement_date <= ?';
        $params[] = $dateTo;
    }
    $whereSql = empty($where) ? '' : ' WHERE ' . implode(' AND ', $where);

    $sql = '
        SELECT 
            p.id,
            p.real_name,
            p.category,
            p.company,
            p.facebook_name,
            p.x_name,
            p.instagram_name,
            p.linkedin_name,
            SUM(e.engagement_count) as total_engagement,
            COUNT(DISTINCT e.engagement_date) as engagement_dates,
            COUNT(DISTINCT e.platform) as platforms_count,
            MAX(e.engagement_date) as last_engagement
        FROM social_people p
        INNER JOIN social_engagement e ON p.id = e.person_id
        ' . $whereSql . '
        GROUP BY p.id, p.real_name, p.category, p.company, p.facebook_name, p.x_name, p.instagram_name, p.linkedin_name
        ORDER BY total_engagement DESC, engagement_dates DESC
        LIMIT ?
    ';
    $params[] = $limit;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $topEngagers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the results
    foreach ($topEngagers as &$engager) {
        $engager['total_engagement'] = (int)$engager['total_engagement'];
        $engager['engagement_dates'] = (int)$engager['engagement_dates'];
        $engager['platforms_count'] = (int)$engager['platforms_count'];
    }

    echo json_encode([
        'top_engagers' => $topEngagers,
        'limit' => $limit,
        'platform' => $platform,
        'category' => $category,
        'date_from' => $dateFrom,
        'date_to' => $dateTo,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log('Top engagers error: ' . $e->getMessage());
    echo json_encode(['error' => 'Server error']);
}
