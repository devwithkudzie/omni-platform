<?php
// cms/api/admin/blogs.php
// Admin JSON endpoint for managing blogs (list, create, update, delete, toggle status)

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../notifications.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');
// CORS: Allow localhost for development, production domain for production
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://omnicontact.biz',
    'https://www.omnicontact.biz',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000');
}
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (!is_admin_logged_in()) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

function json_input()
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

try {
    $pdo = get_pdo();

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        // Get current user role for filtering
        $stmt = $pdo->prepare('SELECT role FROM admins WHERE id = ? LIMIT 1');
        $stmt->execute([$_SESSION['admin_id']]);
        $currentUser = $stmt->fetch();
        $userRole = $currentUser['role'] ?? 'author';
        
        // Get blogs with author information via JOIN
        $stmt = $pdo->query('
            SELECT 
                b.id, 
                b.author_id, 
                b.slug, 
                b.title, 
                b.feature_image, 
                b.excerpt, 
                b.content, 
                b.status, 
                b.approval_status, 
                b.scheduled_publish_at, 
                b.approved_by, 
                b.approved_at, 
                b.created_at, 
                b.updated_at,
                a.name as author_name,
                a.email as author_email
            FROM blogs b
            LEFT JOIN admins a ON b.author_id = a.id
            ORDER BY b.created_at DESC
        ');
        $blogs = $stmt->fetchAll();
        
        // Filter based on role - authors only see their own pending blogs
        if ($userRole === 'author') {
            // Authors see all blogs but can only edit their own
            // This filtering can be done in the frontend if needed
        }
        
        echo json_encode($blogs);
        exit;
    }

    if ($method === 'POST') {
        // Get current user role
        $stmt = $pdo->prepare('SELECT role FROM admins WHERE id = ? LIMIT 1');
        $stmt->execute([$_SESSION['admin_id']]);
        $currentUser = $stmt->fetch();
        $userRole = $currentUser['role'] ?? 'author';
        
        $body = json_input();
        $title = trim($body['title'] ?? '');
        $slug  = trim($body['slug'] ?? '');
        $excerpt = trim($body['excerpt'] ?? '');
        $content = $body['content'] ?? '';
        $featureImage = trim($body['feature_image'] ?? '');
        $status = in_array($body['status'] ?? 'draft', ['draft', 'published', 'archived'], true) ? $body['status'] : 'draft';
        $scheduledPublishAt = !empty($body['scheduled_publish_at']) ? $body['scheduled_publish_at'] : null;
        
        // Approval workflow: authors need approval, managers and super_admins auto-approve
        $approvalStatus = 'pending';
        $approvedBy = null;
        $approvedAt = null;
        
        if (in_array($userRole, ['super_admin', 'manager'])) {
            $approvalStatus = 'approved';
            $approvedBy = $_SESSION['admin_id'];
            $approvedAt = date('Y-m-d H:i:s');
        }

        if ($title === '' || $slug === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Title and slug are required']);
            exit;
        }

        $stmt = $pdo->prepare('INSERT INTO blogs (author_id, slug, title, feature_image, excerpt, content, status, approval_status, scheduled_publish_at, approved_by, approved_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');
        $stmt->execute([$_SESSION['admin_id'], $slug, $title, $featureImage, $excerpt, $content, $status, $approvalStatus, $scheduledPublishAt, $approvedBy, $approvedAt]);

        $id = (int)$pdo->lastInsertId();
        
        // Notify managers if author created a blog that needs approval
        if ($userRole === 'author' && $approvalStatus === 'pending') {
            $stmt = $pdo->prepare('SELECT name, email FROM admins WHERE id = ? LIMIT 1');
            $stmt->execute([$_SESSION['admin_id']]);
            $author = $stmt->fetch();
            $authorName = $author['name'] ?: $author['email'];
            notify_managers_new_blog($id, $title, $authorName);
        }
        
        http_response_code(201);
        echo json_encode(['id' => $id]);
        exit;
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            exit;
        }

        $body = json_input();
        $fields = [];
        $values = [];

        if (array_key_exists('title', $body)) {
            $fields[] = 'title = ?';
            $values[] = trim($body['title']);
        }
        if (array_key_exists('slug', $body)) {
            $fields[] = 'slug = ?';
            $values[] = trim($body['slug']);
        }
        if (array_key_exists('excerpt', $body)) {
            $fields[] = 'excerpt = ?';
            $values[] = trim($body['excerpt']);
        }
        if (array_key_exists('content', $body)) {
            $fields[] = 'content = ?';
            $values[] = $body['content'];
        }
        if (array_key_exists('feature_image', $body)) {
            $fields[] = 'feature_image = ?';
            $values[] = trim($body['feature_image']);
        }
        if (array_key_exists('status', $body)) {
            $status = in_array($body['status'], ['draft', 'published', 'archived'], true) ? $body['status'] : 'draft';
            $fields[] = 'status = ?';
            $values[] = $status;
        }
        if (array_key_exists('approval_status', $body)) {
            // Only managers and super_admins can change approval status
            $stmt = $pdo->prepare('SELECT role FROM admins WHERE id = ? LIMIT 1');
            $stmt->execute([$_SESSION['admin_id']]);
            $currentUser = $stmt->fetch();
            $userRole = $currentUser['role'] ?? 'author';
            
            if (in_array($userRole, ['super_admin', 'manager'])) {
                $approvalStatus = in_array($body['approval_status'], ['pending', 'approved', 'rejected'], true) 
                    ? $body['approval_status'] 
                    : 'pending';
                $fields[] = 'approval_status = ?';
                $values[] = $approvalStatus;
                
                if ($approvalStatus === 'approved') {
                    $fields[] = 'approved_by = ?';
                    $values[] = $_SESSION['admin_id'];
                    $fields[] = 'approved_at = NOW()';
                }
            }
        }
        if (array_key_exists('scheduled_publish_at', $body)) {
            $fields[] = 'scheduled_publish_at = ?';
            $values[] = !empty($body['scheduled_publish_at']) ? $body['scheduled_publish_at'] : null;
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }

        $fields[] = 'updated_at = NOW()';
        $sql = 'UPDATE blogs SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $values[] = $id;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);

        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            exit;
        }

        $stmt = $pdo->prepare('DELETE FROM blogs WHERE id = ?');
        $stmt->execute([$id]);

        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
