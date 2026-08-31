<?php
// cms/api/airtime-admin/accounts.php
// Fetch Bulk Airtime Distribution (OBAD) merchant account balance

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../bulk_airtime_helper.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');

$allowedOrigins = [
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://localhost:8000',
    'https://omnicontact.biz',
    'https://www.omnicontact.biz',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
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

$result = get_obad_account_balances();
if (!$result['success']) {
    http_response_code($result['httpCode'] ?? 503);
    echo json_encode([
        'error' => $result['error'] ?? 'Failed to fetch balances',
        'success' => false,
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Airtime Account Details',
    'details' => $result['details'] ?? [],
]);
