-- Migration: Add facebook_user_id to social_people for better matching
-- Facebook user ID is unique; helps deduplicate when display names change

USE omnicontact_website;

ALTER TABLE social_people
ADD COLUMN facebook_user_id VARCHAR(64) NULL AFTER facebook_name,
ADD INDEX idx_facebook_user_id (facebook_user_id);
