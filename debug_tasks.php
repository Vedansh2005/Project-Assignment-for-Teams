<?php
// Debug script to check task assignment issues
require 'config.php';

header('Content-Type: text/html; charset=utf-8');

$conn = getDBConnection();
if ($conn) {
    echo "<h2>Task Debugging Information</h2>";
    
    // Get all tasks
    echo "<h3>All Tasks in Database:</h3>";
    $tasksResult = $conn->query("SELECT id, projectId, userId, title, status FROM tasks");
    if ($tasksResult && $tasksResult->num_rows > 0) {
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>Task ID</th><th>Project ID</th><th>User ID</th><th>Title</th><th>Status</th></tr>";
        while ($row = $tasksResult->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($row['id']) . "</td>";
            echo "<td>" . htmlspecialchars($row['projectId']) . "</td>";
            echo "<td>" . htmlspecialchars($row['userId']) . " (type: " . gettype($row['userId']) . ")</td>";
            echo "<td>" . htmlspecialchars($row['title']) . "</td>";
            echo "<td>" . htmlspecialchars($row['status']) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>No tasks found in database.</p>";
    }
    
    // Get all users
    echo "<h3>All Users in Database:</h3>";
    $usersResult = $conn->query("SELECT id, firstName, email, username FROM users");
    if ($usersResult && $usersResult->num_rows > 0) {
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>User ID</th><th>Name</th><th>Email</th><th>Username</th></tr>";
        while ($row = $usersResult->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($row['id']) . " (type: " . gettype($row['id']) . ")</td>";
            echo "<td>" . htmlspecialchars($row['firstName']) . "</td>";
            echo "<td>" . htmlspecialchars($row['email']) . "</td>";
            echo "<td>" . htmlspecialchars($row['username']) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>No users found in database.</p>";
    }
    
    // Test query with a specific userId
    echo "<h3>Testing Task Queries:</h3>";
    $usersResult = $conn->query("SELECT id FROM users LIMIT 5");
    if ($usersResult && $usersResult->num_rows > 0) {
        while ($userRow = $usersResult->fetch_assoc()) {
            $testUserId = $userRow['id'];
            echo "<h4>Testing with User ID: " . htmlspecialchars($testUserId) . "</h4>";
            
            // Test exact match
            $testStmt = $conn->prepare("SELECT COUNT(*) as count FROM tasks WHERE userId = ?");
            $testStmt->bind_param("s", $testUserId);
            $testStmt->execute();
            $testResult = $testStmt->get_result();
            $countRow = $testResult->fetch_assoc();
            echo "<p>Tasks found with exact match: " . $countRow['count'] . "</p>";
            $testStmt->close();
            
            // Show actual tasks
            $testStmt = $conn->prepare("SELECT id, title FROM tasks WHERE userId = ?");
            $testStmt->bind_param("s", $testUserId);
            $testStmt->execute();
            $taskResult = $testStmt->get_result();
            if ($taskResult->num_rows > 0) {
                echo "<ul>";
                while ($taskRow = $taskResult->fetch_assoc()) {
                    echo "<li>" . htmlspecialchars($taskRow['title']) . " (ID: " . htmlspecialchars($taskRow['id']) . ")</li>";
                }
                echo "</ul>";
            } else {
                echo "<p>No tasks found for this user.</p>";
            }
            $testStmt->close();
        }
    }
    
    $conn->close();
} else {
    echo "<p>Database connection failed.</p>";
}
?>


