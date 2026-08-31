<?php
// cms/api/admin/social/engagement.php
// Record social media engagement by platform + date from pasted names

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

// Recording engagement is a management operation
require_capability('social.manage_engagement');

function json_input_engagement(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $body = json_input_engagement();

    $platform = strtolower(trim($body['platform'] ?? ''));
    $engagementDate = trim($body['date'] ?? '');
    
    // Accept either matched array (from JavaScript) or namesText (legacy support)
    $matchedFromClient = $body['matched'] ?? null;
    $unmatchedFromClient = $body['unmatched'] ?? null;
    $addUnmatchedAsProspects = !empty($body['add_unmatched_as_prospects']);
    $namesText = trim($body['namesText'] ?? '');

    $validPlatforms = ['facebook', 'x', 'instagram', 'linkedin'];
    if (!in_array($platform, $validPlatforms, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid platform']);
        exit;
    }

    if ($engagementDate === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Date is required']);
        exit;
    }

    // Normalize date to Y-m-d
    $timestamp = strtotime($engagementDate);
    if ($timestamp === false) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid date format']);
        exit;
    }
    $engagementDate = date('Y-m-d', $timestamp);

    $pdo = get_pdo();
    $matched = [];
    $unmatched = [];

    // If matched array provided from JavaScript (or unmatched to add as prospects), use it
    if (is_array($matchedFromClient) && (count($matchedFromClient) > 0 || ($addUnmatchedAsProspects && is_array($unmatchedFromClient) && count($unmatchedFromClient) > 0))) {
        // Use transaction for consistency
        $pdo->beginTransaction();

        foreach ($matchedFromClient as $match) {
            $personId = (int)($match['person_id'] ?? 0);
            if ($personId <= 0) {
                continue; // Skip invalid entries
            }

            // Insert or update engagement record for this person/date/platform
            $stmtUpsert = $pdo->prepare('
                INSERT INTO social_engagement (person_id, engagement_date, platform, engagement_count, created_at, updated_at)
                VALUES (:person_id, :date, :platform, 1, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    engagement_count = 1,
                    updated_at = NOW()
            ');
            $stmtUpsert->execute([
                'person_id' => $personId,
                'date' => $engagementDate,
                'platform' => $platform,
            ]);

            $matched[] = $match;
        }

        // Add unmatched as prospects and record their engagement (if requested)
        $peopleAdded = 0;
        $platformColumn = $platform . '_name';
        $validCols = ['facebook_name', 'x_name', 'instagram_name', 'linkedin_name'];
        if ($addUnmatchedAsProspects && is_array($unmatchedFromClient) && in_array($platformColumn, $validCols, true)) {
            $unmatchedNames = array_unique(array_map('trim', array_filter($unmatchedFromClient)));
            foreach ($unmatchedNames as $inputName) {
                if ($inputName === '') continue;
                $lowerName = mb_strtolower($inputName, 'UTF-8');

                // Check if person exists by real_name or platform handle (may have been added in same batch)
                $sql = "SELECT id FROM social_people WHERE LOWER(real_name) = ? OR ($platformColumn IS NOT NULL AND LOWER($platformColumn) = ?) LIMIT 1";
                $stmtCheck = $pdo->prepare($sql);
                $stmtCheck->execute([$lowerName, $lowerName]);
                $existing = $stmtCheck->fetch(PDO::FETCH_ASSOC);

                if ($existing) {
                    $personId = (int)$existing['id'];
                } else {
                    // Create new prospect: real_name = input, platform handle = input
                    $stmtIns = $pdo->prepare("
                        INSERT INTO social_people (real_name, $platformColumn, category, created_at, updated_at)
                        VALUES (?, ?, 'prospect', NOW(), NOW())
                    ");
                    $stmtIns->execute([$inputName, $inputName]);
                    $personId = (int)$pdo->lastInsertId();
                    $peopleAdded++;
                }

                $stmtUpsert = $pdo->prepare('
                    INSERT INTO social_engagement (person_id, engagement_date, platform, engagement_count, created_at, updated_at)
                    VALUES (:person_id, :date, :platform, 1, NOW(), NOW())
                    ON DUPLICATE KEY UPDATE engagement_count = 1, updated_at = NOW()
                ');
                $stmtUpsert->execute([
                    'person_id' => $personId,
                    'date' => $engagementDate,
                    'platform' => $platform,
                ]);

                $matched[] = ['input' => $inputName, 'person_id' => $personId, 'real_name' => $inputName, 'handle' => $inputName];
            }
        }

        $finalUnmatched = $addUnmatchedAsProspects && is_array($unmatchedFromClient)
            ? []
            : (is_array($unmatchedFromClient) ? $unmatchedFromClient : []);

        $pdo->commit();

        // Log engagement action for audit (non-blocking if table missing)
        try {
            $adminId = $_SESSION['admin_id'] ?? null;
            $stmtLog = $pdo->prepare('
                INSERT INTO social_engagement_log (admin_id, action, platform, engagement_date, matched_count, total_input, details)
                VALUES (:admin_id, :action, :platform, :date, :matched_count, :total_input, :details)
            ');
            $stmtLog->execute([
                'admin_id' => $adminId,
                'action' => 'record',
                'platform' => $platform,
                'date' => $engagementDate,
                'matched_count' => count($matched),
                'total_input' => count($matchedFromClient) + (is_array($unmatchedFromClient) ? count($unmatchedFromClient) : 0),
                'details' => json_encode(['person_ids' => array_column($matched, 'person_id'), 'people_added' => $peopleAdded]),
            ]);
        } catch (Throwable $logEx) {
            error_log('Engagement log failed: ' . $logEx->getMessage());
        }
        audit_log('record_engagement', 'social_engagement', null, [
            'platform' => $platform,
            'date' => $engagementDate,
            'matched_count' => count($matched),
            'people_added' => $peopleAdded,
        ]);

        echo json_encode([
            'success' => true,
            'platform' => $platform,
            'date' => $engagementDate,
            'total_input' => count($matchedFromClient) + (is_array($unmatchedFromClient) ? count($unmatchedFromClient) : 0),
            'matched_count' => count($matched),
            'unmatched_count' => count($finalUnmatched),
            'people_added' => $peopleAdded,
            'matched' => $matched,
            'unmatched' => $finalUnmatched,
        ]);
        exit;
    }

    // Legacy: If namesText provided, do server-side matching (fallback)
    if ($namesText === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Either matched array or namesText is required']);
        exit;
    }

    // Split pasted names into an array
    $rawNames = preg_split('/[\r\n,;]+/', $namesText);
    $names = [];
    foreach ($rawNames as $name) {
        $name = trim($name);
        if ($name !== '') {
            $names[] = $name;
        }
    }

    if (empty($names)) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid names found']);
        exit;
    }

    // Prepare platform-specific column name
    $platformColumn = $platform . '_name'; // facebook_name, x_name, etc.

    // Validate column name to prevent SQL injection
    $validColumns = ['facebook_name', 'x_name', 'instagram_name', 'linkedin_name'];
    if (!in_array($platformColumn, $validColumns, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid platform']);
        exit;
    }

    // Use transaction for consistency
    $pdo->beginTransaction();

    foreach ($names as $inputName) {
        $lowerName = mb_strtolower($inputName, 'UTF-8');

        // Find by real_name or platform-specific handle (case-insensitive)
        // Handle NULL platform columns properly
        $sql = "
            SELECT id, real_name, $platformColumn AS handle
            FROM social_people
            WHERE LOWER(real_name) = :name
               OR ($platformColumn IS NOT NULL AND LOWER($platformColumn) = :name)
            LIMIT 1
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['name' => $lowerName]);
        $person = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($person) {
            $personId = (int)$person['id'];

            // Insert or update engagement record for this person/date/platform.
            // Since workbook uses 0/1, we set engagement_count to 1 for that day.
            $stmtUpsert = $pdo->prepare('
                INSERT INTO social_engagement (person_id, engagement_date, platform, engagement_count, created_at, updated_at)
                VALUES (:person_id, :date, :platform, 1, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    engagement_count = 1,
                    updated_at = NOW()
            ');
            $stmtUpsert->execute([
                'person_id' => $personId,
                'date' => $engagementDate,
                'platform' => $platform,
            ]);

            $matched[] = [
                'input' => $inputName,
                'person_id' => $personId,
                'real_name' => $person['real_name'],
                'handle' => $person['handle'],
            ];
        } else {
            $unmatched[] = $inputName;
        }
    }

    $pdo->commit();

    // Log engagement action for audit (non-blocking if table missing)
    try {
        $adminId = $_SESSION['admin_id'] ?? null;
        $stmtLog = $pdo->prepare('
            INSERT INTO social_engagement_log (admin_id, action, platform, engagement_date, matched_count, total_input, details)
            VALUES (:admin_id, :action, :platform, :date, :matched_count, :total_input, :details)
        ');
        $stmtLog->execute([
            'admin_id' => $adminId,
            'action' => 'record',
            'platform' => $platform,
            'date' => $engagementDate,
            'matched_count' => count($matched),
            'total_input' => count($names),
            'details' => json_encode(['person_ids' => array_column($matched, 'person_id'), 'unmatched' => $unmatched]),
        ]);
    } catch (Throwable $logEx) {
        error_log('Engagement log failed: ' . $logEx->getMessage());
    }
    audit_log('record_engagement', 'social_engagement', null, [
        'platform' => $platform,
        'date' => $engagementDate,
        'matched_count' => count($matched),
        'unmatched_count' => count($unmatched),
    ]);

    echo json_encode([
        'success' => true,
        'platform' => $platform,
        'date' => $engagementDate,
        'total_input' => count($names),
        'matched_count' => count($matched),
        'unmatched_count' => count($unmatched),
        'matched' => $matched,
        'unmatched' => $unmatched,
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    error_log('Engagement API Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    // In development, show the actual error; in production, show generic message
    $errorMessage = (defined('ENVIRONMENT') && ENVIRONMENT === 'development')
        ? $e->getMessage()
        : 'Server error';
    echo json_encode(['error' => $errorMessage]);
}

