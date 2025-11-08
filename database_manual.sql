-- TeamFlow Database Schema (Manual Setup)
-- Run this file directly via MySQL command line or phpMyAdmin

-- Create database
CREATE DATABASE IF NOT EXISTS teamflow;
USE teamflow;

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
    INDEX idx_status (status),
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample users
INSERT INTO users (id, firstName, email, gender, password, username, experience, skills, qualifications, projects, createdAt) VALUES
('1001', 'John Doe', 'john.doe@example.com', 'Male', 'password123', 'johndoe', '5', '["JavaScript", "PHP", "MySQL", "React"]', '["B.S. Computer Science", "AWS Certified Solutions Architect"]', '["2001", "2002"]', NOW()),
('1002', 'Jane Smith', 'jane.smith@example.com', 'Female', 'password123', 'janesmith', '3', '["Python", "Django", "PostgreSQL", "Docker"]', '["M.S. Software Engineering", "Google Cloud Certified"]', '["2001", "2003"]', NOW()),
('1003', 'Mike Johnson', 'mike.johnson@example.com', 'Male', 'password123', 'mikejohnson', '7', '["Java", "Spring Boot", "MongoDB", "Kubernetes"]', '["B.S. Information Technology", "Oracle Certified Professional"]', '["2002"]', NOW()),
('1004', 'Sarah Williams', 'sarah.williams@example.com', 'Female', 'password123', 'sarahwilliams', '4', '["Node.js", "Express", "MongoDB", "GraphQL"]', '["B.S. Computer Science", "MongoDB Certified Developer"]', '["2003"]', NOW()),
('1005', 'David Brown', 'david.brown@example.com', 'Male', 'password123', 'davidbrown', '2', '["HTML", "CSS", "JavaScript", "Vue.js"]', '["B.A. Web Development"]', '[]', NOW());

-- Insert sample projects
INSERT INTO projects (id, name, description, assignedUsers, status, progress, createdAt) VALUES
('2001', 'Website Redesign', 'Redesign the company website with modern UI/UX and improve user experience', '["1001", "1002"]', 'active', 45, NOW()),
('2002', 'Mobile App Development', 'Develop a cross-platform mobile application for iOS and Android', '["1001", "1003"]', 'active', 30, NOW()),
('2003', 'API Integration', 'Integrate third-party APIs and build RESTful services for the platform', '["1002", "1004"]', 'active', 60, NOW()),
('2004', 'Database Migration', 'Migrate legacy database to modern cloud-based solution', '["1003"]', 'pending', 0, NOW()),
('2005', 'Frontend Optimization', 'Optimize frontend performance and implement responsive design', '["1005"]', 'active', 20, NOW());

-- Verify tables were created
SHOW TABLES;

-- Display table structures
DESCRIBE users;
DESCRIBE projects;

-- Display sample data
SELECT 'Users Table:' AS info;
SELECT * FROM users;

SELECT 'Projects Table:' AS info;
SELECT * FROM projects;

