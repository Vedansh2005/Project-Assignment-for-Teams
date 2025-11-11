<?php
require_once 'config.php';
requireLogin();

$userId = getCurrentUserId();
$username = getCurrentUsername();
$message = '';
$showEditForm = isset($_GET['edit']) && $_GET['edit'] === 'profile';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Update task progress
    if (isset($_POST['updateTask'])) {
        $taskId = $_POST['taskId'] ?? '';
        $progress = intval($_POST['progress'] ?? 0);
        
        if ($taskId && $progress >= 0 && $progress <= 100) {
            $conn = getDBConnection();
            if ($conn) {
                $status = $progress == 100 ? 'completed' : ($progress > 0 ? 'in_progress' : 'pending');
                $updatedAt = date('Y-m-d H:i:s');
                $taskId = mysqli_real_escape_string($conn, $taskId);
                
                mysqli_query($conn, "UPDATE tasks SET progress = $progress, status = '$status', updatedAt = '$updatedAt' WHERE id = '$taskId'");
                
                // Update project progress
                $result = mysqli_query($conn, "SELECT projectId FROM tasks WHERE id = '$taskId'");
                if ($row = mysqli_fetch_assoc($result)) {
                    $projectId = mysqli_real_escape_string($conn, $row['projectId']);
                    $avgResult = mysqli_query($conn, "SELECT AVG(progress) as avgProgress FROM tasks WHERE projectId = '$projectId'");
                    if ($avgRow = mysqli_fetch_assoc($avgResult)) {
                        $avgProgress = round($avgRow['avgProgress'] ?? 0);
                        mysqli_query($conn, "UPDATE projects SET progress = $avgProgress WHERE id = '$projectId'");
                    }
                }
                mysqli_close($conn);
                $message = 'Task progress updated!';
            }
        }
    }
    
    // Update profile
    if (isset($_POST['updateProfile'])) {
        $experience = $_POST['experience'] ?? '0';
        $skills = $_POST['skills'] ?? '';
        $qualifications = $_POST['qualifications'] ?? '';
        
        $conn = getDBConnection();
        if ($conn) {
            $skillsArray = !empty($skills) ? explode(',', $skills) : [];
            $skillsArray = array_map('trim', $skillsArray);
            $skillsArray = array_filter($skillsArray);
            
            $qualificationsArray = !empty($qualifications) ? explode("\n", $qualifications) : [];
            $qualificationsArray = array_map('trim', $qualificationsArray);
            $qualificationsArray = array_filter($qualificationsArray);
            
            $skillsJson = mysqli_real_escape_string($conn, json_encode($skillsArray));
            $qualificationsJson = mysqli_real_escape_string($conn, json_encode($qualificationsArray));
            $experience = mysqli_real_escape_string($conn, $experience);
            $userId = mysqli_real_escape_string($conn, $userId);
            
            if (mysqli_query($conn, "UPDATE users SET experience = '$experience', skills = '$skillsJson', qualifications = '$qualificationsJson' WHERE id = '$userId'")) {
                $message = 'Profile updated successfully!';
                $showEditForm = false;
            } else {
                $message = 'Error updating profile';
            }
            mysqli_close($conn);
        }
    }
}

// Get user data
$conn = getDBConnection();
$user = null;
$tasks = [];
$projects = [];
$allProjectTasks = [];

if ($conn && $userId) {
    // Get user
    $userId = mysqli_real_escape_string($conn, $userId);
    $result = mysqli_query($conn, "SELECT * FROM users WHERE id = '$userId'");
    $user = mysqli_fetch_assoc($result);
    if ($user) {
        $user['skills'] = json_decode($user['skills'] ?? '[]', true) ?: [];
        $user['qualifications'] = json_decode($user['qualifications'] ?? '[]', true) ?: [];
        $user['projects'] = json_decode($user['projects'] ?? '[]', true) ?: [];
    }
    
    // Get user's tasks - using COLLATE to handle collation mismatch
    $result = mysqli_query($conn, "SELECT t.*, p.name as projectName FROM tasks t LEFT JOIN projects p ON t.projectId COLLATE utf8mb4_unicode_ci = p.id COLLATE utf8mb4_unicode_ci WHERE t.userId COLLATE utf8mb4_unicode_ci = '$userId' ORDER BY t.createdAt DESC");
    while ($row = mysqli_fetch_assoc($result)) {
        $tasks[] = $row;
    }
    
    // Get user's projects
    if ($user && !empty($user['projects'])) {
        $projectIds = array_map(function($id) use ($conn) {
            return "'" . mysqli_real_escape_string($conn, $id) . "'";
        }, $user['projects']);
        $projectIdsStr = implode(',', $projectIds);
        
        $result = mysqli_query($conn, "SELECT * FROM projects WHERE id IN ($projectIdsStr)");
        while ($row = mysqli_fetch_assoc($result)) {
            $row['assignedUsers'] = json_decode($row['assignedUsers'] ?? '[]', true) ?: [];
            $projects[] = $row;
        }
        
        // Get all tasks for user's projects - using COLLATE to handle collation mismatch
        $result = mysqli_query($conn, "SELECT t.*, u.firstName, u.email, p.name as projectName FROM tasks t LEFT JOIN users u ON t.userId COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci LEFT JOIN projects p ON t.projectId COLLATE utf8mb4_unicode_ci = p.id COLLATE utf8mb4_unicode_ci WHERE t.projectId IN ($projectIdsStr) ORDER BY t.createdAt DESC");
        while ($row = mysqli_fetch_assoc($result)) {
            $allProjectTasks[] = $row;
        }
    }
    
    mysqli_close($conn);
}

