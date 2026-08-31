-- Migration: Add social_posts and social_post_engagement for Phase 2 (Facebook ingestion)
-- Run after create_social_engagement.sql

USE omnicontact_website;

-- Cached post data from platforms (e.g. Facebook)
CREATE TABLE IF NOT EXISTS social_posts (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    platform ENUM('facebook', 'x', 'instagram', 'linkedin') NOT NULL,
    external_id VARCHAR(128) NOT NULL COMMENT 'Platform post ID',
    page_id VARCHAR(64) NULL,
    message TEXT NULL,
    permalink_url VARCHAR(512) NULL,
    post_created_time DATETIME NULL,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_platform_external (platform, external_id),
    INDEX idx_platform (platform),
    INDEX idx_post_created (post_created_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- One row per reaction or comment so we don't double-count on re-sync
CREATE TABLE IF NOT EXISTS social_post_engagement (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    post_id INT UNSIGNED NOT NULL,
    external_id VARCHAR(128) NOT NULL COMMENT 'Comment ID or reaction-{user_id}',
    person_name VARCHAR(255) NULL COMMENT 'Display name from API for matching to social_people',
    engagement_type ENUM('reaction', 'comment') NOT NULL,
    engagement_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_engagement_post
        FOREIGN KEY (post_id) REFERENCES social_posts(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_post_external (post_id, external_id),
    INDEX idx_engagement_date (engagement_date),
    INDEX idx_person_name (person_name(64))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
