-- Add mini_background_enabled column to links table
ALTER TABLE links ADD COLUMN mini_background_enabled BOOLEAN DEFAULT FALSE; 