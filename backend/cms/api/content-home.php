<?php
// cms/api/content-home.php
// Public JSON endpoint to read Home page content (no auth)

require_once __DIR__ . '/../db.php';

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
if (in_array($origin, $allowedOrigins, true)) {
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

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $contentDir = __DIR__ . '/../content';
    $contentFile = $contentDir . '/home.json';

    if (!file_exists($contentFile)) {
        echo json_encode([
            'hero_title' => 'OmniContact',
            'hero_subtitle' => 'Human-first BPO + AI for Africa and beyond.',
            'hero_primary_label' => 'Talk to our team',
            'hero_primary_url' => '/contact',
            'hero_secondary_label' => 'Explore services',
            'hero_secondary_url' => '/bpo-services',
            'highlights' => [
                [
                    'title' => 'BPO Services',
                    'description' => '24/7 customer support, sales and back-office.',
                ],
                [
                    'title' => 'AI & Digital',
                    'description' => 'Chatbots, automation and analytics that scale.',
                ],
                [
                    'title' => 'Impact Sourcing',
                    'description' => 'Creating jobs and opportunities in local communities.',
                ],
            ],
        ]);
        exit;
    }

    $raw = file_get_contents($contentFile);
    if ($raw === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to read content file']);
        exit;
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        http_response_code(500);
        echo json_encode(['error' => 'Invalid content format']);
        exit;
    }

    echo json_encode($data);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}

