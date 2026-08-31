<?php
// cms/api/airtime-admin/send.php
// Send direct airtime (no PayNow) - mirrors airtime-platform POST /api/admin/airtime/send

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../bulk_airtime_helper.php';
require_once __DIR__ . '/../../airtime_audit.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');

$allowedOrigins = [
    'http://localhost', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173',
    'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://localhost:8000', 'https://omnicontact.biz',
    'https://www.omnicontact.biz',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (empty($_SESSION['airtime_user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$phone = trim($input['phone'] ?? '');
$amount = isset($input['amount']) ? (float) $input['amount'] : 0;
$currency = trim($input['currency'] ?? 'USD') ?: 'USD';

if (!$phone || $amount < 0.01) {
    http_response_code(400);
    echo json_encode(['error' => 'phone and amount are required']);
    exit;
}

$receiver = normalize_receiver_phone($phone);
if (!preg_match('/^2637\d{8}$/', $receiver)) {
    http_response_code(400);
    echo json_encode(['error' => 'Receiver must be a valid Econet number (2637XXXXXXXX)']);
    exit;
}

try {
    $balancesResult = get_obad_account_balances();
    if (!$balancesResult['success']) {
        http_response_code(500);
        echo json_encode(['error' => 'Cannot fetch account balances', 'details' => $balancesResult['error'] ?? '']);
        exit;
    }

    $account = null;
    foreach ($balancesResult['details'] ?? [] as $acc) {
        if (($acc['currency'] ?? '') === $currency) {
            $account = $acc;
            break;
        }
    }
    if (!$account) {
        http_response_code(400);
        echo json_encode(['error' => "No account with currency {$currency}"]);
        exit;
    }
    if ((float) ($account['balance'] ?? 0) < $amount) {
        http_response_code(400);
        echo json_encode(['error' => 'Insufficient balance', 'balance' => $account['balance'] ?? 0]);
        exit;
    }

    $result = send_obad_airtime($receiver, $amount, $currency);

    if ($result['success']) {
        $reference = 'DIRECT-' . time();
        $pdo = get_pdo();
        $stmt = $pdo->prepare(
            'INSERT INTO airtime_transactions 
             (network, amount, recipient_number, payment_method, status, paynow_reference) 
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute(['econet', $amount, $receiver, 'direct', 'completed', $reference]);
        $txId = (int) $pdo->lastInsertId();
        airtime_audit_log('direct_send', 'airtime_transaction', $txId, ['phone' => $receiver, 'amount' => $amount, 'currency' => $currency]);

        echo json_encode(['success' => true, 'status' => 'SUCCESS', 'data' => $result['data']]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'status' => 'FAILED', 'error' => $result['error'] ?? 'OBAD send failed']);
    }
} catch (Throwable $e) {
    error_log('airtime-admin send: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
