<?php
// Set proper headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Start session if not already started (after headers are set)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'config.php';

$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($action === 'create') {
    $projectId = $_POST['projectId'] ?? '';
    $userId = $_POST['userId'] ?? '';
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $taskType = $_POST['taskType'] ?? '';
    $priority = $_POST['priority'] ?? 'medium';
    $dueDate = $_POST['dueDate'] ?? null;
    
    if (empty($projectId) || empty($userId) || empty($title) || empty($taskType)) {
        echo json_encode(['success' => false, 'message' => 'Project ID, User ID, Title, and Task Type are required']);
        exit;
    }
    
    $conn = getDBConnection();
    if ($conn) {
        $id = time() . rand(1000, 9999);
        $status = 'pending';
        $progress = 0;
        $createdAt = date('Y-m-d H:i:s');
        $dueDateValue = !empty($dueDate) ? $dueDate : null;
        
        $stmt = $conn->prepare("INSERT INTO tasks (id, projectId, userId, title, description, taskType, priority, status, progress, dueDate, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssssssiss", $id, $projectId, $userId, $title, $description, $taskType, $priority, $status, $progress, $dueDateValue, $createdAt);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Task created successfully', 'taskId' => $id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error creating task: ' . $conn->error]);
        }
        $stmt->close();
        $conn->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    }
    
} elseif ($action === 'getAll') {
    $projectId = $_GET['projectId'] ?? '';
    $userId = $_GET['userId'] ?? '';
    
    $conn = getDBConnection();
    if ($conn) {
        $query = "SELECT t.*, u.firstName, u.email, p.name as projectName FROM tasks t 
                  LEFT JOIN users u ON t.userId = u.id 
                  LEFT JOIN projects p ON t.projectId = p.id WHERE 1=1";
        $params = [];
        $types = "";
        
        if (!empty($projectId)) {
            $query .= " AND t.projectId = ?";
            $params[] = $projectId;
            $types .= "s";
        }
        
        if (!empty($userId)) {
            $query .= " AND t.userId = ?";
            $params[] = $userId;
            $types .= "s";
        }
        
        $query .= " ORDER BY t.createdAt DESC";
        
        $stmt = $conn->prepare($query);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        
        $tasks = [];
        while ($row = $result->fetch_assoc()) {
            $tasks[] = $row;
        }
        
        echo json_encode(['success' => true, 'tasks' => $tasks]);
        $stmt->close();
        $conn->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Database connection failed', 'tasks' => []]);
    }
    
} elseif ($action === 'getByProject') {
    $projectId = $_GET['projectId'] ?? '';
    
    if (empty($projectId)) {
        echo json_encode(['success' => false, 'message' => 'Project ID required', 'tasks' => []]);
        exit;
    }
    
    $conn = getDBConnection();
    if ($conn) {
        $stmt = $conn->prepare("SELECT t.*, u.firstName, u.email, u.skills, u.experience FROM tasks t 
                               LEFT JOIN users u ON t.userId = u.id 
                               WHERE t.projectId = ? ORDER BY t.createdAt DESC");
        $stmt->bind_param("s", $projectId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $tasks = [];
        while ($row = $result->fetch_assoc()) {
            if ($row['skills']) {
                $row['skills'] = json_decode($row['skills'], true) ?: [];
            }
            $tasks[] = $row;
        }
        
        echo json_encode(['success' => true, 'tasks' => $tasks]);
        $stmt->close();
        $conn->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Database connection failed', 'tasks' => []]);
    }
    
} elseif ($action === 'updateProgress') {
    $taskId = $_POST['taskId'] ?? '';
    $progress = $_POST['progress'] ?? 0;
    
    if (empty($taskId)) {
        echo json_encode(['success' => false, 'message' => 'Task ID required']);
        exit;
    }
    
    $progress = max(0, min(100, intval($progress))); // Ensure progress is between 0-100
    
    $conn = getDBConnection();
    if ($conn) {
        // Update task progress and status
        $status = $progress == 100 ? 'completed' : ($progress > 0 ? 'in_progress' : 'pending');
        $updatedAt = date('Y-m-d H:i:s');
        
        $stmt = $conn->prepare("UPDATE tasks SET progress = ?, status = ?, updatedAt = ? WHERE id = ?");
        $stmt->bind_param("isss", $progress, $status, $updatedAt, $taskId);
        
        if ($stmt->execute()) {
            // Update project progress based on average of all tasks
            $projectStmt = $conn->prepare("SELECT projectId FROM tasks WHERE id = ?");
            $projectStmt->bind_param("s", $taskId);
            $projectStmt->execute();
            $projectResult = $projectStmt->get_result();
            if ($projectRow = $projectResult->fetch_assoc()) {
                $projectId = $projectRow['projectId'];
                
                // Calculate average progress of all tasks in the project
                $avgStmt = $conn->prepare("SELECT AVG(progress) as avgProgress FROM tasks WHERE projectId = ?");
                $avgStmt->bind_param("s", $projectId);
                $avgStmt->execute();
                $avgResult = $avgStmt->get_result();
                if ($avgRow = $avgResult->fetch_assoc()) {
                    $avgProgress = round($avgRow['avgProgress']);
                    $updateProjectStmt = $conn->prepare("UPDATE projects SET progress = ? WHERE id = ?");
                    $updateProjectStmt->bind_param("is", $avgProgress, $projectId);
                    $updateProjectStmt->execute();
                    $updateProjectStmt->close();
                }
                $avgStmt->close();
            }
            $projectStmt->close();
            
            echo json_encode(['success' => true, 'message' => 'Task progress updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error updating task progress']);
        }
        $stmt->close();
        $conn->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    }
    
} elseif ($action === 'update') {
    $taskId = $_POST['taskId'] ?? '';
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $priority = $_POST['priority'] ?? '';
    $status = $_POST['status'] ?? '';
    $dueDate = $_POST['dueDate'] ?? null;
    
    if (empty($taskId)) {
        echo json_encode(['success' => false, 'message' => 'Task ID required']);
        exit;
    }
    
    $conn = getDBConnection();
    if ($conn) {
        $updatedAt = date('Y-m-d H:i:s');
        $stmt = $conn->prepare("UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, dueDate = ?, updatedAt = ? WHERE id = ?");
        $stmt->bind_param("sssssss", $title, $description, $priority, $status, $dueDate, $updatedAt, $taskId);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Task updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error updating task']);
        }
        $stmt->close();
        $conn->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    }
    
} elseif ($action === 'delete') {
    $taskId = $_POST['taskId'] ?? '';
    
    if (empty($taskId)) {
        echo json_encode(['success' => false, 'message' => 'Task ID required']);
        exit;
    }
    
    $conn = getDBConnection();
    if ($conn) {
        $stmt = $conn->prepare("DELETE FROM tasks WHERE id = ?");
        $stmt->bind_param("s", $taskId);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Task deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error deleting task']);
        }
        $stmt->close();
        $conn->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    }
    
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing action']);
}
?>

