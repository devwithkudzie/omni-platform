-- Migration: Store Facebook reaction type (LIKE, LOVE, WOW, etc.) for reactions
-- Run after add_social_posts_and_engagement.sql (and add_social_post_engagement_reflected.sql if used)

USE omnicontact_website;

ALTER TABLE social_post_engagement
    ADD COLUMN reaction_type VARCHAR(20) NULL
    COMMENT 'Facebook: LIKE, LOVE, WOW, HAHA, SAD, ANGRY, etc.'
    AFTER engagement_type;
