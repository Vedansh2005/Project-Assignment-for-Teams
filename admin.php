<?php
require_once 'config.php';
requireAdmin();

$message = '';
$action = $_GET['action'] ?? '';
$tab = $_GET['tab'] ?? 'users';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn = getDBConnection();
    
    // Create project
    if (isset($_POST['createProject'])) {
        $name = $_POST['name'] ?? '';
        $description = $_POST['description'] ?? '';
        
        if ($name && $description && $conn) {
            $id = time() . rand(1000, 9999);
            $assignedUsersJson = json_encode([]);
            $status = 'active';
            $progress = 0;
            $createdAt = date('Y-m-d H:i:s');
            
            $stmt = $conn->prepare("INSERT INTO projects (id, name, description, assignedUsers, status, progress, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssssiss", $id, $name, $description, $assignedUsersJson, $status, $progress, $createdAt);
            
            if ($stmt->execute()) {
                $message = 'Project created successfully!';
                $tab = 'projects';
            } else {
                $message = 'Error creating project';
            }
            $stmt->close();
        }
    }
    
    // Assign project
    if (isset($_POST['assignProject']) && $conn) {
        $projectId = $_POST['projectId'] ?? '';
        $userIds = $_POST['userIds'] ?? [];
        
        if ($projectId && !empty($userIds)) {
            $assignedUsersJson = json_encode($userIds);
            $stmt = $conn->prepare("UPDATE projects SET assignedUsers = ? WHERE id = ?");
            $stmt->bind_param("ss", $assignedUsersJson, $projectId);
            $stmt->execute();
            
            // Update all users
            $allUsers = $conn->query("SELECT id, projects FROM users");
            while ($user = $allUsers->fetch_assoc()) {
                $userProjects = json_decode($user['projects'] ?? '[]', true) ?: [];
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
            
            $stmt->close();
            $message = 'Project assigned successfully!';
            $tab = 'assign';
        }
    }
    
    // Create task
    if (isset($_POST['createTask']) && $conn) {
        $projectId = $_POST['projectId'] ?? '';
        $userId = $_POST['userId'] ?? '';
        $title = $_POST['title'] ?? '';
        $description = $_POST['description'] ?? '';
        $taskType = $_POST['taskType'] ?? '';
        $priority = $_POST['priority'] ?? 'medium';
        $dueDate = $_POST['dueDate'] ?? null;
        
        if ($projectId && $userId && $title && $taskType) {
            $id = uniqid('task_', true);
            $status = 'pending';
            $progress = 0;
            $createdAt = date('Y-m-d H:i:s');
            $dueDateValue = (!empty($dueDate) && $dueDate !== 'null') ? $dueDate : null;
            
            $stmt = $conn->prepare("INSERT INTO tasks (id, projectId, userId, title, description, taskType, priority, status, progress, dueDate, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssssssssiss", $id, $projectId, $userId, $title, $description, $taskType, $priority, $status, $progress, $dueDateValue, $createdAt);
            
            if ($stmt->execute()) {
                $message = 'Task created successfully!';
                $tab = 'tasks';
            } else {
                $message = 'Error creating task';
            }
            $stmt->close();
        }
    }
    
    // Update task
    if (isset($_POST['updateTask']) && $conn) {
        $taskId = $_POST['taskId'] ?? '';
        $title = $_POST['title'] ?? '';
        $description = $_POST['description'] ?? '';
        $priority = $_POST['priority'] ?? 'medium';
        $status = $_POST['status'] ?? 'pending';
        $dueDate = $_POST['dueDate'] ?? null;
        
        if ($taskId) {
            $updatedAt = date('Y-m-d H:i:s');
            $dueDateValue = (!empty($dueDate) && $dueDate !== 'null') ? $dueDate : null;
            
            $stmt = $conn->prepare("UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, dueDate = ?, updatedAt = ? WHERE id = ?");
            $stmt->bind_param("sssssss", $title, $description, $priority, $status, $dueDateValue, $updatedAt, $taskId);
            
            if ($stmt->execute()) {
                $message = 'Task updated successfully!';
                $tab = 'tasks';
                $action = '';
            } else {
                $message = 'Error updating task';
            }
            $stmt->close();
        }
    }
    
    if ($conn) $conn->close();
}

