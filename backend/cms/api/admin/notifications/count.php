<?php
// cms/api/admin/notifications/count.php
// Get unread notification count

require_once __DIR__ . '/../../../db.php';
require_once __DIR__ . '/../../../config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');
// CORS: Allow localhost for development, production domain for production
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
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (!is_admin_logged_in()) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

try {
    $pdo = get_pdo();
    $adminId = $_SESSION['admin_id'];
    
    $stmt = $pdo->prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0');
    $stmt->execute([$adminId]);
    $result = $stmt->fetch();
    
    echo json_encode(['count' => (int)$result['count']]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
