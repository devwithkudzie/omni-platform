<?php
// cms/airtime_audit.php
// Audit logging for airtime dashboard user actions

require_once __DIR__ . '/db.php';

/**
 * Log an airtime user action to the audit trail.
 * Call this from airtime-admin API endpoints after successful state-changing operations.
 *
 * @param string $action e.g. 'login', 'logout', 'direct_send', 'resolve', 'resend', 'create_user'
 * @param string|null $resource e.g. 'airtime_transaction', 'airtime_user'
 * @param int|null $resourceId Optional ID of the affected resource
 * @param array $details Optional extra context (will be JSON-encoded)
 */
function airtime_audit_log(string $action, ?string $resource = null, ?int $resourceId = null, array $details = []): void {
    if (empty($_SESSION['airtime_user_id'])) {
        return;
    }
    try {
        $pdo = get_pdo();
        $stmt = $pdo->prepare(
            'INSERT INTO airtime_audit_log (airtime_user_id, action, resource, resource_id, details, ip_address, user_agent) 
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $ua = isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 512) : null;
        $jsonDetails = empty($details) ? null : json_encode($details);
        $stmt->execute([
            $_SESSION['airtime_user_id'],
            $action,
            $resource,
            $resourceId,
            $jsonDetails,
            $ip,
            $ua,
        ]);
    } catch (Throwable $e) {
        error_log('airtime_audit_log failed: ' . $e->getMessage());
    }
}
