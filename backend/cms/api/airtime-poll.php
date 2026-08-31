<?php
/**
 * Poll airtime transaction status.
 * Frontend calls this with ?id=123 to read local status only.
 *
 * Paynow CheckPayment must not be called from browser-driven polling. Paynow
 * posts status changes to cms/api/airtime-paynow-result.php, which updates the
 * local transaction row. This endpoint only reflects that local state.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../rate_limit_helper.php';
rate_limit_enforce('airtime_poll', 60, 60);

$id = (int) ($_GET['id'] ?? 0);
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Transaction ID required']);
    exit;
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

try {
    $pdo = get_pdo();
    try {
        $stmt = $pdo->prepare('SELECT id, status, error_message, obad_error FROM airtime_transactions WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $tx = $stmt->fetch();
    } catch (Throwable $e) {
        $stmt = $pdo->prepare('SELECT id, status, error_message FROM airtime_transactions WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $tx = $stmt->fetch();
        if ($tx) {
            $tx['obad_error'] = null;
        }
    }

    if (!$tx) {
        http_response_code(404);
        echo json_encode(['error' => 'Transaction not found']);
        exit;
    }

    echo json_encode([
        'status' => $tx['status'],
        'id' => $id,
        'error' => $tx['error_message'] ?: ($tx['obad_error'] ?? null),
    ]);
} catch (Throwable $e) {
    error_log('airtime-poll: ' . $e->getMessage());
    echo json_encode(['status' => 'pending', 'id' => $id]);
}
