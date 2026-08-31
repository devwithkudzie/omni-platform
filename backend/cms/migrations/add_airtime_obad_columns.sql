-- Add OBAD (Bulk Airtime) tracking columns to airtime_transactions
-- Run after add_airtime_transactions.sql
-- Required for: balance display, airtime send on payment, resend, direct send

USE omnicontact_website;

ALTER TABLE airtime_transactions
  ADD COLUMN obad_sent_at DATETIME NULL AFTER resolution_notes,
  ADD COLUMN obad_error TEXT NULL AFTER obad_sent_at;