// Calculate progress stats
$completed = 0;
$inProgress = 0;
$pending = 0;
foreach ($tasks as $task) {
    if ($task['status'] === 'completed') {
        $completed++;
    } elseif ($task['status'] === 'in_progress') {
        $inProgress++;
    } else {
        $pending++;
    }
}
?>
<!DOCTYPE html>
<html>
<head>
  <title>User Dashboard - TeamFlow</title>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="styles.css">
  <style>
    body { background-color: #f5f5f5; margin: 0; padding: 0; }
    .header { background-color: white; padding: 20px; border-bottom: 1px solid #ddd; }
    .header-content { width: 90%; max-width: 1200px; margin: 0 auto; }
    .header h1 { margin: 0; color: #333; }
    .header p { margin: 5px 0; color: #666; }
    .header-buttons { float: right; margin-top: -50px; }
    .container { width: 90%; max-width: 1200px; margin: 20px auto; }
    .left-column { width: 30%; float: left; margin-right: 3%; }
    .right-column { width: 67%; float: left; }
    .stats { width: 30%; float: left; text-align: center; padding: 15px; }
    .task-item { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; background-color: #f9f9f9; }
    .clearfix:after { content: ""; display: table; clear: both; }
    .message { padding: 10px; margin-bottom: 15px; background-color: #d1fae5; color: #065f46; }
    .edit-form { background-color: white; padding: 20px; border: 1px solid #ddd; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-content">
      <h1>User Dashboard</h1>
      <p>Welcome back, <?php echo htmlspecialchars($user['firstName'] ?? $username ?? 'User'); ?></p>
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

    <div class="left-column">
      <div class="card">
        <h2>Your Profile</h2>
        <?php if ($showEditForm): ?>
          <form method="POST" action="dashboard.php">
            <input type="hidden" name="updateProfile" value="1">
            <div class="form-group">
              <label>Experience (years)</label>
              <input type="number" name="experience" min="0" value="<?php echo htmlspecialchars($user['experience'] ?? '0'); ?>" required>
            </div>
            <div class="form-group">
              <label>Skills (comma separated)</label>
              <input type="text" name="skills" value="<?php echo htmlspecialchars(implode(', ', $user['skills'] ?? [])); ?>" placeholder="PHP, JavaScript, MySQL">
            </div>
            <div class="form-group">
              <label>Qualifications (one per line)</label>
              <textarea name="qualifications" rows="5"><?php echo htmlspecialchars(implode("\n", $user['qualifications'] ?? [])); ?></textarea>
            </div>
            <button type="submit" class="btn">Save</button>
            <a href="dashboard.php" class="btn" style="background-color: #666; text-decoration: none; display: inline-block; margin-left: 10px;">Cancel</a>
          </form>
        <?php else: ?>
          <p><strong>Name:</strong> <?php echo htmlspecialchars($user['firstName'] ?? 'N/A'); ?></p>
          <p><strong>Email:</strong> <?php echo htmlspecialchars($user['email'] ?? 'N/A'); ?></p>
          <p><strong>Experience:</strong> <?php echo htmlspecialchars($user['experience'] ?? '0'); ?> years</p>
          <p><strong>Skills:</strong></p>
          <?php if (!empty($user['skills'])): ?>
            <?php foreach ($user['skills'] as $skill): ?>
              <span class="badge"><?php echo htmlspecialchars($skill); ?></span>
            <?php endforeach; ?>
          <?php else: ?>
            <p class="text-muted">No skills added</p>
          <?php endif; ?>
          <p style="margin-top: 15px;"><strong>Qualifications:</strong></p>
          <?php if (!empty($user['qualifications'])): ?>
            <?php foreach ($user['qualifications'] as $qual): ?>
              <p>• <?php echo htmlspecialchars($qual); ?></p>
            <?php endforeach; ?>
          <?php else: ?>
            <p class="text-muted">No qualifications added</p>
          <?php endif; ?>
          <a href="dashboard.php?edit=profile" class="btn" style="margin-top: 15px;">Edit Profile</a>
        <?php endif; ?>
      </div>
    </div>

    <div class="right-column">
      <div class="card">
        <h2>Your Progress</h2>
        <div class="stats">
          <p style="color: #666; font-size: 14px;">Completed</p>
          <p style="font-size: 36px; font-weight: bold; color: #22c55e; margin: 0;"><?php echo $completed; ?></p>
        </div>
        <div class="stats">
          <p style="color: #666; font-size: 14px;">In Progress</p>
          <p style="font-size: 36px; font-weight: bold; color: #0ea5e9; margin: 0;"><?php echo $inProgress; ?></p>
        </div>
        <div class="stats">
          <p style="color: #666; font-size: 14px;">Pending</p>
          <p style="font-size: 36px; font-weight: bold; color: #666; margin: 0;"><?php echo $pending; ?></p>
        </div>
        <div class="clearfix"></div>
      </div>

      <div class="card">
        <h2>My Assigned Projects</h2>
        <?php if (empty($projects)): ?>
          <p>No projects assigned yet. Contact your admin to get assigned to a project.</p>
        <?php else: ?>
          <?php foreach ($projects as $project): ?>
            <div class="task-item">
              <h3><?php echo htmlspecialchars($project['name'] ?? 'Unnamed Project'); ?></h3>
              <p style="color: #666; font-size: 14px;"><?php echo htmlspecialchars($project['description'] ?? 'No description'); ?></p>
              <p><strong>Status:</strong> <?php echo htmlspecialchars($project['status'] ?? 'active'); ?></p>
              <p><strong>Progress:</strong> <?php echo htmlspecialchars($project['progress'] ?? 0); ?>%</p>
            </div>
          <?php endforeach; ?>
        <?php endif; ?>
      </div>

      <div class="card">
        <h2>My Tasks</h2>
        <?php if (empty($tasks)): ?>
          <p>No tasks assigned to you yet. Contact your admin to get assigned tasks.</p>
        <?php else: ?>
          <?php foreach ($tasks as $task): ?>
            <div class="task-item">
              <h3><?php echo htmlspecialchars($task['title'] ?? 'Untitled Task'); ?></h3>
              <p style="color: #666; font-size: 14px;"><?php echo htmlspecialchars($task['description'] ?? 'No description'); ?></p>
              <p><strong>Project:</strong> <?php echo htmlspecialchars($task['projectName'] ?? 'Unknown'); ?></p>
              <p><strong>Type:</strong> <span class="badge"><?php echo htmlspecialchars($task['taskType'] ?? 'N/A'); ?></span></p>
              <p><strong>Priority:</strong> <span class="badge"><?php echo htmlspecialchars($task['priority'] ?? 'medium'); ?></span></p>
              <p><strong>Status:</strong> <?php echo htmlspecialchars($task['status'] ?? 'pending'); ?></p>
              <p><strong>Progress:</strong> <?php echo htmlspecialchars($task['progress'] ?? 0); ?>%</p>
              <?php if (!empty($task['dueDate'])): ?>
                <p><strong>Due Date:</strong> <?php echo htmlspecialchars($task['dueDate']); ?></p>
              <?php endif; ?>
              <form method="POST" action="dashboard.php" style="margin-top: 15px;">
                <input type="hidden" name="updateTask" value="1">
                <input type="hidden" name="taskId" value="<?php echo htmlspecialchars($task['id']); ?>">
                <label>Update Progress:</label>
                <input type="range" name="progress" min="0" max="100" value="<?php echo htmlspecialchars($task['progress'] ?? 0); ?>" onchange="this.form.submit()">
                <span><?php echo htmlspecialchars($task['progress'] ?? 0); ?>%</span>
              </form>
            </div>
          <?php endforeach; ?>
        <?php endif; ?>
      </div>

      <div class="card">
        <h2>All Project Tasks</h2>
        <?php if (empty($allProjectTasks)): ?>
          <p>No tasks found in your assigned projects.</p>
        <?php else: ?>
          <?php
          $tasksByProject = [];
          foreach ($allProjectTasks as $task) {
            $projectName = $task['projectName'] ?? 'Unknown Project';
            if (!isset($tasksByProject[$projectName])) {
              $tasksByProject[$projectName] = [];
            }
            $tasksByProject[$projectName][] = $task;
          }
          ?>
          <?php foreach ($tasksByProject as $projectName => $projectTasks): ?>
            <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd;">
              <h3><?php echo htmlspecialchars($projectName); ?></h3>
              <?php foreach ($projectTasks as $task): ?>
                <div class="task-item">
                  <h4><?php echo htmlspecialchars($task['title']); ?></h4>
                  <p style="color: #666; font-size: 14px;"><?php echo htmlspecialchars($task['description'] ?? 'No description'); ?></p>
                  <p><strong>Assigned to:</strong> <?php echo htmlspecialchars($task['firstName'] ?? 'Unknown'); ?></p>
                  <p><strong>Type:</strong> <span class="badge"><?php echo htmlspecialchars($task['taskType'] ?? 'N/A'); ?></span></p>
                  <p><strong>Priority:</strong> <span class="badge"><?php echo htmlspecialchars($task['priority'] ?? 'medium'); ?></span></p>
                  <p><strong>Status:</strong> <?php echo htmlspecialchars($task['status'] ?? 'pending'); ?></p>
                  <p><strong>Progress:</strong> <?php echo htmlspecialchars($task['progress'] ?? 0); ?>%</p>
                </div>
              <?php endforeach; ?>
            </div>
          <?php endforeach; ?>
        <?php endif; ?>
      </div>
    </div>
    <div class="clearfix"></div>
  </div>
</body>
</html>
