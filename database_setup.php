<?php
/**
 * Database Setup Script
 * Run this file once to set up the database
 * Access via: http://localhost/wtpro/database_setup.php
 */

require_once 'config.php';

// Only allow this to run in development (remove in production)
$isDevelopment = true; // Set to false in production

if (!$isDevelopment) {
    die('Database setup is disabled in production mode.');
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Database Setup - TeamFlow</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 30px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        h1 {
            color: #333;
        }
        .success {
            background-color: #d1fae5;
            color: #065f46;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
        .error {
            background-color: #fee2e2;
            color: #991b1b;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
        .info {
            background-color: #dbeafe;
            color: #1e40af;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
        pre {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        button {
            background-color: #0ea5e9;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 10px;
        }
        button:hover {
            background-color: #0284c7;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>TeamFlow Database Setup</h1>
        
        <?php
        $insertSampleData = isset($_POST['insert_sample_data']) && $_POST['insert_sample_data'] === '1';
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['setup'])) {
            echo '<div class="info">Setting up database...</div>';
            
            try {
                // Connect to MySQL server (without database)
                $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
                
                if ($conn->connect_error) {
                    throw new Exception("Connection failed: " . $conn->connect_error);
                }
                
                // Create database
                $sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME;
                if ($conn->query($sql)) {
                    echo '<div class="success">✓ Database "' . DB_NAME . '" created or already exists</div>';
                } else {
                    throw new Exception("Error creating database: " . $conn->error);
                }
                
                // Select database
                $conn->select_db(DB_NAME);
                
                // Read and execute SQL file
                $sqlFile = __DIR__ . '/database.sql';
                if (file_exists($sqlFile)) {
                    $sql = file_get_contents($sqlFile);
                    
                    // Remove CREATE DATABASE and USE statements as we're already connected
                    $sql = preg_replace('/CREATE DATABASE.*?;/i', '', $sql);
                    $sql = preg_replace('/USE.*?;/i', '', $sql);
                    
                    // Execute SQL statements
                    $statements = array_filter(array_map('trim', explode(';', $sql)));
                    
                    foreach ($statements as $statement) {
                        if (!empty($statement) && !preg_match('/^(DROP|SHOW|DESCRIBE)/i', $statement)) {
                            if (!$conn->query($statement)) {
                                // Ignore errors for IF NOT EXISTS statements
                                if (strpos($statement, 'IF NOT EXISTS') === false) {
                                    echo '<div class="error">Warning: ' . $conn->error . '</div>';
                                }
                            }
                        }
                    }
                    
                    echo '<div class="success">✓ Tables created successfully</div>';
                } else {
                    // Create tables manually if SQL file doesn't exist
                    createTables($conn);
                    echo '<div class="success">✓ Tables created successfully (using config.php)</div>';
                }
                
                // Insert sample data if requested
                if ($insertSampleData) {
                    echo '<div class="info">Inserting sample data...</div>';
                    
                    // Check if data already exists
                    $userCount = $conn->query("SELECT COUNT(*) as count FROM users")->fetch_assoc()['count'];
                    $projectCount = $conn->query("SELECT COUNT(*) as count FROM projects")->fetch_assoc()['count'];
                    
                    if ($userCount == 0 && $projectCount == 0) {
                        // Insert sample users
                        $users = [
                            "('1001', 'John Doe', 'john.doe@example.com', 'Male', 'password123', 'johndoe', '5', '[\"JavaScript\", \"PHP\", \"MySQL\", \"React\"]', '[\"B.S. Computer Science\", \"AWS Certified Solutions Architect\"]', '[\"2001\", \"2002\"]', NOW())",
                            "('1002', 'Jane Smith', 'jane.smith@example.com', 'Female', 'password123', 'janesmith', '3', '[\"Python\", \"Django\", \"PostgreSQL\", \"Docker\"]', '[\"M.S. Software Engineering\", \"Google Cloud Certified\"]', '[\"2001\", \"2003\"]', NOW())",
                            "('1003', 'Mike Johnson', 'mike.johnson@example.com', 'Male', 'password123', 'mikejohnson', '7', '[\"Java\", \"Spring Boot\", \"MongoDB\", \"Kubernetes\"]', '[\"B.S. Information Technology\", \"Oracle Certified Professional\"]', '[\"2002\"]', NOW())",
                            "('1004', 'Sarah Williams', 'sarah.williams@example.com', 'Female', 'password123', 'sarahwilliams', '4', '[\"Node.js\", \"Express\", \"MongoDB\", \"GraphQL\"]', '[\"B.S. Computer Science\", \"MongoDB Certified Developer\"]', '[\"2003\"]', NOW())",
                            "('1005', 'David Brown', 'david.brown@example.com', 'Male', 'password123', 'davidbrown', '2', '[\"HTML\", \"CSS\", \"JavaScript\", \"Vue.js\"]', '[\"B.A. Web Development\"]', '[]', NOW())"
                        ];
                        
                        $sql = "INSERT INTO users (id, firstName, email, gender, password, username, experience, skills, qualifications, projects, createdAt) VALUES " . implode(', ', $users);
                        if ($conn->query($sql)) {
                            echo '<div class="success">✓ Sample users inserted (5 users)</div>';
                        } else {
                            echo '<div class="error">Warning: Could not insert users - ' . $conn->error . '</div>';
                        }
                        
                        // Insert sample projects
                        $projects = [
                            "('2001', 'Website Redesign', 'Redesign the company website with modern UI/UX and improve user experience', '[\"1001\", \"1002\"]', 'active', 45, NOW())",
                            "('2002', 'Mobile App Development', 'Develop a cross-platform mobile application for iOS and Android', '[\"1001\", \"1003\"]', 'active', 30, NOW())",
                            "('2003', 'API Integration', 'Integrate third-party APIs and build RESTful services for the platform', '[\"1002\", \"1004\"]', 'active', 60, NOW())",
                            "('2004', 'Database Migration', 'Migrate legacy database to modern cloud-based solution', '[\"1003\"]', 'pending', 0, NOW())",
                            "('2005', 'Frontend Optimization', 'Optimize frontend performance and implement responsive design', '[\"1005\"]', 'active', 20, NOW())"
                        ];
                        
                        $sql = "INSERT INTO projects (id, name, description, assignedUsers, status, progress, createdAt) VALUES " . implode(', ', $projects);
                        if ($conn->query($sql)) {
                            echo '<div class="success">✓ Sample projects inserted (5 projects)</div>';
                        } else {
                            echo '<div class="error">Warning: Could not insert projects - ' . $conn->error . '</div>';
                        }
                    } else {
                        echo '<div class="info">Sample data already exists. Skipping data insertion.</div>';
                    }
                }
                
                // Verify tables
                $result = $conn->query("SHOW TABLES");
                $tables = [];
                while ($row = $result->fetch_array()) {
                    $tables[] = $row[0];
                }
                
                // Count records
                $userCount = $conn->query("SELECT COUNT(*) as count FROM users")->fetch_assoc()['count'];
                $projectCount = $conn->query("SELECT COUNT(*) as count FROM projects")->fetch_assoc()['count'];
                
                echo '<div class="success">✓ Database setup complete!</div>';
                echo '<div class="info"><strong>Tables created:</strong> ' . implode(', ', $tables) . '</div>';
                echo '<div class="info"><strong>Records:</strong> ' . $userCount . ' users, ' . $projectCount . ' projects</div>';
                
                // Test connection
                $testConn = getDBConnection();
                if ($testConn) {
                    echo '<div class="success">✓ Database connection test successful!</div>';
                    $testConn->close();
                } else {
                    echo '<div class="error">✗ Database connection test failed</div>';
                }
                
                $conn->close();
                
            } catch (Exception $e) {
                echo '<div class="error">Error: ' . $e->getMessage() . '</div>';
            }
        } else {
            ?>
            <div class="info">
                <p>This script will:</p>
                <ul>
                    <li>Create the database "<strong><?php echo DB_NAME; ?></strong>"</li>
                    <li>Create the <strong>users</strong> table</li>
                    <li>Create the <strong>projects</strong> table</li>
                    <li>Set up indexes and constraints</li>
                </ul>
                <p><strong>Database Configuration:</strong></p>
                <pre>Host: <?php echo DB_HOST; ?>
Database: <?php echo DB_NAME; ?>
User: <?php echo DB_USER; ?>
Password: <?php echo DB_PASS ? '***' : '(empty)'; ?></pre>
            </div>
            
            <form method="POST">
                <div style="margin: 15px 0;">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" name="insert_sample_data" value="1" checked style="margin-right: 10px; width: auto;">
                        <span>Insert sample data (5 users and 5 projects)</span>
                    </label>
                </div>
                <button type="submit" name="setup">Setup Database</button>
            </form>
            <?php
        }
        ?>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <h3>Manual Setup via phpMyAdmin</h3>
            <p><strong>Recommended Method:</strong></p>
            <ol>
                <li>Open phpMyAdmin (usually at <code>http://localhost/phpmyadmin</code>)</li>
                <li>Click on "Import" tab</li>
                <li>Choose file: <code>database_manual.sql</code></li>
                <li>Click "Go" to import</li>
                <li>The database <code>teamflow</code> will be created with tables and sample data</li>
            </ol>
            <p><strong>Alternative - Command Line:</strong></p>
            <pre>mysql -u <?php echo DB_USER; ?> -p < database_manual.sql</pre>
            <p><strong>Note:</strong> The <code>database_manual.sql</code> file includes sample data (5 users and 5 projects) that will be visible in phpMyAdmin.</p>
        </div>
    </div>
</body>
</html>

