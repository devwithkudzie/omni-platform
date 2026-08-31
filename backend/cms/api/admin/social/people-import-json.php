<?php
// cms/api/admin/social/people-import-json.php
// Import social_people from a JSON payload (parsed on the frontend, e.g. via SheetJS)

require_once __DIR__ . '/../../../db.php';
require_once __DIR__ . '/../../../audit.php';

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
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// JSON import updates/creates people in bulk
require_capability('social.manage_people');

function json_input_people(): array {
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

    $pdo = get_pdo();
    $payload = json_input_people();

    $people = $payload['people'] ?? null;
    if (!is_array($people) || count($people) === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing or empty "people" array in request body']);
        exit;
    }

    // Optional: set all imported people to this category (overrides per-row when set)
    $categoryOverride = isset($payload['category']) ? trim((string) $payload['category']) : null;
    $validCategories = ['employee', 'client', 'prospect', 'partner', 'other'];
    if ($categoryOverride !== null && $categoryOverride !== '' && !in_array($categoryOverride, $validCategories, true)) {
        $categoryOverride = null;
    }

    $inserted = 0;
    $updated = 0;

    $pdo->beginTransaction();

    foreach ($people as $person) {
        if (!is_array($person)) {
            continue;
        }

        $realName = trim((string)($person['real_name'] ?? ''));
        if ($realName === '') {
            continue;
        }

        $facebookName  = isset($person['facebook_name']) ? trim((string)$person['facebook_name']) : null;
        $xName         = isset($person['x_name']) ? trim((string)$person['x_name']) : null;
        $instagramName = isset($person['instagram_name']) ? trim((string)$person['instagram_name']) : null;
        $linkedinName  = isset($person['linkedin_name']) ? trim((string)$person['linkedin_name']) : null;
        $category      = isset($person['category']) ? trim((string)$person['category']) : null;
        // Use override if provided; otherwise use per-row category or fallback to 'other'
        if ($categoryOverride !== null && $categoryOverride !== '') {
            $category = $categoryOverride;
        } elseif ($category === '' || !in_array($category, $validCategories, true)) {
            $category = $category ?: 'other';
        }
        $company       = isset($person['company']) ? trim((string)$person['company']) : null;
        $employeeId    = isset($person['employee_id']) ? trim((string)$person['employee_id']) : null;
        $clientId      = isset($person['client_id']) ? trim((string)$person['client_id']) : null;
        $notes         = isset($person['notes']) ? trim((string)$person['notes']) : null;

        // Try to find existing person by real_name (case-insensitive)
        $stmt = $pdo->prepare('SELECT id FROM social_people WHERE LOWER(real_name) = LOWER(?) LIMIT 1');
        $stmt->execute([$realName]);
        $existingId = $stmt->fetchColumn();

        if ($existingId) {
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
    audit_log('import_people_json', 'social_people', null, ['inserted' => $inserted, 'updated' => $updated]);

    echo json_encode([
        'success' => true,
        'inserted' => $inserted,
        'updated' => $updated,
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}

