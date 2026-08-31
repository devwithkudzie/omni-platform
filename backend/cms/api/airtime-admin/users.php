<?php
// cms/api/airtime-admin/users.php
// User management for airtime dashboard - only admins can access

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../airtime_audit.php';

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
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (empty($_SESSION['airtime_user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

try {
    $pdo = get_pdo();
    try {
        $stmt = $pdo->prepare('SELECT id, email, name, role FROM airtime_users WHERE id = ? LIMIT 1');
        $stmt->execute([$_SESSION['airtime_user_id']]);
        $currentUser = $stmt->fetch();
    } catch (Throwable $e) {
        if (strpos($e->getMessage(), 'role') !== false || strpos($e->getMessage(), 'Unknown column') !== false) {
            $stmt = $pdo->prepare('SELECT id, email, name FROM airtime_users WHERE id = ? LIMIT 1');
            $stmt->execute([$_SESSION['airtime_user_id']]);
            $currentUser = $stmt->fetch();
            if ($currentUser) $currentUser['role'] = 'admin';
        } else {
            throw $e;
        }
    }
    $isAdmin = in_array($currentUser['role'] ?? 'operator', ['admin', 'super_admin'], true);
    if (!$currentUser || !$isAdmin) {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        exit;
    }
    $isSuperAdmin = ($currentUser['role'] ?? '') === 'super_admin';
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    exit;
}

function json_input() {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        try {
            $stmt = $pdo->query('SELECT id, email, name, role, created_at FROM airtime_users ORDER BY created_at DESC');
        } catch (Throwable $e) {
            $stmt = $pdo->query('SELECT id, email, name, created_at FROM airtime_users ORDER BY created_at DESC');
        }
        $users = $stmt->fetchAll();
        foreach ($users as &$u) {
            if (!isset($u['role'])) $u['role'] = 'admin';
        }
        echo json_encode($users);
        exit;
    }

    if ($method === 'POST') {
        $body = json_input();
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';
        $name = trim($body['name'] ?? '');
        $requestedRole = $body['role'] ?? 'operator';
        if ($isSuperAdmin) {
            $role = in_array($requestedRole, ['super_admin', 'admin', 'operator'], true) ? $requestedRole : 'operator';
        } else {
            $role = $requestedRole === 'admin' ? 'admin' : 'operator';
        }

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            exit;
        }

        $stmt = $pdo->prepare('SELECT id FROM airtime_users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Email already exists']);
            exit;
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        try {
            $stmt = $pdo->prepare('INSERT INTO airtime_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)');
            $stmt->execute([$email, $passwordHash, $name ?: null, $role]);
        } catch (Throwable $e) {
            if (strpos($e->getMessage(), 'role') !== false || strpos($e->getMessage(), 'Unknown column') !== false) {
                $stmt = $pdo->prepare('INSERT INTO airtime_users (email, password_hash, name) VALUES (?, ?, ?)');
                $stmt->execute([$email, $passwordHash, $name ?: null]);
            } else {
                throw $e;
            }
        }
        $id = (int) $pdo->lastInsertId();

        airtime_audit_log('create_user', 'airtime_user', $id, ['email' => $email, 'role' => $role]);
        http_response_code(201);
        echo json_encode(['id' => $id, 'email' => $email, 'name' => $name, 'role' => $role]);
        exit;
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            exit;
        }

        try {
            $stmt = $pdo->prepare('SELECT id, role FROM airtime_users WHERE id = ? LIMIT 1');
            $stmt->execute([$id]);
            $targetUser = $stmt->fetch();
        } catch (Throwable $e) {
            if (strpos($e->getMessage(), 'role') !== false || strpos($e->getMessage(), 'Unknown column') !== false) {
                $stmt = $pdo->prepare('SELECT id FROM airtime_users WHERE id = ? LIMIT 1');
                $stmt->execute([$id]);
                $targetUser = $stmt->fetch();
                if ($targetUser) $targetUser['role'] = 'admin';
            } else {
                throw $e;
            }
        }
        if (!$targetUser) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }
        if (($targetUser['role'] ?? '') === 'super_admin' && !$isSuperAdmin) {
            http_response_code(403);
            echo json_encode(['error' => 'Only super admin can edit super admin']);
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
            $requestedRole = $body['role'] ?? 'operator';
            if ($isSuperAdmin) {
                $role = in_array($requestedRole, ['super_admin', 'admin', 'operator'], true) ? $requestedRole : 'operator';
            } else {
                $role = $requestedRole === 'admin' ? 'admin' : 'operator';
            }
            $fields[] = 'role = ?';
            $values[] = $role;
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
        $sql = 'UPDATE airtime_users SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);

        airtime_audit_log('update_user', 'airtime_user', $id, []);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            exit;
        }
        if ($id === (int) $_SESSION['airtime_user_id']) {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot delete your own account']);
            exit;
        }

        try {
            $stmt = $pdo->prepare('SELECT id, role FROM airtime_users WHERE id = ? LIMIT 1');
            $stmt->execute([$id]);
            $target = $stmt->fetch();
        } catch (Throwable $e) {
            if (strpos($e->getMessage(), 'role') !== false || strpos($e->getMessage(), 'Unknown column') !== false) {
                $stmt = $pdo->prepare('SELECT id FROM airtime_users WHERE id = ? LIMIT 1');
                $stmt->execute([$id]);
                $target = $stmt->fetch();
                if ($target) $target['role'] = 'admin';
            } else {
                throw $e;
            }
        }
        if (!$target) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }
        if (($target['role'] ?? '') === 'super_admin') {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot delete super admin']);
            exit;
        }

        airtime_audit_log('delete_user', 'airtime_user', $id, []);
        $stmt = $pdo->prepare('DELETE FROM airtime_users WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Throwable $e) {
    error_log('airtime-admin users: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
