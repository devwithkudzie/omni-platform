<?php
// cms/cron/publish-scheduled.php
// This script should be run via cron to publish scheduled blog posts
// Add to crontab: */15 * * * * php /path/to/cms/cron/publish-scheduled.php

require_once __DIR__ . '/../db.php';

try {
    $pdo = get_pdo();
    
    // Find blogs that are approved, scheduled, and should be published now
    $stmt = $pdo->prepare("
        UPDATE blogs 
        SET status = 'published', 
            updated_at = NOW() 
        WHERE approval_status = 'approved' 
          AND status != 'published'
          AND scheduled_publish_at IS NOT NULL 
          AND scheduled_publish_at <= NOW()
    ");
    
    $stmt->execute();
    $count = $stmt->rowCount();
    
    if ($count > 0) {
        error_log("Published {$count} scheduled blog post(s)");
    }
    
    echo "Published {$count} scheduled blog post(s)\n";
} catch (Throwable $e) {
    error_log("Error publishing scheduled blogs: " . $e->getMessage());
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
