<?php
// cms/api/admin/social/fetch-facebook.php
// Fetches recent Facebook page posts, reactions, and comments; upserts into
// social_posts and social_post_engagement, and increments social_engagement for matched people.

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

// Cron: if cron_token matches SOCIAL_CRON_TOKEN env, skip session auth (for scheduled sync)
// Prefer header (avoids token in URL/logs); fallback to GET for backward compat
$cronToken = $_SERVER['HTTP_X_CRON_TOKEN'] ?? $_GET['cron_token'] ?? '';
$cronSecret = cms_config_string('facebook.social_cron_token');
if ($cronToken !== '' && $cronSecret !== '' && hash_equals($cronSecret, $cronToken)) {
    // Allow cron request without session
} else {
    require_capability('social.manage_engagement');
}

$pageId    = cms_config_string('facebook.page_id');
$pageToken = cms_config_string('facebook.page_access_token');
$version   = cms_config_string('facebook.graph_version', 'v19.0');

if (!$pageId || !$pageToken) {
    http_response_code(500);
    echo json_encode([
        'error' => 'FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN is not set. Check backend/config/app.php.',
    ]);
    exit;
}

$limit = max(5, min(50, (int)($_GET['limit'] ?? 25)));

function fb_get(string $url, array $params, string $version, string $pageToken): array {
    $base = "https://graph.facebook.com/{$version}";
    $params['access_token'] = $pageToken;
    $full = $base . $url . '?' . http_build_query($params);
    $ch = curl_init($full);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
    ]);
    $body   = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($status < 200 || $status >= 300) {
        return ['error' => true, 'status' => $status, 'body' => $body];
    }
    $data = json_decode($body, true);
    return is_array($data) ? $data : ['error' => true, 'body' => $body];
}

