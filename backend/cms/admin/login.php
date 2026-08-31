<?php
// cms/admin/login.php
require_once __DIR__ . '/../db.php';

$pdo = get_pdo();
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($email && $password) {
        $stmt = $pdo->prepare('SELECT id, password_hash FROM admins WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $admin = $stmt->fetch();

        if ($admin && password_verify($password, $admin['password_hash'])) {
            $_SESSION['admin_id'] = $admin['id'];
            header('Location: /cms/admin/blogs.php');
            exit;
        } else {
            $error = 'Invalid credentials';
        }
    } else {
        $error = 'Email and password are required';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin Login - OmniContact CMS</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f4f5f7; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; }
    .card { background:white; padding:2rem; border-radius:12px; box-shadow:0 10px 30px rgba(15,23,42,0.18); width:100%; max-width:380px; }
    h1 { margin:0 0 1.5rem; font-size:1.5rem; text-align:center; }
    label { display:block; margin-bottom:0.25rem; font-size:0.9rem; color:#4b5563; }
    input { width:100%; padding:0.6rem 0.75rem; border-radius:8px; border:1px solid #d1d5db; margin-bottom:1rem; font-size:0.95rem; }
    button { width:100%; padding:0.7rem 1rem; border:none; border-radius:999px; background:#111827; color:white; font-weight:600; cursor:pointer; font-size:0.95rem; }
    button:hover { background:#000; }
    .error { color:#b91c1c; background:#fee2e2; border-radius:8px; padding:0.5rem 0.75rem; margin-bottom:1rem; font-size:0.85rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>OmniContact Admin</h1>
    <?php if ($error): ?>
      <div class="error"><?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></div>
    <?php endif; ?>
    <form method="post" action="login.php">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" required autocomplete="username" />

      <label for="password">Password</label>
      <input type="password" id="password" name="password" required autocomplete="current-password" />

      <button type="submit">Sign In</button>
    </form>
  </div>
</body>
</html>
