-- Consolidated rollback for link enhancements (combines migrations 2-4)
-- Remove the final color structure fields
ALTER TABLE links DROP COLUMN IF EXISTS custom_accent_color_enabled;
ALTER TABLE links DROP COLUMN IF EXISTS custom_accent_color;
ALTER TABLE links DROP COLUMN IF EXISTS custom_title_color_enabled;
ALTER TABLE links DROP COLUMN IF EXISTS custom_title_color;
ALTER TABLE links DROP COLUMN IF EXISTS custom_description_color_enabled;
ALTER TABLE links DROP COLUMN IF EXISTS custom_description_color;

-- Remove description field from links table
ALTER TABLE links DROP COLUMN IF EXISTS description;

-- Note: We don't restore the old custom_font_color fields as they were
-- replaced by the more specific color fields above. 