try {
    $pdo = get_pdo();

    // Fetch page follower count (fan_count = likes; followers_count = New Page Experience)
    $facebookFollowers = null;
    $pageResponse = fb_get("/{$pageId}", [
        'fields' => 'fan_count,followers_count',
    ], $version, $pageToken);
    if (empty($pageResponse['error']) && (isset($pageResponse['fan_count']) || isset($pageResponse['followers_count']))) {
        $followerCount = (int) ($pageResponse['followers_count'] ?? $pageResponse['fan_count'] ?? 0);
        $facebookFollowers = $followerCount;
        try {
            $stmtFollower = $pdo->prepare('
                INSERT INTO social_platform_stats (platform, follower_count, updated_at)
                VALUES (\'facebook\', ?, NOW())
                ON DUPLICATE KEY UPDATE follower_count = VALUES(follower_count), updated_at = NOW()
            ');
            $stmtFollower->execute([$followerCount]);
        } catch (Throwable $e) {
            // Table may not exist (run add_social_platform_stats.sql) - continue sync
        }
    }

    // When followers_only=1 (e.g. for cron/automatic): only fetch follower count, skip posts/reactions/comments
    $followersOnly = !empty($_GET['followers_only']);
    if ($followersOnly) {
        echo json_encode([
            'success' => true,
            'facebook_followers' => $facebookFollowers,
            'followers_only' => true,
        ]);
        exit;
    }

    // Fetch recent posts published by the page
    $postsResponse = fb_get("/{$pageId}/posts", [
        'fields' => 'id,message,created_time,permalink_url',
        'limit'  => $limit,
    ], $version, $pageToken);

    if (!empty($postsResponse['error'])) {
        $status = $postsResponse['status'] ?? 500;
        $body = $postsResponse['body'] ?? 'Unknown error';
        $fbError = null;
        if (is_string($body)) {
            $decoded = json_decode($body, true);
            if (isset($decoded['error']['message'])) {
                $fbError = $decoded['error']['message'];
            }
        }
        http_response_code($status);
        echo json_encode([
            'error'   => 'Facebook API error',
            'status'  => $status,
            'message' => $fbError ?: $body,
        ]);
        exit;
    }

    $posts = $postsResponse['data'] ?? [];
    if (empty($posts)) {
        echo json_encode([
            'success' => true,
            'posts_fetched' => 0,
            'posts_upserted' => 0,
            'reactions_inserted' => 0,
            'comments_inserted' => 0,
            'engagement_updated' => 0,
            'people_added' => 0,
            'recalc_updated' => 0,
            'facebook_followers' => $facebookFollowers,
        ]);
        exit;
    }

    $stmtUpsertPost = $pdo->prepare('
        INSERT INTO social_posts (platform, external_id, page_id, message, permalink_url, post_created_time, fetched_at)
        VALUES (\'facebook\', :external_id, :page_id, :message, :permalink_url, :post_created_time, NOW())
        ON DUPLICATE KEY UPDATE
            message = VALUES(message),
            permalink_url = VALUES(permalink_url),
            post_created_time = VALUES(post_created_time),
            fetched_at = NOW()
    ');
    $hasReactionType = $pdo->query("SHOW COLUMNS FROM social_post_engagement LIKE 'reaction_type'")->rowCount() > 0;
    $hasMessage = $pdo->query("SHOW COLUMNS FROM social_post_engagement LIKE 'message'")->rowCount() > 0;
    $cols = ['post_id', 'external_id', 'person_name', 'engagement_type', 'engagement_date'];
    $placeholders = [':post_id', ':external_id', ':person_name', ':engagement_type', ':engagement_date'];
    if ($hasReactionType) {
        $cols[] = 'reaction_type';
        $placeholders[] = ':reaction_type';
    }
    if ($hasMessage) {
        $cols[] = 'message';
        $placeholders[] = ':message';
    }
    $dupUpdate = 'id = id';
    if ($hasMessage) {
        $dupUpdate .= ', message = VALUES(message)';
    }
    $stmtInsertEng = $pdo->prepare(sprintf(
        'INSERT INTO social_post_engagement (%s) VALUES (%s) ON DUPLICATE KEY UPDATE %s',
        implode(',', $cols),
        implode(',', $placeholders),
        $dupUpdate
    ));
    $hasFbUserId = $pdo->query("SHOW COLUMNS FROM social_people LIKE 'facebook_user_id'")->rowCount() > 0;
    $stmtFindPersonByFbId = $hasFbUserId ? $pdo->prepare('
        SELECT id FROM social_people WHERE facebook_user_id IS NOT NULL AND facebook_user_id = :fb_id LIMIT 1
    ') : null;
    $stmtFindPerson = $pdo->prepare('
        SELECT id FROM social_people
        WHERE facebook_name IS NOT NULL AND LOWER(TRIM(facebook_name)) = LOWER(TRIM(:name))
        LIMIT 1
    ');
    $stmtFindPersonByRealName = $pdo->prepare('
        SELECT id FROM social_people WHERE LOWER(TRIM(real_name)) = LOWER(TRIM(:name)) LIMIT 1
    ');
    $stmtInsertPerson = $hasFbUserId ? $pdo->prepare('
        INSERT INTO social_people (real_name, facebook_name, facebook_user_id, category, created_at, updated_at)
        VALUES (:real_name, :facebook_name, :facebook_user_id, \'prospect\', NOW(), NOW())
    ') : $pdo->prepare('
        INSERT INTO social_people (real_name, facebook_name, category, created_at, updated_at)
        VALUES (:real_name, :facebook_name, \'prospect\', NOW(), NOW())
    ');
    $stmtUpdatePersonFb = $hasFbUserId ? $pdo->prepare('
        UPDATE social_people SET facebook_name = :fb_name, facebook_user_id = COALESCE(:fb_id, facebook_user_id), updated_at = NOW() WHERE id = :id
    ') : null;
    $stmtUpdatePersonFacebook = !$stmtUpdatePersonFb ? $pdo->prepare('
        UPDATE social_people SET facebook_name = :fb_name, updated_at = NOW() WHERE id = :id
    ') : null;
    $stmtUpsertEngagement = $pdo->prepare('
        INSERT INTO social_engagement (person_id, engagement_date, platform, engagement_count, created_at, updated_at)
        VALUES (:person_id, :engagement_date, \'facebook\', 1, NOW(), NOW())
        ON DUPLICATE KEY UPDATE engagement_count = engagement_count + 1, updated_at = NOW()
    ');
    $stmtMarkReflected = $pdo->prepare('UPDATE social_post_engagement SET reflected_in_engagement = 1 WHERE id = :id');

    $postsUpserted = 0;
    $reactionsInserted = 0;
    $commentsInserted = 0;
    $engagementUpdated = 0;
    $peopleAdded = 0;
    $reactionsSeen = 0;   // total from API (for debugging)
    $commentsSeen = 0;    // total from API (for debugging)

    foreach ($posts as $post) {
        $externalId = $post['id'] ?? '';
        $message = $post['message'] ?? null;
        $permalinkUrl = $post['permalink_url'] ?? null;
        $createdTime = $post['created_time'] ?? null;
        $postDate = $createdTime ? date('Y-m-d', strtotime($createdTime)) : date('Y-m-d');

        if ($externalId === '') {
            continue;
        }

        $stmtUpsertPost->execute([
            'external_id' => $externalId,
            'page_id' => $pageId,
            'message' => $message,
            'permalink_url' => $permalinkUrl,
            'post_created_time' => $createdTime ? date('Y-m-d H:i:s', strtotime($createdTime)) : null,
        ]);
        $postsUpserted++;

        $stmtGetPostId = $pdo->prepare('SELECT id FROM social_posts WHERE platform = \'facebook\' AND external_id = :eid LIMIT 1');
        $stmtGetPostId->execute(['eid' => $externalId]);
        $postId = (int) ($stmtGetPostId->fetchColumn() ?: 0);
        if ($postId === 0) {
            continue;
        }

        // Reactions (includes likes – Facebook treats Like as one reaction type; we get everyone who reacted)
        $reactionsResponse = fb_get("/{$externalId}/reactions", [
            'fields' => 'id,name,type',
            'limit'  => 500,
        ], $version, $pageToken);
        $reactions = $reactionsResponse['data'] ?? [];
        $reactionsSeen += count($reactions);
        foreach ($reactions as $r) {
            $rId = $r['id'] ?? '';
            $rName = $r['name'] ?? null;
            $rType = $r['type'] ?? 'LIKE';
            if ($rId === '') {
                continue;
            }
            $extId = 'reaction-' . $rId;
            $params = [
                'post_id' => $postId,
                'external_id' => $extId,
                'person_name' => $rName,
                'engagement_type' => 'reaction',
                'engagement_date' => $postDate,
            ];
            if ($hasReactionType) {
                $params['reaction_type'] = $rType;
            }
            if ($hasMessage) {
                $params['message'] = null;
            }
            $stmtInsertEng->execute($params);
            $isNewReaction = ($stmtInsertEng->rowCount() === 1); // 1 = new insert, 2 = duplicate update
            if ($isNewReaction) {
                $reactionsInserted++;
            }
            $newId = $isNewReaction ? (int) $pdo->lastInsertId() : 0;
            // Skip page owner (page commenting/reacting on its own post)
            if ($rId === $pageId) {
                if ($newId > 0) $stmtMarkReflected->execute(['id' => $newId]);
            } elseif ($isNewReaction && $rName !== null && $rName !== '') {
                    $personId = null;
                    $rFbId = ($rId !== '' && $rId !== 'reaction-') ? $rId : null;
                    if ($rFbId && $stmtFindPersonByFbId) {
                        $stmtFindPersonByFbId->execute(['fb_id' => $rFbId]);
                        $person = $stmtFindPersonByFbId->fetch(PDO::FETCH_ASSOC);
                        if ($person) $personId = (int) $person['id'];
                    }
                    if ($personId === null) {
                        $stmtFindPerson->execute(['name' => $rName]);
                        $person = $stmtFindPerson->fetch(PDO::FETCH_ASSOC);
                        if ($person) $personId = (int) $person['id'];
                    }
                    if ($personId === null) {
                        $stmtFindPersonByRealName->execute(['name' => $rName]);
                        $person = $stmtFindPersonByRealName->fetch(PDO::FETCH_ASSOC);
                        if ($person) {
                            $personId = (int) $person['id'];
                            if ($stmtUpdatePersonFb) {
                                $stmtUpdatePersonFb->execute(['fb_name' => $rName, 'fb_id' => $rFbId, 'id' => $personId]);
                            } else {
                                $stmtUpdatePersonFacebook->execute(['fb_name' => $rName, 'id' => $personId]);
                            }
                        }
                    }
                    if ($personId === null) {
                        if ($hasFbUserId) {
                            $stmtInsertPerson->execute(['real_name' => $rName, 'facebook_name' => $rName, 'facebook_user_id' => $rFbId]);
                        } else {
                            $stmtInsertPerson->execute(['real_name' => $rName, 'facebook_name' => $rName]);
                        }
                        $personId = (int) $pdo->lastInsertId();
                        $peopleAdded++;
                    }
                    if ($personId > 0) {
                        $stmtUpsertEngagement->execute([
                            'person_id' => $personId,
                            'engagement_date' => $postDate,
                        ]);
                        $engagementUpdated++;
                        if ($newId > 0) {
                            $stmtMarkReflected->execute(['id' => $newId]);
                        }
                    }
                }
        }

        // Comments
        $commentsResponse = fb_get("/{$externalId}/comments", [
            'fields' => 'id,from{name,id},created_time,message',
            'limit'  => 500,
        ], $version, $pageToken);
        $comments = $commentsResponse['data'] ?? [];
        $commentsSeen += count($comments);
        foreach ($comments as $c) {
            $cId = $c['id'] ?? '';
            $from = $c['from'] ?? [];
            $cName = is_array($from) ? ($from['name'] ?? null) : null;
            $cFbId = (is_array($from) && isset($from['id'])) ? (string) $from['id'] : null;
            $cTime = $c['created_time'] ?? $createdTime;
            $engDate = $cTime ? date('Y-m-d', strtotime($cTime)) : $postDate;
            $cMessage = $c['message'] ?? null;
            if ($cId === '') {
                continue;
            }
            // Fallback when from is null (user restricted profile) – use placeholder so we still count engagement
            $personNameForEng = ($cName !== null && $cName !== '') ? $cName : 'Anonymous (unidentified)';
            $params = [
                'post_id' => $postId,
                'external_id' => $cId,
                'person_name' => $personNameForEng,
                'engagement_type' => 'comment',
                'engagement_date' => $engDate,
            ];
            if ($hasReactionType) {
                $params['reaction_type'] = null;
            }
            if ($hasMessage) {
                $params['message'] = $cMessage;
            }
            $stmtInsertEng->execute($params);
            $isNewComment = ($stmtInsertEng->rowCount() === 1); // 1 = new insert, 2 = duplicate update
            if ($isNewComment) {
                $commentsInserted++;
            }
            $newId = $isNewComment ? (int) $pdo->lastInsertId() : 0;
            // Skip page owner only; include anonymous comments (null from) as "Anonymous (unidentified)"
            if ($cFbId === $pageId) {
                if ($newId > 0) $stmtMarkReflected->execute(['id' => $newId]);
            } elseif ($isNewComment && $personNameForEng !== '') {
                    $personId = null;
                    $addName = $cName ?? $personNameForEng;
                    if ($cFbId && $stmtFindPersonByFbId) {
                        $stmtFindPersonByFbId->execute(['fb_id' => $cFbId]);
                        $person = $stmtFindPersonByFbId->fetch(PDO::FETCH_ASSOC);
                        if ($person) $personId = (int) $person['id'];
                    }
                    if ($personId === null) {
                        $stmtFindPerson->execute(['name' => $addName]);
                        $person = $stmtFindPerson->fetch(PDO::FETCH_ASSOC);
                        if ($person) $personId = (int) $person['id'];
                    }
                    if ($personId === null) {
                        $stmtFindPersonByRealName->execute(['name' => $addName]);
                        $person = $stmtFindPersonByRealName->fetch(PDO::FETCH_ASSOC);
                        if ($person) {
                            $personId = (int) $person['id'];
                            if ($stmtUpdatePersonFb && $cFbId) {
                                $stmtUpdatePersonFb->execute(['fb_name' => $addName, 'fb_id' => $cFbId, 'id' => $personId]);
                            } elseif ($stmtUpdatePersonFacebook) {
                                $stmtUpdatePersonFacebook->execute(['fb_name' => $addName, 'id' => $personId]);
                            }
                        }
                    }
                    if ($personId === null) {
                        if ($hasFbUserId) {
                            $stmtInsertPerson->execute(['real_name' => $addName, 'facebook_name' => $addName, 'facebook_user_id' => $cFbId]);
                        } else {
                            $stmtInsertPerson->execute(['real_name' => $addName, 'facebook_name' => $addName]);
                        }
                        $personId = (int) $pdo->lastInsertId();
                        $peopleAdded++;
                    }
                    if ($personId > 0) {
                        $stmtUpsertEngagement->execute([
                            'person_id' => $personId,
                            'engagement_date' => $engDate,
                        ]);
                        $engagementUpdated++;
                        if ($newId > 0) {
                            $stmtMarkReflected->execute(['id' => $newId]);
                        }
                    }
                }
        }
    }

    // Recalc: backfill social_engagement from any social_post_engagement not yet reflected
    // (e.g. comment was synced before the person was added to Social People)
    $recalcUpdated = 0;
    try {
        $stmtUnreflected = $pdo->query("
            SELECT spe.id, spe.person_name, spe.engagement_date
            FROM social_post_engagement spe
            INNER JOIN social_posts sp ON sp.id = spe.post_id
            WHERE sp.platform = 'facebook' AND spe.reflected_in_engagement = 0
        ");
        if ($stmtUnreflected !== false) {
            while (($row = $stmtUnreflected->fetch(PDO::FETCH_ASSOC)) !== false) {
                $name = $row['person_name'] ?? '';
                if ($name === '') {
                    $stmtMarkReflected->execute(['id' => $row['id']]);
                    continue;
                }
                $stmtFindPerson->execute(['name' => $name]);
                $person = $stmtFindPerson->fetch(PDO::FETCH_ASSOC);
                if (!$person) {
                    $stmtFindPersonByRealName->execute(['name' => $name]);
                    $person = $stmtFindPersonByRealName->fetch(PDO::FETCH_ASSOC);
                    if ($person) {
                        $stmtUpdatePersonFacebook->execute(['fb_name' => $name, 'id' => (int) $person['id']]);
                    } else {
                        $stmtInsertPerson->execute(['real_name' => $name, 'facebook_name' => $name]);
                        $personId = (int) $pdo->lastInsertId();
                        $peopleAdded++;
                        $person = ['id' => $personId];
                    }
                }
                if ($person) {
                    $personId = (int) ($person['id'] ?? 0);
                    if ($personId > 0) {
                        $stmtUpsertEngagement->execute([
                            'person_id' => $personId,
                            'engagement_date' => $row['engagement_date'],
                        ]);
                        $recalcUpdated++;
                    }
                }
                $stmtMarkReflected->execute(['id' => $row['id']]);
            }
        }
    } catch (Throwable $e) {
        // Column reflected_in_engagement may not exist yet (run add_social_post_engagement_reflected.sql)
    }

    echo json_encode([
        'success' => true,
        'posts_fetched' => count($posts),
        'posts_upserted' => $postsUpserted,
        'reactions_inserted' => $reactionsInserted,
        'comments_inserted' => $commentsInserted,
        'people_added' => $peopleAdded,
        'engagement_updated' => $engagementUpdated,
        'recalc_updated' => $recalcUpdated,
        'facebook_followers' => $facebookFollowers,
        'reactions_seen' => $reactionsSeen,
        'comments_seen' => $commentsSeen,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage(),
    ]);
}
