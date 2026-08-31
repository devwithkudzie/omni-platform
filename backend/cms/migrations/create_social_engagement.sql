-- Migration: Create social media engagement tables
-- This migration creates:
-- 1) social_people        - master list of people and their social handles
-- 2) social_engagement    - per-date, per-platform engagement records

USE omnicontact_website;

-- Master list of people / fans
CREATE TABLE IF NOT EXISTS social_people (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    real_name VARCHAR(255) NOT NULL,
    facebook_name VARCHAR(255) NULL,
    x_name VARCHAR(255) NULL,
    instagram_name VARCHAR(255) NULL,
    linkedin_name VARCHAR(255) NULL,
    -- Classification and metadata
    category ENUM('employee','client','prospect','partner','other') DEFAULT 'other',
    company VARCHAR(255) NULL,
    employee_id VARCHAR(64) NULL,
    client_id VARCHAR(64) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_real_name (real_name),
    INDEX idx_facebook_name (facebook_name),
    INDEX idx_x_name (x_name),
    INDEX idx_instagram_name (instagram_name),
    INDEX idx_linkedin_name (linkedin_name),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Per-date, per-platform engagement
CREATE TABLE IF NOT EXISTS social_engagement (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    person_id INT UNSIGNED NOT NULL,
    engagement_date DATE NOT NULL,
    platform ENUM('facebook', 'x', 'instagram', 'linkedin') NOT NULL,
    engagement_count INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_social_engagement_person
        FOREIGN KEY (person_id) REFERENCES social_people(id)
        ON DELETE CASCADE,
    UNIQUE KEY uniq_person_date_platform (person_id, engagement_date, platform),
    INDEX idx_engagement_date (engagement_date),
    INDEX idx_platform (platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

