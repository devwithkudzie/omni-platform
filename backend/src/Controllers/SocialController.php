<?php

namespace OmniContact\Controllers;

use OmniContact\Auth\Auth;
use OmniContact\Database\Connection;
use OmniContact\Http\Request;
use OmniContact\Http\Response;

final class SocialController
{
    private const PLATFORMS = ['facebook', 'x', 'instagram', 'linkedin'];

    public static function dashboard(array $params, array $config): void
    {
        self::authorize($config);

        try {
            $pdo = Connection::make($config);
            $summary = self::summary($pdo);
            $topEngagers = self::topEngagers($pdo);
            $recentActivity = self::recentActivity($pdo);

            Response::json([
                'summary' => $summary,
                'top_engagers' => $topEngagers,
                'recent_activity' => $recentActivity,
                'workbook' => self::workbookMeta(),
            ]);
        } catch (\PDOException $e) {
            Response::error('SOCIAL_TABLES_MISSING', 'Social media tables are not available in this database yet.', 503);
        }
    }

    public static function checkNames(array $params, array $config): void
    {
        self::authorize($config);
        $input = Request::json();
        $names = self::extractNames((string) ($input['names'] ?? ''));

        if (!$names) {
            Response::error('VALIDATION_ERROR', 'Paste at least one name to check.', 422);
            return;
        }

        try {
            $pdo = Connection::make($config);
            $people = self::people($pdo);
        } catch (\PDOException $e) {
            Response::error('SOCIAL_TABLES_MISSING', 'Social media tables are not available in this database yet.', 503);
            return;
        }

        $index = self::personIndex($people);
        $matches = [];
        $unmatched = [];

        foreach ($names as $name) {
            $key = self::normalizeName($name);
            $matched = $index[$key] ?? null;

            if (!$matched) {
                $matched = self::findLooseMatch($key, $people);
            }

            if ($matched) {
                $matches[] = [
                    'input' => $name,
                    'person' => $matched,
                ];
            } else {
                $unmatched[] = $name;
            }
        }

        Response::json([
            'checked' => count($names),
            'matched_count' => count($matches),
            'unmatched_count' => count($unmatched),
            'matches' => $matches,
            'unmatched' => $unmatched,
        ]);
    }

    private static function authorize(array $config): array
    {
        $admin = Auth::admin($config);
        $responsibilities = $admin['responsibilities'] ?? [];

        if (is_string($responsibilities)) {
            $decoded = json_decode($responsibilities, true);
            $responsibilities = is_array($decoded) ? $decoded : [];
        }

        if (
            in_array($admin['role'], ['super_admin', 'manager'], true)
            || in_array('manage_social', $responsibilities, true)
        ) {
            return $admin;
        }

        Response::error('FORBIDDEN', 'You do not have access to social media management.', 403);
        exit;
    }

