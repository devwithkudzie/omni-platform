<?php
// cms/api/admin/social/dashboard-stats.php
// Returns dashboard statistics for social media engagement

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

// Require at least aggregate-view capability for social stats
require_capability('social.view_aggregates');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $pdo = get_pdo();

    $category = isset($_GET['category']) ? trim($_GET['category']) : null;
    $dateFrom = isset($_GET['date_from']) ? trim($_GET['date_from']) : null;
    $dateTo = isset($_GET['date_to']) ? trim($_GET['date_to']) : null;

    $validCategories = ['employee', 'client', 'prospect', 'partner', 'other'];
    if ($category && !in_array($category, $validCategories, true)) {
        $category = null;
    }

    $whereClause = [];
    $params = [];
    if ($category) {
        $whereClause[] = 'p.category = ?';
        $params[] = $category;
    }
    if ($dateFrom) {
        $whereClause[] = 'e.engagement_date >= ?';
        $params[] = $dateFrom;
    }
    if ($dateTo) {
        $whereClause[] = 'e.engagement_date <= ?';
        $params[] = $dateTo;
    }
    $whereSql = empty($whereClause) ? '' : ' WHERE ' . implode(' AND ', $whereClause);
    $baseFrom = 'social_engagement e INNER JOIN social_people p ON e.person_id = p.id';
    $baseFromPeople = 'social_people p';
    $baseFromEng = 'social_engagement e';

    // Overall stats (filtered)
    $stats = [
        'total_people' => 0,
        'total_engagement' => 0,
        'total_dates' => 0,
        'by_platform' => [],
        'recent_activity' => [],
    ];

    if (empty($whereClause)) {
        $stmt = $pdo->query('SELECT COUNT(*) FROM social_people');
        $stats['total_people'] = (int)$stmt->fetchColumn();
    } else {
        $stmt = $pdo->prepare("SELECT COUNT(DISTINCT p.id) FROM {$baseFrom}{$whereSql}");
        $stmt->execute($params);
        $stats['total_people'] = (int)$stmt->fetchColumn();
    }

    $stmt = $pdo->prepare("SELECT COALESCE(SUM(e.engagement_count), 0) FROM {$baseFrom}{$whereSql}");
    $stmt->execute($params);
    $stats['total_engagement'] = (int)$stmt->fetchColumn();

    $stmt = $pdo->prepare("SELECT COUNT(DISTINCT e.engagement_date) FROM {$baseFrom}{$whereSql}");
    $stmt->execute($params);
    $stats['total_dates'] = (int)$stmt->fetchColumn();

    // Stats by platform (filtered) + follower counts from social_platform_stats
    $platforms = ['facebook', 'x', 'instagram', 'linkedin'];
    $followerCounts = [];
    try {
        $stmtF = $pdo->query('SELECT platform, follower_count FROM social_platform_stats');
        if ($stmtF) {
            while (($r = $stmtF->fetch(PDO::FETCH_ASSOC)) !== false) {
                $followerCounts[$r['platform']] = (int) ($r['follower_count'] ?? 0);
            }
        }
    } catch (Throwable $e) {
        // Table may not exist
    }
    foreach ($platforms as $platform) {
        $platWhere = array_merge($whereClause, ['e.platform = ?']);
        $platParams = array_merge($params, [$platform]);
        $platSql = ' WHERE ' . implode(' AND ', $platWhere);
        $stmt = $pdo->prepare("
            SELECT COUNT(DISTINCT e.person_id) as unique_people,
                   COALESCE(SUM(e.engagement_count), 0) as total_engagement,
                   COUNT(DISTINCT e.engagement_date) as unique_dates
            FROM {$baseFrom}{$platSql}
        ");
        $stmt->execute($platParams);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['by_platform'][$platform] = [
            'unique_people' => (int)($row['unique_people'] ?? 0),
            'total_engagement' => (int)($row['total_engagement'] ?? 0),
            'unique_dates' => (int)($row['unique_dates'] ?? 0),
            'follower_count' => $followerCounts[$platform] ?? 0,
        ];
    }

    // Recent activity (filtered)
    $stmt = $pdo->prepare("
        SELECT e.id, e.platform, e.engagement_date, e.engagement_count, e.created_at, p.real_name, p.category
        FROM {$baseFrom}{$whereSql}
        ORDER BY e.created_at DESC
        LIMIT 10
    ");
    $stmt->execute($params);
    $stats['recent_activity'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Date range stats (last 30/7 days - always unfiltered for quick reference)
    $stmt = $pdo->query('
        SELECT COALESCE(SUM(engagement_count), 0) as total, COUNT(DISTINCT person_id) as unique_people
        FROM social_engagement WHERE engagement_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ');
    $row30 = $stmt->fetch(PDO::FETCH_ASSOC);
    $stats['last_30_days'] = [
        'total_engagement' => (int)($row30['total'] ?? 0),
        'unique_people' => (int)($row30['unique_people'] ?? 0),
    ];
    $stmt = $pdo->query('
        SELECT COALESCE(SUM(engagement_count), 0) as total, COUNT(DISTINCT person_id) as unique_people
        FROM social_engagement WHERE engagement_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    ');
    $row7 = $stmt->fetch(PDO::FETCH_ASSOC);
    $stats['last_7_days'] = [
        'total_engagement' => (int)($row7['total'] ?? 0),
        'unique_people' => (int)($row7['unique_people'] ?? 0),
    ];

    // Engagement over time (daily) for trend chart
    $stats['engagement_over_time'] = [];
    if ($dateFrom && $dateTo) {
        $stmt = $pdo->prepare("
            SELECT e.engagement_date, SUM(e.engagement_count) as total
            FROM {$baseFrom}{$whereSql}
            GROUP BY e.engagement_date
            ORDER BY e.engagement_date ASC
        ");
        $stmt->execute($params);
        while (($r = $stmt->fetch(PDO::FETCH_ASSOC)) !== false) {
            $stats['engagement_over_time'][] = [
                'date' => $r['engagement_date'],
                'total' => (int)($r['total'] ?? 0),
            ];
        }
    }

    // Stats by category (always show all; filters apply to main stats)
    $categories = ['employee', 'client', 'prospect', 'partner', 'other'];
    $stats['by_category'] = [];
    foreach ($categories as $cat) {
        $catWhere = array_merge($whereClause, ['p.category = ?']);
        $catParams = array_merge($params, [$cat]);
        $catSql = ' WHERE ' . implode(' AND ', $catWhere);
        $stmt = $pdo->prepare("
            SELECT COUNT(DISTINCT e.person_id) AS unique_people, COALESCE(SUM(e.engagement_count), 0) AS total_engagement
            FROM {$baseFrom}{$catSql}
        ");
        $stmt->execute($catParams);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['by_category'][$cat] = [
            'unique_people' => (int)($row['unique_people'] ?? 0),
            'total_engagement' => (int)($row['total_engagement'] ?? 0),
        ];
    }

    echo json_encode($stats);
} catch (Throwable $e) {
    http_response_code(500);
    error_log('Dashboard stats error: ' . $e->getMessage());
    echo json_encode(['error' => 'Server error']);
}
