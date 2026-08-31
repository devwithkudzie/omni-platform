<?php
// cms/test-login.php
// Test script to verify login functionality

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

echo "=== Login Test ===\n\n";

// Test database connection
try {
    $pdo = get_pdo();
    echo "✅ Database connection: OK\n\n";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Check if admin exists
$email = 'admin@omnicontact.co.za';
$stmt = $pdo->prepare('SELECT id, email, name, role, password_hash FROM admins WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$admin = $stmt->fetch();

if (!$admin) {
    echo "❌ Admin user not found!\n";
    echo "Run: php cms/setup-admin.php\n";
    exit(1);
}

echo "✅ Admin user found:\n";
echo "   Email: {$admin['email']}\n";
echo "   Name: " . ($admin['name'] ?? 'N/A') . "\n";
echo "   Role: {$admin['role']}\n\n";

// Test password verification
$testPassword = 'admin123';
if (password_verify($testPassword, $admin['password_hash'])) {
    echo "✅ Password verification: OK (password 'admin123' works)\n\n";
} else {
    echo "❌ Password verification: FAILED\n";
    echo "   The password 'admin123' does not match the stored hash.\n";
    echo "   Run: php cms/setup-admin.php\n\n";
}

// Test session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$_SESSION['admin_id'] = $admin['id'];
echo "✅ Session test: OK (admin_id = {$admin['id']})\n\n";

echo "=== Test Complete ===\n";
echo "\nTo fix login issues:\n";
echo "1. Make sure PHP server is running: php -S localhost:8000 -t .\n";
echo "2. Make sure React dev server is running: npm run dev\n";
echo "3. Check browser console for CORS errors\n";
echo "4. Verify admin exists: php cms/setup-admin.php\n";