// Handle delete task
if ($action === 'delete' && isset($_GET['taskId'])) {
    $taskId = $_GET['taskId'] ?? '';
    $conn = getDBConnection();
    if ($conn && $taskId) {
        // Get project ID before deleting
        $stmt = $conn->prepare("SELECT projectId FROM tasks WHERE id = ?");
        $stmt->bind_param("s", $taskId);
        $stmt->execute();
        $result = $stmt->get_result();
        $projectId = null;
        if ($row = $result->fetch_assoc()) {
            $projectId = $row['projectId'];
        }
        $stmt->close();
        
        // Delete task
        $stmt = $conn->prepare("DELETE FROM tasks WHERE id = ?");
        $stmt->bind_param("s", $taskId);
        $stmt->execute();
        $stmt->close();
        
        // Update project progress
        if ($projectId) {
            $avgStmt = $conn->prepare("SELECT AVG(progress) as avgProgress FROM tasks WHERE projectId = ?");
            $avgStmt->bind_param("s", $projectId);
            $avgStmt->execute();
            $avgResult = $avgStmt->get_result();
            if ($avgRow = $avgResult->fetch_assoc()) {
                $avgProgress = round($avgRow['avgProgress'] ?? 0);
                $updateProjectStmt = $conn->prepare("UPDATE projects SET progress = ? WHERE id = ?");
                $updateProjectStmt->bind_param("is", $avgProgress, $projectId);
                $updateProjectStmt->execute();
                $updateProjectStmt->close();
            }
            $avgStmt->close();
        }
        
        $conn->close();
        $message = 'Task deleted successfully!';
        $tab = 'tasks';
    }
}

// Get data
$conn = getDBConnection();
$users = [];
$projects = [];
$tasks = [];
$currentTask = null;

if ($conn) {
    // Get all users
    $result = $conn->query("SELECT id, firstName, email, gender, username, experience, skills, qualifications, projects FROM users");
    while ($row = $result->fetch_assoc()) {
        $row['skills'] = json_decode($row['skills'] ?? '[]', true) ?: [];
        $row['qualifications'] = json_decode($row['qualifications'] ?? '[]', true) ?: [];
        $row['projects'] = json_decode($row['projects'] ?? '[]', true) ?: [];
        $users[] = $row;
    }
    
    // Get all projects
    $result = $conn->query("SELECT * FROM projects ORDER BY createdAt DESC");
    while ($row = $result->fetch_assoc()) {
        $row['assignedUsers'] = json_decode($row['assignedUsers'] ?? '[]', true) ?: [];
        $projects[] = $row;
    }
    
    // Get all tasks
    $result = $conn->query("SELECT t.*, u.firstName, u.email, p.name as projectName FROM tasks t LEFT JOIN users u ON t.userId COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci LEFT JOIN projects p ON t.projectId COLLATE utf8mb4_unicode_ci = p.id COLLATE utf8mb4_unicode_ci ORDER BY t.createdAt DESC");
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }
    
    // Get task for editing
    if ($action === 'edit' && isset($_GET['taskId'])) {
        $taskId = $_GET['taskId'];
        $stmt = $conn->prepare("SELECT * FROM tasks WHERE id = ?");
        $stmt->bind_param("s", $taskId);
        $stmt->execute();
        $result = $stmt->get_result();
        $currentTask = $result->fetch_assoc();
        $stmt->close();
    }
    
    $conn->close();
}

