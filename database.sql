-- TeamFlow Database Schema
-- MySQL Database Setup Script
-- 
-- Usage:
-- 1. Via database_setup.php: Run the setup script in browser (Recommended)
-- 2. Via command line: Use database_manual.sql instead
-- 3. Via phpMyAdmin: Import database_manual.sql
--
-- This file is used by database_setup.php
-- For manual setup, use database_manual.sql

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    gender VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    experience VARCHAR(10) DEFAULT '0',
    skills TEXT,
    qualifications TEXT,
    projects TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create projects table
CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    assignedUsers TEXT,
    status VARCHAR(20) DEFAULT 'active',
    progress INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create tasks table
CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    projectId VARCHAR(50) NOT NULL,
    userId VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    taskType VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    progress INT DEFAULT 0,
    dueDate DATE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project (projectId),
    INDEX idx_user (userId),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Insert sample data (uncomment if needed)
-- Sample user
-- INSERT INTO users (id, firstName, email, gender, password, username, experience, skills, qualifications, projects, createdAt) 
-- VALUES ('1001', 'John Doe', 'john@example.com', 'Male', 'password123', 'john', '5', '["JavaScript", "PHP", "MySQL"]', '["B.S. Computer Science"]', '[]', NOW());

-- Sample project
-- INSERT INTO projects (id, name, description, assignedUsers, status, progress, createdAt) 
-- VALUES ('2001', 'Website Redesign', 'Redesign the company website with modern UI/UX', '[]', 'active', 0, NOW());

-- Show tables
SHOW TABLES;

-- Display table structures
DESCRIBE users;
DESCRIBE projects;

