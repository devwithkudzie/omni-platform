<?php
// cms/reset-admin-password.php
// One-time script to reset admin password
// DELETE THIS FILE after use for security!

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

// Set your target account and temporary password here.
$adminEmail = 'admin@omnicontact.biz';
$newPassword = 'admin123'; // CHANGE THIS!

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $adminEmail = $_POST['email'] ?? $adminEmail;
    $newPassword = $_POST['password'] ?? $newPassword;
} elseif (php_sapi_name() === 'cli') {
    $options = getopt('', ['email:', 'password:']);
    $adminEmail = $options['email'] ?? $adminEmail;
    $newPassword = $options['password'] ?? $newPassword;
}

try {
    $pdo = get_pdo();
    
    // Generate password hash
    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Update admin password
    $stmt = $pdo->prepare('UPDATE admins SET password_hash = ? WHERE email = ?');
    $stmt->execute([$passwordHash, $adminEmail]);
    
    if ($stmt->rowCount() > 0) {
        if (php_sapi_name() === 'cli') {
            echo "Password reset successful!\n";
            echo "Email: {$adminEmail}\n";
            echo "New Password: {$newPassword}\n";
            echo "Delete or secure this file after use.\n";
        } else {
            echo "<h2>Password Reset Successful!</h2>";
            echo "<p><strong>Email:</strong> " . htmlspecialchars($adminEmail) . "</p>";
            echo "<p><strong>New Password:</strong> " . htmlspecialchars($newPassword) . "</p>";
            echo "<p style='color: red;'><strong>DELETE THIS FILE NOW for security!</strong></p>";
        }
    } else {
        if (php_sapi_name() === 'cli') {
            echo "Admin user not found or password not updated.\n";
            exit(1);
        }
        echo "<h2>Error</h2>";
        echo "<p>Admin user not found or password not updated.</p>";
    }
    
} catch (Exception $e) {
    if (php_sapi_name() === 'cli') {
        echo "Error: {$e->getMessage()}\n";
        exit(1);
    }
    echo "<h2>Error</h2>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
}

// Show form if GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Reset Admin Password</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            form { background: #f5f5f5; padding: 20px; border-radius: 8px; }
            input[type="password"] { width: 100%; padding: 10px; margin: 10px 0; }
            button { background: #1a237e; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #283593; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <h2>Reset Admin Password</h2>
        <div class="warning">
            <strong>⚠️ Security Warning:</strong> Delete this file immediately after use!
        </div>
        <form method="POST">
            <label>Admin Email:</label>
            <input type="email" name="email" value="<?php echo htmlspecialchars($adminEmail); ?>" required>
            <label>New Password:</label>
            <input type="password" name="password" value="<?php echo htmlspecialchars($newPassword); ?>" required>
            <button type="submit">Reset Password</button>
        </form>
    </body>
    </html>
    <?php
}
?>
