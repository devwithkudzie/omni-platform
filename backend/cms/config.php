<?php
// cms/config.php
// Legacy CMS bootstrap. Credentials are centralized in backend/config/app.php.

// Load optional local overrides first; backend/config/app.php can read constants
// defined there before falling back to its own centralized values.
$localConfig = __DIR__ . '/config.local.php';
if (file_exists($localConfig)) {
    require_once $localConfig;
}

function cms_app_config(?string $key = null, mixed $default = null): mixed {
    static $config = null;
    if ($config === null) {
        $configPath = dirname(__DIR__) . '/config/app.php';
        $config = is_file($configPath) ? require $configPath : [];
    }

    if ($key === null) {
        return $config;
    }

    $value = $config;
    foreach (explode('.', $key) as $segment) {
        if (!is_array($value) || !array_key_exists($segment, $value)) {
            return $default;
        }
        $value = $value[$segment];
    }

    return $value;
}

function cms_config_string(string $key, string $default = ''): string {
    $value = cms_app_config($key, $default);
    return is_scalar($value) ? (string)$value : $default;
}

function cms_config_putenv(string $envKey, string $configKey): void {
    $existing = getenv($envKey);
    if ($existing !== false && $existing !== '') {
        return;
    }

    $value = cms_config_string($configKey);
    if ($value !== '') {
        putenv($envKey . '=' . $value);
        $_ENV[$envKey] = $value;
    }
}

foreach ([
    'DB_HOST' => 'db.host',
    'DB_NAME' => 'db.name',
    'DB_USER' => 'db.user',
    'DB_PASS' => 'db.pass',
    'TENANT_ID' => 'mail.tenant_id',
    'CLIENT_ID' => 'mail.client_id',
    'CLIENT_SECRET' => 'mail.client_secret',
    'SERVICE_ACCOUNT' => 'mail.service_account',
    'CONTACT_TO_ZW' => 'contact.to_zw',
    'CONTACT_TO_ZA' => 'contact.to_za',
    'CONTACT_CC' => 'contact.cc',
    'PAYNOW_ID' => 'paynow.id',
    'PAYNOW_KEY' => 'paynow.key',
    'PAYNOW_MERCHANT_EMAIL' => 'paynow.merchant_email',
    'BASE_URL' => 'base_url',
    'BULKAIRTIME_CLIENTID' => 'bulk_airtime.client_id',
    'BULKAIRTIME_CLIENTSECRET' => 'bulk_airtime.client_secret',
    'BULKAIRTIME_APIKEY' => 'bulk_airtime.api_key',
    'BULKAIRTIME_BASE_URL' => 'bulk_airtime.base_url',
    'AIRTIME_MAX_AMOUNT' => 'bulk_airtime.max_amount',
    'FB_APP_ID' => 'facebook.app_id',
    'FB_APP_SECRET' => 'facebook.app_secret',
    'FB_PAGE_ID' => 'facebook.page_id',
    'FB_PAGE_ACCESS_TOKEN' => 'facebook.page_access_token',
    'FB_GRAPH_VERSION' => 'facebook.graph_version',
    'SOCIAL_CRON_TOKEN' => 'facebook.social_cron_token',
] as $envKey => $configKey) {
    cms_config_putenv($envKey, $configKey);
}

