-- Migration: Add author_id to blogs table
USE omnicontact_website;

-- Check and add author_id column
SET @dbname = DATABASE();
SET @tablename = 'blogs';
SET @columnname = 'author_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT UNSIGNED NULL AFTER id, ADD INDEX idx_author_id (', @columnname, ')')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Set existing blogs to have author_id = 2 (current admin)
UPDATE blogs SET author_id = 2 WHERE author_id IS NULL;
