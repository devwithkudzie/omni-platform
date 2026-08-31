<?php
// cms/api/admin/social/workbooks-list.php
// List all uploaded workbooks with completion status

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

// Listing workbooks is part of managing engagement
require_capability('social.manage_engagement');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $socialDir = __DIR__ . '/../../../social';
    $workbooks = [];
    
    // Get all workbook files (timestamped versions)
    $files = glob($socialDir . '/social_engagement_*.{xlsx,xls,csv}', GLOB_BRACE);
    
    // Get all completed dates from database
    $pdo = get_pdo();
    $stmt = $pdo->query('
        SELECT DISTINCT platform, engagement_date
        FROM social_engagement
        ORDER BY platform, engagement_date
    ');
    $completedDates = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $key = $row['platform'] . ':' . $row['engagement_date'];
        $completedDates[$key] = true;
    }
    
    foreach ($files as $filePath) {
        $fileName = basename($filePath);
        $fileInfo = [
            'file' => $fileName,
            'original_name' => $fileName,
            'uploaded_at' => date('c', filemtime($filePath)),
            'file_size' => filesize($filePath),
            'sheets' => [],
            'completion_status' => [
                'total_dates' => 0,
                'completed_dates' => 0,
                'all_completed' => false,
                'by_platform' => [],
            ],
        ];
        
        // Try to read metadata if exists (from workbook.json or separate meta file)
        $metaFile = $socialDir . '/' . pathinfo($fileName, PATHINFO_FILENAME) . '.json';
        if (file_exists($metaFile)) {
            $meta = json_decode(file_get_contents($metaFile), true);
            if ($meta) {
                $fileInfo['original_name'] = $meta['original_name'] ?? $fileName;
                $fileInfo['sheets'] = $meta['sheets'] ?? [];
                
                // Calculate completion status
                $totalDates = count($fileInfo['sheets']);
                $fileInfo['completion_status']['total_dates'] = $totalDates;
                
                // Check completion for each platform
                $platforms = ['facebook', 'x', 'instagram', 'linkedin'];
                $allCompleted = true;
                
                foreach ($platforms as $platform) {
                    $platformCompleted = 0;
                    foreach ($fileInfo['sheets'] as $sheetName) {
                        // Try to match sheet name to date
                        $matched = false;
                        foreach ($completedDates as $key => $val) {
                            list($p, $date) = explode(':', $key, 2);
                            if ($p === $platform) {
                                // Try to match sheet name to date
                                if (matchesDate($sheetName, $date)) {
                                    $matched = true;
                                    break;
                                }
                            }
                        }
                        if ($matched) {
                            $platformCompleted++;
                        }
                    }
                    
                    $fileInfo['completion_status']['by_platform'][$platform] = [
                        'completed' => $platformCompleted,
                        'total' => $totalDates,
                        'all_completed' => $platformCompleted === $totalDates && $totalDates > 0,
                    ];
                    
                    if ($platformCompleted < $totalDates) {
                        $allCompleted = false;
                    }
                }
                
                $fileInfo['completion_status']['all_completed'] = $allCompleted;
                $fileInfo['completion_status']['completed_dates'] = array_sum(array_column($fileInfo['completion_status']['by_platform'], 'completed'));
            }
        }
        
        $workbooks[] = $fileInfo;
    }
    
    // Sort by upload date (newest first)
    usort($workbooks, function($a, $b) {
        return strtotime($b['uploaded_at']) - strtotime($a['uploaded_at']);
    });
    
    echo json_encode([
        'workbooks' => $workbooks,
        'count' => count($workbooks),
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log('Workbooks list error: ' . $e->getMessage());
    echo json_encode(['error' => 'Server error']);
}

// Helper function to match sheet name to date
function matchesDate($sheetName, $date) {
    // Exact match
    if ($sheetName === $date) return true;
    
    // Try parsing both as dates
    try {
        $sheetDate = new DateTime($sheetName);
        $targetDate = new DateTime($date);
        if ($sheetDate && $targetDate) {
            return $sheetDate->format('Y-m-d') === $targetDate->format('Y-m-d');
        }
    } catch (Exception $e) {
        // Not valid dates, continue with other matching
    }
    
    // Try normalizing
    try {
        $d1 = new DateTime($sheetName);
        $d2 = new DateTime($date);
        return $d1->format('Y-m-d') === $d2->format('Y-m-d');
    } catch (Exception $e) {
        return strtolower(trim($sheetName)) === strtolower(trim($date));
    }
}
