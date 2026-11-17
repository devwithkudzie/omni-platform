<?php

namespace OmniContact\Support;

/**
 * Zoho CRM lead upsert for Digital Marketing Health Check submissions.
 * Enabled when ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and ZOHO_REFRESH_TOKEN are set.
 */
final class ZohoCrm
{
    public static function isConfigured(array $config): bool
    {
        $zoho = is_array($config['zoho'] ?? null) ? $config['zoho'] : [];
        return trim((string)($zoho['client_id'] ?? '')) !== ''
            && trim((string)($zoho['client_secret'] ?? '')) !== ''
            && trim((string)($zoho['refresh_token'] ?? '')) !== '';
    }

    /**
     * @return array{ok:bool,action?:string,id?:string,error?:string,skipped?:bool}
     */
    public static function upsertMarketingHealthLead(array $config, array $payload, array $scored): array
    {
        if (!self::isConfigured($config)) {
            return ['ok' => true, 'skipped' => true, 'action' => 'skipped'];
        }

        $zoho = $config['zoho'];
        $token = self::accessToken($zoho);
        if (!$token) {
            return ['ok' => false, 'error' => 'ZOHO_TOKEN_FAILED'];
        }

        $name = trim((string)($payload['name'] ?? ''));
        $email = trim((string)($payload['email'] ?? ''));
        $company = trim((string)($payload['company'] ?? ''));
        $challenge = trim((string)($payload['challenge'] ?? ''));
        // The form sends First and Last Name separately, matching the MaaS lead
        // form. Older clients send one "name", which is split at the first space.
        $firstName = trim((string)($payload['firstName'] ?? ''));
        $lastName = trim((string)($payload['lastName'] ?? ''));
        if ($firstName === '' && $lastName === '') {
            $parts = preg_split('/\s+/', $name, 2) ?: [];
            $firstName = trim((string)($parts[0] ?? ''));
            $lastName = trim((string)($parts[1] ?? ''));
        }
        if ($lastName === '') {
            $lastName = $firstName !== '' ? $firstName : 'Website Lead';
            $firstName = $firstName !== '' && $lastName === $firstName ? '' : $firstName;
        }

        $weakestLines = [];
        foreach ($scored['weakest'] as $pillar) {
            if (!is_array($pillar)) {
                continue;
            }
            $weakestLines[] = sprintf(
                '%s — %s',
                (string)($pillar['label'] ?? 'Area'),
                (string)($pillar['tip'] ?? '')
            );
        }

        // Results go into the dedicated Health Check fields below, so the lead's
        // Description ("Sales Notes") stays free for the sales team.
        $lead = [
            'First_Name' => $firstName,
            'Last_Name' => $lastName,
            'Email' => $email,
            'Company' => $company !== '' ? $company : 'Not provided',
            'Lead_Source' => trim((string)($zoho['lead_source'] ?? '')) ?: 'MaaS Digital Marketing Health Check',
            'Tag' => [
                ['name' => 'MaaS'],
                ['name' => 'Digital Marketing Health Check'],
            ],
        ];

        $fieldMap = is_array($zoho['field_map'] ?? null) ? $zoho['field_map'] : [];
        $pillarById = [];
        foreach ($scored['pillarScores'] as $pillar) {
            if (is_array($pillar) && isset($pillar['id'])) {
                $pillarById[(string)$pillar['id']] = (int)($pillar['score'] ?? 0);
            }
        }
        // Typed values: Zoho rejects strings for Number and Checkbox fields.
        $customValues = [
            'overall_score' => isset($scored['overallScore']) ? (int)$scored['overallScore'] : null,
            'category' => (string)($scored['category'] ?? ''),
            'strategy_score' => $pillarById['strategy'] ?? null,
            'visibility_score' => $pillarById['visibility'] ?? null,
            'leads_score' => $pillarById['leads'] ?? null,
            'content_score' => $pillarById['content'] ?? null,
            'measurement_score' => $pillarById['measurement'] ?? null,
            'completed_date' => gmdate('Y-m-d'),
            'challenge' => $challenge,
            'next_steps' => implode("\n", $weakestLines),
            'email_opt_in' => !empty($payload['marketingConsent']),
            'lead_source_tag' => 'MaaS',
        ];
        foreach ($customValues as $logical => $value) {
            $apiName = trim((string)($fieldMap[$logical] ?? ''));
            if ($apiName === '' || $apiName === '-' || $value === null || $value === '') {
                continue;
            }
            $lead[$apiName] = $value;
        }

        $apiDomain = rtrim((string)($zoho['api_domain'] ?? 'https://www.zohoapis.com'), '/');
        $outcome = self::saveLead($apiDomain, $token, $lead, $email);

        // A cached token can be revoked before it expires; refresh once and retry.
        if (($outcome['status'] ?? 0) === 401) {
            $token = self::accessToken($zoho, true);
            if (!$token) {
                return ['ok' => false, 'error' => 'ZOHO_TOKEN_FAILED'];
            }
            $outcome = self::saveLead($apiDomain, $token, $lead, $email);
        }

        unset($outcome['status']);
        return $outcome;
    }

