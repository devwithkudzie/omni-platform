-- Migration: Add social_engagement_log for audit trail of engagement recording
-- Run after create_social_engagement.sql

USE omnicontact_website;

CREATE TABLE IF NOT EXISTS social_engagement_log (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    admin_id INT UNSIGNED NULL,
    action VARCHAR(32) NOT NULL DEFAULT 'record',
    platform VARCHAR(32) NOT NULL,
    engagement_date DATE NOT NULL,
    matched_count INT UNSIGNED NOT NULL DEFAULT 0,
    total_input INT UNSIGNED NOT NULL DEFAULT 0,
    details JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at),
    INDEX idx_platform_date (platform, engagement_date),
    INDEX idx_admin (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Audit log of engagement recording actions';
