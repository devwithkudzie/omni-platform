<?php
// cms/api/admin/social/workbook-data.php
// Returns JSON data for client-side workbook generation (people, dates, engagement map)
// No PhpSpreadsheet/Composer required - Excel is built in JavaScript

require_once __DIR__ . '/../../../db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');

$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
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

require_capability('social.view_aggregates');

$category = isset($_GET['category']) ? trim($_GET['category']) : null;
$dateFrom = isset($_GET['date_from']) ? trim($_GET['date_from']) : null;
$dateTo = isset($_GET['date_to']) ? trim($_GET['date_to']) : null;

$validCategories = ['employee', 'client', 'prospect', 'partner', 'other'];
if ($category && !in_array($category, $validCategories, true)) {
    $category = null;
}

// Default date range: last 30 days
if (!$dateFrom && !$dateTo) {
    $dateTo = date('Y-m-d');
    $dateFrom = date('Y-m-d', strtotime('-30 days'));
}

try {
    $pdo = get_pdo();

    // People (optionally filtered by category)
    $peopleSql = 'SELECT id, real_name FROM social_people';
    $peopleParams = [];
    if ($category) {
        $peopleSql .= ' WHERE category = ?';
        $peopleParams[] = $category;
    }
    $peopleSql .= ' ORDER BY real_name ASC';
    $stmtPeople = $peopleParams ? $pdo->prepare($peopleSql) : $pdo;
    if ($peopleParams) {
        $stmtPeople->execute($peopleParams);
    } else {
        $stmtPeople = $pdo->query($peopleSql);
    }
    $people = $stmtPeople->fetchAll(PDO::FETCH_ASSOC);

    // Dates: either range or distinct from engagement
    $dates = [];
    if ($dateFrom && $dateTo) {
        $from = strtotime($dateFrom);
        $to = strtotime($dateTo);
        if ($from !== false && $to !== false) {
            $d = min($from, $to);
            $end = max($from, $to);
            while ($d <= $end) {
                $dates[] = date('Y-m-d', $d);
                $d = strtotime('+1 day', $d);
            }
        }
    }
    if (empty($dates)) {
        $baseFrom = 'social_engagement e INNER JOIN social_people p ON e.person_id = p.id';
        $where = [];
        $params = [];
        if ($category) {
            $where[] = 'p.category = ?';
            $params[] = $category;
        }
        $whereSql = empty($where) ? '' : ' WHERE ' . implode(' AND ', $where);
        $stmtDates = $pdo->prepare("
            SELECT DISTINCT e.engagement_date
            FROM {$baseFrom}{$whereSql}
            ORDER BY e.engagement_date ASC
        ");
        $stmtDates->execute($params);
        $dates = $stmtDates->fetchAll(PDO::FETCH_COLUMN);
    }
    if (empty($dates)) {
        $dates = [date('Y-m-d')];
    }

    // Engagement map: "personId|date|platform" => 1
    $where = [];
    $params = [];
    $baseFrom = 'social_engagement e INNER JOIN social_people p ON e.person_id = p.id';
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

    $stmtEng = $pdo->prepare("
        SELECT e.person_id, e.engagement_date, e.platform, e.engagement_count
        FROM {$baseFrom}{$whereSql}
    ");
    $stmtEng->execute($params);
    $engagement = [];
    while ($row = $stmtEng->fetch(PDO::FETCH_ASSOC)) {
        $key = $row['person_id'] . '|' . $row['engagement_date'] . '|' . $row['platform'];
        $engagement[$key] = ($row['engagement_count'] ?? 0) > 0 ? 1 : 0;
    }

    echo json_encode([
        'people' => $people,
        'dates' => $dates,
        'engagement' => $engagement,
        'headers' => ['NAME', 'Facebook', 'X ', 'Instagram', 'LinkedIn', 'Total Engagement'],
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage(),
    ]);
}
