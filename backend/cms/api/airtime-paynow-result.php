<?php
/**
 * PayNow result URL – PayNow posts transaction status here when payment completes.
 * See: https://developers.paynow.co.zw/docs/validating_hash.html
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../bulk_airtime_helper.php';

// PayNow sends POST with status, reference, etc.
// Log receipt for debugging (PayNow retries on HTTP error)
$status = trim($_POST['status'] ?? '');
$reference = trim($_POST['reference'] ?? '');
$paynowreference = trim($_POST['paynowreference'] ?? '');
$hash = $_POST['hash'] ?? '';
$normalizedStatus = strtoupper($status);

// Validate hash (recommended – see PayNow docs)
$integrationKey = trim(cms_config_string('paynow.key'));
if ($integrationKey) {
    $concat = '';
    foreach ($_POST as $k => $v) {
        if (strtoupper($k) !== 'HASH') {
            $concat .= $v;
        }
    }
    $concat .= $integrationKey;
    $expectedHash = strtoupper(hash('sha512', $concat));
    if ($hash !== $expectedHash) {
        error_log('airtime-paynow-result: hash mismatch for reference=' . $reference);
        http_response_code(400);
        exit;
    }
}

$paidStatuses = ['PAID', 'AWAITING DELIVERY', 'DELIVERED'];
$refundedStatuses = ['REFUNDED'];
$cancelledStatuses = ['CANCELLED', 'CANCELED'];

// Paid = funds received. Awaiting Delivery / Delivered also mean payment complete.
$isPaid = in_array($normalizedStatus, $paidStatuses, true);
$isRefunded = in_array($normalizedStatus, $refundedStatuses, true);
$isCancelled = in_array($normalizedStatus, $cancelledStatuses, true);
$isFinal = $isPaid || $isRefunded || $isCancelled;

// Find transaction by reference (our merchant reference)
error_log('airtime-paynow-result: ref=' . $reference . ' status=' . $status . ' isPaid=' . ($isPaid ? '1' : '0'));
if ($reference) {
    try {
        $pdo = get_pdo();
        $stmt = $pdo->prepare('SELECT id, status, recipient_number, amount FROM airtime_transactions WHERE paynow_reference = ? LIMIT 1');
        $stmt->execute([$reference]);
        $tx = $stmt->fetch();

        if ($tx && $tx['status'] === 'pending' && $isFinal) {
            if ($isPaid) {
                $newStatus = 'completed';
                $errorMessage = null;
            } elseif ($isRefunded) {
                $newStatus = 'refunded';
                $errorMessage = 'PayNow status: ' . $status;
            } else {
                $newStatus = 'failed';
                $errorMessage = 'PayNow status: ' . $status;
            }

            $update = $pdo->prepare('UPDATE airtime_transactions SET status = ?, error_message = ? WHERE id = ?');
            $update->execute([$newStatus, $errorMessage, $tx['id']]);

            // Send airtime via OBAD when paid (mirrors airtime-platform)
            if ($newStatus === 'completed') {
                $receiver = normalize_receiver_phone($tx['recipient_number'] ?? '');
                if ($receiver && preg_match('/^2637\d{8}$/', $receiver)) {
                    $airtimeResult = send_obad_airtime($receiver, (float) $tx['amount'], 'USD');
                    try {
                        if ($airtimeResult['success']) {
                            $pdo->prepare('UPDATE airtime_transactions SET obad_sent_at = NOW() WHERE id = ?')->execute([$tx['id']]);
                            error_log('airtime-paynow-result: OBAD sent tx=' . $tx['id'] . ' to ' . $receiver);
                        } else {
                            $errMsg = $airtimeResult['error'] ?? 'OBAD send failed';
                            $errStmt = $pdo->prepare('UPDATE airtime_transactions SET obad_error = ? WHERE id = ?');
                            $errStmt->execute([$errMsg, $tx['id']]);
                            error_log('airtime-paynow-result: OBAD failed tx=' . $tx['id'] . ': ' . $errMsg);
                        }
                    } catch (Throwable $e) {
                        error_log('airtime-paynow-result obad: ' . $e->getMessage());
                    }
                } else {
                    error_log('airtime-paynow-result: invalid receiver for tx=' . $tx['id'] . ' recipient=' . ($tx['recipient_number'] ?? ''));
                }
            }
        }
    } catch (Throwable $e) {
        error_log('airtime-paynow-result: ' . $e->getMessage());
    }
}

$baseUrl = rtrim(cms_config_string('base_url'), '/');
$redirect = $baseUrl ? $baseUrl . '/airtime?paynow=done' : '/airtime?paynow=done';
header('Location: ' . $redirect);
exit;
