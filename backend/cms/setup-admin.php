<?php
// cms/setup-admin.php
// Script to create or update admin user
// Usage: Visit this file in browser or run via CLI: php setup-admin.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

// Default admin credentials (change these!)
$adminEmail = 'admin@omnicontact.co.za';
$adminName = 'Kudzaishe Prosper Mukungurutse';
$adminPassword = 'admin123'; // CHANGE THIS PASSWORD!
$adminRole = 'super_admin';

// Allow override via POST or CLI arguments
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $adminEmail = $_POST['email'] ?? $adminEmail;
    $adminName = $_POST['name'] ?? $adminName;
    $adminPassword = $_POST['password'] ?? $adminPassword;
    $adminRole = $_POST['role'] ?? $adminRole;
} elseif (php_sapi_name() === 'cli') {
    // CLI mode - allow arguments
    $options = getopt('', ['email:', 'name:', 'password:', 'role:']);
    $adminEmail = $options['email'] ?? $adminEmail;
    $adminName = $options['name'] ?? $adminName;
    $adminPassword = $options['password'] ?? $adminPassword;
    $adminRole = $options['role'] ?? $adminRole;
}

try {
    $pdo = get_pdo();
    
    // Check if admin exists
    $stmt = $pdo->prepare('SELECT id, email FROM admins WHERE email = ? LIMIT 1');
    $stmt->execute([$adminEmail]);
    $existing = $stmt->fetch();
    
    // Generate password hash
    $passwordHash = password_hash($adminPassword, PASSWORD_DEFAULT);
    
    if ($existing) {
        // Update existing admin
        $stmt = $pdo->prepare('UPDATE admins SET password_hash = ?, name = ?, role = ? WHERE email = ?');
        $stmt->execute([$passwordHash, $adminName, $adminRole, $adminEmail]);
        $action = 'updated';
    } else {
        // Create new admin
        $stmt = $pdo->prepare('INSERT INTO admins (email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, NOW())');
        $stmt->execute([$adminEmail, $passwordHash, $adminName, $adminRole]);
        $action = 'created';
    }
    
    if (php_sapi_name() === 'cli') {
        // CLI output
        echo "✅ Admin account {$action} successfully!\n";
        echo "Email: {$adminEmail}\n";
        echo "Name: {$adminName}\n";
        echo "Role: {$adminRole}\n";
        echo "Password: {$adminPassword}\n";
        echo "\n⚠️  Remember to change the password after first login!\n";
    } else {
        // Web output
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <title>Admin Setup - <?php echo $action === 'created' ? 'Created' : 'Updated'; ?></title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    max-width: 600px; 
                    margin: 50px auto; 
                    padding: 20px; 
                    background: #f5f7fb;
                }
                .success-box { 
                    background: #d1fae5; 
                    border: 2px solid #10b981; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 20px 0;
                }
                .info-box {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .info-box h3 {
                    margin-top: 0;
                    color: #1a237e;
                }
                .info-item {
                    margin: 10px 0;
                    padding: 8px;
                    background: #f8fafc;
                    border-radius: 4px;
                }
                .info-item strong {
                    color: #475569;
                    display: inline-block;
                    width: 100px;
                }
                .warning {
                    background: #fef3c7;
                    border: 1px solid #f59e0b;
                    padding: 15px;
                    border-radius: 4px;
                    margin: 20px 0;
                    color: #92400e;
                }
                .button {
                    display: inline-block;
                    background: #1a237e;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin-top: 20px;
                }
                .button:hover {
                    background: #283593;
                }
            </style>
        </head>
        <body>
            <div class="success-box">
                <h2>✅ Admin Account <?php echo ucfirst($action); ?> Successfully!</h2>
            </div>
            
            <div class="info-box">
                <h3>Admin Credentials</h3>
                <div class="info-item">
                    <strong>Email:</strong> <?php echo htmlspecialchars($adminEmail); ?>
                </div>
                <div class="info-item">
                    <strong>Name:</strong> <?php echo htmlspecialchars($adminName); ?>
                </div>
                <div class="info-item">
                    <strong>Role:</strong> <?php echo htmlspecialchars($adminRole); ?>
                </div>
                <div class="info-item">
                    <strong>Password:</strong> <?php echo htmlspecialchars($adminPassword); ?>
                </div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Security Warning:</strong>
                <ul>
                    <li>Change the password immediately after first login!</li>
                    <li>Delete or secure this file after use</li>
                    <li>Never commit passwords to version control</li>
                </ul>
            </div>
            
            <a href="/admin/login" class="button">Go to Admin Login</a>
        </body>
        </html>
        <?php
    }
    
} catch (Exception $e) {
    $error = $e->getMessage();
    
    if (php_sapi_name() === 'cli') {
        echo "❌ Error: {$error}\n";
        exit(1);
    } else {
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <title>Admin Setup - Error</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    max-width: 600px; 
                    margin: 50px auto; 
                    padding: 20px; 
                }
                .error-box { 
                    background: #fee2e2; 
                    border: 2px solid #ef4444; 
                    padding: 20px; 
                    border-radius: 8px; 
                    color: #991b1b;
                }
            </style>
        </head>
        <body>
            <div class="error-box">
                <h2>❌ Error</h2>
                <p><?php echo htmlspecialchars($error); ?></p>
                <p>Please check:</p>
                <ul>
                    <li>Database connection settings in config.php</li>
                    <li>Database exists and admins table is created</li>
                    <li>Database user has proper permissions</li>
                </ul>
            </div>
        </body>
        </html>
        <?php
    }
}
?>
