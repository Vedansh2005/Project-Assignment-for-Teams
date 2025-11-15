<?php
require_once 'config.php';
requireAdmin();

$message = isset($_GET['msg']) ? urldecode($_GET['msg']) : '';
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
            
            $name = mysqli_real_escape_string($conn, $name);
            $description = mysqli_real_escape_string($conn, $description);
            $assignedUsersJson = mysqli_real_escape_string($conn, $assignedUsersJson);
            
            if (mysqli_query($conn, "INSERT INTO projects (id, name, description, assignedUsers, status, progress, createdAt) VALUES ('$id', '$name', '$description', '$assignedUsersJson', '$status', $progress, '$createdAt')")) {
                $message = 'Project created successfully!';
                $tab = 'projects';
            } else {
                $message = 'Error creating project';
            }
        }
    }
    
    // Update project
    if (isset($_POST['updateProject']) && $conn) {
        $projectId = $_POST['projectId'] ?? '';
        $name = $_POST['name'] ?? '';
        $description = $_POST['description'] ?? '';
        $status = $_POST['status'] ?? 'active';
        
        if ($projectId && $name && $description) {
            $projectId = mysqli_real_escape_string($conn, $projectId);
            $name = mysqli_real_escape_string($conn, $name);
            $description = mysqli_real_escape_string($conn, $description);
            $status = mysqli_real_escape_string($conn, $status);
            
            if (mysqli_query($conn, "UPDATE projects SET name = '$name', description = '$description', status = '$status' WHERE id = '$projectId'")) {
                $message = 'Project updated successfully!';
                $tab = 'projects';
                $action = '';
            } else {
                $message = 'Error updating project';
            }
        }
    }
    
    // Delete project (with confirmation)
    if (isset($_POST['deleteProject']) && $conn) {
        $projectId = $_POST['projectId'] ?? '';
        
        if ($projectId) {
            $projectId = mysqli_real_escape_string($conn, $projectId);
            
            // Delete all tasks associated with this project
            mysqli_query($conn, "DELETE FROM tasks WHERE projectId COLLATE utf8mb4_unicode_ci = '$projectId'");
            
            // Remove project from all users' projects array
            $allUsers = mysqli_query($conn, "SELECT id, projects FROM users");
            while ($user = mysqli_fetch_assoc($allUsers)) {
                $userProjects = json_decode($user['projects'] ?? '[]', true) ?: [];
                $userProjects = array_values(array_filter($userProjects, function($p) use ($projectId) {
                    return $p !== $projectId;
                }));
                
                $userProjectsJson = mysqli_real_escape_string($conn, json_encode($userProjects));
                $userId = mysqli_real_escape_string($conn, $user['id']);
                mysqli_query($conn, "UPDATE users SET projects = '$userProjectsJson' WHERE id = '$userId'");
            }
            
            // Delete the project
            if (mysqli_query($conn, "DELETE FROM projects WHERE id = '$projectId'")) {
                $message = 'Project deleted successfully!';
                $tab = 'projects';
                $action = '';
            } else {
                $message = 'Error deleting project';
            }
        }
    }
    
    // Assign project
    if (isset($_POST['assignProject']) && $conn) {
        $projectId = $_POST['projectId'] ?? '';
        $userIds = $_POST['userIds'] ?? [];
        
        if ($projectId && !empty($userIds)) {
            $projectIdEscaped = mysqli_real_escape_string($conn, $projectId);
            $assignedUsersJson = mysqli_real_escape_string($conn, json_encode($userIds));
            
            // Update project assignedUsers
            if (mysqli_query($conn, "UPDATE projects SET assignedUsers = '$assignedUsersJson' WHERE id = '$projectIdEscaped'")) {
                // Update all users - remove project from everyone first, then add to selected users
                $allUsers = mysqli_query($conn, "SELECT id, projects FROM users");
                if ($allUsers !== false) {
                    while ($user = mysqli_fetch_assoc($allUsers)) {
                        if (!$user) continue;
                        
                        $userProjects = json_decode($user['projects'] ?? '[]', true) ?: [];
                        // Remove project from this user's list
                        $userProjects = array_values(array_filter($userProjects, function($p) use ($projectId) {
                            return $p !== $projectId;
                        }));
                        
                        // Check if this user should have the project (convert both to strings for comparison)
                        $userIdStr = (string)$user['id'];
                        $shouldHaveProject = false;
                        foreach ($userIds as $selectedUserId) {
                            if ((string)$selectedUserId === $userIdStr) {
                                $shouldHaveProject = true;
                                break;
                            }
                        }
                        
                        if ($shouldHaveProject) {
                            if (!in_array($projectId, $userProjects)) {
                                $userProjects[] = $projectId;
                            }
                        }
                        
                        $userProjectsJson = mysqli_real_escape_string($conn, json_encode($userProjects));
                        $userIdEscaped = mysqli_real_escape_string($conn, $user['id']);
                        mysqli_query($conn, "UPDATE users SET projects = '$userProjectsJson' WHERE id = '$userIdEscaped'");
                    }
                    mysqli_free_result($allUsers);
                }
                
                header('Location: admin.php?tab=assign&projectId=' . urlencode($projectId) . '&msg=' . urlencode('Project assigned successfully!'));
                exit;
            } else {
                $errorMsg = mysqli_error($conn);
                $message = 'Error assigning project: ' . ($errorMsg ?: 'Unknown error');
                $tab = 'assign';
            }
        } else {
            $message = 'Please select a project and at least one user';
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
            $dueDateValue = (!empty($dueDate) && $dueDate !== 'null') ? $dueDate : 'NULL';
            
            $projectId = mysqli_real_escape_string($conn, $projectId);
            $userId = mysqli_real_escape_string($conn, $userId);
            $title = mysqli_real_escape_string($conn, $title);
            $description = mysqli_real_escape_string($conn, $description);
            $taskType = mysqli_real_escape_string($conn, $taskType);
            $priority = mysqli_real_escape_string($conn, $priority);
            $id = mysqli_real_escape_string($conn, $id);
            
            $dueDateSql = $dueDateValue === 'NULL' ? 'NULL' : "'" . mysqli_real_escape_string($conn, $dueDateValue) . "'";
            
            if (mysqli_query($conn, "INSERT INTO tasks (id, projectId, userId, title, description, taskType, priority, status, progress, dueDate, createdAt) VALUES ('$id', '$projectId', '$userId', '$title', '$description', '$taskType', '$priority', '$status', $progress, $dueDateSql, '$createdAt')")) {
                $message = 'Task created successfully!';
                $tab = 'tasks';
            } else {
                $message = 'Error creating task';
            }
        }
    }
    
    // Update task
    if (isset($_POST['updateTask']) && $conn) {
        $taskId = $_POST['taskId'] ?? '';
        $projectId = $_POST['projectId'] ?? '';
        $userId = $_POST['userId'] ?? '';
        $title = $_POST['title'] ?? '';
        $description = $_POST['description'] ?? '';
        $priority = $_POST['priority'] ?? 'medium';
        $status = $_POST['status'] ?? 'pending';
        $dueDate = $_POST['dueDate'] ?? null;
        
        if ($taskId) {
            $updatedAt = date('Y-m-d H:i:s');
            $dueDateValue = (!empty($dueDate) && $dueDate !== 'null') ? $dueDate : 'NULL';
            
            $taskId = mysqli_real_escape_string($conn, $taskId);
            $projectId = mysqli_real_escape_string($conn, $projectId);
            $userId = mysqli_real_escape_string($conn, $userId);
            $title = mysqli_real_escape_string($conn, $title);
            $description = mysqli_real_escape_string($conn, $description);
            $priority = mysqli_real_escape_string($conn, $priority);
            $status = mysqli_real_escape_string($conn, $status);
            
            $dueDateSql = $dueDateValue === 'NULL' ? 'NULL' : "'" . mysqli_real_escape_string($conn, $dueDateValue) . "'";
            
            // Get current task to check if project/user changed
            $currentTaskResult = mysqli_query($conn, "SELECT projectId, userId FROM tasks WHERE id = '$taskId'");
            $oldTaskData = mysqli_fetch_assoc($currentTaskResult);
            $oldProjectId = $oldTaskData['projectId'] ?? '';
            
            // Build update query - always include userId and projectId when editing (form pre-selects current values)
            $updateFields = "title = '$title', description = '$description', priority = '$priority', status = '$status', dueDate = $dueDateSql, updatedAt = '$updatedAt'";
            if (!empty($projectId)) {
                $updateFields .= ", projectId = '$projectId'";
            }
            if (!empty($userId)) {
                $updateFields .= ", userId = '$userId'";
            }
            
            if (mysqli_query($conn, "UPDATE tasks SET $updateFields WHERE id = '$taskId'")) {
                // Update project progress for both old and new projects if project was changed
                if (!empty($projectId)) {
                    $avgResult = mysqli_query($conn, "SELECT AVG(progress) as avgProgress FROM tasks WHERE projectId COLLATE utf8mb4_unicode_ci = '$projectId'");
                    if ($avgRow = mysqli_fetch_assoc($avgResult)) {
                        $avgProgress = round($avgRow['avgProgress'] ?? 0);
                        mysqli_query($conn, "UPDATE projects SET progress = $avgProgress WHERE id COLLATE utf8mb4_unicode_ci = '$projectId'");
                    }
                }
                // Also update old project's progress if project was changed
                if (!empty($oldProjectId) && $oldProjectId !== $projectId && !empty($projectId)) {
                    $oldAvgResult = mysqli_query($conn, "SELECT AVG(progress) as avgProgress FROM tasks WHERE projectId COLLATE utf8mb4_unicode_ci = '$oldProjectId'");
                    if ($oldAvgRow = mysqli_fetch_assoc($oldAvgResult)) {
                        $oldAvgProgress = round($oldAvgRow['avgProgress'] ?? 0);
                        mysqli_query($conn, "UPDATE projects SET progress = $oldAvgProgress WHERE id COLLATE utf8mb4_unicode_ci = '$oldProjectId'");
                    }
                }
                
                $message = 'Task updated successfully!';
                $tab = 'tasks';
                $action = '';
            } else {
                $message = 'Error updating task';
            }
        }
    }
    
    if ($conn) mysqli_close($conn);
}

