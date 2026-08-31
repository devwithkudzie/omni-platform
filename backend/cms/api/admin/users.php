<?php
// cms/api/admin/users.php
// User management API (create, list, update, delete users)

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../audit.php';

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
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (!is_admin_logged_in()) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

// Get current user to check permissions
try {
    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT role FROM admins WHERE id = ? LIMIT 1');
    $stmt->execute([$_SESSION['admin_id']]);
    $currentUser = $stmt->fetch();
    
    if (!$currentUser) {
        http_response_code(401);
        echo json_encode(['error' => 'User not found']);
        exit;
    }
    
    $isSuperAdmin = $currentUser['role'] === 'super_admin';
    $isManager = in_array($currentUser['role'], ['super_admin', 'manager']);
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
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        // List all users (only super_admin and manager can see all)
        if (!$isManager) {
            http_response_code(403);
            echo json_encode(['error' => 'Insufficient permissions']);
            exit;
        }
        
        // Super admins see all users, managers only see managers and authors
        if ($isSuperAdmin) {
            $stmt = $pdo->query('SELECT id, email, name, role, responsibilities, created_at, created_by FROM admins ORDER BY created_at DESC');
        } else {
            $stmt = $pdo->prepare('SELECT id, email, name, role, responsibilities, created_at, created_by FROM admins WHERE role IN ("manager", "author") ORDER BY created_at DESC');
            $stmt->execute();
        }
        
        $users = $stmt->fetchAll();
        
        // Decode responsibilities JSON for each user
        foreach ($users as &$u) {
            if (isset($u['responsibilities']) && is_string($u['responsibilities'])) {
                $dec = json_decode($u['responsibilities'], true);
                $u['responsibilities'] = is_array($dec) ? $dec : [];
            } else {
                $u['responsibilities'] = $u['responsibilities'] ?? [];
            }
        }
        
        // Remove sensitive data
        foreach ($users as &$user) {
            unset($user['password_hash']);
        }
        
        echo json_encode($users);
        exit;
    }

    if ($method === 'POST') {
        // Create new user (super_admin and manager can create)
        if (!$isManager) {
            http_response_code(403);
            echo json_encode(['error' => 'Only managers and super admins can create users']);
            exit;
        }
        
        $body = json_input();
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';
        $name = trim($body['name'] ?? '');
        $requestedRole = $body['role'] ?? 'author';
        
        // Managers can only create authors, super_admin can create any role
        if ($isSuperAdmin) {
            $role = in_array($requestedRole, ['super_admin', 'manager', 'author'], true) 
                ? $requestedRole 
                : 'author';
        } else {
            // Managers can only create authors
            $role = 'author';
        }
        
        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            exit;
        }
        
        // Check if email already exists
        $stmt = $pdo->prepare('SELECT id FROM admins WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Email already exists']);
            exit;
        }
        
        $responsibilities = $body['responsibilities'] ?? [];
        $responsibilitiesJson = is_array($responsibilities) ? json_encode(array_values($responsibilities)) : null;
        
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('INSERT INTO admins (email, password_hash, name, role, responsibilities, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())');
        $stmt->execute([$email, $passwordHash, $name ?: null, $role, $responsibilitiesJson, $_SESSION['admin_id']]);
        
        $id = (int)$pdo->lastInsertId();
        audit_log('create_user', 'user', $id, ['email' => $email, 'role' => $role]);
        http_response_code(201);
        echo json_encode(['id' => $id, 'email' => $email, 'name' => $name, 'role' => $role, 'responsibilities' => $responsibilities]);
        exit;
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        // Update user (super_admin can update anyone, manager can update authors)
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            exit;
        }
        
        // Get target user
        $stmt = $pdo->prepare('SELECT role FROM admins WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $targetUser = $stmt->fetch();
        
        if (!$targetUser) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }
        
        // Permission check
        if (!$isSuperAdmin && ($targetUser['role'] !== 'author' || !$isManager)) {
            http_response_code(403);
            echo json_encode(['error' => 'Insufficient permissions']);
            exit;
        }
        
        $body = json_input();
        $fields = [];
        $values = [];
        
        if (array_key_exists('name', $body)) {
            $fields[] = 'name = ?';
            $values[] = trim($body['name']) ?: null;
        }
        if (array_key_exists('role', $body)) {
            // Only super_admin can change roles, managers can't
            if ($isSuperAdmin) {
                $role = in_array($body['role'], ['super_admin', 'manager', 'author'], true) ? $body['role'] : 'author';
                $fields[] = 'role = ?';
                $values[] = $role;
            }
        }
        if (array_key_exists('responsibilities', $body)) {
            $resp = $body['responsibilities'];
            $fields[] = 'responsibilities = ?';
            $values[] = is_array($resp) ? json_encode(array_values($resp)) : null;
        }
        if (array_key_exists('password', $body) && !empty($body['password'])) {
            $fields[] = 'password_hash = ?';
            $values[] = password_hash($body['password'], PASSWORD_DEFAULT);
        }
        
        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }
        
        $values[] = $id;
        $sql = 'UPDATE admins SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        
        audit_log('update_user', 'user', $id, []);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE') {
        // Delete user (only super_admin)
        if (!$isSuperAdmin) {
            http_response_code(403);
            echo json_encode(['error' => 'Only super admin can delete users']);
            exit;
        }
        
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            exit;
        }
        
        // Prevent deleting yourself
        if ($id === (int)$_SESSION['admin_id']) {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot delete your own account']);
            exit;
        }
        
        audit_log('delete_user', 'user', $id, []);
        $stmt = $pdo->prepare('DELETE FROM admins WHERE id = ?');
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
