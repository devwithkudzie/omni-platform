<?php
// cms/api/admin/notifications.php
// Notifications API (list, mark as read, get unread count)

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../config.php';

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
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (!is_admin_logged_in()) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

function json_input() {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

try {
    $pdo = get_pdo();
    $adminId = $_SESSION['admin_id'];
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $unreadOnly = isset($_GET['unread']) && $_GET['unread'] === 'true';
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        
        $sql = 'SELECT id, type, title, message, related_id, related_type, is_read, created_at 
                FROM notifications 
                WHERE user_id = ?';
        
        if ($unreadOnly) {
            $sql .= ' AND is_read = 0';
        }
        
        $sql .= ' ORDER BY created_at DESC LIMIT ?';
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$adminId, $limit]);
        $notifications = $stmt->fetchAll();
        
        echo json_encode($notifications);
        exit;
    }

    if ($method === 'POST') {
        // Mark notification as read
        $body = json_input();
        $notificationId = isset($body['id']) ? (int)$body['id'] : 0;
        $markAll = isset($body['mark_all']) && $body['mark_all'] === true;
        
        if ($markAll) {
            $stmt = $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0');
            $stmt->execute([$adminId]);
            echo json_encode(['success' => true, 'marked' => $stmt->rowCount()]);
        } else if ($notificationId > 0) {
            $stmt = $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?');
            $stmt->execute([$notificationId, $adminId]);
            echo json_encode(['success' => true]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request']);
        }
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
