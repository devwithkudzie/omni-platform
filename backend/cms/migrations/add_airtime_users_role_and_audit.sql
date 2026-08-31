-- Migration: Add role to airtime_users, create airtime_audit_log for action tracking
-- Run after add_airtime_users.sql

USE omnicontact_website;

-- Add role column: 'admin' can manage users and view audit; 'operator' can use dashboard only
SET @dbname = DATABASE();
SET @tablename = 'airtime_users';
SET @columnname = 'role';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_name = @tablename AND table_schema = @dbname AND column_name = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(32) NOT NULL DEFAULT ''admin'' AFTER name')
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure existing users have admin role
UPDATE airtime_users SET role = 'admin' WHERE role = '' OR role IS NULL;

-- Airtime audit log: track every action by logged-in airtime users
CREATE TABLE IF NOT EXISTS airtime_audit_log (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    airtime_user_id INT UNSIGNED NOT NULL,
    action VARCHAR(64) NOT NULL COMMENT 'e.g. login, logout, direct_send, resolve, resend',
    resource VARCHAR(64) NULL COMMENT 'e.g. airtime_transaction, airtime_user',
    resource_id INT UNSIGNED NULL,
    details JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(512) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_airtime_user_id (airtime_user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (airtime_user_id) REFERENCES airtime_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Audit trail of airtime dashboard user actions';
