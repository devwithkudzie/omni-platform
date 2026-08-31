<?php
/**
 * PayNow hash verification test.
 * Run: php paynow_hash_test.php (CLI only)
 *
 * Verifies that our hash calculation matches PayNow's expected format.
 * Uses the example from https://developers.paynow.co.zw/docs/generating_hash.html
 */
require_once __DIR__ . '/require_cli.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/vendor/autoload.php';

// PayNow docs example
$exampleValues = [
    'id' => '1201',
    'reference' => 'TEST REF',
    'amount' => '99.99',
    'additionalinfo' => 'A test ticket transaction',
    'returnurl' => 'http://www.google.com/search?q=returnurl',
    'resulturl' => 'http://www.google.com/search?q=resulturl',
    'status' => 'Message',
];
$exampleKey = '3e9fed89-60e1-4ce5-ab6e-6b1eb2d4f977';
$expectedHash = '2A033FC38798D913D42ECB786B9B19645ADEDBDE788862032F1BD82CF3B92DEF84F316385D5B40DBB35F1A4FD7D5BFE73835174136463CDD48C9366B0749C689';

$computed = \Paynow\Util\Hash::make($exampleValues, $exampleKey);

echo "PayNow hash verification test\n";
echo "==============================\n";
echo "Expected: $expectedHash\n";
echo "Computed: $computed\n";
echo "Match: " . ($computed === $expectedHash ? 'YES' : 'NO') . "\n\n";

// Test with your config
$yourKey = trim(cms_config_string('paynow.key'));
$yourId = trim(cms_config_string('paynow.id'));
if ($yourKey && $yourId) {
    echo "Your config: PAYNOW_ID=$yourId, PAYNOW_KEY=" . substr($yourKey, 0, 8) . "...\n";
    echo "Ensure the Integration Key in PayNow dashboard matches exactly (no extra spaces).\n";
    echo "For mobile (EcoCash, OneMoney, InnBucks, O'mari), the integration must have those payment methods enabled.\n";
} else {
    echo "No PAYNOW_KEY/PAYNOW_ID in backend/config/app.php - add them to test.\n";
}
