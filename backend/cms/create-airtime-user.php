<?php
/**
 * One-time script to create the first airtime dashboard user.
 * Run from project root: php cms/create-airtime-user.php airtime@omnicontact.biz admin123
 *
 * SECURITY: CLI only. Do not expose via web.
 * If you get "could not find driver", PHP's pdo_mysql extension is disabled.
 * Use the SQL method instead: run cms/generate-airtime-hash.php for a hash,
 * then cms/migrations/add_airtime_user.sql in phpMyAdmin.
 */

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    header('Content-Type: text/plain');
    exit('This script can only be run from the command line.');
}

require_once __DIR__ . '/db.php';

$email = $argv[1] ?? null;
$password = $argv[2] ?? null;

if (!$email || !$password) {
    echo "Usage: php create-airtime-user.php <email> <password>\n";
    echo "Example: php create-airtime-user.php airtime@omnicontact.biz MySecurePass123\n";
    exit(1);
}

try {
    $pdo = get_pdo();
    $hash = password_hash($password, PASSWORD_DEFAULT);
    try {
        $stmt = $pdo->prepare('INSERT INTO airtime_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)');
        $stmt->execute([trim($email), $hash, 'Airtime Manager', 'admin']);
    } catch (PDOException $e) {
        $stmt = $pdo->prepare('INSERT INTO airtime_users (email, password_hash, name) VALUES (?, ?, ?)');
        $stmt->execute([trim($email), $hash, 'Airtime Manager']);
    }
    echo "Airtime user created: $email\n";
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo "User with that email already exists.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
    exit(1);
}
