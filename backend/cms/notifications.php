<?php
// cms/notifications.php
// Helper functions for creating notifications

require_once __DIR__ . '/db.php';

/**
 * Create a notification for a user
 */
function create_notification($userId, $type, $title, $message, $relatedId = null, $relatedType = null) {
    try {
        $pdo = get_pdo();
        $stmt = $pdo->prepare('
            INSERT INTO notifications (user_id, type, title, message, related_id, related_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ');
        $stmt->execute([$userId, $type, $title, $message, $relatedId, $relatedType]);
        return (int)$pdo->lastInsertId();
    } catch (Throwable $e) {
        error_log('Failed to create notification: ' . $e->getMessage());
        return false;
    }
}

/**
 * Notify managers when an author creates a blog
 */
function notify_managers_new_blog($blogId, $blogTitle, $authorName) {
    try {
        $pdo = get_pdo();
        // Get all managers and super_admins
        $stmt = $pdo->query("SELECT id FROM admins WHERE role IN ('manager', 'super_admin')");
        $managers = $stmt->fetchAll();
        
        foreach ($managers as $manager) {
            create_notification(
                $manager['id'],
                'blog_pending',
                'New Blog Pending Approval',
                "{$authorName} has created a new blog post: \"{$blogTitle}\". Please review and approve.",
                $blogId,
                'blog'
            );
        }
    } catch (Throwable $e) {
        error_log('Failed to notify managers: ' . $e->getMessage());
    }
}

/**
 * Notify author when their blog is approved
 */
function notify_author_blog_approved($blogId, $blogTitle, $authorId, $approverName) {
    try {
        create_notification(
            $authorId,
            'blog_approved',
            'Blog Approved',
            "Your blog post \"{$blogTitle}\" has been approved by {$approverName}.",
            $blogId,
            'blog'
        );
    } catch (Throwable $e) {
        error_log('Failed to notify author: ' . $e->getMessage());
    }
}

/**
 * Notify author when their blog is rejected
 */
function notify_author_blog_rejected($blogId, $blogTitle, $authorId, $rejectorName) {
    try {
        create_notification(
            $authorId,
            'blog_rejected',
            'Blog Rejected',
            "Your blog post \"{$blogTitle}\" has been rejected by {$rejectorName}.",
            $blogId,
            'blog'
        );
    } catch (Throwable $e) {
        error_log('Failed to notify author: ' . $e->getMessage());
    }
}
