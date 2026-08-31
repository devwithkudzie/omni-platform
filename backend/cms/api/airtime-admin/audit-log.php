<?php
// cms/api/airtime-admin/audit-log.php
// Fetch audit log - only admins can access

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');

$allowedOrigins = [
    'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173',
    'http://127.0.0.1:3000', 'https://omnicontact.biz',
    'https://www.omnicontact.biz',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (empty($_SESSION['airtime_user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

try {
    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT role FROM airtime_users WHERE id = ? LIMIT 1');
    $stmt->execute([$_SESSION['airtime_user_id']]);
    $currentUser = $stmt->fetch();
    if (!$currentUser || !in_array($currentUser['role'] ?? 'operator', ['admin', 'super_admin'], true)) {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        exit;
    }

    $limit = min(200, max(1, (int) ($_GET['limit'] ?? 100)));
    $offset = max(0, (int) ($_GET['offset'] ?? 0));
    $userId = isset($_GET['user_id']) ? (int) $_GET['user_id'] : null;
    $action = isset($_GET['action']) ? trim($_GET['action']) : null;

    $sql = 'SELECT a.id, a.airtime_user_id, a.action, a.resource, a.resource_id, a.details, a.created_at,
                   u.email as user_email, u.name as user_name
            FROM airtime_audit_log a
            LEFT JOIN airtime_users u ON u.id = a.airtime_user_id
            WHERE 1=1';
    $params = [];

    if ($userId) {
        $sql .= ' AND a.airtime_user_id = ?';
        $params[] = $userId;
    }
    if ($action) {
        $sql .= ' AND a.action = ?';
        $params[] = $action;
    }

    $sql .= ' ORDER BY a.created_at DESC LIMIT ' . (int) $limit . ' OFFSET ' . (int) $offset;

    $stmt = $params ? $pdo->prepare($sql) : $pdo->query($sql);
    if ($params) $stmt->execute($params);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$r) {
        if (isset($r['details']) && is_string($r['details'])) {
            $dec = json_decode($r['details'], true);
            $r['details'] = is_array($dec) ? $dec : null;
        }
    }

    echo json_encode(['entries' => $rows]);
} catch (Throwable $e) {
    error_log('airtime-admin audit-log: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
