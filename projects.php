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

require_once 'config.php';

$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($action === 'create') {
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    
    if (empty($name) || empty($description)) {
        echo json_encode(['success' => false, 'message' => 'Name and description required']);
        exit;
    }
    
    $conn = getDBConnection();
    if ($conn) {
        $id = time() . rand(1000, 9999);
        $assignedUsersJson = json_encode([]);
        $status = 'active';
        $progress = 0;
        $createdAt = date('Y-m-d H:i:s');
        
        $stmt = $conn->prepare("INSERT INTO projects (id, name, description, assignedUsers, status, progress, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssiss", $id, $name, $description, $assignedUsersJson, $status, $progress, $createdAt);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Project created successfully', 'projectId' => $id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error creating project']);
        }
        $stmt->close();
        $conn->close();
    } else {
        $projects = readJSONFile('projects.json');
        $newProject = [
            'id' => time() . rand(1000, 9999),
            'name' => $name,
            'description' => $description,
            'assignedUsers' => [],
            'status' => 'active',
            'progress' => 0,
            'createdAt' => date('Y-m-d H:i:s')
        ];
        $projects[] = $newProject;
        writeJSONFile('projects.json', $projects);
        echo json_encode(['success' => true, 'message' => 'Project created successfully', 'projectId' => $newProject['id']]);
    }
    
} elseif ($action === 'getAll') {
    $conn = getDBConnection();
    if ($conn) {
        $result = $conn->query("SELECT * FROM projects ORDER BY createdAt DESC");
        $projects = [];
        while ($row = $result->fetch_assoc()) {
            $row['assignedUsers'] = json_decode($row['assignedUsers'], true) ?: [];
            $projects[] = $row;
        }
        echo json_encode(['success' => true, 'projects' => $projects]);
        $conn->close();
    } else {
        $projects = readJSONFile('projects.json');
        echo json_encode(['success' => true, 'projects' => $projects]);
    }
    
} elseif ($action === 'assign') {
    $projectId = $_POST['projectId'] ?? '';
    $userIds = json_decode($_POST['userIds'] ?? '[]', true);
    
    if (empty($projectId)) {
        echo json_encode(['success' => false, 'message' => 'Project ID required']);
        exit;
    }
    
    $conn = getDBConnection();
    if ($conn) {
        // Get project
        $stmt = $conn->prepare("SELECT assignedUsers FROM projects WHERE id = ?");
        $stmt->bind_param("s", $projectId);
        $stmt->execute();
        $result = $stmt->get_result();
        if (!$project = $result->fetch_assoc()) {
            echo json_encode(['success' => false, 'message' => 'Project not found']);
            exit;
        }
        
        // Update project
        $assignedUsersJson = json_encode($userIds);
        $stmt = $conn->prepare("UPDATE projects SET assignedUsers = ? WHERE id = ?");
        $stmt->bind_param("ss", $assignedUsersJson, $projectId);
        $stmt->execute();
        
        // Update all users
        $allUsers = $conn->query("SELECT id, projects FROM users");
        while ($user = $allUsers->fetch_assoc()) {
            $userProjects = json_decode($user['projects'], true) ?: [];
            $userProjects = array_values(array_filter($userProjects, function($p) use ($projectId) {
                return $p !== $projectId;
            }));
            
            if (in_array($user['id'], $userIds)) {
                if (!in_array($projectId, $userProjects)) {
                    $userProjects[] = $projectId;
                }
            }
            
            $userProjectsJson = json_encode($userProjects);
            $updateStmt = $conn->prepare("UPDATE users SET projects = ? WHERE id = ?");
            $updateStmt->bind_param("ss", $userProjectsJson, $user['id']);
            $updateStmt->execute();
            $updateStmt->close();
        }
        
        echo json_encode(['success' => true, 'message' => 'Project assignment updated']);
        $stmt->close();
        $conn->close();
    } else {
        $projects = readJSONFile('projects.json');
        $users = readJSONFile('users.json');
        
        // Find and update project
        foreach ($projects as &$project) {
            if ($project['id'] === $projectId) {
                $project['assignedUsers'] = $userIds;
                break;
            }
        }
        
        // Update all users
        foreach ($users as &$user) {
            $userProjects = $user['projects'] ?: [];
            $userProjects = array_values(array_filter($userProjects, function($p) use ($projectId) {
                return $p !== $projectId;
            }));
            
            if (in_array($user['id'], $userIds)) {
                if (!in_array($projectId, $userProjects)) {
                    $userProjects[] = $projectId;
                }
            }
            
            $user['projects'] = $userProjects;
        }
        
        writeJSONFile('projects.json', $projects);
        writeJSONFile('users.json', $users);
        echo json_encode(['success' => true, 'message' => 'Project assignment updated']);
    }
} else {
    // Return proper response for empty or invalid actions
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing action']);
}
?>

