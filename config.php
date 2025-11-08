<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'teamflow');
define('DB_USER', 'root');
define('DB_PASS', '');

// Admin credentials
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'admin123');

// Note: Session should be started in individual PHP files that need it
// Don't start it globally here as it may interfere with header settings
// JSON header should be set in individual PHP files that return JSON

// Database connection
function getDBConnection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            // If database doesn't exist, create it
            $conn = new mysqli('localhost', 'root', '','teamflow');
            $conn->query("CREATE DATABASE IF NOT EXISTS " . DB_NAME);
            $conn->select_db(DB_NAME);
            
            // Create tables
            createTables($conn);
        } else {
            createTables($conn);
        }
        return $conn;
    } catch (Exception $e) {
        // Use file-based storage if database fails
        return null;
    }
}

// Create database tables
function createTables($conn) {
    // Users table
    $conn->query("CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        firstName VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        gender VARCHAR(20),
        password VARCHAR(255),
        username VARCHAR(100),
        experience VARCHAR(10),
        skills TEXT,
        qualifications TEXT,
        projects TEXT,
        createdAt DATETIME
    )");
    
    // Projects table
    $conn->query("CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(200),
        description TEXT,
        assignedUsers TEXT,
        status VARCHAR(20),
        progress INT,
        createdAt DATETIME
    )");
    
    // Tasks table
    $conn->query("CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(50) PRIMARY KEY,
        projectId VARCHAR(50),
        userId VARCHAR(50),
        title VARCHAR(200),
        description TEXT,
        taskType VARCHAR(50),
        priority VARCHAR(20),
        status VARCHAR(20),
        progress INT,
        dueDate DATE,
        createdAt DATETIME,
        updatedAt DATETIME
    )");
}

// Get file storage path
function getDataPath() {
    $path = __DIR__ . '/data/';
    if (!file_exists($path)) {
        mkdir($path, 0777, true);
    }
    return $path;
}

// Read JSON file
function readJSONFile($filename) {
    $filepath = getDataPath() . $filename;
    if (file_exists($filepath)) {
        $content = file_get_contents($filepath);
        return json_decode($content, true) ?: [];
    }
    return [];
}

// Write JSON file
function writeJSONFile($filename, $data) {
    $filepath = getDataPath() . $filename;
    file_put_contents($filepath, json_encode($data, JSON_PRETTY_PRINT));
    return true;
}
?>

