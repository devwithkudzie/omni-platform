<?php
// cms/api/admin/social/workbook.php
// Upload the working social media engagement workbook (Excel or CSV)

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
if (in_array($origin, $allowedOrigins)) {
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

if (!is_admin_logged_in()) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    if (!isset($_FILES['workbook']) || $_FILES['workbook']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Workbook file is required']);
        exit;
    }

    $file = $_FILES['workbook'];
    $originalName = $file['name'] ?? 'workbook';
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

    $allowedExtensions = ['xlsx', 'xls', 'csv'];
    if (!in_array($ext, $allowedExtensions, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type. Please upload an Excel (.xlsx/.xls) or CSV file.']);
        exit;
    }

    $uploadDir = __DIR__ . '/../../../social';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0775, true);
    }

    // Store with a timestamp so you can keep history if desired
    // Also keep the latest version as 'current_workbook.xlsx' for easy access
    $timestamp = date('Ymd_His');
    $safeName = 'social_engagement_' . $timestamp . '.' . $ext;
    $targetPath = $uploadDir . '/' . $safeName;
    
    // Also create a "current" version for easy tracking
    $currentName = 'current_workbook.' . $ext;
    $currentPath = $uploadDir . '/' . $currentName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save uploaded workbook']);
        exit;
    }
    
    // Copy to current_workbook for easy reference
    if (!copy($targetPath, $currentPath)) {
        // Log warning but don't fail - timestamped version is saved
        error_log('Warning: Could not create current_workbook copy');
    }

    // Try to read sheet names using PhpSpreadsheet if available
    $sheets = [];
    if (file_exists(__DIR__ . '/../../../vendor/autoload.php')) {
        require_once __DIR__ . '/../../../vendor/autoload.php';
        try {
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($targetPath);
            $sheets = $spreadsheet->getSheetNames();
        } catch (Exception $e) {
            error_log('Could not read sheets from workbook: ' . $e->getMessage());
        }
    }
    
    // Save/update simple meta file so frontend can show current workbook and load sheet names
    $meta = [
        'file' => $safeName,
        'current_file' => $currentName, // Easy reference to latest
        'original_name' => $originalName,
        'uploaded_at' => date('c'),
        'upload_timestamp' => $timestamp,
        'sheets' => $sheets, // Store sheet names for completion tracking
    ];
    file_put_contents($uploadDir . '/workbook.json', json_encode($meta, JSON_PRETTY_PRINT));
    
    // Also save individual meta file for this workbook
    $individualMetaFile = $uploadDir . '/' . pathinfo($safeName, PATHINFO_FILENAME) . '.json';
    file_put_contents($individualMetaFile, json_encode($meta, JSON_PRETTY_PRINT));
    audit_log('upload_workbook', 'social_workbook', null, ['file' => $safeName, 'original_name' => $originalName]);

    echo json_encode([
        'success' => true,
        'file' => $safeName,
        'original_name' => $originalName,
        'message' => 'Workbook uploaded successfully. This will be the base file for engagement updates and downloads.',
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}

