<?php
// cms/api/admin/social/merge-person.php
// Merge source person into target: transfer engagement, copy handles, delete source.
// Use when you discover the same person has different usernames on different platforms.

require_once __DIR__ . '/../../../db.php';
require_once __DIR__ . '/../../../audit.php';

header('Content-Type: application/json; charset=utf-8');
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

header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_capability('social.manage_people');

function json_input(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $body = json_input();
    $targetId = (int)($body['target_id'] ?? 0);
    $sourceId = (int)($body['source_id'] ?? 0);

    if ($targetId <= 0 || $sourceId <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'target_id and source_id are required']);
        exit;
    }

    if ($targetId === $sourceId) {
        http_response_code(400);
        echo json_encode(['error' => 'Cannot merge a person into themselves']);
        exit;
    }

    $pdo = get_pdo();
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('SELECT id, real_name, facebook_name, x_name, instagram_name, linkedin_name, category, company FROM social_people WHERE id IN (?, ?)');
    $stmt->execute([$targetId, $sourceId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $people = [];
    foreach ($rows as $row) {
        $people[(int)$row['id']] = $row;
    }

    if (!isset($people[$targetId]) || !isset($people[$sourceId])) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['error' => 'One or both people not found']);
        exit;
    }

    $target = $people[$targetId];
    $source = $people[$sourceId];

    // 1. Transfer engagement from source to target (sum counts when same date+platform)
    $stmt = $pdo->prepare('SELECT engagement_date, platform, engagement_count FROM social_engagement WHERE person_id = ?');
    $stmt->execute([$sourceId]);
    $sourceEngagements = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($sourceEngagements as $eng) {
        $stmtMerge = $pdo->prepare('
            INSERT INTO social_engagement (person_id, engagement_date, platform, engagement_count, created_at, updated_at)
            VALUES (?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
                engagement_count = engagement_count + ?,
                updated_at = NOW()
        ');
        $cnt = (int)($eng['engagement_count'] ?? 1);
        $stmtMerge->execute([
            $targetId,
            $eng['engagement_date'],
            $eng['platform'],
            $cnt,
            $cnt,
        ]);
    }

    $stmtDel = $pdo->prepare('DELETE FROM social_engagement WHERE person_id = ?');
    $stmtDel->execute([$sourceId]);

    // Copy platform handles, category, and company from source to target where target is empty
    $updates = [];
    $params = [];
    foreach (['facebook_name', 'x_name', 'instagram_name', 'linkedin_name', 'company'] as $col) {
        if (empty($target[$col]) && !empty($source[$col])) {
            $updates[] = "$col = ?";
            $params[] = $source[$col];
        }
    }
    if (!empty($updates)) {
        $params[] = $targetId;
        $pdo->prepare('UPDATE social_people SET ' . implode(', ', $updates) . ', updated_at = NOW() WHERE id = ?')->execute($params);
    }

    // Delete source person
    $stmtDelPerson = $pdo->prepare('DELETE FROM social_people WHERE id = ?');
    $stmtDelPerson->execute([$sourceId]);

    $pdo->commit();
    audit_log('merge_person', 'social_people', $targetId, ['source_id' => $sourceId, 'engagement_transferred' => count($sourceEngagements)]);

    echo json_encode([
        'success' => true,
        'message' => 'Merge complete. Engagement transferred.',
        'target_id' => $targetId,
        'source_id' => $sourceId,
        'engagement_transferred' => count($sourceEngagements),
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    error_log('Merge person error: ' . $e->getMessage());
    echo json_encode(['error' => 'Server error']);
}