    private static function saveLead(string $apiDomain, string $token, array $lead, string $email): array
    {
        $search = self::findLeadIdByEmail($apiDomain, $token, $email);
        if ($search['status'] === 401) {
            return ['ok' => false, 'error' => 'ZOHO_AUTH_FAILED', 'status' => 401];
        }
        $existingId = $search['id'];

        if ($existingId) {
            $result = self::request(
                'PUT',
                "{$apiDomain}/crm/v2/Leads",
                $token,
                ['data' => [array_merge($lead, ['id' => $existingId])]]
            );
            if (self::recordSucceeded($result)) {
                return ['ok' => true, 'action' => 'updated', 'id' => $existingId];
            }
            self::logFailure('update', $result);
            return ['ok' => false, 'error' => 'ZOHO_UPDATE_FAILED', 'id' => $existingId, 'status' => (int)$result['status']];
        }

        $result = self::request(
            'POST',
            "{$apiDomain}/crm/v2/Leads",
            $token,
            ['data' => [$lead]]
        );

        $body = json_decode((string)($result['body'] ?? ''), true);
        $id = is_array($body) ? (string)($body['data'][0]['details']['id'] ?? '') : '';
        if (self::recordSucceeded($result) && $id !== '') {
            return ['ok' => true, 'action' => 'created', 'id' => $id];
        }

        self::logFailure('create', $result);
        return ['ok' => false, 'error' => 'ZOHO_CREATE_FAILED', 'status' => (int)$result['status']];
    }

    /**
     * Zoho allows only ~10 access tokens per refresh token every 10 minutes, so
     * minting one per submission makes back-to-back submissions fail. Reuse the
     * token (valid for an hour) from a small cache file until shortly before expiry.
     */
    private static function accessToken(array $zoho, bool $forceRefresh = false): ?string
    {
        $cacheFile = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR
            . 'omni-zoho-token-' . sha1((string)$zoho['client_id'] . '|' . (string)$zoho['refresh_token']) . '.json';

        if (!$forceRefresh && is_readable($cacheFile)) {
            $cached = json_decode((string)@file_get_contents($cacheFile), true);
            if (is_array($cached) && !empty($cached['token']) && (int)($cached['expires_at'] ?? 0) > time() + 60) {
                return (string)$cached['token'];
            }
        }

        $fresh = self::refreshAccessToken($zoho);
        if (!$fresh) {
            return null;
        }

        $written = @file_put_contents($cacheFile, json_encode([
            'token' => $fresh['token'],
            'expires_at' => time() + $fresh['expires_in'],
        ]), LOCK_EX);
        if ($written !== false) {
            @chmod($cacheFile, 0600);
        }

        return $fresh['token'];
    }

    /** @return array{token:string,expires_in:int}|null */
    private static function refreshAccessToken(array $zoho): ?array
    {
        $accounts = rtrim((string)($zoho['accounts_url'] ?? 'https://accounts.zoho.com'), '/');
        $ch = curl_init("{$accounts}/oauth/v2/token");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'refresh_token' => (string)$zoho['refresh_token'],
            'client_id' => (string)$zoho['client_id'],
            'client_secret' => (string)$zoho['client_secret'],
            'grant_type' => 'refresh_token',
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode((string)$response, true);
        $token = is_array($data) ? (string)($data['access_token'] ?? '') : '';
        if ($token === '') {
            self::logFailure('token', ['status' => 0, 'body' => $response]);
            return null;
        }
        return ['token' => $token, 'expires_in' => max(60, (int)($data['expires_in'] ?? 3600))];
    }

    // Zoho answers 200/201 even when a record is rejected; the per-record
    // status in the body says whether it was actually saved.
    private static function recordSucceeded(array $result): bool
    {
        $status = (int)($result['status'] ?? 500);
        if ($status < 200 || $status >= 300) {
            return false;
        }
        $body = json_decode((string)($result['body'] ?? ''), true);
        return is_array($body) && strtolower((string)($body['data'][0]['status'] ?? '')) === 'success';
    }

    // Writes Zoho's reason to the PHP error log so a rejected lead can be diagnosed.
    private static function logFailure(string $step, array $result): void
    {
        error_log(sprintf(
            '[ZohoCrm] %s failed (HTTP %s): %s',
            $step,
            (string)($result['status'] ?? '?'),
            substr((string)($result['body'] ?? ''), 0, 800)
        ));
    }

    /** @return array{status:int,id:?string} */
    private static function findLeadIdByEmail(string $apiDomain, string $token, string $email): array
    {
        if ($email === '') {
            return ['status' => 204, 'id' => null];
        }

        $url = $apiDomain . '/crm/v2/Leads/search?' . http_build_query([
            'email' => $email,
        ]);
        $result = self::request('GET', $url, $token);
        $status = (int)($result['status'] ?? 500);
        if ($status === 204) {
            return ['status' => 204, 'id' => null];
        }
        if ($status >= 300) {
            self::logFailure('search', $result);
        }

        $body = json_decode((string)($result['body'] ?? ''), true);
        $id = is_array($body) ? (string)($body['data'][0]['id'] ?? '') : '';
        return ['status' => $status, 'id' => $id !== '' ? $id : null];
    }

    private static function request(string $method, string $url, string $token, ?array $payload = null): array
    {
        $ch = curl_init($url);
        $headers = [
            'Authorization: Zoho-oauthtoken ' . $token,
            'Content-Type: application/json',
        ];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        if ($payload !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        }
        $response = curl_exec($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return ['status' => $status, 'body' => $response];
    }
}
