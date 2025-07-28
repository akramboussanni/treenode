-- Complete database schema for Treenode application
-- This migration includes all schema changes from previous migrations

-- Users table
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    user_role TEXT NOT NULL,
    email_confirmed BOOLEAN NOT NULL DEFAULT false,
    email_confirm_token VARCHAR(64),
    email_confirm_issuedat BIGINT,
    password_reset_token VARCHAR(64),
    password_reset_issuedat BIGINT,
    jwt_session_id BIGINT
);

-- JWT token blacklist for session management
CREATE TABLE jwt_blacklist (
    jti VARCHAR(255) PRIMARY KEY,
    user_id BIGINT,
    expires_at BIGINT NOT NULL
);

-- Failed login attempts tracking
CREATE TABLE failed_logins (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NULL,
    ip_address VARCHAR(45) NOT NULL,
    attempted_at BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true
);

-- Account lockouts
CREATE TABLE lockouts (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NULL,
    ip_address VARCHAR(45),
    locked_until BIGINT NOT NULL,
    reason VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT true
);

-- Indexes for security tables
CREATE INDEX idx_failed_logins_user ON failed_logins(user_id);
CREATE INDEX idx_failed_logins_ip ON failed_logins(ip_address);
CREATE INDEX idx_failed_logins_attempted_at ON failed_logins(attempted_at);

CREATE INDEX idx_lockouts_user ON lockouts(user_id);
CREATE INDEX idx_lockouts_ip ON lockouts(ip_address);
CREATE INDEX idx_lockouts_locked_until ON lockouts(locked_until);

-- Nodes table (link pages)
CREATE TABLE nodes (
    id BIGINT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    subdomain_name VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    background_color VARCHAR(50),
    title_font_color VARCHAR(50),
    caption_font_color VARCHAR(50),
    accent_color VARCHAR(50),
    theme_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
    page_title VARCHAR(255),
    domain VARCHAR(255) NOT NULL,
    domain_verified BOOLEAN NOT NULL DEFAULT false,
    show_share_button BOOLEAN NOT NULL DEFAULT true,
    hide_powered_by BOOLEAN DEFAULT FALSE,
    theme VARCHAR(50) DEFAULT 'default',
    mouse_effects_enabled BOOLEAN NOT NULL DEFAULT true,
    text_shadows_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for subdomain lookups
CREATE INDEX idx_nodes_subdomain_name ON nodes(subdomain_name);

-- Node access control for collaborators
CREATE TABLE node_access (
    node_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (node_id, user_id),
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- Links table (individual links on a node)
CREATE TABLE links (
    id BIGINT PRIMARY KEY,
    node_id BIGINT NOT NULL,
    name VARCHAR(255) UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    link TEXT NOT NULL,
    icon VARCHAR(255),
    visible BOOLEAN NOT NULL DEFAULT true,
    enabled BOOLEAN NOT NULL DEFAULT true,
    mini BOOLEAN NOT NULL DEFAULT false,
    position INTEGER NOT NULL DEFAULT 0,
    gradient_type VARCHAR(50),
    gradient_angle REAL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- Indexes for links table
CREATE INDEX idx_links_name ON links(name);
CREATE INDEX idx_links_visible_enabled ON links(visible, enabled);

-- Color stops for gradient customization
CREATE TABLE color_stops (
    id BIGINT PRIMARY KEY,
    link_id BIGINT NOT NULL,
    color VARCHAR(50) NOT NULL,
    position REAL NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL DEFAULT 0,
    FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
);

-- Invitations table for collaboration
CREATE TABLE invitations (
    id BIGINT PRIMARY KEY,
    node_id BIGINT NOT NULL,
    user_id BIGINT,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    accepted BOOLEAN DEFAULT FALSE,
    expires_at BIGINT NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- Indexes for invitations table
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_node_id ON invitations(node_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);
CREATE INDEX idx_invitations_user_id ON invitations(user_id); 