<?php
// cms/api/blogs.php
// Public JSON API for blogs (for React frontend)

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display, but log
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // adjust for production if needed

try {
    require_once __DIR__ . '/../db.php';
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to load database configuration',
        'message' => $e->getMessage()
    ]);
    exit;
}

try {
    $pdo = get_pdo();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database connection failed',
        'message' => $e->getMessage()
    ]);
    exit;
}

$slug = isset($_GET['slug']) ? trim($_GET['slug']) : null;

try {
    if ($slug) {
        // Get single blog - must be published AND approved
        // Handle NULL approval_status for backward compatibility (treat as approved)
        // Always show "admin" as author for published blogs
        $stmt = $pdo->prepare('
            SELECT id, slug, title, feature_image, excerpt, content, status, created_at, updated_at 
            FROM blogs 
            WHERE slug = ? 
              AND status = "published" 
              AND (approval_status = "approved" OR approval_status IS NULL)
              AND (scheduled_publish_at IS NULL OR scheduled_publish_at <= NOW())
            LIMIT 1
        ');
        $stmt->execute([$slug]);
        $blog = $stmt->fetch();
        if (!$blog) {
            http_response_code(404);
            echo json_encode(['error' => 'Blog not found']);
            exit;
        }
        // Always set author to "admin" for published blogs
        $blog['author'] = 'admin';
        echo json_encode($blog);
    } else {
        // Get all blogs - must be published AND approved
        // Order by most recent first (scheduled_publish_at if set, otherwise created_at)
        // Handle NULL approval_status for backward compatibility (treat as approved)
        // Always show "admin" as author for published blogs
        $stmt = $pdo->query('
            SELECT id, slug, title, feature_image, excerpt, status, created_at, scheduled_publish_at
            FROM blogs 
            WHERE status = "published" 
              AND (approval_status = "approved" OR approval_status IS NULL)
              AND (scheduled_publish_at IS NULL OR scheduled_publish_at <= NOW())
            ORDER BY 
              COALESCE(scheduled_publish_at, created_at) DESC,
              id DESC
        ');
        $blogs = $stmt->fetchAll();
        // Always set author to "admin" for published blogs
        foreach ($blogs as &$blog) {
            $blog['author'] = 'admin';
        }
        echo json_encode($blogs);
    }
} catch (Throwable $e) {
    http_response_code(500);
    // Log error for debugging (remove in production if needed)
    error_log('Blogs API Error: ' . $e->getMessage());
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage(), // Remove this in production for security
    ]);
}
