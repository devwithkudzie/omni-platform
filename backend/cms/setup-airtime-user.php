<?php
/**
 * One-time web form to create the first airtime dashboard user.
 * Visit: http://localhost:8000/cms/setup-airtime-user.php
 * Or: https://yourdomain.com/cms/setup-airtime-user.php
 *
 * DELETE this file after creating your user (security).
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$message = '';
$error = '';
$usersExist = false;

// Check if table exists and if users already exist – block creating more once users exist
$tableExists = false;
try {
    $pdo = get_pdo();
    $pdo->query('SELECT 1 FROM airtime_users LIMIT 1');
    $tableExists = true;
    $usersExist = ((int) $pdo->query('SELECT COUNT(*) FROM airtime_users')->fetchColumn()) > 0;
} catch (Throwable $e) {
    $error = 'airtime_users table not found. Run migrations first: add_airtime_users.sql';
}

if ($usersExist) {
    $error = 'Users already exist. Delete this file (setup-airtime-user.php) for security.';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$usersExist) {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $name = trim($_POST['name'] ?? 'Airtime Manager');

    if (!$email || !$password) {
        $error = 'Email and password are required.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters.';
    } else {
        try {
            $pdo = get_pdo();
            $hash = password_hash($password, PASSWORD_DEFAULT);
            try {
                $stmt = $pdo->prepare('INSERT INTO airtime_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)');
                $stmt->execute([$email, $hash, $name ?: 'Airtime Manager', 'admin']);
            } catch (PDOException $e) {
                $stmt = $pdo->prepare('INSERT INTO airtime_users (email, password_hash, name) VALUES (?, ?, ?)');
                $stmt->execute([$email, $hash, $name ?: 'Airtime Manager']);
            }
            $message = "Airtime user created: $email. You can now log in at /airtime/login. Delete this file for security.";
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                $error = 'A user with that email already exists.';
            } else {
                $error = 'Database error: ' . $e->getMessage();
            }
        }
    }
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Airtime User</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 400px; margin: 60px auto; padding: 20px; }
        h1 { font-size: 1.25rem; }
        label { display: block; margin-top: 12px; font-weight: 500; }
        input { width: 100%; padding: 8px 12px; margin-top: 4px; box-sizing: border-box; }
        button { margin-top: 16px; padding: 10px 20px; background: #1a237e; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
        button:hover { background: #283593; }
        .msg { margin-top: 16px; padding: 12px; border-radius: 6px; }
        .success { background: #d1fae5; color: #065f46; }
        .error { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <h1>Create Airtime Dashboard User</h1>
    <?php if ($message): ?>
        <div class="msg success"><?= htmlspecialchars($message) ?></div>
    <?php elseif ($error): ?>
        <div class="msg error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>
    <?php if (!$message && $tableExists && !$usersExist): ?>
    <form method="post">
        <label>Email</label>
        <input type="email" name="email" required placeholder="airtime@omnicontact.biz">
        <label>Password</label>
        <input type="password" name="password" required minlength="6" placeholder="At least 6 characters">
        <label>Name (optional)</label>
        <input type="text" name="name" placeholder="Airtime Manager">
        <button type="submit">Create User</button>
    </form>
    <?php endif; ?>
</body>
</html>
