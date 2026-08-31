<?php
// cms/fix-cors.php
// Script to fix CORS headers in all admin API files for local development

$adminApiDir = __DIR__ . '/api/admin';
$files = [
    'blogs.php',
    'users.php',
    'account.php',
    'upload.php',
    'notifications.php',
    'notifications/count.php',
    'blogs/approve.php',
];

$corsCode = <<<'PHP'
// CORS: Allow localhost for development, production domain for production
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
PHP

;

foreach ($files as $file) {
    $filePath = $adminApiDir . '/' . $file;
    if (!file_exists($filePath)) {
        echo "⚠️  File not found: $file\n";
        continue;
    }
    
    $content = file_get_contents($filePath);
    
    // Replace old CORS header
    $content = preg_replace(
        "/header\('Access-Control-Allow-Origin: https:\/\/omnicontact\.biz'\);/",
        $corsCode,
        $content
    );
    
    file_put_contents($filePath, $content);
    echo "✅ Fixed: $file\n";
}

echo "\n✅ CORS headers updated for local development!\n";