// Handle delete task
if ($action === 'delete' && isset($_GET['taskId'])) {
    $taskId = $_GET['taskId'] ?? '';
    $conn = getDBConnection();
    if ($conn && $taskId) {
        // Get project ID before deleting
        $taskId = mysqli_real_escape_string($conn, $taskId);
        $result = mysqli_query($conn, "SELECT projectId FROM tasks WHERE id = '$taskId'");
        $projectId = null;
        if ($row = mysqli_fetch_assoc($result)) {
            $projectId = $row['projectId'];
        }
        
        // Delete task
        mysqli_query($conn, "DELETE FROM tasks WHERE id = '$taskId'");
        
        // Update project progress
        if ($projectId) {
            $projectId = mysqli_real_escape_string($conn, $projectId);
            $avgResult = mysqli_query($conn, "SELECT AVG(progress) as avgProgress FROM tasks WHERE projectId = '$projectId'");
            if ($avgRow = mysqli_fetch_assoc($avgResult)) {
                $avgProgress = round($avgRow['avgProgress'] ?? 0);
                mysqli_query($conn, "UPDATE projects SET progress = $avgProgress WHERE id = '$projectId'");
            }
        }
        
        mysqli_close($conn);
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
$currentProject = null;

if ($conn) {
    // Get all users
    $result = mysqli_query($conn, "SELECT id, firstName, email, gender, username, experience, skills, qualifications, projects FROM users");
    while ($row = mysqli_fetch_assoc($result)) {
        $row['skills'] = json_decode($row['skills'] ?? '[]', true) ?: [];
        $row['qualifications'] = json_decode($row['qualifications'] ?? '[]', true) ?: [];
        $row['projects'] = json_decode($row['projects'] ?? '[]', true) ?: [];
        $users[] = $row;
    }
    
    // Get all projects
    $result = mysqli_query($conn, "SELECT * FROM projects ORDER BY createdAt DESC");
    while ($row = mysqli_fetch_assoc($result)) {
        $row['assignedUsers'] = json_decode($row['assignedUsers'] ?? '[]', true) ?: [];
        $projects[] = $row;
    }
    
    // Get all tasks - using COLLATE to handle collation mismatch
    $result = mysqli_query($conn, "SELECT t.*, u.firstName, u.email, p.name as projectName FROM tasks t LEFT JOIN users u ON t.userId COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci LEFT JOIN projects p ON t.projectId COLLATE utf8mb4_unicode_ci = p.id COLLATE utf8mb4_unicode_ci ORDER BY t.createdAt DESC");
    while ($row = mysqli_fetch_assoc($result)) {
        $tasks[] = $row;
    }
    
    // Get task for editing
    if ($action === 'edit' && isset($_GET['taskId'])) {
        $taskId = mysqli_real_escape_string($conn, $_GET['taskId']);
        $result = mysqli_query($conn, "SELECT * FROM tasks WHERE id = '$taskId'");
        $currentTask = mysqli_fetch_assoc($result);
    }
    
    // Get project for editing
    if ($action === 'edit' && isset($_GET['projectId'])) {
        $projectId = mysqli_real_escape_string($conn, $_GET['projectId']);
        $result = mysqli_query($conn, "SELECT * FROM projects WHERE id = '$projectId'");
        $currentProject = mysqli_fetch_assoc($result);
        if ($currentProject) {
            $currentProject['assignedUsers'] = json_decode($currentProject['assignedUsers'] ?? '[]', true) ?: [];
        }
    }
    
    mysqli_close($conn);
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
      <?php if ($action === 'create' || ($action === 'edit' && $currentProject)): ?>
        <div class="form-container">
          <h3><?php echo $action === 'create' ? 'Create New Project' : 'Edit Project'; ?></h3>
          <form method="POST" action="admin.php?tab=projects">
            <?php if ($action === 'edit'): ?>
              <input type="hidden" name="updateProject" value="1">
              <input type="hidden" name="projectId" value="<?php echo htmlspecialchars($currentProject['id']); ?>">
            <?php else: ?>
              <input type="hidden" name="createProject" value="1">
            <?php endif; ?>
            <div class="form-group">
              <label>Project Name</label>
              <input type="text" name="name" value="<?php echo htmlspecialchars($currentProject['name'] ?? ''); ?>" required>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea name="description" rows="5" required><?php echo htmlspecialchars($currentProject['description'] ?? ''); ?></textarea>
            </div>
            <?php if ($action === 'edit'): ?>
            <div class="form-group">
              <label>Status</label>
              <select name="status">
                <option value="active" <?php echo (($currentProject['status'] ?? 'active') === 'active') ? 'selected' : ''; ?>>Active</option>
                <option value="completed" <?php echo (($currentProject['status'] ?? 'active') === 'completed') ? 'selected' : ''; ?>>Completed</option>
                <option value="on_hold" <?php echo (($currentProject['status'] ?? 'active') === 'on_hold') ? 'selected' : ''; ?>>On Hold</option>
              </select>
            </div>
            <?php endif; ?>
            <button type="submit" class="btn"><?php echo $action === 'create' ? 'Create Project' : 'Update Project'; ?></button>
            <a href="admin.php?tab=projects" class="btn" style="background-color: #666; text-decoration: none; display: inline-block; margin-left: 10px;">Cancel</a>
          </form>
        </div>
      <?php elseif ($action === 'delete' && isset($_GET['projectId'])): ?>
        <div class="form-container">
          <h3>Delete Project</h3>
          <p>Are you sure you want to delete this project? This will also delete all associated tasks and remove the project from all users.</p>
          <form method="POST" action="admin.php?tab=projects">
            <input type="hidden" name="deleteProject" value="1">
            <input type="hidden" name="projectId" value="<?php echo htmlspecialchars($_GET['projectId']); ?>">
            <button type="submit" class="btn" style="background-color: #dc2626;">Yes, Delete Project</button>
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
                <div style="margin-top: 10px;">
                  <a href="admin.php?tab=assign&projectId=<?php echo htmlspecialchars($project['id']); ?>" class="btn" style="margin-right: 5px;">Assign Users</a>
                  <a href="admin.php?tab=projects&action=edit&projectId=<?php echo htmlspecialchars($project['id']); ?>" class="btn" style="background-color: #0ea5e9; margin-right: 5px;">Edit</a>
                  <a href="admin.php?tab=projects&action=delete&projectId=<?php echo htmlspecialchars($project['id']); ?>" class="btn" style="background-color: #dc2626;">Delete</a>
                </div>
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
            <div class="form-group">
              <label>Select Project</label>
              <select name="projectId" <?php echo $action === 'create' ? 'required' : ''; ?>>
                <option value="">Select a project</option>
                <?php foreach ($projects as $project): ?>
                  <option value="<?php echo htmlspecialchars($project['id']); ?>" <?php echo (($action === 'edit' && isset($currentTask['projectId']) && $currentTask['projectId'] === $project['id']) || ($action === 'create' && isset($_GET['projectId']) && $_GET['projectId'] === $project['id'])) ? 'selected' : ''; ?>>
                    <?php echo htmlspecialchars($project['name']); ?>
                  </option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="form-group">
              <label>Select User (Assign/Reassign Task)</label>
              <select name="userId" <?php echo $action === 'create' ? 'required' : ''; ?>>
                <option value="">Select a user</option>
                <?php foreach ($users as $user): ?>
                  <option value="<?php echo htmlspecialchars($user['id']); ?>" <?php echo (($action === 'edit' && isset($currentTask['userId']) && $currentTask['userId'] === $user['id']) || ($action === 'create' && isset($_GET['userId']) && $_GET['userId'] === $user['id'])) ? 'selected' : ''; ?>>
                    <?php echo htmlspecialchars($user['firstName'] . ' (' . $user['email'] . ')'); ?>
                  </option>
                <?php endforeach; ?>
              </select>
            </div>
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
