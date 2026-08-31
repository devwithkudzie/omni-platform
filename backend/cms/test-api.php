<?php
// cms/test-api.php
// Quick test script to verify API and database connection
// Visit: https://omnicontact.biz/cms/test-api.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>OmniContact API Test</h2>";
echo "<pre>";

// Test 1: Check if files exist
echo "=== File Check ===\n";
$files = [
    __DIR__ . '/db.php',
    __DIR__ . '/config.php',
    __DIR__ . '/api/blogs.php',
];

foreach ($files as $file) {
    $exists = file_exists($file);
    echo ($exists ? "✅" : "❌") . " " . basename($file) . "\n";
}

// Test 2: Database connection
echo "\n=== Database Connection ===\n";
try {
    require_once __DIR__ . '/config.php';
    require_once __DIR__ . '/db.php';
    
    $pdo = get_pdo();
    echo "✅ Database connection: SUCCESS\n";
    
    // Test 3: Check tables
    echo "\n=== Database Tables ===\n";
    $tables = ['admins', 'blogs', 'notifications'];
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $result = $stmt->fetch();
            echo "✅ Table '$table': {$result['count']} records\n";
        } catch (Exception $e) {
            echo "❌ Table '$table': " . $e->getMessage() . "\n";
        }
    }
    
    // Test 4: Check blogs
    echo "\n=== Blog Status ===\n";
    $stmt = $pdo->query("SELECT status, approval_status, COUNT(*) as count FROM blogs GROUP BY status, approval_status");
    $results = $stmt->fetchAll();
    if (empty($results)) {
        echo "⚠️  No blogs in database\n";
    } else {
        foreach ($results as $row) {
            echo "  - Status: {$row['status']}, Approval: " . ($row['approval_status'] ?: 'NULL') . ", Count: {$row['count']}\n";
        }
    }
    
    // Test 5: Published blogs
    echo "\n=== Published Blogs ===\n";
    $stmt = $pdo->query("
        SELECT COUNT(*) as count 
        FROM blogs 
        WHERE status = 'published' 
          AND (approval_status = 'approved' OR approval_status IS NULL)
    ");
    $result = $stmt->fetch();
    echo "Published & approved blogs: {$result['count']}\n";
    
    // Test 6: API endpoint test
    echo "\n=== API Endpoint Test ===\n";
    $apiUrl = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/cms/api/blogs.php';
    echo "API URL: $apiUrl\n";
    
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        echo "✅ API returns: HTTP $httpCode\n";
        $data = json_decode($response, true);
        if (is_array($data)) {
            echo "✅ Response is valid JSON array with " . count($data) . " items\n";
        } else {
            echo "⚠️  Response is not a JSON array: $response\n";
        }
    } else {
        echo "❌ API returns: HTTP $httpCode\n";
        echo "Response: $response\n";
    }
    
} catch (Exception $e) {
    echo "❌ Database Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== PHP Configuration ===\n";
echo "PHP Version: " . phpversion() . "\n";
echo "Error Reporting: " . (ini_get('display_errors') ? 'ON' : 'OFF') . "\n";

echo "</pre>";
?>