    private static function summary(\PDO $pdo): array
    {
        $totalPeople = (int) $pdo->query('SELECT COUNT(*) FROM social_people')->fetchColumn();
        $totalEngagement = (int) $pdo->query('SELECT COALESCE(SUM(engagement_count), 0) FROM social_engagement')->fetchColumn();
        $activeDays = (int) $pdo->query('SELECT COUNT(DISTINCT engagement_date) FROM social_engagement')->fetchColumn();

        $stmt = $pdo->query('
            SELECT platform, COUNT(DISTINCT person_id) AS unique_people, COALESCE(SUM(engagement_count), 0) AS total_engagement
            FROM social_engagement
            GROUP BY platform
        ');

        $platforms = array_fill_keys(self::PLATFORMS, ['unique_people' => 0, 'total_engagement' => 0]);
        foreach ($stmt->fetchAll() as $row) {
            $platform = $row['platform'];
            if (!isset($platforms[$platform])) {
                continue;
            }
            $platforms[$platform] = [
                'unique_people' => (int) $row['unique_people'],
                'total_engagement' => (int) $row['total_engagement'],
            ];
        }

        return [
            'total_people' => $totalPeople,
            'total_engagement' => $totalEngagement,
            'active_days' => $activeDays,
            'by_platform' => $platforms,
        ];
    }

    private static function topEngagers(\PDO $pdo): array
    {
        $stmt = $pdo->query('
            SELECT p.id, p.real_name, p.facebook_name, p.x_name, p.instagram_name, p.linkedin_name, p.category,
                   p.company, COALESCE(SUM(e.engagement_count), 0) AS total_engagement,
                   COUNT(DISTINCT e.engagement_date) AS engagement_days,
                   MAX(e.engagement_date) AS last_engagement
            FROM social_people p
            LEFT JOIN social_engagement e ON e.person_id = p.id
            GROUP BY p.id, p.real_name, p.facebook_name, p.x_name, p.instagram_name, p.linkedin_name, p.category, p.company
            ORDER BY total_engagement DESC, engagement_days DESC, p.real_name ASC
            LIMIT 25
        ');

        return array_map([self::class, 'normalizePerson'], $stmt->fetchAll());
    }

    private static function recentActivity(\PDO $pdo): array
    {
        $stmt = $pdo->query('
            SELECT e.platform, e.engagement_date, e.engagement_count, e.created_at, p.real_name, p.category
            FROM social_engagement e
            INNER JOIN social_people p ON p.id = e.person_id
            ORDER BY e.created_at DESC
            LIMIT 12
        ');

        return array_map(static function (array $row): array {
            $row['engagement_count'] = (int) $row['engagement_count'];
            return $row;
        }, $stmt->fetchAll());
    }

    private static function people(\PDO $pdo): array
    {
        $stmt = $pdo->query('
            SELECT p.id, p.real_name, p.facebook_name, p.x_name, p.instagram_name, p.linkedin_name, p.category,
                   p.company, COALESCE(SUM(e.engagement_count), 0) AS total_engagement,
                   COUNT(DISTINCT e.engagement_date) AS engagement_days,
                   MAX(e.engagement_date) AS last_engagement
            FROM social_people p
            LEFT JOIN social_engagement e ON e.person_id = p.id
            GROUP BY p.id, p.real_name, p.facebook_name, p.x_name, p.instagram_name, p.linkedin_name, p.category, p.company
            ORDER BY p.real_name ASC
            LIMIT 5000
        ');

        return array_map([self::class, 'normalizePerson'], $stmt->fetchAll());
    }

    private static function normalizePerson(array $person): array
    {
        $person['id'] = (int) $person['id'];
        $person['total_engagement'] = (int) ($person['total_engagement'] ?? 0);
        $person['engagement_days'] = (int) ($person['engagement_days'] ?? 0);
        return $person;
    }

    private static function extractNames(string $input): array
    {
        $parts = preg_split('/[\r\n,;]+/', $input) ?: [];
        $names = [];

        foreach ($parts as $part) {
            $name = trim($part);
            if ($name !== '' && !in_array($name, $names, true)) {
                $names[] = $name;
            }
        }

        return $names;
    }

    private static function personIndex(array $people): array
    {
        $index = [];

        foreach ($people as $person) {
            foreach (['real_name', 'facebook_name', 'x_name', 'instagram_name', 'linkedin_name'] as $field) {
                $value = trim((string) ($person[$field] ?? ''));
                if ($value === '') {
                    continue;
                }
                $index[self::normalizeName($value)] = $person;
            }
        }

        return $index;
    }

    private static function findLooseMatch(string $needle, array $people): ?array
    {
        if (strlen($needle) < 4) {
            return null;
        }

        foreach ($people as $person) {
            foreach (['real_name', 'facebook_name', 'x_name', 'instagram_name', 'linkedin_name'] as $field) {
                $candidate = self::normalizeName((string) ($person[$field] ?? ''));
                if ($candidate !== '' && (str_contains($candidate, $needle) || str_contains($needle, $candidate))) {
                    return $person;
                }
            }
        }

        return null;
    }

    private static function normalizeName(string $name): string
    {
        $name = strtolower(trim($name));
        $name = preg_replace('/^@+/', '', $name) ?? $name;
        $name = preg_replace('/[^a-z0-9]+/', ' ', $name) ?? $name;
        return trim(preg_replace('/\s+/', ' ', $name) ?? $name);
    }

    private static function workbookMeta(): ?array
    {
        $path = dirname(__DIR__, 2) . '/cms/social/workbook.json';
        if (!is_file($path)) {
            return null;
        }

        $data = json_decode((string) file_get_contents($path), true);
        return is_array($data) ? $data : null;
    }
}
