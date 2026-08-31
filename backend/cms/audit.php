<?php
// cms/audit.php
// Audit logging for admin actions - tracks who did what and when

require_once __DIR__ . '/db.php';

/**
 * Log an admin action to the audit trail.
 * Call this from API endpoints after successful state-changing operations.
 *
 * @param string $action e.g. 'record_engagement', 'create_person', 'update_blog', 'login'
 * @param string|null $resource e.g. 'social_engagement', 'social_people', 'blog', 'user'
 * @param int|null $resourceId Optional ID of the affected resource
 * @param array $details Optional extra context (will be JSON-encoded)
 */
function audit_log(string $action, ?string $resource = null, ?int $resourceId = null, array $details = []): void {
    if (!is_admin_logged_in()) {
        return;
    }
    try {
        $pdo = get_pdo();
        $stmt = $pdo->prepare(
            'INSERT INTO admin_audit_log (admin_id, action, resource, resource_id, details, ip_address, user_agent) 
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $ua = isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 512) : null;
        $jsonDetails = empty($details) ? null : json_encode($details);
        $stmt->execute([
            $_SESSION['admin_id'],
            $action,
            $resource,
            $resourceId,
            $jsonDetails,
            $ip,
            $ua,
        ]);
    } catch (Throwable $e) {
        error_log('audit_log failed: ' . $e->getMessage());
    }
}
