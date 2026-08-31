<?php
// cms/fb-config-test.php
// Simple diagnostic – CLI only. Run: php cms/fb-config-test.php
require_once __DIR__ . '/require_cli.php';
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'FB_APP_ID'      => cms_config_string('facebook.app_id') ? 'set' : 'missing',
    'FB_APP_SECRET'  => cms_config_string('facebook.app_secret') ? 'set' : 'missing',
    'FB_PAGE_ID'     => cms_config_string('facebook.page_id') ?: null,
    'HAS_PAGE_TOKEN' => cms_config_string('facebook.page_access_token') ? true : false,
    'GRAPH_VERSION'  => cms_config_string('facebook.graph_version') ?: null,
], JSON_PRETTY_PRINT);
