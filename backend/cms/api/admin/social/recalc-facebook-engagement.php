<?php
// cms/api/admin/social/recalc-facebook-engagement.php
// Backfills social_engagement from social_post_engagement rows that are not yet reflected.
// Use after adding people to Social People (with Facebook name) so their past comments/reactions count.

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
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_capability('social.manage_engagement');

try {
    $pdo = get_pdo();

    $stmtFindPerson = $pdo->prepare('
        SELECT id FROM social_people
        WHERE facebook_name IS NOT NULL AND LOWER(TRIM(facebook_name)) = LOWER(TRIM(:name))
        LIMIT 1
    ');
    $stmtUpsertEngagement = $pdo->prepare('
        INSERT INTO social_engagement (person_id, engagement_date, platform, engagement_count, created_at, updated_at)
        VALUES (:person_id, :engagement_date, \'facebook\', 1, NOW(), NOW())
        ON DUPLICATE KEY UPDATE engagement_count = engagement_count + 1, updated_at = NOW()
    ');
    $stmtMarkReflected = $pdo->prepare('UPDATE social_post_engagement SET reflected_in_engagement = 1 WHERE id = :id');

    $stmtUnreflected = $pdo->query("
        SELECT spe.id, spe.person_name, spe.engagement_date
        FROM social_post_engagement spe
        INNER JOIN social_posts sp ON sp.id = spe.post_id
        WHERE sp.platform = 'facebook' AND spe.reflected_in_engagement = 0
    ");
    if ($stmtUnreflected === false) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Column reflected_in_engagement may be missing. Run migration add_social_post_engagement_reflected.sql.',
        ]);
        exit;
    }

    $processed = 0;
    $updated = 0;
    while (($row = $stmtUnreflected->fetch(PDO::FETCH_ASSOC)) !== false) {
        $processed++;
        $name = $row['person_name'] ?? '';
        if ($name === '') {
            $stmtMarkReflected->execute(['id' => $row['id']]);
            continue;
        }
        $stmtFindPerson->execute(['name' => $name]);
        $person = $stmtFindPerson->fetch(PDO::FETCH_ASSOC);
        if ($person) {
            $stmtUpsertEngagement->execute([
                'person_id' => (int) $person['id'],
                'engagement_date' => $row['engagement_date'],
            ]);
            $updated++;
        }
        $stmtMarkReflected->execute(['id' => $row['id']]);
    }

    echo json_encode([
        'success' => true,
        'processed' => $processed,
        'engagement_updated' => $updated,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage(),
    ]);
}
