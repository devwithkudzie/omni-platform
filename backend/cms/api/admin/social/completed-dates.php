<?php
// cms/api/admin/social/completed-dates.php
// Get list of completed platform+date combinations

require_once __DIR__ . '/../../../db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');

// CORS: Allow localhost for development, production domain for production
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
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
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (!is_admin_logged_in()) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $pdo = get_pdo();
    
    // Get all unique platform+date combinations that have engagement records
    $stmt = $pdo->query('
        SELECT DISTINCT platform, engagement_date
        FROM social_engagement
        ORDER BY platform, engagement_date DESC
    ');
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Group by platform and return as array of "platform:date" keys
    $completed = [];
    foreach ($rows as $row) {
        $key = $row['platform'] . ':' . $row['engagement_date'];
        $completed[] = $key;
    }
    
    // Also return grouped by platform for easier frontend use
    $byPlatform = [];
    foreach ($rows as $row) {
        $platform = $row['platform'];
        if (!isset($byPlatform[$platform])) {
            $byPlatform[$platform] = [];
        }
        $byPlatform[$platform][] = $row['engagement_date'];
    }
    
    echo json_encode([
        'completed' => $completed, // Array of "platform:date" strings
        'by_platform' => $byPlatform, // Object with platform as key, array of dates as value
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log('Completed dates API Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    $errorMessage = (defined('ENVIRONMENT') && ENVIRONMENT === 'development')
        ? $e->getMessage()
        : 'Server error';
    echo json_encode(['error' => $errorMessage]);
}
