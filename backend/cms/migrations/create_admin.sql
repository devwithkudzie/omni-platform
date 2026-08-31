-- Migration: Create initial admin user
-- This creates the default super admin account

-- Note: Use cms/setup-admin.php instead for easier setup
-- Or generate password hash using: php -r "echo password_hash('your-password', PASSWORD_DEFAULT);"

-- Default admin credentials:
-- Email: admin@omnicontact.co.za
-- Password: admin123 (⚠️ CHANGE THIS!)
-- Name: Kudzaishe Prosper Mukungurutse
-- Role: super_admin

INSERT INTO admins (email, password_hash, name, role, created_at)
VALUES (
    'admin@omnicontact.co.za',
    '$2y$10$0gcfkI9FkaJiCxwe2AHRqOrZDgosZZAFkN0PcW4BBsOJfCvwKcqkG',  -- Hash for 'admin123'
    'Kudzaishe Prosper Mukungurutse',
    'super_admin',
    NOW()
)
ON DUPLICATE KEY UPDATE
    password_hash = VALUES(password_hash),
    name = VALUES(name),
    role = VALUES(role);

-- ⚠️ SECURITY WARNING:
-- 1. Change the password immediately after first login!
-- 2. Use cms/setup-admin.php for easier password management
-- 3. Generate new hash: php -r "echo password_hash('your-secure-password', PASSWORD_DEFAULT);"
