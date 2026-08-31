-- Migration: Airtime transactions table for purchase logs and issue resolution
-- Run after create_tables.sql and add_admin_responsibilities_and_audit.sql

USE omnicontact_website;

CREATE TABLE IF NOT EXISTS airtime_transactions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    network VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    recipient_number VARCHAR(30) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_number VARCHAR(30) NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded', 'needs_review') DEFAULT 'pending',
    paynow_reference VARCHAR(100) NULL,
    paynow_poll_url VARCHAR(500) NULL,
    error_message TEXT NULL,
    resolved_at DATETIME NULL,
    resolved_by INT UNSIGNED NULL,
    resolution_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_network (network),
    FOREIGN KEY (resolved_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
