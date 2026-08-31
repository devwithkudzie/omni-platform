-- Migration: Store comment text (message) for social_post_engagement
-- Run after add_social_posts_and_engagement.sql

USE omnicontact_website;

ALTER TABLE social_post_engagement
    ADD COLUMN message TEXT NULL
    COMMENT 'Comment text from API; NULL for reactions'
    AFTER person_name;
