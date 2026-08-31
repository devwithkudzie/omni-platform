<?php
// cms/api/admin/social/people.php
// Manage social people records and bulk-import via CSV

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
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// People list and bulk import are person-level operations

try {
    $pdo = get_pdo();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        require_capability('social.view_person_detail');
        // List people (simple, for now no pagination)
        $stmt = $pdo->query('
            SELECT 
                id, 
                real_name, 
                facebook_name, 
                x_name, 
                instagram_name, 
                linkedin_name, 
                category,
                company,
                employee_id,
                client_id,
                notes, 
                created_at, 
                updated_at
            FROM social_people
            ORDER BY real_name ASC
            LIMIT 1000
        ');
        $people = $stmt->fetchAll();
        echo json_encode($people);
        exit;
    }

    if ($method === 'POST') {
        require_capability('social.manage_people');
        // Expect multipart/form-data with a CSV or Excel file named "file"
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'CSV or Excel file is required']);
            exit;
        }

        $file = $_FILES['file'];
        $tmpPath = $file['tmp_name'];
        $originalName = $file['name'] ?? 'people';
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

        if (!in_array($ext, ['csv', 'xlsx', 'xls'], true)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type. Please upload a CSV or Excel (.xlsx/.xls) file.']);
            exit;
        }

        // Read rows from CSV or Excel into a simple [ [col0, col1, ...], ... ] array
        $rows = [];
        if ($ext === 'csv') {
            $handle = fopen($tmpPath, 'r');
            if ($handle === false) {
                http_response_code(400);
                echo json_encode(['error' => 'Unable to read uploaded file']);
                exit;
            }
            while (($row = fgetcsv($handle)) !== false) {
                $rows[] = $row;
            }
            fclose($handle);
        } else {
            // Excel: use PhpSpreadsheet if available
            $autoload = __DIR__ . '/../../../vendor/autoload.php';
            if (!file_exists($autoload)) {
                http_response_code(500);
                echo json_encode([
                    'error' =>
                        'Excel import requires PhpSpreadsheet on the server. ' .
                        'Please ask your host to install it, or upload a CSV export instead.',
                ]);
                exit;
            }

            require_once $autoload;
            try {
                $type = $ext === 'xlsx' ? 'Xlsx' : 'Xls';
                $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader($type);
                $reader->setReadDataOnly(true);
                $spreadsheet = $reader->load($tmpPath);

                // Prefer the "Calculator" sheet from the 2026 Social Media Engagement workbook,
                // since that's where the full NAME list lives. Fallback to the first sheet.
                $sheet = $spreadsheet->getSheetByName('Calculator');
                if (!$sheet) {
                    $sheet = $spreadsheet->getSheet(0);
                }
                $highestRow = $sheet->getHighestRow();
                $highestColumn = $sheet->getHighestColumn();
                $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);

                for ($row = 1; $row <= $highestRow; $row++) {
                    $rowData = [];
                    for ($col = 1; $col <= $highestColumnIndex; $col++) {
                        $rowData[] = (string) $sheet->getCellByColumnAndRow($col, $row)->getValue();
                    }
                    $rows[] = $rowData;
                }
            } catch (Throwable $e) {
                http_response_code(400);
                echo json_encode(['error' => 'Unable to read Excel file. Please check the format or use CSV.']);
                exit;
            }
        }

        if (empty($rows)) {
            http_response_code(400);
            echo json_encode(['error' => 'File is empty or invalid']);
            exit;
        }

        // First row is header
        $header = array_shift($rows);

        // Expected columns in header (case-insensitive): real_name, facebook_name, x_name, instagram_name, linkedin_name, notes
        $map = [];
        foreach ($header as $index => $name) {
            $normalized = strtolower(trim((string) $name));
            if ($normalized !== '') {
                $map[$normalized] = $index;
            }
        }

        // Allow using "NAME" (like in the 2026 Social Media Engagement workbook) as the real_name column
        if (!isset($map['real_name']) && isset($map['name'])) {
            $map['real_name'] = $map['name'];
        }

        if (!isset($map['real_name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'File must include a \"real_name\" (or \"NAME\") column in the first row']);
            exit;
        }

        // Optional: set all imported people to this category (overrides per-row when set)
        $categoryOverride = isset($_POST['category']) ? trim((string) $_POST['category']) : null;
        $validCategories = ['employee', 'client', 'prospect', 'partner', 'other'];
        if ($categoryOverride !== null && $categoryOverride !== '' && !in_array($categoryOverride, $validCategories, true)) {
            $categoryOverride = null;
        }

        $inserted = 0;
        $updated = 0;

        // Use transaction for consistency
        $pdo->beginTransaction();

        foreach ($rows as $row) {
            $realNameIndex = $map['real_name'];
            $realName = isset($row[$realNameIndex]) ? trim((string) $row[$realNameIndex]) : '';
            if ($realName === '') {
                continue;
            }

            $facebookName  = isset($map['facebook_name']) ? trim((string) ($row[$map['facebook_name']] ?? '')) : null;
            $xName         = isset($map['x_name']) ? trim((string) ($row[$map['x_name']] ?? '')) : null;
            $instagramName = isset($map['instagram_name']) ? trim((string) ($row[$map['instagram_name']] ?? '')) : null;
            $linkedinName  = isset($map['linkedin_name']) ? trim((string) ($row[$map['linkedin_name']] ?? '')) : null;
            $notes         = isset($map['notes']) ? trim((string) ($row[$map['notes']] ?? '')) : null;

            // Optional classification fields if present in header
            $category   = isset($map['category']) ? trim((string) ($row[$map['category']] ?? '')) : null;
            if ($categoryOverride !== null && $categoryOverride !== '') {
                $category = $categoryOverride;
            } elseif ($category === '' || !in_array($category, $validCategories, true)) {
                $category = $category ?: 'other';
            }
            $company    = isset($map['company']) ? trim((string) ($row[$map['company']] ?? '')) : null;
            $employeeId = isset($map['employee_id']) ? trim((string) ($row[$map['employee_id']] ?? '')) : null;
            $clientId   = isset($map['client_id']) ? trim((string) ($row[$map['client_id']] ?? '')) : null;

            // Try to find existing person by real_name (case-insensitive)
            $stmt = $pdo->prepare('SELECT id FROM social_people WHERE LOWER(real_name) = LOWER(?) LIMIT 1');
            $stmt->execute([$realName]);
            $existingId = $stmt->fetchColumn();

            if ($existingId) {
                // Update existing record with any new handle data
                $stmt = $pdo->prepare('
                    UPDATE social_people
                    SET facebook_name = COALESCE(NULLIF(?, \'\'), facebook_name),
                        x_name = COALESCE(NULLIF(?, \'\'), x_name),
                        instagram_name = COALESCE(NULLIF(?, \'\'), instagram_name),
                        linkedin_name = COALESCE(NULLIF(?, \'\'), linkedin_name),
                        notes = COALESCE(NULLIF(?, \'\'), notes),
                        category = COALESCE(NULLIF(?, \'\'), category),
                        company = COALESCE(NULLIF(?, \'\'), company),
                        employee_id = COALESCE(NULLIF(?, \'\'), employee_id),
                        client_id = COALESCE(NULLIF(?, \'\'), client_id),
                        updated_at = NOW()
                    WHERE id = ?
                ');
                $stmt->execute([
                    $facebookName,
                    $xName,
                    $instagramName,
                    $linkedinName,
                    $notes,
                    $category,
                    $company,
                    $employeeId,
                    $clientId,
                    $existingId,
                ]);
                $updated++;
            } else {
                // Insert new person
                $stmt = $pdo->prepare('
                    INSERT INTO social_people (
                        real_name, 
                        facebook_name, 
                        x_name, 
                        instagram_name, 
                        linkedin_name,
                        category,
                        company,
                        employee_id,
                        client_id,
                        notes, 
                        created_at, 
                        updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                ');
                $stmt->execute([
                    $realName,
                    $facebookName,
                    $xName,
                    $instagramName,
                    $linkedinName,
                    $category ?: 'other',
                    $company ?: null,
                    $employeeId ?: null,
                    $clientId ?: null,
                    $notes,
                ]);
                $inserted++;
            }
        }

        $pdo->commit();
        audit_log('import_people_csv', 'social_people', null, ['inserted' => $inserted, 'updated' => $updated]);
        echo json_encode([
            'success' => true,
            'inserted' => $inserted,
            'updated' => $updated,
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}

