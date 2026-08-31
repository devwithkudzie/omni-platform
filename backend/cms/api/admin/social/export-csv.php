<?php
// cms/api/admin/social/export-csv.php
// Export social data as Excel (.xlsx) or CSV (engagement, people, or dashboard summary)

require_once __DIR__ . '/../../../db.php';

header('Access-Control-Allow-Credentials: true');
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
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

$type = isset($_GET['type']) ? strtolower(trim($_GET['type'])) : 'engagement';
$format = isset($_GET['format']) ? strtolower(trim($_GET['format'])) : 'xlsx';
$category = isset($_GET['category']) ? trim($_GET['category']) : null;
$dateFrom = isset($_GET['date_from']) ? trim($_GET['date_from']) : null;
$dateTo = isset($_GET['date_to']) ? trim($_GET['date_to']) : null;

require_capability('social.view_aggregates');

$validTypes = ['engagement', 'people', 'dashboard', 'workbook'];
if (!in_array($type, $validTypes, true)) {
    $type = 'engagement';
}

$validFormats = ['xlsx', 'csv'];
if (!in_array($format, $validFormats, true)) {
    $format = 'xlsx';
}

$useExcel = $format === 'xlsx';
$autoload = __DIR__ . '/../../../vendor/autoload.php';
if ($useExcel && !file_exists($autoload)) {
    $useExcel = false;
}

$validCategories = ['employee', 'client', 'prospect', 'partner', 'other'];
if ($category && !in_array($category, $validCategories, true)) {
    $category = null;
}

// Workbook export: default to last 30 days if no date range
if ($type === 'workbook' && !$dateFrom && !$dateTo) {
    $dateTo = date('Y-m-d');
    $dateFrom = date('Y-m-d', strtotime('-30 days'));
}

function output_csv(array $headers, array $rows, string $filename): void {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    $out = fopen('php://output', 'w');
    fputcsv($out, $headers);
    foreach ($rows as $row) {
        fputcsv($out, $row);
    }
    fclose($out);
}

function output_excel(array $headers, array $rows, string $filename): void {
    $autoload = __DIR__ . '/../../../vendor/autoload.php';
    if (!file_exists($autoload)) {
        throw new RuntimeException('PhpSpreadsheet not installed. Run: composer require phpoffice/phpspreadsheet');
    }
    require_once $autoload;
    $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $col = 1;
    foreach ($headers as $h) {
        $sheet->setCellValueByColumnAndRow($col++, 1, (string) $h);
    }
    $numCols = count($headers);
    if ($numCols <= 26) {
        $lastCol = chr(64 + $numCols);
    } else {
        $lastCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($numCols);
    }
    $sheet->getStyle('A1:' . $lastCol . '1')->getFont()->setBold(true);
    $rowNum = 2;
    foreach ($rows as $row) {
        $col = 1;
        foreach ($row as $val) {
            $sheet->setCellValueByColumnAndRow($col++, $rowNum, $val);
        }
        $rowNum++;
    }
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
    $writer->save('php://output');
}

/**
 * Output workbook in 2026 Social Media Engagement format:
 * One sheet per date, columns: NAME | Facebook | X | Instagram | LinkedIn | Total Engagement
 * Values: 1 if engaged, 0 otherwise
 * If dateFrom/dateTo provided, generates all dates in range (even with no engagement)
 */
