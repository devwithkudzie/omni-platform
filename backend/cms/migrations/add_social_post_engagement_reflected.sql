-- Migration: Add reflected_in_engagement for Option B recalc (backfill engagement from stored reactions/comments)
-- Run after add_social_posts_and_engagement.sql

USE omnicontact_website;

ALTER TABLE social_post_engagement
    ADD COLUMN reflected_in_engagement TINYINT(1) NOT NULL DEFAULT 0
    COMMENT '1 after this row has been applied to social_engagement'
    AFTER engagement_date;

-- Speeds up recalc query: unreflected rows only
CREATE INDEX idx_reflected ON social_post_engagement (reflected_in_engagement);
