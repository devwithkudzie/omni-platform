<?php
// cms/api/admin/social/person.php
// Create, update, and delete individual social_people records (manual management UI)

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
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function json_input_person(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

try {
    $pdo = get_pdo();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        require_capability('social.view_person_detail');
        // Get person details + engagement history
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            exit;
        }
        $stmt = $pdo->prepare('
            SELECT id, real_name, facebook_name, x_name, instagram_name, linkedin_name,
                   category, company, employee_id, client_id, notes, created_at, updated_at
            FROM social_people WHERE id = ? LIMIT 1
        ');
        $stmt->execute([$id]);
        $person = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$person) {
            http_response_code(404);
            echo json_encode(['error' => 'Person not found']);
            exit;
        }
        $stmtEng = $pdo->prepare('
            SELECT engagement_date, platform, engagement_count, created_at, updated_at
            FROM social_engagement
            WHERE person_id = ?
            ORDER BY engagement_date DESC, platform ASC
        ');
        $stmtEng->execute([$id]);
        $engagement = $stmtEng->fetchAll(PDO::FETCH_ASSOC);
        $totalEngagement = 0;
        foreach ($engagement as &$row) {
            $row['engagement_count'] = (int)$row['engagement_count'];
            $totalEngagement += $row['engagement_count'];
        }
        echo json_encode([
            'person' => $person,
            'engagement' => $engagement,
            'total_engagement' => $totalEngagement,
        ]);
        exit;
    }

    if ($method === 'POST') {
        require_capability('social.manage_people');
        // Create new person
        $body = json_input_person();
        $realName = trim($body['real_name'] ?? '');

        if ($realName === '') {
            http_response_code(400);
            echo json_encode(['error' => 'real_name is required']);
            exit;
        }

        $facebookName  = trim($body['facebook_name'] ?? '');
        $xName         = trim($body['x_name'] ?? '');
        $instagramName = trim($body['instagram_name'] ?? '');
        $linkedinName  = trim($body['linkedin_name'] ?? '');
        $category      = trim($body['category'] ?? 'other');
        $company       = trim($body['company'] ?? '');
        $employeeId    = trim($body['employee_id'] ?? '');
        $clientId      = trim($body['client_id'] ?? '');
        $notes         = trim($body['notes'] ?? '');

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
            $facebookName !== '' ? $facebookName : null,
            $xName !== '' ? $xName : null,
            $instagramName !== '' ? $instagramName : null,
            $linkedinName !== '' ? $linkedinName : null,
            $category !== '' ? $category : 'other',
            $company !== '' ? $company : null,
            $employeeId !== '' ? $employeeId : null,
            $clientId !== '' ? $clientId : null,
            $notes !== '' ? $notes : null,
        ]);

        $id = (int)$pdo->lastInsertId();

        echo json_encode(['success' => true, 'id' => $id]);
        exit;
    }

    if ($method === 'PUT') {
        require_capability('social.manage_people');
        // Update existing person
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            exit;
        }

        $body = json_input_person();

        $fields = [];
        $values = [];

        if (array_key_exists('real_name', $body)) {
            $fields[] = 'real_name = ?';
            $values[] = trim($body['real_name']);
        }
        if (array_key_exists('facebook_name', $body)) {
            $fields[] = 'facebook_name = ?';
            $values[] = $body['facebook_name'] !== '' ? trim($body['facebook_name']) : null;
        }
        if (array_key_exists('x_name', $body)) {
            $fields[] = 'x_name = ?';
            $values[] = $body['x_name'] !== '' ? trim($body['x_name']) : null;
        }
        if (array_key_exists('instagram_name', $body)) {
            $fields[] = 'instagram_name = ?';
            $values[] = $body['instagram_name'] !== '' ? trim($body['instagram_name']) : null;
        }
        if (array_key_exists('linkedin_name', $body)) {
            $fields[] = 'linkedin_name = ?';
            $values[] = $body['linkedin_name'] !== '' ? trim($body['linkedin_name']) : null;
        }
        if (array_key_exists('notes', $body)) {
            $fields[] = 'notes = ?';
            $values[] = $body['notes'] !== '' ? trim($body['notes']) : null;
        }
        if (array_key_exists('category', $body)) {
            $fields[] = 'category = ?';
            $values[] = $body['category'] !== '' ? trim($body['category']) : 'other';
        }
        if (array_key_exists('company', $body)) {
            $fields[] = 'company = ?';
            $values[] = $body['company'] !== '' ? trim($body['company']) : null;
        }
        if (array_key_exists('employee_id', $body)) {
            $fields[] = 'employee_id = ?';
            $values[] = $body['employee_id'] !== '' ? trim($body['employee_id']) : null;
        }
        if (array_key_exists('client_id', $body)) {
            $fields[] = 'client_id = ?';
            $values[] = $body['client_id'] !== '' ? trim($body['client_id']) : null;
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }

        $fields[] = 'updated_at = NOW()';
        $sql = 'UPDATE social_people SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $values[] = $id;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        audit_log('update_person', 'social_people', $id, []);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE') {
        require_capability('social.manage_people');
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            exit;
        }

        audit_log('delete_person', 'social_people', $id, []);
        $stmt = $pdo->prepare('DELETE FROM social_people WHERE id = ?');
        $stmt->execute([$id]);

        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}

