<?php
// cms/api/admin/social/workbook-set-current.php
// Set a specific social engagement workbook as the active/current one

require_once __DIR__ . '/../../../db.php';
require_once __DIR__ . '/../../../audit.php';

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
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Setting the active workbook is a privileged operation
require_capability('social.manage_workbooks');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $pdo = get_pdo();
    $rawBody = file_get_contents('php://input');
    $data = json_decode($rawBody, true);
    $requestedFile = $data['file'] ?? null;

    if (!$requestedFile) {
        http_response_code(400);
        echo json_encode(['error' => 'Workbook file is required']);
        exit;
    }

    $socialDir = __DIR__ . '/../../../social';
    $fileName = basename($requestedFile);
    $filePath = $socialDir . '/' . $fileName;

    if (!file_exists($filePath)) {
        http_response_code(404);
        echo json_encode(['error' => 'Workbook file not found']);
        exit;
    }

    $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $allowedExtensions = ['xlsx', 'xls', 'csv'];
    if (!in_array($ext, $allowedExtensions, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type']);
        exit;
    }

    // Try to load individual meta file for this workbook
    $meta = null;
    $individualMetaFile = $socialDir . '/' . pathinfo($fileName, PATHINFO_FILENAME) . '.json';
    if (file_exists($individualMetaFile)) {
        $meta = json_decode(file_get_contents($individualMetaFile), true) ?: null;
    }

    $uploadedAt = date('c', filemtime($filePath));
    $originalName = $fileName;
    $sheets = [];

    if ($meta) {
        $originalName = $meta['original_name'] ?? $originalName;
        $uploadedAt = $meta['uploaded_at'] ?? $uploadedAt;
        $sheets = $meta['sheets'] ?? [];
    }

    // Ensure we have at least basic meta
    $meta = [
        'file' => $fileName,
        'original_name' => $originalName,
        'uploaded_at' => $uploadedAt,
        'upload_timestamp' => date('Ymd_His', filemtime($filePath)),
        'sheets' => $sheets,
    ];

    // Maintain a "current" copy for easy download
    $currentName = 'current_workbook.' . $ext;
    $currentPath = $socialDir . '/' . $currentName;
    if (!@copy($filePath, $currentPath)) {
        // Log warning but do not fail the operation
        error_log('Warning: Could not update current_workbook copy when setting active workbook');
    }

    $meta['current_file'] = $currentName;

    // Save as global workbook.json
    $metaPath = $socialDir . '/workbook.json';
    file_put_contents($metaPath, json_encode($meta, JSON_PRETTY_PRINT));

    // Also refresh individual meta file so it stays in sync
    file_put_contents($individualMetaFile, json_encode($meta, JSON_PRETTY_PRINT));
    audit_log('set_active_workbook', 'social_workbook', null, ['file' => $fileName]);

    echo json_encode([
        'success' => true,
        'message' => 'Active workbook updated successfully',
        'file' => $fileName,
        'meta' => $meta,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log('Workbook set-current error: ' . $e->getMessage());
    echo json_encode(['error' => 'Server error']);
}

