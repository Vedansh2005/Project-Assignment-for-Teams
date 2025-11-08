<?php
// Turn off error display and enable output buffering
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Start output buffering before any output
ob_start();

// Set proper headers for JSON response
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit;
}

// Start session if not already started (after headers are set)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Require config
require_once 'config.php';

// Function to send JSON response
function sendJSON($data, $statusCode = 200) {
    ob_clean();
    http_response_code($statusCode);
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        // If JSON encoding fails, send a safe error message
        ob_clean();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'JSON encoding error'], JSON_UNESCAPED_UNICODE);
    } else {
        echo $json;
    }
    exit;
}

// Function to send error response
function sendError($message, $statusCode = 400) {
    // Sanitize error message to prevent JSON issues
    $safeMessage = is_string($message) ? $message : 'Unknown error';
    sendJSON(['success' => false, 'message' => $safeMessage], $statusCode);
}

// Main execution wrapped in try-catch
try {
    $action = $_POST['action'] ?? $_GET['action'] ?? '';
    
    if (empty($action)) {
        sendError('Invalid or missing action', 400);
    }
    
    if ($action === 'create') {
        $projectId = isset($_POST['projectId']) ? trim($_POST['projectId']) : '';
        $userId = isset($_POST['userId']) ? trim($_POST['userId']) : '';
        $title = isset($_POST['title']) ? trim($_POST['title']) : '';
        $description = isset($_POST['description']) ? trim($_POST['description']) : '';
        $taskType = isset($_POST['taskType']) ? trim($_POST['taskType']) : '';
        $priority = isset($_POST['priority']) ? trim($_POST['priority']) : 'medium';
        $dueDate = isset($_POST['dueDate']) ? trim($_POST['dueDate']) : null;
        
        // Validation
        if (empty($projectId) || empty($userId) || empty($title) || empty($taskType)) {
            sendError('Project ID, User ID, Title, and Task Type are required');
        }
        
        // Validate priority
        if (!in_array($priority, ['low', 'medium', 'high'])) {
            $priority = 'medium';
        }
        
        // Validate task type
        $allowedTypes = ['Frontend', 'Backend', 'Database', 'API', 'Testing', 'Design', 'Documentation', 'DevOps', 'Other'];
        if (!in_array($taskType, $allowedTypes)) {
            $taskType = 'Other';
        }
        
        $conn = getDBConnection();
        if (!$conn) {
            sendError('Database connection failed', 500);
        }
        
        // Verify user exists
        $userCheck = $conn->prepare("SELECT id FROM users WHERE id COLLATE utf8mb4_unicode_ci = ?");
        if (!$userCheck) {
            sendError('Database error: ' . $conn->error, 500);
        }
        $userCheck->bind_param("s", $userId);
        $userCheck->execute();
        $userResult = $userCheck->get_result();
        if ($userResult->num_rows === 0) {
            $userCheck->close();
            $conn->close();
            sendError('User not found');
        }
        $userCheck->close();
        
        // Verify project exists
        $projectCheck = $conn->prepare("SELECT id FROM projects WHERE id COLLATE utf8mb4_unicode_ci = ?");
        if (!$projectCheck) {
            sendError('Database error: ' . $conn->error, 500);
        }
        $projectCheck->bind_param("s", $projectId);
        $projectCheck->execute();
        $projectResult = $projectCheck->get_result();
        if ($projectResult->num_rows === 0) {
            $projectCheck->close();
            $conn->close();
            sendError('Project not found');
        }
        $projectCheck->close();
        
        $id = uniqid('task_', true);
        $status = 'pending';
        $progress = 0;
        $createdAt = date('Y-m-d H:i:s');
        $dueDateValue = (!empty($dueDate) && $dueDate !== 'null') ? $dueDate : null;
        
        $stmt = $conn->prepare("INSERT INTO tasks (id, projectId, userId, title, description, taskType, priority, status, progress, dueDate, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        if (!$stmt) {
            $conn->close();
            sendError('Database error: ' . $conn->error, 500);
        }
        $stmt->bind_param("ssssssssiss", $id, $projectId, $userId, $title, $description, $taskType, $priority, $status, $progress, $dueDateValue, $createdAt);
        
        if ($stmt->execute()) {
            $stmt->close();
            $conn->close();
            sendJSON(['success' => true, 'message' => 'Task created successfully', 'taskId' => $id]);
        } else {
            $error = $stmt->error;
            $stmt->close();
            $conn->close();
            sendError('Error creating task: ' . $error, 500);
        }
        
    } elseif ($action === 'getAll') {
        $projectId = isset($_GET['projectId']) ? trim($_GET['projectId']) : '';
        $userId = isset($_GET['userId']) ? trim($_GET['userId']) : '';
        
        $conn = getDBConnection();
        if (!$conn) {
            sendError('Database connection failed', 500);
        }
        
        // Build query with proper JOINs - fix collation mismatch
        $query = "SELECT t.*, 
                         COALESCE(u.firstName, 'Unknown') as firstName, 
                         COALESCE(u.email, '') as email, 
                         COALESCE(p.name, 'Unknown Project') as projectName 
                  FROM tasks t 
                  LEFT JOIN users u ON t.userId COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
                  LEFT JOIN projects p ON t.projectId COLLATE utf8mb4_unicode_ci = p.id COLLATE utf8mb4_unicode_ci
                  WHERE 1=1";
        $params = [];
        $types = "";
        
        if (!empty($projectId)) {
            $query .= " AND t.projectId COLLATE utf8mb4_unicode_ci = ?";
            $params[] = $projectId;
            $types .= "s";
        }
        
        if (!empty($userId)) {
            $query .= " AND t.userId COLLATE utf8mb4_unicode_ci = ?";
            $params[] = $userId;
            $types .= "s";
        }
        
        $query .= " ORDER BY t.createdAt DESC";
        
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            $conn->close();
            sendError('Query preparation failed: ' . $conn->error, 500);
        }
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        if (!$stmt->execute()) {
            $error = $stmt->error;
            $stmt->close();
            $conn->close();
            sendError('Query execution failed: ' . $error, 500);
        }
        
        $result = $stmt->get_result();
        
        $tasks = [];
        while ($row = $result->fetch_assoc()) {
            // Sanitize and ensure all fields have proper values
            $task = [
                'id' => $row['id'] ?? '',
                'projectId' => $row['projectId'] ?? '',
                'userId' => $row['userId'] ?? '',
                'title' => $row['title'] ?? 'Untitled Task',
                'description' => $row['description'] ?? '',
                'taskType' => $row['taskType'] ?? 'Other',
                'priority' => $row['priority'] ?? 'medium',
                'status' => $row['status'] ?? 'pending',
                'progress' => isset($row['progress']) ? (int)$row['progress'] : 0,
                'dueDate' => $row['dueDate'] ?? null,
                'createdAt' => $row['createdAt'] ?? '',
                'updatedAt' => $row['updatedAt'] ?? '',
                'projectName' => $row['projectName'] ?? 'Unknown Project',
                'firstName' => $row['firstName'] ?? 'Unknown User',
                'email' => $row['email'] ?? ''
            ];
            $tasks[] = $task;
        }
        
        $stmt->close();
        $conn->close();
        
        sendJSON(['success' => true, 'tasks' => $tasks]);
        
    } elseif ($action === 'getByProject') {
        $projectId = isset($_GET['projectId']) ? trim($_GET['projectId']) : '';
        
        if (empty($projectId)) {
            sendError('Project ID required');
        }
        
        $conn = getDBConnection();
        if (!$conn) {
            sendError('Database connection failed', 500);
        }
        
        $query = "SELECT t.*, 
                         COALESCE(u.firstName, 'Unknown') as firstName, 
                         COALESCE(u.email, '') as email,
                         u.skills,
                         u.experience,
                         COALESCE(p.name, 'Unknown Project') as projectName
                  FROM tasks t 
                  LEFT JOIN users u ON t.userId COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
                  LEFT JOIN projects p ON t.projectId COLLATE utf8mb4_unicode_ci = p.id COLLATE utf8mb4_unicode_ci
                  WHERE t.projectId COLLATE utf8mb4_unicode_ci = ? 
                  ORDER BY t.createdAt DESC";
        
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            $conn->close();
            sendError('Query preparation failed: ' . $conn->error, 500);
        }
        
        $stmt->bind_param("s", $projectId);
        
        if (!$stmt->execute()) {
            $error = $stmt->error;
            $stmt->close();
            $conn->close();
            sendError('Query execution failed: ' . $error, 500);
        }
        
        $result = $stmt->get_result();
        
        $tasks = [];
        while ($row = $result->fetch_assoc()) {
            $task = [
                'id' => $row['id'] ?? '',
                'projectId' => $row['projectId'] ?? '',
                'userId' => $row['userId'] ?? '',
                'title' => $row['title'] ?? 'Untitled Task',
                'description' => $row['description'] ?? '',
                'taskType' => $row['taskType'] ?? 'Other',
                'priority' => $row['priority'] ?? 'medium',
                'status' => $row['status'] ?? 'pending',
                'progress' => isset($row['progress']) ? (int)$row['progress'] : 0,
                'dueDate' => $row['dueDate'] ?? null,
                'createdAt' => $row['createdAt'] ?? '',
                'updatedAt' => $row['updatedAt'] ?? '',
                'projectName' => $row['projectName'] ?? 'Unknown Project',
                'firstName' => $row['firstName'] ?? 'Unknown User',
                'email' => $row['email'] ?? '',
                'experience' => $row['experience'] ?? null
            ];
            
            // Parse skills if present
            if (!empty($row['skills'])) {
                $skills = json_decode($row['skills'], true);
                $task['skills'] = is_array($skills) ? $skills : [];
            } else {
                $task['skills'] = [];
            }
            
            $tasks[] = $task;
        }
        
        $stmt->close();
        $conn->close();
        
        sendJSON(['success' => true, 'tasks' => $tasks]);
        
    } elseif ($action === 'updateProgress') {
        $taskId = isset($_POST['taskId']) ? trim($_POST['taskId']) : '';
        $progress = isset($_POST['progress']) ? intval($_POST['progress']) : 0;
        
        if (empty($taskId)) {
            sendError('Task ID required');
        }
        
        // Ensure progress is between 0-100
        $progress = max(0, min(100, $progress));
        
        $conn = getDBConnection();
        if (!$conn) {
            sendError('Database connection failed', 500);
        }
        
        // Verify task exists
        $taskCheck = $conn->prepare("SELECT id, projectId FROM tasks WHERE id COLLATE utf8mb4_unicode_ci = ?");
        if (!$taskCheck) {
            $conn->close();
            sendError('Database error: ' . $conn->error, 500);
        }
        $taskCheck->bind_param("s", $taskId);
        $taskCheck->execute();
        $taskResult = $taskCheck->get_result();
        if ($taskResult->num_rows === 0) {
            $taskCheck->close();
            $conn->close();
            sendError('Task not found');
        }
        $taskRow = $taskResult->fetch_assoc();
        $projectId = $taskRow['projectId'];
        $taskCheck->close();
        
        // Update task progress and status
        $status = $progress == 100 ? 'completed' : ($progress > 0 ? 'in_progress' : 'pending');
        $updatedAt = date('Y-m-d H:i:s');
        
        $stmt = $conn->prepare("UPDATE tasks SET progress = ?, status = ?, updatedAt = ? WHERE id COLLATE utf8mb4_unicode_ci = ?");
        if (!$stmt) {
            $conn->close();
            sendError('Database error: ' . $conn->error, 500);
        }
        $stmt->bind_param("isss", $progress, $status, $updatedAt, $taskId);
        
        if (!$stmt->execute()) {
            $error = $stmt->error;
            $stmt->close();
            $conn->close();
            sendError('Error updating task progress: ' . $error, 500);
        }
        
        // Update project progress based on average of all tasks
        if (!empty($projectId)) {
            $avgStmt = $conn->prepare("SELECT AVG(progress) as avgProgress FROM tasks WHERE projectId COLLATE utf8mb4_unicode_ci = ?");
            if ($avgStmt) {
                $avgStmt->bind_param("s", $projectId);
                $avgStmt->execute();
                $avgResult = $avgStmt->get_result();
                if ($avgRow = $avgResult->fetch_assoc()) {
                    $avgProgress = round($avgRow['avgProgress'] ?? 0);
                    $updateProjectStmt = $conn->prepare("UPDATE projects SET progress = ? WHERE id COLLATE utf8mb4_unicode_ci = ?");
                    if ($updateProjectStmt) {
                        $updateProjectStmt->bind_param("is", $avgProgress, $projectId);
                        $updateProjectStmt->execute();
                        $updateProjectStmt->close();
                    }
                }
                $avgStmt->close();
            }
        }
        
        $stmt->close();
        $conn->close();
        
        sendJSON(['success' => true, 'message' => 'Task progress updated successfully']);
        
    } elseif ($action === 'update') {
        $taskId = isset($_POST['taskId']) ? trim($_POST['taskId']) : '';
        $title = isset($_POST['title']) ? trim($_POST['title']) : '';
        $description = isset($_POST['description']) ? trim($_POST['description']) : '';
        $priority = isset($_POST['priority']) ? trim($_POST['priority']) : '';
        $status = isset($_POST['status']) ? trim($_POST['status']) : '';
        $dueDate = isset($_POST['dueDate']) ? trim($_POST['dueDate']) : null;
        
        if (empty($taskId)) {
            sendError('Task ID required');
        }
        
        // Validate priority
        if (!empty($priority) && !in_array($priority, ['low', 'medium', 'high'])) {
            $priority = 'medium';
        }
        
        // Validate status
        if (!empty($status) && !in_array($status, ['pending', 'in_progress', 'completed'])) {
            $status = 'pending';
        }
        
        $conn = getDBConnection();
        if (!$conn) {
            sendError('Database connection failed', 500);
        }
        
        // Verify task exists
        $taskCheck = $conn->prepare("SELECT id FROM tasks WHERE id COLLATE utf8mb4_unicode_ci = ?");
        if (!$taskCheck) {
            $conn->close();
            sendError('Database error: ' . $conn->error, 500);
        }
        $taskCheck->bind_param("s", $taskId);
        $taskCheck->execute();
        $taskResult = $taskCheck->get_result();
        if ($taskResult->num_rows === 0) {
            $taskCheck->close();
            $conn->close();
            sendError('Task not found');
        }
        $taskCheck->close();
        
        $updatedAt = date('Y-m-d H:i:s');
        $dueDateValue = (!empty($dueDate) && $dueDate !== 'null') ? $dueDate : null;
        
        $stmt = $conn->prepare("UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, dueDate = ?, updatedAt = ? WHERE id COLLATE utf8mb4_unicode_ci = ?");
        if (!$stmt) {
            $conn->close();
            sendError('Database error: ' . $conn->error, 500);
        }
        $stmt->bind_param("sssssss", $title, $description, $priority, $status, $dueDateValue, $updatedAt, $taskId);
        
        if (!$stmt->execute()) {
            $error = $stmt->error;
            $stmt->close();
            $conn->close();
            sendError('Error updating task: ' . $error, 500);
        }
        
        $stmt->close();
        $conn->close();
        
        sendJSON(['success' => true, 'message' => 'Task updated successfully']);
        
    } elseif ($action === 'delete') {
        $taskId = isset($_POST['taskId']) ? trim($_POST['taskId']) : '';
        
        if (empty($taskId)) {
            sendError('Task ID required');
        }
        
        $conn = getDBConnection();
        if (!$conn) {
            sendError('Database connection failed', 500);
        }
        
        // Get projectId before deleting to update project progress
        $projectStmt = $conn->prepare("SELECT projectId FROM tasks WHERE id COLLATE utf8mb4_unicode_ci = ?");
        $projectId = null;
        if ($projectStmt) {
            $projectStmt->bind_param("s", $taskId);
            $projectStmt->execute();
            $projectResult = $projectStmt->get_result();
            if ($projectRow = $projectResult->fetch_assoc()) {
                $projectId = $projectRow['projectId'];
            }
            $projectStmt->close();
        }
        
        $stmt = $conn->prepare("DELETE FROM tasks WHERE id COLLATE utf8mb4_unicode_ci = ?");
        if (!$stmt) {
            $conn->close();
            sendError('Database error: ' . $conn->error, 500);
        }
        $stmt->bind_param("s", $taskId);
        
        if (!$stmt->execute()) {
            $error = $stmt->error;
            $stmt->close();
            $conn->close();
            sendError('Error deleting task: ' . $error, 500);
        }
        
        // Update project progress after deletion
        if (!empty($projectId)) {
            $avgStmt = $conn->prepare("SELECT AVG(progress) as avgProgress FROM tasks WHERE projectId COLLATE utf8mb4_unicode_ci = ?");
            if ($avgStmt) {
                $avgStmt->bind_param("s", $projectId);
                $avgStmt->execute();
                $avgResult = $avgStmt->get_result();
                if ($avgRow = $avgResult->fetch_assoc()) {
                    $avgProgress = round($avgRow['avgProgress'] ?? 0);
                    $updateProjectStmt = $conn->prepare("UPDATE projects SET progress = ? WHERE id COLLATE utf8mb4_unicode_ci = ?");
                    if ($updateProjectStmt) {
                        $updateProjectStmt->bind_param("is", $avgProgress, $projectId);
                        $updateProjectStmt->execute();
                        $updateProjectStmt->close();
                    }
                }
                $avgStmt->close();
            }
        }
        
        $stmt->close();
        $conn->close();
        
        sendJSON(['success' => true, 'message' => 'Task deleted successfully']);
        
    } else {
        sendError('Invalid or missing action', 400);
    }
    
} catch (Exception $e) {
    sendError('Server error: ' . $e->getMessage(), 500);
} catch (Error $e) {
    sendError('Server error: ' . $e->getMessage(), 500);
}