if (session_status() === PHP_SESSION_NONE) {
    $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $isSecure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

// Database configuration.
define('DB_HOST', cms_config_string('db.host'));
define('DB_NAME', cms_config_string('db.name'));
define('DB_USER', cms_config_string('db.user'));
define('DB_PASS', cms_config_string('db.pass'));

// OpenAI API Configuration
// In production, set OPENAI_API_KEY as an environment variable.
// For local dev, configure it in backend/config/app.php or optional local overrides.
// We do NOT hard-code secrets here.

// Simple helper: check if admin is logged in
function is_admin_logged_in(): bool {
    return !empty($_SESSION['admin_id']);
}

// Simple helper: redirect to login if not admin
function require_admin() {
    if (!is_admin_logged_in()) {
        header('Location: /admin/login.php');
        exit;
    }
}

/**
 * RBAC helpers
 *
 * Roles live in admins.role and we derive capabilities from the role.
 * This lets us keep the role list small while expressing more granular permissions.
 */

function current_admin_role(): string {
    if (empty($_SESSION['admin_id'])) {
        return 'guest';
    }

    static $cachedRole = null;
    if ($cachedRole !== null) {
        return $cachedRole;
    }

    try {
        $pdo = get_pdo();
        $stmt = $pdo->prepare('SELECT role FROM admins WHERE id = ? LIMIT 1');
        $stmt->execute([$_SESSION['admin_id']]);
        $role = $stmt->fetchColumn() ?: 'author';
        $cachedRole = $role;
        return $role;
    } catch (Throwable $e) {
        // Fail safe: treat as lowest-privilege author
        return 'author';
    }
}

function admin_capabilities_for_role(string $role): array {
    // Full social capabilities (all users get full social access for now)
    $socialCaps = [
        'social.view_aggregates',
        'social.view_person_detail',
        'social.manage_people',
        'social.manage_engagement',
        'social.manage_workbooks',
    ];
    switch ($role) {
        case 'super_admin':
            return array_merge([
                'blog.manage_all',
                'blog.manage_own',
                'blog.approve',
                'admin.manage_users',
                'admin.view_users',
            ], $socialCaps);
        case 'manager':
            return array_merge([
                'blog.manage_all',
                'blog.approve',
                'admin.view_users',
            ], $socialCaps);
        case 'author':
        default:
            return array_merge([
                'blog.manage_own',
            ], $socialCaps);
    }
}

/**
 * Get responsibilities from DB for current admin (for future granular control).
 * Returns array of strings: manage_social, manage_cms_content, etc.
 */
function admin_responsibilities(): array {
    if (empty($_SESSION['admin_id'])) {
        return [];
    }
    static $cached = null;
    if ($cached !== null) {
        return $cached;
    }
    try {
        $pdo = get_pdo();
        $stmt = $pdo->prepare('SELECT responsibilities FROM admins WHERE id = ? LIMIT 1');
        $stmt->execute([$_SESSION['admin_id']]);
        $raw = $stmt->fetchColumn();
        if ($raw === null || $raw === '') {
            $cached = [];
            return [];
        }
        $decoded = json_decode($raw, true);
        $cached = is_array($decoded) ? $decoded : [];
        return $cached;
    } catch (Throwable $e) {
        $cached = [];
        return [];
    }
}

/** Capabilities granted by each responsibility */
function capabilities_from_responsibility(string $resp): array {
    switch ($resp) {
        case 'manage_social':
            return [
                'social.view_aggregates',
                'social.view_person_detail',
                'social.manage_people',
                'social.manage_engagement',
                'social.manage_workbooks',
            ];
        case 'manage_cms_content':
            return ['blog.manage_all', 'blog.manage_own'];
        case 'manage_theme':
        case 'manage_chatbot':
            return []; // Future
        default:
            return [];
    }
}

function admin_can(string $capability): bool {
    $role = current_admin_role();
    if ($role === 'guest') {
        return false;
    }
    $caps = admin_capabilities_for_role($role);
    foreach (admin_responsibilities() as $resp) {
        $caps = array_merge($caps, capabilities_from_responsibility($resp));
    }
    $caps = array_unique($caps);
    return in_array($capability, $caps, true);
}

function require_capability(string $capability): void {
    if (!is_admin_logged_in()) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        exit;
    }

    if (!admin_can($capability)) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
}

/**
 * Optional local configuration overrides (continued).
 * Optional local overrides are already loaded at the top.
 * It can also call putenv() for PayNow, OBAD, etc.
 */

// Azure AD App Registration credentials and service account mailbox.
define('TENANT_ID', cms_config_string('mail.tenant_id'));
define('CLIENT_ID', cms_config_string('mail.client_id'));
define('CLIENT_SECRET', cms_config_string('mail.client_secret'));
define('SERVICE_ACCOUNT', cms_config_string('mail.service_account'));
