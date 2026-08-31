-- Migration: Ensure first airtime user is super_admin (cannot be deleted)
-- Run after add_airtime_users_role_and_audit.sql

USE omnicontact_website;

-- Upgrade the first user (lowest id) to super_admin
UPDATE airtime_users
SET role = 'super_admin'
WHERE id = (SELECT * FROM (SELECT MIN(id) FROM airtime_users) t)
  AND (role = 'admin' OR role = '' OR role IS NULL);