// Count tasks per user
$taskCounts = [];
foreach ($tasks as $task) {
    if ($task['userId']) {
        $taskCounts[$task['userId']] = ($taskCounts[$task['userId']] ?? 0) + 1;
    }
}
?>
<!DOCTYPE html>
<html>
<head>
  <title>Admin Dashboard - TeamFlow</title>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="styles.css">
  <style>
    body { background-color: #f5f5f5; margin: 0; padding: 0; }
    .header { background-color: white; padding: 20px; border-bottom: 1px solid #ddd; }
    .header-content { width: 90%; max-width: 1200px; margin: 0 auto; }
    .header h1 { margin: 0; color: #333; }
    .header-buttons { float: right; margin-top: -50px; }
    .container { width: 90%; max-width: 1200px; margin: 20px auto; }
    .tabs { margin-bottom: 20px; }
    .tabs a { display: inline-block; padding: 10px 20px; margin-right: 5px; background-color: #f3f4f6; border: 1px solid #ddd; text-decoration: none; color: #333; }
    .tabs a:hover { background-color: #e5e7eb; }
    .tabs a.active { background-color: white; border-bottom: 2px solid #0ea5e9; }
    table { width: 100%; background-color: white; border-collapse: collapse; }
    table th, table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    table th { background-color: #f9f9f9; font-weight: bold; }
    .project-box { width: 48%; float: left; margin: 1%; background-color: white; padding: 20px; border: 1px solid #ddd; box-sizing: border-box; }
    .clearfix:after { content: ""; display: table; clear: both; }
    .message { padding: 10px; margin-bottom: 15px; background-color: #d1fae5; color: #065f46; }
    .form-container { background-color: white; padding: 20px; border: 1px solid #ddd; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-content">
      <h1>Admin Dashboard</h1>
      <p>Manage your team and projects</p>
      <div class="header-buttons">
        <a href="logout.php" class="btn">Logout</a>
      </div>
      <div class="clearfix"></div>
    </div>
  </div>

  <div class="container">
    <?php if ($message): ?>
    <div class="message"><?php echo htmlspecialchars($message); ?></div>
    <?php endif; ?>

    <div class="tabs">
      <a href="admin.php?tab=users" class="<?php echo $tab === 'users' ? 'active' : ''; ?>">All Users</a>
      <a href="admin.php?tab=projects" class="<?php echo $tab === 'projects' ? 'active' : ''; ?>">Projects</a>
      <a href="admin.php?tab=assign" class="<?php echo $tab === 'assign' ? 'active' : ''; ?>">Assign Projects</a>
      <a href="admin.php?tab=tasks" class="<?php echo $tab === 'tasks' ? 'active' : ''; ?>">Assign Tasks</a>
    </div>

    <?php if ($tab === 'users'): ?>
    <div class="card">
      <h2>All Registered Users</h2>
      <?php if (empty($users)): ?>
        <p>No users registered yet.</p>
      <?php else: ?>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Experience</th>
              <th>Skills</th>
              <th>Assigned Projects</th>
              <th>Tasks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($users as $user): ?>
              <?php
              $assignedProjects = [];
              foreach ($projects as $project) {
                if (in_array($user['id'], $project['assignedUsers']) || in_array($user['id'], $user['projects'])) {
                  $assignedProjects[] = $project['name'];
                }
              }
              $taskCount = $taskCounts[$user['id']] ?? 0;
              ?>
              <tr>
                <td><?php echo htmlspecialchars($user['firstName'] ?? 'N/A'); ?></td>
                <td><?php echo htmlspecialchars($user['email'] ?? 'N/A'); ?></td>
                <td><?php echo htmlspecialchars($user['experience'] ?? '0'); ?> years</td>
                <td><?php echo htmlspecialchars(implode(', ', $user['skills'])); ?></td>
                <td><?php echo htmlspecialchars(implode(', ', $assignedProjects) ?: 'None'); ?></td>
                <td><?php echo $taskCount; ?></td>
                <td>
                  <?php if (!empty($assignedProjects)): ?>
                    <a href="admin.php?tab=tasks&userId=<?php echo htmlspecialchars($user['id']); ?>" class="btn" style="padding: 5px 10px; font-size: 12px;">+ Assign Task</a>
                  <?php else: ?>
                    <span style="color: #9ca3af; font-size: 12px;">No Project</span>
                  <?php endif; ?>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      <?php endif; ?>
    </div>

    <?php elseif ($tab === 'projects'): ?>
    <div class="card">
      <h2>Projects</h2>
      <?php if ($action === 'create'): ?>
        <div class="form-container">
          <h3>Create New Project</h3>
          <form method="POST" action="admin.php?tab=projects">
            <input type="hidden" name="createProject" value="1">
            <div class="form-group">
              <label>Project Name</label>
              <input type="text" name="name" required>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea name="description" rows="5" required></textarea>
            </div>
            <button type="submit" class="btn">Create Project</button>
            <a href="admin.php?tab=projects" class="btn" style="background-color: #666; text-decoration: none; display: inline-block; margin-left: 10px;">Cancel</a>
          </form>
        </div>
      <?php else: ?>
        <a href="admin.php?tab=projects&action=create" class="btn" style="margin-bottom: 20px;">Create New Project</a>
        <?php if (empty($projects)): ?>
          <p>No projects created yet.</p>
        <?php else: ?>
          <div class="clearfix">
            <?php foreach ($projects as $project): ?>
              <div class="project-box">
                <h3><?php echo htmlspecialchars($project['name']); ?></h3>
                <p><?php echo htmlspecialchars($project['description']); ?></p>
                <p><strong>Status:</strong> <?php echo htmlspecialchars($project['status']); ?></p>
                <p><strong>Progress:</strong> <?php echo htmlspecialchars($project['progress']); ?>%</p>
                <p><strong>Assigned Users:</strong> <?php echo count($project['assignedUsers']); ?></p>
                <a href="admin.php?tab=assign&projectId=<?php echo htmlspecialchars($project['id']); ?>" class="btn" style="margin-top: 10px;">Assign Users</a>
              </div>
            <?php endforeach; ?>
          </div>
          <div class="clearfix"></div>
        <?php endif; ?>
      <?php endif; ?>
    </div>

    <?php elseif ($tab === 'assign'): ?>
    <div class="card">
      <h2>Assign Projects to Users</h2>
      <form method="POST" action="admin.php?tab=assign">
        <input type="hidden" name="assignProject" value="1">
        <div class="form-group">
          <label>Select Project</label>
          <select name="projectId" required>
            <option value="">Select a project</option>
            <?php foreach ($projects as $project): ?>
              <option value="<?php echo htmlspecialchars($project['id']); ?>" <?php echo (isset($_GET['projectId']) && $_GET['projectId'] === $project['id']) ? 'selected' : ''; ?>>
                <?php echo htmlspecialchars($project['name']); ?>
              </option>
            <?php endforeach; ?>
          </select>
        </div>
        <div class="form-group">
          <label>Select Users (hold Ctrl/Cmd to select multiple)</label>
          <select name="userIds[]" multiple style="height: 200px;" required>
            <?php foreach ($users as $user): ?>
              <option value="<?php echo htmlspecialchars($user['id']); ?>">
                <?php echo htmlspecialchars($user['firstName'] . ' (' . $user['email'] . ')'); ?>
              </option>
            <?php endforeach; ?>
          </select>
        </div>
        <button type="submit" class="btn">Assign Project</button>
      </form>
    </div>

    <?php elseif ($tab === 'tasks'): ?>
    <div class="card">
      <h2>Task Management</h2>
      <?php if ($action === 'create' || ($action === 'edit' && $currentTask)): ?>
        <div class="form-container">
          <h3><?php echo $action === 'create' ? 'Create New Task' : 'Edit Task'; ?></h3>
          <form method="POST" action="admin.php?tab=tasks">
            <input type="hidden" name="<?php echo $action === 'create' ? 'createTask' : 'updateTask'; ?>" value="1">
            <?php if ($action === 'edit'): ?>
              <input type="hidden" name="taskId" value="<?php echo htmlspecialchars($currentTask['id']); ?>">
            <?php endif; ?>
            <?php if ($action === 'create'): ?>
              <div class="form-group">
                <label>Select Project</label>
                <select name="projectId" required>
                  <option value="">Select a project</option>
                  <?php foreach ($projects as $project): ?>
                    <option value="<?php echo htmlspecialchars($project['id']); ?>">
                      <?php echo htmlspecialchars($project['name']); ?>
                    </option>
                  <?php endforeach; ?>
                </select>
              </div>
              <div class="form-group">
                <label>Select User</label>
                <select name="userId" required>
                  <option value="">Select a user</option>
                  <?php foreach ($users as $user): ?>
                    <option value="<?php echo htmlspecialchars($user['id']); ?>" <?php echo (isset($_GET['userId']) && $_GET['userId'] === $user['id']) ? 'selected' : ''; ?>>
                      <?php echo htmlspecialchars($user['firstName'] . ' (' . $user['email'] . ')'); ?>
                    </option>
                  <?php endforeach; ?>
                </select>
              </div>
            <?php endif; ?>
            <div class="form-group">
              <label>Task Title</label>
              <input type="text" name="title" value="<?php echo htmlspecialchars($currentTask['title'] ?? ''); ?>" required>
            </div>
            <div class="form-group">
              <label>Task Description</label>
              <textarea name="description" rows="4"><?php echo htmlspecialchars($currentTask['description'] ?? ''); ?></textarea>
            </div>
            <?php if ($action === 'create'): ?>
              <div class="form-group">
                <label>Task Type</label>
                <select name="taskType" required>
                  <option value="">Select Task Type</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="API">API</option>
                  <option value="Testing">Testing</option>
                  <option value="Design">Design</option>
                  <option value="Documentation">Documentation</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            <?php endif; ?>
            <div class="form-group">
              <label>Priority</label>
              <select name="priority">
                <option value="low" <?php echo (($currentTask['priority'] ?? 'medium') === 'low') ? 'selected' : ''; ?>>Low</option>
                <option value="medium" <?php echo (($currentTask['priority'] ?? 'medium') === 'medium') ? 'selected' : ''; ?>>Medium</option>
                <option value="high" <?php echo (($currentTask['priority'] ?? 'medium') === 'high') ? 'selected' : ''; ?>>High</option>
              </select>
            </div>
            <?php if ($action === 'edit'): ?>
              <div class="form-group">
                <label>Status</label>
                <select name="status">
                  <option value="pending" <?php echo (($currentTask['status'] ?? 'pending') === 'pending') ? 'selected' : ''; ?>>Pending</option>
                  <option value="in_progress" <?php echo (($currentTask['status'] ?? 'pending') === 'in_progress') ? 'selected' : ''; ?>>In Progress</option>
                  <option value="completed" <?php echo (($currentTask['status'] ?? 'pending') === 'completed') ? 'selected' : ''; ?>>Completed</option>
                </select>
              </div>
            <?php endif; ?>
            <div class="form-group">
              <label>Due Date (Optional)</label>
              <input type="date" name="dueDate" value="<?php echo htmlspecialchars($currentTask['dueDate'] ?? ''); ?>">
            </div>
            <button type="submit" class="btn"><?php echo $action === 'create' ? 'Create Task' : 'Update Task'; ?></button>
            <a href="admin.php?tab=tasks" class="btn" style="background-color: #666; text-decoration: none; display: inline-block; margin-left: 10px;">Cancel</a>
          </form>
        </div>
      <?php else: ?>
        <a href="admin.php?tab=tasks&action=create<?php echo isset($_GET['userId']) ? '&userId=' . htmlspecialchars($_GET['userId']) : ''; ?>" class="btn" style="margin-bottom: 20px;">+ Create New Task</a>
        
        <?php if (empty($tasks)): ?>
          <p>No tasks created yet.</p>
        <?php else: ?>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($tasks as $task): ?>
                <tr>
                  <td><?php echo htmlspecialchars($task['title']); ?></td>
                  <td><?php echo htmlspecialchars($task['projectName'] ?? 'Unknown'); ?></td>
                  <td><?php echo htmlspecialchars($task['firstName'] ?? 'Unknown'); ?></td>
                  <td><span class="badge"><?php echo htmlspecialchars($task['taskType'] ?? 'N/A'); ?></span></td>
                  <td><span class="badge"><?php echo htmlspecialchars($task['priority'] ?? 'medium'); ?></span></td>
                  <td><?php echo htmlspecialchars($task['status'] ?? 'pending'); ?></td>
                  <td><?php echo htmlspecialchars($task['progress'] ?? 0); ?>%</td>
                  <td>
                    <a href="admin.php?tab=tasks&action=edit&taskId=<?php echo htmlspecialchars($task['id']); ?>" class="btn" style="padding: 5px 10px; font-size: 12px;">Edit</a>
                    <a href="admin.php?tab=tasks&action=delete&taskId=<?php echo htmlspecialchars($task['id']); ?>" class="btn" style="padding: 5px 10px; font-size: 12px; background-color: #dc2626;" onclick="return confirm('Are you sure?');">Delete</a>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        <?php endif; ?>
      <?php endif; ?>
    </div>
    <?php endif; ?>
  </div>
</body>
</html>
