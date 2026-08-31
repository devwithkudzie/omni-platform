<?php
// cms/api/airtime-admin/bootstrap.php
// Create first airtime user when no users exist (one-time setup)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');

$allowedOrigins = [
    'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173',
    'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'https://omnicontact.biz',
    'https://www.omnicontact.biz',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $pdo = get_pdo();
    $count = (int) $pdo->query('SELECT COUNT(*) FROM airtime_users')->fetchColumn();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'canBootstrap' => false]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $bootstrapToken = trim(getenv('BOOTSTRAP_SETUP_TOKEN') ?: '');
    echo json_encode([
        'canBootstrap' => $count === 0,
        'requiresToken' => $bootstrapToken !== '',
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/../../rate_limit_helper.php';
rate_limit_enforce('airtime_bootstrap', 5, 900);

if ($count > 0) {
    http_response_code(403);
    echo json_encode(['error' => 'Users already exist. Use the dashboard to add more.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$name = trim($input['name'] ?? 'Airtime Admin');
$setupToken = trim($input['setup_token'] ?? '');

$bootstrapToken = trim(getenv('BOOTSTRAP_SETUP_TOKEN') ?: '');
if ($bootstrapToken !== '' && !hash_equals($bootstrapToken, $setupToken)) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid setup token']);
    exit;
}

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 6 characters']);
    exit;
}

try {
    $hasRole = false;
    try {
        $pdo->query('SELECT role FROM airtime_users LIMIT 1');
        $hasRole = true;
    } catch (Throwable $e) {
        // role column doesn't exist yet
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    if ($hasRole) {
        $stmt = $pdo->prepare('INSERT INTO airtime_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)');
        $stmt->execute([$email, $passwordHash, $name ?: null, 'super_admin']);
    } else {
        $stmt = $pdo->prepare('INSERT INTO airtime_users (email, password_hash, name) VALUES (?, ?, ?)');
        $stmt->execute([$email, $passwordHash, $name ?: null]);
    }

    $id = (int) $pdo->lastInsertId();
    $_SESSION['airtime_user_id'] = $id;

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $id,
            'email' => $email,
            'name' => $name,
            'role' => 'super_admin',
        ],
    ]);
} catch (Throwable $e) {
    error_log('airtime bootstrap: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create user']);
}
