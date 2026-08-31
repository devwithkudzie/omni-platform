<?php

namespace OmniContact\Controllers;

use OmniContact\Auth\Auth;
use OmniContact\Database\Connection;
use OmniContact\Http\Request;
use OmniContact\Http\Response;
use PDO;

final class PostController
{
    public static function publicIndex(array $params, array $config): void
    {
        $pdo = Connection::make($config);
        $stmt = $pdo->query(
            "SELECT b.id, b.slug, b.title, b.feature_image, b.excerpt, b.status, b.created_at, b.scheduled_publish_at, COALESCE(a.name, a.email, 'admin') AS author
             FROM blogs b
             LEFT JOIN admins a ON a.id = b.author_id
             WHERE b.status = 'published'
               AND COALESCE(b.approval_status, 'approved') = 'approved'
               AND (b.scheduled_publish_at IS NULL OR b.scheduled_publish_at <= NOW())
             ORDER BY b.created_at DESC"
        );

        Response::json(['posts' => $stmt->fetchAll()]);
    }

    public static function publicShow(array $params, array $config): void
    {
        $pdo = Connection::make($config);
        $stmt = $pdo->prepare(
            "SELECT b.id, b.slug, b.title, b.feature_image, b.excerpt, b.content, b.status, b.created_at, b.scheduled_publish_at, COALESCE(a.name, a.email, 'admin') AS author
             FROM blogs b
             LEFT JOIN admins a ON a.id = b.author_id
             WHERE b.slug = ?
               AND b.status = 'published'
               AND COALESCE(b.approval_status, 'approved') = 'approved'
               AND (b.scheduled_publish_at IS NULL OR b.scheduled_publish_at <= NOW())
             LIMIT 1"
        );
        $stmt->execute([$params['slug']]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$post) {
            Response::error('NOT_FOUND', 'Post not found.', 404);
            return;
        }

        Response::json(['post' => $post]);
    }

    public static function adminIndex(array $params, array $config): void
    {
        Auth::admin($config);

        $pdo = Connection::make($config);
        $stmt = $pdo->query(
            'SELECT b.id, b.author_id, b.slug, b.title, b.feature_image, b.excerpt, b.content, b.status, b.approval_status, b.scheduled_publish_at, b.approved_by, b.approved_at, b.created_at, b.updated_at, a.name AS author_name, a.email AS author_email
             FROM blogs b
             LEFT JOIN admins a ON a.id = b.author_id
             ORDER BY b.created_at DESC'
        );

        Response::json(['posts' => $stmt->fetchAll()]);
    }

    public static function adminCreate(array $params, array $config): void
    {
        $admin = Auth::admin($config);
        $input = Request::json();
        $payload = self::sanitize($input);

        if ($payload['title'] === '' || $payload['slug'] === '') {
            Response::error('VALIDATION_ERROR', 'Title and slug are required.', 422);
            return;
        }

        $approvalStatus = in_array($admin['role'], ['super_admin', 'manager'], true) ? 'approved' : 'pending';
        $approvedBy = $approvalStatus === 'approved' ? $admin['id'] : null;
        $approvedAt = $approvalStatus === 'approved' ? date('Y-m-d H:i:s') : null;

        $pdo = Connection::make($config);
        $stmt = $pdo->prepare(
            'INSERT INTO blogs (author_id, slug, title, feature_image, excerpt, content, status, approval_status, scheduled_publish_at, approved_by, approved_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())'
        );
        $stmt->execute([
            $admin['id'],
            $payload['slug'],
            $payload['title'],
            $payload['feature_image'],
            $payload['excerpt'],
            $payload['content'],
            $payload['status'],
            $approvalStatus,
            $payload['scheduled_publish_at'],
            $approvedBy,
            $approvedAt,
        ]);

        Response::json(['id' => (int) $pdo->lastInsertId()], 201);
    }

    public static function adminUpdate(array $params, array $config): void
    {
        Auth::admin($config);
        $input = Request::json();
        $payload = self::sanitize($input);
        $id = (int) $params['id'];

        if ($payload['title'] === '' || $payload['slug'] === '') {
            Response::error('VALIDATION_ERROR', 'Title and slug are required.', 422);
            return;
        }

        $pdo = Connection::make($config);
        $stmt = $pdo->prepare(
            'UPDATE blogs
             SET slug = ?, title = ?, feature_image = ?, excerpt = ?, content = ?, status = ?, scheduled_publish_at = ?, updated_at = NOW()
             WHERE id = ?'
        );
        $stmt->execute([
            $payload['slug'],
            $payload['title'],
            $payload['feature_image'],
            $payload['excerpt'],
            $payload['content'],
            $payload['status'],
            $payload['scheduled_publish_at'],
            $id,
        ]);

        Response::json(['success' => true]);
    }

    public static function adminDelete(array $params, array $config): void
    {
        Auth::admin($config);

        $pdo = Connection::make($config);
        $stmt = $pdo->prepare('DELETE FROM blogs WHERE id = ?');
        $stmt->execute([(int) $params['id']]);

        Response::json(['success' => true]);
    }

    public static function adminApproval(array $params, array $config): void
    {
        $admin = Auth::admin($config);

        if (!in_array($admin['role'], ['super_admin', 'manager'], true)) {
            Response::error('FORBIDDEN', 'Only managers and super admins can approve posts.', 403);
            return;
        }

        $input = Request::json();
        $status = match ($input['action'] ?? '') {
            'approve' => 'approved',
            'reject' => 'rejected',
            default => null,
        };

        if (!$status) {
            Response::error('VALIDATION_ERROR', 'Action must be approve or reject.', 422);
            return;
        }

        $pdo = Connection::make($config);
        $stmt = $pdo->prepare('UPDATE blogs SET approval_status = ?, approved_by = ?, approved_at = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([
            $status,
            $status === 'approved' ? $admin['id'] : null,
            $status === 'approved' ? date('Y-m-d H:i:s') : null,
            (int) $params['id'],
        ]);

        Response::json(['success' => true]);
    }

    private static function sanitize(array $input): array
    {
        return [
            'title' => trim($input['title'] ?? ''),
            'slug' => trim($input['slug'] ?? ''),
            'excerpt' => trim($input['excerpt'] ?? ''),
            'content' => $input['content'] ?? '',
            'feature_image' => trim($input['feature_image'] ?? ''),
            'status' => in_array($input['status'] ?? 'draft', ['draft', 'published', 'archived'], true) ? $input['status'] : 'draft',
            'scheduled_publish_at' => !empty($input['scheduled_publish_at']) ? $input['scheduled_publish_at'] : null,
        ];
    }
}
