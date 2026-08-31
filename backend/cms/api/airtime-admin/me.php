<?php
// cms/api/airtime-admin/me.php

require_once __DIR__ . '/../../db.php';

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
    } catch (Throwable $e) {
        if (strpos($e->getMessage(), 'role') !== false || strpos($e->getMessage(), 'Unknown column') !== false) {
            $stmt = $pdo->prepare('SELECT id, email, name FROM airtime_users WHERE id = ? LIMIT 1');
            $stmt->execute([$_SESSION['airtime_user_id']]);
        } else {
            throw $e;
        }
    }
    $user = $stmt->fetch();

    if (!$user) {
        unset($_SESSION['airtime_user_id']);
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        exit;
    }

    echo json_encode([
        'id' => (int) $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'] ?? 'admin',
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
