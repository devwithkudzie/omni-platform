<?php
// cms/api/admin/content-home.php
// JSON endpoint to manage Home page content (hero + key sections)

require_once __DIR__ . '/../../db.php';

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
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (!is_admin_logged_in()) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

function json_input_home(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $contentDir = __DIR__ . '/../../content';
    $contentFile = $contentDir . '/home.json';

    if ($method === 'GET') {
        if (!file_exists($contentFile)) {
            // Reasonable defaults; admin will override in UI
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
        exit;
    }

    if ($method === 'POST' || $method === 'PUT') {
        $body = json_input_home();
        if (empty($body)) {
            http_response_code(400);
            echo json_encode(['error' => 'Request body must be valid JSON']);
            exit;
        }

        if (!is_dir($contentDir)) {
            if (!mkdir($contentDir, 0775, true) && !is_dir($contentDir)) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create content directory']);
                exit;
            }
        }

        $json = json_encode($body, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        if ($json === false) {
            http_response_code(400);
            echo json_encode(['error' => 'Content could not be encoded as JSON']);
            exit;
        }

        if (file_put_contents($contentFile, $json) === false) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save content']);
            exit;
        }

        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}

