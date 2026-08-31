<?php
// cms/api/airtime-admin/logout.php

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../airtime_audit.php';

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

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (!empty($_SESSION['airtime_user_id'])) {
    airtime_audit_log('logout', 'session', (int) $_SESSION['airtime_user_id'], []);
}
unset($_SESSION['airtime_user_id']);
echo json_encode(['success' => true]);
