-- Consolidated migration for link enhancements (combines migrations 2-4)
-- Add description field to links table
ALTER TABLE links ADD COLUMN description TEXT DEFAULT '';

-- Add the final color structure fields (accent, title, description colors)
ALTER TABLE links ADD COLUMN custom_accent_color_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE links ADD COLUMN custom_accent_color VARCHAR(50) DEFAULT '';
ALTER TABLE links ADD COLUMN custom_title_color_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE links ADD COLUMN custom_title_color VARCHAR(50) DEFAULT '';
ALTER TABLE links ADD COLUMN custom_description_color_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE links ADD COLUMN custom_description_color VARCHAR(50) DEFAULT '';

-- Note: The old custom_font_color fields from migration 002 are not included here
-- as they were replaced by the more specific color fields above.
-- If they exist in the database, they will remain but won't be used by the application. 