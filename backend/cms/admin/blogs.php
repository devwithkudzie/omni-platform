<?php
// cms/admin/blogs.php
require_once __DIR__ . '/../db.php';
require_admin();

$pdo = get_pdo();

// Simple list of blogs (no pagination yet)
$stmt = $pdo->query('SELECT id, slug, title, status, created_at, updated_at FROM blogs ORDER BY created_at DESC');
$blogs = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Blogs - OmniContact CMS</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f4f5f7; margin:0; }
    header { background:#111827; color:white; padding:1rem 1.5rem; display:flex; align-items:center; justify-content:space-between; }
    header h1 { margin:0; font-size:1.25rem; }
    header a { color:#e5e7eb; text-decoration:none; font-size:0.9rem; }
    main { padding:1.5rem; max-width:960px; margin:0 auto; }
    table { width:100%; border-collapse:collapse; background:white; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(15,23,42,0.06); }
    th, td { padding:0.75rem 1rem; font-size:0.9rem; text-align:left; }
    th { background:#f3f4f6; font-weight:600; color:#4b5563; }
    tr:nth-child(even) td { background:#f9fafb; }
    .badge { display:inline-block; padding:0.15rem 0.6rem; border-radius:999px; font-size:0.75rem; }
    .badge--published { background:#dcfce7; color:#166534; }
    .badge--draft { background:#fee2e2; color:#991b1b; }
  </style>
</head>
<body>
  <header>
    <h1>Blogs</h1>
    <div>
      <a href="/cms/admin/logout.php">Logout</a>
    </div>
  </header>

  <main>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Slug</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($blogs as $blog): ?>
          <tr>
            <td><?php echo (int)$blog['id']; ?></td>
            <td><?php echo htmlspecialchars($blog['title'], ENT_QUOTES, 'UTF-8'); ?></td>
            <td><?php echo htmlspecialchars($blog['slug'], ENT_QUOTES, 'UTF-8'); ?></td>
            <td>
              <?php if ($blog['status'] === 'published'): ?>
                <span class="badge badge--published">Published</span>
              <?php else: ?>
                <span class="badge badge--draft">Draft</span>
              <?php endif; ?>
            </td>
            <td><?php echo htmlspecialchars($blog['created_at'], ENT_QUOTES, 'UTF-8'); ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </main>
</body>
</html>
