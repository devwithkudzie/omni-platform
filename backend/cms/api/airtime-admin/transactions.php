<?php
// cms/api/airtime-admin/transactions.php
// Airtime dashboard API - requires airtime user session (not CMS admin)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../bulk_airtime_helper.php';
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

header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, PATCH, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (empty($_SESSION['airtime_user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = get_pdo();

    if ($method === 'GET') {
        $status = isset($_GET['status']) ? trim($_GET['status']) : null;
        $network = isset($_GET['network']) ? trim($_GET['network']) : null;
        $paymentMethod = isset($_GET['payment_method']) ? trim($_GET['payment_method']) : null;
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $limit = min(100, max(5, (int) ($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $sql = 'SELECT id, network, amount, recipient_number, payment_method, payment_number,
                       status, paynow_reference, error_message, resolved_at, resolved_by, resolution_notes,
                       obad_sent_at, obad_error, created_at, updated_at
                FROM airtime_transactions';
        $params = [];
        $where = [];

        if ($status && in_array($status, ['pending', 'completed', 'failed', 'refunded', 'needs_review'], true)) {
            $where[] = 'status = ?';
            $params[] = $status;
        }

        if ($network !== null && $network !== '') {
            $where[] = 'network = ?';
            $params[] = $network;
        }

        if ($paymentMethod !== null && $paymentMethod !== '') {
            $where[] = 'payment_method = ?';
            $params[] = $paymentMethod;
        }

        if ($search !== '') {
            $term = '%' . $search . '%';
            $conds = ['recipient_number LIKE ?', 'payment_number LIKE ?', 'paynow_reference LIKE ?'];
            $searchParams = [$term, $term, $term];
            if (is_numeric($search)) {
                array_unshift($conds, 'id = ?');
                array_unshift($searchParams, (int) $search);
            }
            $where[] = '(' . implode(' OR ', $conds) . ')';
            $params = array_merge($params, $searchParams);
        }

        if (!empty($where)) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        $countSql = 'SELECT COUNT(*) FROM airtime_transactions' . (empty($where) ? '' : ' WHERE ' . implode(' AND ', $where));
        $countStmt = $params ? $pdo->prepare($countSql) : $pdo->query($countSql);
        if ($params) {
            $countStmt->execute($params);
        }
        $total = (int) $countStmt->fetchColumn();

        $sql .= ' ORDER BY created_at DESC LIMIT ' . (int) $limit . ' OFFSET ' . (int) $offset;

        try {
            $stmt = $params ? $pdo->prepare($sql) : $pdo->query($sql);
            if ($params) {
                $stmt->execute($params);
            }
            $transactions = $stmt->fetchAll();
        } catch (Throwable $e) {
            if (strpos($e->getMessage(), 'obad_sent_at') !== false || strpos($e->getMessage(), 'obad_error') !== false) {
                $sql = 'SELECT id, network, amount, recipient_number, payment_method, payment_number,
                               status, paynow_reference, error_message, resolved_at, resolved_by, resolution_notes,
                               created_at, updated_at
                        FROM airtime_transactions' . (empty($where) ? '' : ' WHERE ' . implode(' AND ', $where)) . ' ORDER BY created_at DESC LIMIT ' . (int) $limit . ' OFFSET ' . (int) $offset;
                $stmt = $params ? $pdo->prepare($sql) : $pdo->query($sql);
                if ($params) {
                    $stmt->execute($params);
                }
                $transactions = $stmt->fetchAll();
                foreach ($transactions as &$t) {
                    $t['obad_sent_at'] = null;
                    $t['obad_error'] = null;
                }
            } else {
                throw $e;
            }
        }

        $countStmt = $pdo->query(
            'SELECT status, COUNT(*) as cnt FROM airtime_transactions GROUP BY status'
        );
        $counts = [];
        while ($row = $countStmt->fetch()) {
            $counts[$row['status']] = (int) $row['cnt'];
        }

        echo json_encode([
            'transactions' => $transactions,
            'counts' => $counts,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => max(1, (int) ceil($total / $limit)),
        ]);
        exit;
    }

    if ($method === 'PATCH') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $id = (int) ($input['id'] ?? $_GET['id'] ?? 0);
        $action = trim($input['action'] ?? '');

        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Transaction ID required']);
            exit;
        }

        $stmt = $pdo->prepare('SELECT id, status FROM airtime_transactions WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $tx = $stmt->fetch();

        if (!$tx) {
            http_response_code(404);
            echo json_encode(['error' => 'Transaction not found']);
            exit;
        }

        if ($action === 'resolve') {
            $resolutionNotes = trim($input['resolution_notes'] ?? '');
            $newStatus = trim($input['status'] ?? 'completed');
            if (!in_array($newStatus, ['completed', 'refunded', 'failed'], true)) {
                $newStatus = 'completed';
            }

            $update = $pdo->prepare(
                'UPDATE airtime_transactions 
                 SET status = ?, resolved_at = NOW(), resolved_by = NULL, resolution_notes = ?
                 WHERE id = ?'
            );
            $update->execute([
                $newStatus,
                $resolutionNotes ?: null,
                $id,
            ]);
            airtime_audit_log('resolve', 'airtime_transaction', $id, ['status' => $newStatus, 'notes' => $resolutionNotes ?: null]);

            echo json_encode(['success' => true, 'status' => $newStatus]);
            exit;
        }

        if ($action === 'mark_needs_review') {
            $update = $pdo->prepare('UPDATE airtime_transactions SET status = ? WHERE id = ?');
            $update->execute(['needs_review', $id]);
            airtime_audit_log('mark_needs_review', 'airtime_transaction', $id, []);

            echo json_encode(['success' => true, 'status' => 'needs_review']);
            exit;
        }

        if ($action === 'resend') {
            // Resend airtime for paid transaction where OBAD send failed
            $stmt = $pdo->prepare('SELECT id, recipient_number, amount FROM airtime_transactions WHERE id = ? AND status = ? LIMIT 1');
            $stmt->execute([$id, 'completed']);
            $tx = $stmt->fetch();
            if (!$tx) {
                http_response_code(404);
                echo json_encode(['error' => 'Transaction not found or not completed']);
                exit;
            }
            $receiver = normalize_receiver_phone($tx['recipient_number'] ?? '');
            if (!preg_match('/^2637\d{8}$/', $receiver)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid receiver number']);
                exit;
            }
            $result = send_obad_airtime($receiver, (float) $tx['amount'], 'USD');
            if ($result['success']) {
                try {
                    $pdo->prepare('UPDATE airtime_transactions SET obad_sent_at = NOW(), obad_error = NULL WHERE id = ?')->execute([$id]);
                } catch (Throwable $e) {
                    error_log('resend obad update: ' . $e->getMessage());
                }
                airtime_audit_log('resend', 'airtime_transaction', $id, []);
                echo json_encode(['success' => true, 'status' => 'RESOLVED: AIRTIME SENT', 'data' => $result['data']]);
            } else {
                try {
                    $errStmt = $pdo->prepare('UPDATE airtime_transactions SET obad_error = ? WHERE id = ?');
                    $errStmt->execute([$result['error'] ?? 'Resend failed', $id]);
                } catch (Throwable $e) {
                    error_log('resend obad error update: ' . $e->getMessage());
                }
                http_response_code(500);
                echo json_encode(['error' => $result['error'] ?? 'Resend failed']);
            }
            exit;
        }

        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Throwable $e) {
    error_log('airtime-admin transactions error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
