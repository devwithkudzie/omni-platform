<?php
/**
 * Generate password hash for airtime user (no database needed).
 * Run from project root: php cms/generate-airtime-hash.php yourpassword
 * Then run the SQL in add_airtime_user.sql in phpMyAdmin.
 */
$password = $argv[1] ?? null;
if (!$password) {
    echo "Usage: php cms/generate-airtime-hash.php <password>\n";
    exit(1);
}
echo password_hash($password, PASSWORD_DEFAULT);
