<?php
// cms/api/admin/blogs/approve.php
// Approve or reject blog posts

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../notifications.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');
// CORS: Allow localhost for development, production domain for production
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
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

if (!is_admin_logged_in()) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

// Check if user is manager or super_admin
try {
    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT role FROM admins WHERE id = ? LIMIT 1');
    $stmt->execute([$_SESSION['admin_id']]);
    $currentUser = $stmt->fetch();
    
    if (!$currentUser || !in_array($currentUser['role'], ['super_admin', 'manager'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Only managers and super admins can approve blogs']);
        exit;
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
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
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }
    
    $body = json_input();
    $blogId = isset($body['id']) ? (int)$body['id'] : 0;
    $action = $body['action'] ?? ''; // 'approve' or 'reject'
    
    if ($blogId <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid blog ID']);
        exit;
    }
    
    if (!in_array($action, ['approve', 'reject'], true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action. Use "approve" or "reject"']);
        exit;
    }
    
    $approvalStatus = $action === 'approve' ? 'approved' : 'rejected';
    
    // Get blog info and author before updating
    $stmt = $pdo->prepare('SELECT title, author_id FROM blogs WHERE id = ? LIMIT 1');
    $stmt->execute([$blogId]);
    $blog = $stmt->fetch();
    
    if (!$blog) {
        http_response_code(404);
        echo json_encode(['error' => 'Blog not found']);
        exit;
    }
    
    // Get approver info
    $stmt = $pdo->prepare('SELECT name, email FROM admins WHERE id = ? LIMIT 1');
    $stmt->execute([$_SESSION['admin_id']]);
    $approver = $stmt->fetch();
    $approverName = $approver['name'] ?: $approver['email'];
    
    if ($action === 'approve') {
        $stmt = $pdo->prepare('UPDATE blogs SET approval_status = ?, approved_by = ?, approved_at = NOW(), updated_at = NOW() WHERE id = ?');
        $stmt->execute([$approvalStatus, $_SESSION['admin_id'], $blogId]);
        
        // Notify author if blog has an author
        if ($blog['author_id']) {
            notify_author_blog_approved($blogId, $blog['title'], $blog['author_id'], $approverName);
        }
    } else {
        $stmt = $pdo->prepare('UPDATE blogs SET approval_status = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$approvalStatus, $blogId]);
        
        // Notify author if blog has an author
        if ($blog['author_id']) {
            notify_author_blog_rejected($blogId, $blog['title'], $blog['author_id'], $approverName);
        }
    }
    
    echo json_encode(['success' => true, 'approval_status' => $approvalStatus]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
