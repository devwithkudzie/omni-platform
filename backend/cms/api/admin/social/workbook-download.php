<?php
// cms/api/admin/social/workbook-download.php
// Download a workbook file.
// - If ?file= is provided, download that specific workbook.
// - Otherwise, download the current/active workbook from workbook.json.

require_once __DIR__ . '/../../../db.php';

header('Access-Control-Allow-Credentials: true');

// CORS: Allow localhost for development, production domain for production
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://omnicontact.biz',
    'https://www.omnicontact.biz',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000');
}

if (!is_admin_logged_in()) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

try {
    $socialDir = __DIR__ . '/../../../social';
    $requestedFile = $_GET['file'] ?? null;
    $workbookPath = null;
    $downloadExt = null;
    $downloadOriginalName = null;

    if ($requestedFile) {
        // Download a specific workbook file by name
        $fileName = basename($requestedFile);
        $candidatePath = $socialDir . '/' . $fileName;
        if (!file_exists($candidatePath)) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(404);
            echo json_encode(['error' => 'Requested workbook not found']);
            exit;
        }

        $workbookPath = $candidatePath;
        $downloadExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        // Try to read individual meta file for nicer original_name
        $individualMetaFile = $socialDir . '/' . pathinfo($fileName, PATHINFO_FILENAME) . '.json';
        if (file_exists($individualMetaFile)) {
            $meta = json_decode(file_get_contents($individualMetaFile), true) ?: null;
            if ($meta && !empty($meta['original_name'])) {
                $downloadOriginalName = $meta['original_name'];
            }
        }

        if (!$downloadOriginalName) {
            $downloadOriginalName = $fileName;
        }
    } else {
        // Fallback: download the current/active workbook from workbook.json
        $metaFile = $socialDir . '/workbook.json';
        
        if (!file_exists($metaFile)) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(404);
            echo json_encode(['error' => 'No workbook uploaded yet']);
            exit;
        }
        
        $meta = json_decode(file_get_contents($metaFile), true);
        if (!$meta || !isset($meta['file'])) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(404);
            echo json_encode(['error' => 'Workbook metadata not found']);
            exit;
        }
        
        // Prefer current_workbook if available, otherwise use timestamped version
        if (isset($meta['current_file'])) {
            $currentPath = $socialDir . '/' . $meta['current_file'];
            if (file_exists($currentPath)) {
                $workbookPath = $currentPath;
            }
        }
        
        // Fallback to timestamped version
        if (!$workbookPath) {
            $workbookPath = $socialDir . '/' . $meta['file'];
        }

        $downloadExt = strtolower(pathinfo($meta['file'], PATHINFO_EXTENSION));
        $downloadOriginalName = $meta['original_name'] ?? ('workbook.' . $downloadExt);
    }

    if (!$workbookPath || !file_exists($workbookPath)) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(404);
        echo json_encode(['error' => 'Workbook file not found']);
        exit;
    }
    
    // Determine content type
    $ext = $downloadExt ?: strtolower(pathinfo($workbookPath, PATHINFO_EXTENSION));
    $contentTypes = [
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'xls' => 'application/vnd.ms-excel',
        'csv' => 'text/csv',
    ];
    $contentType = $contentTypes[$ext] ?? 'application/octet-stream';
    
    // Set headers for file download
    $originalName = $downloadOriginalName ?? ('workbook.' . $ext);
    $downloadName = 'social_engagement_' . date('Y-m-d') . '.' . $ext;
    
    header('Content-Type: ' . $contentType);
    header('Content-Disposition: attachment; filename="' . $downloadName . '"');
    header('Content-Length: ' . filesize($workbookPath));
    header('Cache-Control: no-cache, must-revalidate');
    header('Pragma: no-cache');
    
    // Output file
    readfile($workbookPath);
    exit;
} catch (Throwable $e) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    error_log('Workbook download error: ' . $e->getMessage());
    echo json_encode(['error' => 'Failed to download workbook']);
}
