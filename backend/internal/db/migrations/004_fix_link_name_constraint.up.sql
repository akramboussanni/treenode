-- Fix link name constraint to be unique per node, not globally
-- SQLite doesn't support DROP CONSTRAINT, so we need to recreate the table

-- Create new table with correct constraints
CREATE TABLE links_new (
    id BIGINT PRIMARY KEY,
    node_id BIGINT NOT NULL,
    name VARCHAR(255),  -- No global UNIQUE constraint
    display_name VARCHAR(255) NOT NULL,
    link TEXT NOT NULL,
    description TEXT DEFAULT '',
    icon VARCHAR(255),
    visible BOOLEAN NOT NULL DEFAULT true,
    enabled BOOLEAN NOT NULL DEFAULT true,
    mini BOOLEAN NOT NULL DEFAULT false,
    position INTEGER NOT NULL DEFAULT 0,
    gradient_type VARCHAR(50),
    gradient_angle REAL,
    custom_accent_color_enabled BOOLEAN NOT NULL DEFAULT false,
    custom_accent_color VARCHAR(50) DEFAULT '',
    custom_title_color_enabled BOOLEAN NOT NULL DEFAULT false,
    custom_title_color VARCHAR(50) DEFAULT '',
    custom_description_color_enabled BOOLEAN NOT NULL DEFAULT false,
    custom_description_color VARCHAR(50) DEFAULT '',
    mini_background_enabled BOOLEAN DEFAULT FALSE,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
    UNIQUE (node_id, name)  -- Composite UNIQUE constraint per node
);

-- Copy data from old table to new table
INSERT INTO links_new SELECT * FROM links;

-- Drop old table
DROP TABLE links;

-- Rename new table to original name
ALTER TABLE links_new RENAME TO links;

-- Recreate indexes
CREATE INDEX idx_links_name ON links(name);
CREATE INDEX idx_links_visible_enabled ON links(visible, enabled); 