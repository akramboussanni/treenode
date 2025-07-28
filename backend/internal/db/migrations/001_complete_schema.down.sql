-- Complete database schema rollback for Treenode application
-- This migration drops all tables in the correct order to avoid foreign key constraints

-- Drop tables in reverse order of dependencies

-- Drop color_stops table first (depends on links)
DROP TABLE IF EXISTS color_stops;

-- Drop links table (depends on nodes)
DROP TABLE IF EXISTS links;

-- Drop invitations table (depends on nodes)
DROP TABLE IF EXISTS invitations;

-- Drop node_access table (depends on nodes)
DROP TABLE IF EXISTS node_access;

-- Drop nodes table (depends on users)
DROP TABLE IF EXISTS nodes;

-- Drop security tables
DROP TABLE IF EXISTS lockouts;
DROP TABLE IF EXISTS failed_logins;

-- Drop JWT blacklist table
DROP TABLE IF EXISTS jwt_blacklist;

-- Drop users table last (referenced by other tables)
DROP TABLE IF EXISTS users; 