function output_workbook_excel(PDO $pdo, array $whereClause, array $params, string $filename, ?string $category, ?string $dateFrom = null, ?string $dateTo = null): void {
    // Discard any stray output (warnings, notices) that would corrupt the Excel binary
    if (ob_get_level()) {
        ob_end_clean();
    }
    ob_start();

    $autoload = __DIR__ . '/../../../vendor/autoload.php';
    if (!file_exists($autoload)) {
        ob_end_clean();
        throw new RuntimeException('PhpSpreadsheet not installed. Run: composer require phpoffice/phpspreadsheet');
    }
    require_once $autoload;

    $baseFrom = 'social_engagement e INNER JOIN social_people p ON e.person_id = p.id';
    $whereSql = empty($whereClause) ? '' : ' WHERE ' . implode(' AND ', $whereClause);

    // Get all people (optionally filtered by category)
    $peopleSql = 'SELECT id, real_name FROM social_people';
    $peopleParams = [];
    if ($category) {
        $peopleSql .= ' WHERE category = ?';
        $peopleParams[] = $category;
    }
    $peopleSql .= ' ORDER BY real_name ASC';
    $stmtPeople = $peopleParams ? $pdo->prepare($peopleSql) : $pdo;
    if ($peopleParams) {
        $stmtPeople->execute($peopleParams);
    } else {
        $stmtPeople = $pdo->query($peopleSql);
    }
    $people = $stmtPeople->fetchAll(PDO::FETCH_ASSOC);

    // Get dates: either full range (if dateFrom/dateTo) or distinct dates with engagement
    $dates = [];
    if ($dateFrom && $dateTo) {
        $from = strtotime($dateFrom);
        $to = strtotime($dateTo);
        if ($from !== false && $to !== false) {
            $d = min($from, $to);
            $end = max($from, $to);
            while ($d <= $end) {
                $dates[] = date('Y-m-d', $d);
                $d = strtotime('+1 day', $d);
            }
        }
    }
    if (empty($dates)) {
        $stmtDates = $pdo->prepare("
            SELECT DISTINCT e.engagement_date
            FROM {$baseFrom}{$whereSql}
            ORDER BY e.engagement_date ASC
        ");
        $stmtDates->execute($params);
        $dates = $stmtDates->fetchAll(PDO::FETCH_COLUMN);
    }
    if (empty($dates)) {
        $dates = [date('Y-m-d')];
    }

    // Get engagement data: (person_id, engagement_date, platform) => engagement_count
    $stmtEng = $pdo->prepare("
        SELECT e.person_id, e.engagement_date, e.platform, e.engagement_count
        FROM {$baseFrom}{$whereSql}
    ");
    $stmtEng->execute($params);
    $engagementMap = [];
    while ($row = $stmtEng->fetch(PDO::FETCH_ASSOC)) {
        $key = $row['person_id'] . '|' . $row['engagement_date'] . '|' . $row['platform'];
        $engagementMap[$key] = ($row['engagement_count'] ?? 0) > 0 ? 1 : 0;
    }

    $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
    $headers = ['NAME', 'Facebook', 'X ', 'Instagram', 'LinkedIn', 'Total Engagement'];

    // Excel sheet names: max 31 chars, must be unique. Use "d M y" (e.g. "09 Feb 26") to avoid duplicates.
    foreach ($dates as $idx => $engDate) {
        $sheetName = date('d M y', strtotime($engDate));
        if ($idx === 0) {
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle($sheetName);
        } else {
            $sheet = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, $sheetName);
            $spreadsheet->addSheet($sheet, $idx);
        }

        $col = 1;
        foreach ($headers as $h) {
            $sheet->setCellValueByColumnAndRow($col++, 1, $h);
        }
        $sheet->getStyle('A1:F1')->getFont()->setBold(true);

        $rowNum = 2;
        foreach ($people as $person) {
            $pid = $person['id'];
            $fb = $engagementMap[$pid . '|' . $engDate . '|facebook'] ?? 0;
            $x = $engagementMap[$pid . '|' . $engDate . '|x'] ?? 0;
            $ig = $engagementMap[$pid . '|' . $engDate . '|instagram'] ?? 0;
            $li = $engagementMap[$pid . '|' . $engDate . '|linkedin'] ?? 0;
            $total = $fb + $x + $ig + $li;

            $sheet->setCellValueByColumnAndRow(1, $rowNum, $person['real_name'] ?? '');
            $sheet->setCellValueByColumnAndRow(2, $rowNum, $fb);
            $sheet->setCellValueByColumnAndRow(3, $rowNum, $x);
            $sheet->setCellValueByColumnAndRow(4, $rowNum, $ig);
            $sheet->setCellValueByColumnAndRow(5, $rowNum, $li);
            $sheet->setCellValueByColumnAndRow(6, $rowNum, $total);
            $rowNum++;
        }
    }

    ob_end_clean();
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
    $writer->save('php://output');
}

try {
    $pdo = get_pdo();

    $where = [];
    $params = [];
    $baseFrom = 'social_engagement e INNER JOIN social_people p ON e.person_id = p.id';
    if ($category) {
        $where[] = 'p.category = ?';
        $params[] = $category;
    }
    if ($dateFrom) {
        $where[] = 'e.engagement_date >= ?';
        $params[] = $dateFrom;
    }
    if ($dateTo) {
        $where[] = 'e.engagement_date <= ?';
        $params[] = $dateTo;
    }
    $whereSql = empty($where) ? '' : ' WHERE ' . implode(' AND ', $where);

    $ext = $useExcel ? 'xlsx' : 'csv';

    if ($type === 'engagement') {
        $stmt = $pdo->prepare("
            SELECT p.real_name, p.category, p.company, e.engagement_date, e.platform, e.engagement_count, e.created_at
            FROM {$baseFrom}{$whereSql}
            ORDER BY e.engagement_date DESC, p.real_name, e.platform
        ");
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $filename = 'social_engagement_' . date('Y-m-d') . '.' . $ext;
        $headers = ['Real Name', 'Category', 'Company', 'Date', 'Platform', 'Engagement Count', 'Recorded At'];
        $data = array_map(function ($r) {
            return [
                $r['real_name'] ?? '',
                $r['category'] ?? '',
                $r['company'] ?? '',
                $r['engagement_date'] ?? '',
                $r['platform'] ?? '',
                $r['engagement_count'] ?? 0,
                $r['created_at'] ?? '',
            ];
        }, $rows);
        if ($useExcel) {
            try {
                output_excel($headers, $data, $filename);
            } catch (Throwable $ex) {
                output_csv($headers, $data, 'social_engagement_' . date('Y-m-d') . '.csv');
            }
        } else {
            output_csv($headers, $data, $filename);
        }
        exit;
    }

    if ($type === 'people') {
        $stmt = $pdo->query('
            SELECT id, real_name, facebook_name, x_name, instagram_name, linkedin_name, category, company, employee_id, client_id, notes
            FROM social_people ORDER BY real_name ASC
        ');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $filename = 'social_people_' . date('Y-m-d') . '.' . $ext;
        $headers = ['ID', 'Real Name', 'Facebook', 'X', 'Instagram', 'LinkedIn', 'Category', 'Company', 'Employee ID', 'Client ID', 'Notes'];
        $data = array_map(function ($r) {
            return [
                $r['id'] ?? '',
                $r['real_name'] ?? '',
                $r['facebook_name'] ?? '',
                $r['x_name'] ?? '',
                $r['instagram_name'] ?? '',
                $r['linkedin_name'] ?? '',
                $r['category'] ?? '',
                $r['company'] ?? '',
                $r['employee_id'] ?? '',
                $r['client_id'] ?? '',
                $r['notes'] ?? '',
            ];
        }, $rows);
        if ($useExcel) {
            try {
                output_excel($headers, $data, $filename);
            } catch (Throwable $ex) {
                output_csv($headers, $data, 'social_people_' . date('Y-m-d') . '.csv');
            }
        } else {
            output_csv($headers, $data, $filename);
        }
        exit;
    }

        if ($type === 'workbook') {
        if (!$useExcel) {
            http_response_code(400);
            echo json_encode(['error' => 'Workbook format requires Excel (format=xlsx)']);
            exit;
        }
        try {
            output_workbook_excel($pdo, $where, $params, 'social_engagement_' . date('Y-m-d') . '.xlsx', $category, $dateFrom, $dateTo);
        } catch (Throwable $ex) {
            if (ob_get_level()) {
                ob_end_clean();
            }
            http_response_code(500);
            header('Content-Type: application/json');
            $debug = (defined('ENVIRONMENT') && ENVIRONMENT === 'development') ? [
                'file' => $ex->getFile(),
                'line' => $ex->getLine(),
            ] : [];
            echo json_encode(array_merge(
                ['error' => 'Export failed', 'message' => $ex->getMessage()],
                $debug
            ));
        }
        exit;
    }

    if ($type === 'dashboard') {
        $stmt = $pdo->prepare("
            SELECT p.category, e.platform,
                   COUNT(DISTINCT e.person_id) as unique_people,
                   SUM(e.engagement_count) as total_engagement,
                   COUNT(DISTINCT e.engagement_date) as unique_dates
            FROM {$baseFrom}{$whereSql}
            GROUP BY p.category, e.platform
            ORDER BY p.category, e.platform
        ");
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $filename = 'social_dashboard_' . date('Y-m-d') . '.' . $ext;
        $headers = ['Category', 'Platform', 'Unique People', 'Total Engagement', 'Unique Dates'];
        $data = array_map(function ($r) {
            return [
                $r['category'] ?? '',
                $r['platform'] ?? '',
                $r['unique_people'] ?? 0,
                $r['total_engagement'] ?? 0,
                $r['unique_dates'] ?? 0,
            ];
        }, $rows);
        if ($useExcel) {
            try {
                output_excel($headers, $data, $filename);
            } catch (Throwable $ex) {
                output_csv($headers, $data, 'social_dashboard_' . date('Y-m-d') . '.csv');
            }
        } else {
            output_csv($headers, $data, $filename);
        }
        exit;
    }
} catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Export failed',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
    ]);
}
