-- Revert link name constraint fix
-- SQLite doesn't support DROP CONSTRAINT, so we need to recreate the table

-- Create new table with original constraints
CREATE TABLE links_old (
    id BIGINT PRIMARY KEY,
    node_id BIGINT NOT NULL,
    name VARCHAR(255) UNIQUE,  -- Restore global UNIQUE constraint
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
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- Copy data from current table to old table
INSERT INTO links_old SELECT * FROM links;

-- Drop current table
DROP TABLE links;

-- Rename old table to original name
ALTER TABLE links_old RENAME TO links;

-- Recreate indexes
CREATE INDEX idx_links_name ON links(name);
CREATE INDEX idx_links_visible_enabled ON links(visible, enabled); 