-- Create first airtime dashboard user
-- 1. Generate hash: php cms/generate-airtime-hash.php admin123
-- 2. Replace YOUR_HASH below with the output
-- 3. Run this in phpMyAdmin (or: mysql -u root omnicontact_website < add_airtime_user.sql)

USE omnicontact_website;

INSERT INTO airtime_users (email, password_hash, name) VALUES
('airtime@omnicontact.biz', 'YOUR_HASH', 'Airtime Manager');
