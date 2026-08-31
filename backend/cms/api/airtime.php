<?php
// cms/api/airtime.php
// Public API for airtime purchase (no auth required)

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Access-Control-Allow-Origin: *');
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

$missingFiles = [];
foreach (['rate_limit_helper.php', 'db.php', 'bulk_airtime_helper.php', 'paynow_helper.php'] as $f) {
    if (!file_exists(__DIR__ . '/../' . $f)) $missingFiles[] = $f;
}
if ($missingFiles) {
    error_log('airtime.php: missing required files: ' . implode(', ', $missingFiles));
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error. Please contact support.']);
    exit;
}

require_once __DIR__ . '/../rate_limit_helper.php';
rate_limit_enforce('airtime_purchase', 10, 60);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../bulk_airtime_helper.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$network = trim($input['network'] ?? '');
$amount = isset($input['amount']) ? (float) $input['amount'] : 0;
$recipientNumber = trim($input['recipient_number'] ?? '');
$paymentMethod = trim($input['payment_method'] ?? '');
$paymentNumber = trim($input['payment_number'] ?? '');

$maxAmount = (float) cms_config_string('bulk_airtime.max_amount', '500');
$maxAmount = $maxAmount > 0 ? $maxAmount : 500;

$errors = [];
if (!$network) $errors[] = 'Network is required';
if ($amount < 0.1) $errors[] = 'Amount must be at least $0.10';
if ($amount > $maxAmount) $errors[] = 'Amount cannot exceed $' . number_format($maxAmount, 0);
if (strlen($recipientNumber) < 9) $errors[] = 'Valid recipient number is required';
if (!$paymentMethod) $errors[] = 'Payment method is required';

$mobileMethods = ['ecocash', 'onemoney', 'innbucks', 'omari'];
if (in_array(strtolower($paymentMethod), $mobileMethods) && strlen($paymentNumber) < 9) {
    $errors[] = 'Payment number is required for ' . $paymentMethod;
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['error' => implode('. ', $errors)]);
    exit;
}

if (strtolower($network) !== 'econet') {
    http_response_code(400);
    echo json_encode(['error' => 'Only Econet is supported at this time']);
    exit;
}

// PayNow express checkout: ecocash, onemoney, innbucks, omari
$paynowMethod = strtolower(trim($paymentMethod));
if (!in_array($paynowMethod, ['ecocash', 'onemoney', 'innbucks', 'omari'])) {
    $paynowMethod = 'ecocash';
}

$merchantEmail = trim(cms_config_string('paynow.merchant_email'));
$currency = 'USD';
$skipBalanceCheck = (strtolower(trim(getenv('SKIP_BALANCE_CHECK') ?: '')) === 'true');

try {
    // 1. Check OBAD balance before initiating PayNow (mirrors airtime-platform)
    if (!$skipBalanceCheck) {
        $balancesResult = get_obad_account_balances();
        if ($balancesResult['success'] && !empty($balancesResult['details'])) {
            $account = null;
            foreach ($balancesResult['details'] as $acc) {
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
            $balance = (float) ($account['balance'] ?? 0);
            if ($balance < $amount) {
                http_response_code(400);
                echo json_encode(['error' => "Insufficient balance in {$currency} account", 'balance' => $balance]);
                exit;
            }
        }
    }

    $pdo = get_pdo();
    $reference = 'AIRTIME-' . strtoupper(bin2hex(random_bytes(8)));

    $stmt = $pdo->prepare(
        'INSERT INTO airtime_transactions 
         (network, amount, recipient_number, payment_method, payment_number, status, paynow_reference) 
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $network,
        $amount,
        $recipientNumber,
        $paymentMethod,
        $paymentNumber ?: null,
        'pending',
        $reference,
    ]);
    $id = (int) $pdo->lastInsertId();

    // PayNow integration
    require_once __DIR__ . '/../paynow_helper.php';
    $paynow = get_paynow_instance();

    if ($paynow) {
        $payment = $paynow->createPayment('Airtime ' . $network . ' - ' . $recipientNumber, $merchantEmail ?: 'customer@omnicontact.biz');
        $payment->add('Econet Airtime $' . number_format($amount, 2), $amount);

        $phone = preg_replace('/[^0-9]/', '', $paymentNumber ?: $recipientNumber);
        if (strlen($phone) === 9 && substr($phone, 0, 1) === '0') {
            $phone = '263' . substr($phone, 1);
        } elseif (strlen($phone) === 10 && substr($phone, 0, 2) === '07') {
            $phone = '263' . substr($phone, 1);
        } elseif (strlen($phone) === 12 && substr($phone, 0, 3) === '263') {
            // already correct
        } else {
            $phone = '263' . ltrim($phone, '0');
        }

        $response = $paynow->sendMobile($payment, $phone, $paynowMethod);

        if ($response->success()) {
            $pollUrl = $response->pollUrl();
            $instructions = $response->instructions();
            $data = $response->data();

            // InnBucks returns authorizationcode; EcoCash/OneMoney use instructions
            $authCode = $data['authorizationcode'] ?? '';
            $authExpires = $data['authorizationexpires'] ?? '';
            $displayInstructions = $instructions;
            if (!$displayInstructions && $authCode) {
                $displayInstructions = "Use code {$authCode} in the InnBucks app" . ($authExpires ? " (expires {$authExpires})" : '');
            }
            $displayInstructions = $displayInstructions ?: 'Please check your phone for the payment prompt.';

            $update = $pdo->prepare('UPDATE airtime_transactions SET paynow_reference = ?, paynow_poll_url = ? WHERE id = ?');
            $update->execute([$reference, $pollUrl, $id]);

            echo json_encode([
                'success' => true,
                'id' => $id,
                'reference' => $reference,
                'poll_url' => $pollUrl,
                'instructions' => $displayInstructions,
                'message' => $displayInstructions,
            ]);
        } else {
            $errorMsg = method_exists($response, 'errors') ? $response->errors() : 'PayNow initiation failed';
            $pdo->prepare('UPDATE airtime_transactions SET status = ?, error_message = ? WHERE id = ?')->execute(['failed', $errorMsg, $id]);
            http_response_code(400);
            echo json_encode(['error' => $errorMsg]);
        }
    } else {
        // No PayNow config – store only
        echo json_encode([
            'success' => true,
            'id' => $id,
            'message' => 'Airtime order received. Configure PayNow credentials for payment processing.',
        ]);
    }
} catch (Throwable $e) {
    $msg = $e->getMessage();
    $file = $e->getFile();
    $line = $e->getLine();
    error_log('airtime purchase error: ' . $msg . ' in ' . $file . ':' . $line);
    error_log('airtime stack: ' . $e->getTraceAsString());
    http_response_code(500);
    $debug = strtolower(trim(getenv('DEBUG_AIRTIME_ERROR') ?: '')) === 'true';
    $response = ['error' => 'Unable to process order. Please try again.'];
    if ($debug) {
        $response['debug'] = $msg;
        $response['hint'] = 'Set DEBUG_AIRTIME_ERROR=false in config.local.php after fixing.';
    }
    echo json_encode($response);
}
