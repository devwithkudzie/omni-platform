<?php
// cms/api/admin/social/people-bulk-update.php
// Bulk update category for selected social people

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
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_capability('social.manage_people');

$validCategories = ['employee', 'client', 'prospect', 'partner', 'other'];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $raw = file_get_contents('php://input');
    $data = $raw ? json_decode($raw, true) : null;
    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON body']);
        exit;
    }

    $ids = $data['ids'] ?? null;
    $category = isset($data['category']) ? trim((string) $data['category']) : '';

    if (!is_array($ids) || count($ids) === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing or empty "ids" array']);
        exit;
    }

    if ($category === '' || !in_array($category, $validCategories, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Valid "category" is required (employee, client, prospect, partner, other)']);
        exit;
    }

    $pdo = get_pdo();
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare("
        UPDATE social_people
        SET category = ?, updated_at = NOW()
        WHERE id IN ($placeholders)
    ");
    $params = array_merge([$category], array_map('intval', $ids));
    $stmt->execute($params);
    $updated = $stmt->rowCount();
    audit_log('bulk_update_people', 'social_people', null, ['ids_count' => count($ids), 'category' => $category, 'updated' => $updated]);

    echo json_encode([
        'success' => true,
        'updated' => $updated,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
