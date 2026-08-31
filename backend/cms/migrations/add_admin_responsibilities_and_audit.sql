-- Migration: Add responsibilities to admins and admin_audit_log for tracking all actions
-- Run after add_user_roles_and_scheduling.sql

USE omnicontact_website;

-- Add responsibilities column (JSON array of strings: manage_social, manage_cms_content, etc.)
SET @dbname = DATABASE();
SET @tablename = 'admins';
SET @columnname = 'responsibilities';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (table_name = @tablename) AND (table_schema = @dbname) AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' JSON NULL COMMENT ''Granular permissions: manage_social, manage_cms_content, etc.'' AFTER role')
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Admin audit log: track every action by logged-in admins
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    admin_id INT UNSIGNED NOT NULL,
    action VARCHAR(64) NOT NULL COMMENT 'e.g. login, record_engagement, create_person, update_blog',
    resource VARCHAR(64) NULL COMMENT 'e.g. social_engagement, social_people, blog, user',
    resource_id INT UNSIGNED NULL,
    details JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(512) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_id (admin_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Audit trail of all admin actions';
