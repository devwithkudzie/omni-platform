<?php
// cms/api/admin/account.php
// Account settings API (update own profile, change password)

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
header('Access-Control-Allow-Methods: GET, PUT, PATCH, OPTIONS');

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
        // Get current user's account info
        $stmt = $pdo->prepare('SELECT id, email, name, role, created_at FROM admins WHERE id = ? LIMIT 1');
        $stmt->execute([$adminId]);
        $admin = $stmt->fetch();
        
        if (!$admin) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }
        
        echo json_encode($admin);
        exit;
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        // Update own account
        $body = json_input();
        $fields = [];
        $values = [];
        
        if (array_key_exists('name', $body)) {
            $fields[] = 'name = ?';
            $values[] = trim($body['name']) ?: null;
        }
        
        if (array_key_exists('email', $body)) {
            $newEmail = trim($body['email']);
            if (!empty($newEmail)) {
                // Check if email is already taken by another user
                $stmt = $pdo->prepare('SELECT id FROM admins WHERE email = ? AND id != ? LIMIT 1');
                $stmt->execute([$newEmail, $adminId]);
                if ($stmt->fetch()) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Email already in use']);
                    exit;
                }
                $fields[] = 'email = ?';
                $values[] = $newEmail;
            }
        }
        
        if (array_key_exists('current_password', $body) && array_key_exists('new_password', $body)) {
            // Verify current password
            $stmt = $pdo->prepare('SELECT password_hash FROM admins WHERE id = ? LIMIT 1');
            $stmt->execute([$adminId]);
            $admin = $stmt->fetch();
            
            if (!$admin || !password_verify($body['current_password'], $admin['password_hash'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Current password is incorrect']);
                exit;
            }
            
            // Update password
            if (strlen($body['new_password']) < 6) {
                http_response_code(400);
                echo json_encode(['error' => 'New password must be at least 6 characters']);
                exit;
            }
            
            $fields[] = 'password_hash = ?';
            $values[] = password_hash($body['new_password'], PASSWORD_DEFAULT);
        }
        
        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }
        
        $values[] = $adminId;
        $sql = 'UPDATE admins SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
