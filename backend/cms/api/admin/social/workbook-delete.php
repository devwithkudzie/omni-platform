<?php
// cms/api/admin/social/workbook-delete.php
// Delete a specific social engagement workbook (super admin only)

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

// Deleting workbooks is a highly privileged operation
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

    $metaPath = $socialDir . '/workbook.json';
    $currentMeta = null;
    $wasActive = false;

    if (file_exists($metaPath)) {
        $currentMeta = json_decode(file_get_contents($metaPath), true) ?: null;
        if ($currentMeta && isset($currentMeta['file']) && $currentMeta['file'] === $fileName) {
            $wasActive = true;
        }
    }

    // Delete the timestamped workbook and its individual meta file
    @unlink($filePath);
    $individualMetaFile = $socialDir . '/' . pathinfo($fileName, PATHINFO_FILENAME) . '.json';
    if (file_exists($individualMetaFile)) {
        @unlink($individualMetaFile);
    }

    $newActiveMeta = null;

    if ($wasActive) {
        // Find the newest remaining workbook (if any) to promote as active
        $files = glob($socialDir . '/social_engagement_*.{xlsx,xls,csv}', GLOB_BRACE);

        if ($files && count($files) > 0) {
            usort($files, function ($a, $b) {
                return filemtime($b) <=> filemtime($a);
            });

            $newFilePath = $files[0];
            $newFileName = basename($newFilePath);
            $newExt = strtolower(pathinfo($newFileName, PATHINFO_EXTENSION));
            $uploadedAt = date('c', filemtime($newFilePath));
            $originalName = $newFileName;
            $sheets = [];

            // Try to load new file's individual meta
            $newIndividualMetaFile = $socialDir . '/' . pathinfo($newFileName, PATHINFO_FILENAME) . '.json';
            if (file_exists($newIndividualMetaFile)) {
                $m = json_decode(file_get_contents($newIndividualMetaFile), true) ?: null;
                if ($m) {
                    $originalName = $m['original_name'] ?? $originalName;
                    $uploadedAt = $m['uploaded_at'] ?? $uploadedAt;
                    $sheets = $m['sheets'] ?? [];
                }
            }

            $currentName = 'current_workbook.' . $newExt;
            $currentPath = $socialDir . '/' . $currentName;
            if (!@copy($newFilePath, $currentPath)) {
                error_log('Warning: Could not update current_workbook copy when promoting new active workbook');
            }

            $newActiveMeta = [
                'file' => $newFileName,
                'current_file' => $currentName,
                'original_name' => $originalName,
                'uploaded_at' => $uploadedAt,
                'upload_timestamp' => date('Ymd_His', filemtime($newFilePath)),
                'sheets' => $sheets,
            ];

            file_put_contents($metaPath, json_encode($newActiveMeta, JSON_PRETTY_PRINT));
            file_put_contents($newIndividualMetaFile, json_encode($newActiveMeta, JSON_PRETTY_PRINT));
        } else {
            // No workbooks left – remove global meta and best-effort remove current copy
            if (file_exists($metaPath)) {
                @unlink($metaPath);
            }
            // Try to remove any current_workbook.* files
            foreach (glob($socialDir . '/current_workbook.*') as $currentFile) {
                @unlink($currentFile);
            }
        }
    }

    audit_log('delete_workbook', 'social_workbook', null, ['file' => $fileName, 'was_active' => $wasActive]);
    echo json_encode([
        'success' => true,
        'message' => 'Workbook deleted successfully',
        'deleted_file' => $fileName,
        'was_active' => $wasActive,
        'new_active' => $newActiveMeta,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log('Workbook delete error: ' . $e->getMessage());
    echo json_encode(['error' => 'Server error']);
}

