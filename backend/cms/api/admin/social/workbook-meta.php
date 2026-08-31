<?php
// cms/api/admin/social/workbook-meta.php
// Returns metadata about the current social engagement workbook (name + sheet list)

require_once __DIR__ . '/../../../db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');

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

    $dir = __DIR__ . '/../../../social';
    
    // Check if specific workbook file is requested
    $requestedFile = $_GET['file'] ?? null;
    
    if ($requestedFile) {
        // Load specific workbook
        $filePath = $dir . '/' . basename($requestedFile);
        if (!file_exists($filePath)) {
            echo json_encode(['exists' => false]);
            exit;
        }
        
        // Try to load individual meta file
        $metaFile = $dir . '/' . pathinfo($requestedFile, PATHINFO_FILENAME) . '.json';
        $fileName = basename($requestedFile);
        $originalName = $fileName;
        $uploadedAt = date('c', filemtime($filePath));
        $sheets = [];
        
        if (file_exists($metaFile)) {
            $meta = json_decode(file_get_contents($metaFile), true);
            if ($meta) {
                $originalName = $meta['original_name'] ?? $fileName;
                $uploadedAt = $meta['uploaded_at'] ?? $uploadedAt;
                $sheets = $meta['sheets'] ?? [];
            }
        }
    } else {
        // Load current workbook from workbook.json
        $metaPath = $dir . '/workbook.json';

        if (!file_exists($metaPath)) {
            echo json_encode(['exists' => false]);
            exit;
        }

        $metaRaw = file_get_contents($metaPath);
        $meta = json_decode($metaRaw, true) ?: [];

        $fileName = $meta['file'] ?? null;
        $originalName = $meta['original_name'] ?? $fileName;
        $uploadedAt = $meta['uploaded_at'] ?? null;

        if (!$fileName) {
            echo json_encode(['exists' => false]);
            exit;
        }

        $filePath = $dir . '/' . $fileName;
        if (!file_exists($filePath)) {
            echo json_encode(['exists' => false]);
            exit;
        }
        
        $sheets = $meta['sheets'] ?? [];
    }

    $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    // Use sheets from meta if available, otherwise read from file
    if (empty($sheets)) {
        if ($ext === 'csv') {
            // Treat CSV as a single sheet, using file name as the label
            $sheets = [pathinfo($originalName ?? $fileName, PATHINFO_FILENAME)];
        } elseif (in_array($ext, ['xlsx', 'xls'], true)) {
            // Try to read sheet names using PhpSpreadsheet if available
            try {
                if (file_exists(__DIR__ . '/../../../vendor/autoload.php')) {
                    require_once __DIR__ . '/../../../vendor/autoload.php';
                    $readerClass = $ext === 'xlsx'
                        ? \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx')
                        : \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xls');
                    $readerClass->setReadDataOnly(true);
                    $spreadsheet = $readerClass->load($filePath);
                    $sheets = $spreadsheet->getSheetNames();
                }
            } catch (Throwable $e) {
                // If we fail to load sheet names, just return basic meta without sheets
                $sheets = [];
            }
        }
    }

    echo json_encode([
        'exists' => true,
        'file' => $fileName,
        'original_name' => $originalName,
        'uploaded_at' => $uploadedAt,
        'sheets' => $sheets,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}

