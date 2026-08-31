<?php
// cms/api/admin/airtime.php
// Admin API for airtime logs and issue resolution

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../audit.php';

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
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000');
}

header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, PATCH, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Require admin with airtime capability (all logged-in admins for now)
if (!is_admin_logged_in()) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = get_pdo();

    if ($method === 'GET') {
        $status = isset($_GET['status']) ? trim($_GET['status']) : null;
        $limit = min(500, max(1, (int) ($_GET['limit'] ?? 100)));
        $offset = max(0, (int) ($_GET['offset'] ?? 0));

        $sql = 'SELECT id, network, amount, recipient_number, payment_method, payment_number,
                       status, paynow_reference, error_message, resolved_at, resolved_by, resolution_notes,
                       created_at, updated_at
                FROM airtime_transactions';
        $params = [];

        if ($status && in_array($status, ['pending', 'completed', 'failed', 'refunded', 'needs_review'], true)) {
            $sql .= ' WHERE status = ?';
            $params[] = $status;
        }

        $sql .= ' ORDER BY created_at DESC LIMIT ' . (int) $limit . ' OFFSET ' . (int) $offset;

        $stmt = $params ? $pdo->prepare($sql) : $pdo->query($sql);
        if ($params) {
            $stmt->execute($params);
        }
        $transactions = $stmt->fetchAll();

        // Count by status for dashboard
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
                 SET status = ?, resolved_at = NOW(), resolved_by = ?, resolution_notes = ?
                 WHERE id = ?'
            );
            $update->execute([
                $newStatus,
                $_SESSION['admin_id'],
                $resolutionNotes ?: null,
                $id,
            ]);

            audit_log('airtime_resolve', 'airtime_transaction', $id, [
                'old_status' => $tx['status'],
                'new_status' => $newStatus,
                'notes' => $resolutionNotes,
            ]);

            echo json_encode(['success' => true, 'status' => $newStatus]);
            exit;
        }

        if ($action === 'mark_needs_review') {
            $update = $pdo->prepare('UPDATE airtime_transactions SET status = ? WHERE id = ?');
            $update->execute(['needs_review', $id]);

            audit_log('airtime_mark_review', 'airtime_transaction', $id, []);

            echo json_encode(['success' => true, 'status' => 'needs_review']);
            exit;
        }

        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Throwable $e) {
    error_log('admin airtime error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
