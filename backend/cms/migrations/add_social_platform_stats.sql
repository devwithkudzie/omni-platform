-- Migration: Add social_platform_stats for follower counts per platform
-- Facebook: fetched from API during sync; X/Instagram/LinkedIn: manual entry or future API

USE omnicontact_website;

CREATE TABLE IF NOT EXISTS social_platform_stats (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    platform ENUM('facebook', 'x', 'instagram', 'linkedin') NOT NULL,
    follower_count INT UNSIGNED NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_platform (platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed with zero counts so we can upsert
INSERT IGNORE INTO social_platform_stats (platform, follower_count) VALUES
    ('facebook', 0),
    ('x', 0),
    ('instagram', 0),
    ('linkedin', 0);
