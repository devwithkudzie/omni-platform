<?php

$env = static function (string $key, string $default = ''): string {
    $value = getenv($key);
    if ($value !== false && $value !== '') {
        return $value;
    }

    if (defined($key)) {
        $constant = constant($key);
        return is_scalar($constant) ? (string)$constant : $default;
    }

    return $default;
};

$csv = static function (string $value): array {
    return array_values(array_filter(array_map('trim', explode(',', $value))));
};

return [
    'env' => $env('APP_ENV', 'local'),
    'url' => $env('APP_URL', 'http://127.0.0.1:8080'),
    'base_url' => $env('BASE_URL', 'https://omnicontact.biz'),
    'jwt_secret' => $env('JWT_SECRET', 'local-dev-change-me'),
    'allowed_origins' => $csv($env(
        'ALLOWED_ORIGINS',
        'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:3002,http://127.0.0.1:3002,http://localhost:3003,http://127.0.0.1:3003,http://localhost:3004,http://127.0.0.1:3004,http://localhost:3005,http://127.0.0.1:3005,http://localhost:3006,http://127.0.0.1:3006,https://omnicontact.biz,https://www.omnicontact.biz,https://yamurai.com,https://www.yamurai.com'
    )),
    'db' => [
        'host' => $env('DB_HOST', 'localhost'),
        'name' => $env('DB_NAME', 'omnicontact_website'),
        'user' => $env('DB_USER', 'omnicontact'),
        'pass' => $env('DB_PASS', ''),
    ],
    'mail' => [
        'tenant_id' => $env('TENANT_ID', ''),
        'client_id' => $env('CLIENT_ID', ''),
        'client_secret' => $env('CLIENT_SECRET', ''),
        'service_account' => $env('SERVICE_ACCOUNT', 'forms@omnicontact.biz'),
    ],
    'contact' => [
        'to_zw' => $env('CONTACT_TO_ZW', 'info@omnicontact.biz'),
        'to_za' => $env('CONTACT_TO_ZA', 'info@omnicontact.biz'),
        'cc' => $env('CONTACT_CC', 'kudzai.mukungu@omnicontact.biz'),
    ],
    'zoho' => [
        'client_id' => $env('ZOHO_CLIENT_ID', ''),
        'client_secret' => $env('ZOHO_CLIENT_SECRET', ''),
        'refresh_token' => $env('ZOHO_REFRESH_TOKEN', ''),
        'accounts_url' => $env('ZOHO_ACCOUNTS_URL', 'https://accounts.zoho.com'),
        'api_domain' => $env('ZOHO_API_DOMAIN', 'https://www.zohoapis.com'),
        'lead_source' => $env('ZOHO_LEAD_SOURCE', 'MaaS Digital Marketing Health Check'),
        // API names of the Lead fields in the "Digital Marketing Health Check"
        // section of the Zoho Leads layout. Set one to "-" to stop writing it.
        'field_map' => [
            'overall_score' => $env('ZOHO_FIELD_OVERALL_SCORE', 'Health_Check_Score'),
            'category' => $env('ZOHO_FIELD_CATEGORY', 'Health_Check_Category'),
            'strategy_score' => $env('ZOHO_FIELD_STRATEGY_SCORE', 'Strategy_Direction_Score'),
            'visibility_score' => $env('ZOHO_FIELD_VISIBILITY_SCORE', 'Visibility_Reach_Score'),
            'leads_score' => $env('ZOHO_FIELD_LEADS_SCORE', 'Lead_Generation_Conversion_Score'),
            'content_score' => $env('ZOHO_FIELD_CONTENT_SCORE', 'Content_Engagement_Score'),
            'measurement_score' => $env('ZOHO_FIELD_MEASUREMENT_SCORE', 'Measurement_Optimisation_Score'),
            'completed_date' => $env('ZOHO_FIELD_COMPLETED_DATE', 'Health_Check_Completed_Date'),
            'challenge' => $env('ZOHO_FIELD_CHALLENGE', 'Marketing_Challenge'),
            'next_steps' => $env('ZOHO_FIELD_NEXT_STEPS', 'Recommended_Next_Steps'),
            'email_opt_in' => $env('ZOHO_FIELD_EMAIL_OPT_IN', 'Email_Op_In'),
            'lead_source_tag' => $env('ZOHO_FIELD_LEAD_SOURCE_TAG', ''),
        ],
    ],
    'paynow' => [
        'id' => $env('PAYNOW_ID'),
        'key' => $env('PAYNOW_KEY'),
        'merchant_email' => $env('PAYNOW_MERCHANT_EMAIL'),
    ],
    'bulk_airtime' => [
        'client_id' => $env('BULKAIRTIME_CLIENTID'),
        'client_secret' => $env('BULKAIRTIME_CLIENTSECRET'),
        'api_key' => $env('BULKAIRTIME_APIKEY'),
        'base_url' => $env('BULKAIRTIME_BASE_URL', 'https://bulkairtime.omnicontact.biz/api/v1/obad/gateway/'),
        'max_amount' => (float) $env('AIRTIME_MAX_AMOUNT', '500'),
    ],
    'facebook' => [
        'app_id' => $env('FB_APP_ID'),
        'app_secret' => $env('FB_APP_SECRET'),
        'page_id' => $env('FB_PAGE_ID'),
        'page_access_token' => $env('FB_PAGE_ACCESS_TOKEN'),
        'graph_version' => $env('FB_GRAPH_VERSION', 'v19.0'),
        'social_cron_token' => $env('SOCIAL_CRON_TOKEN'),
    ],
];
