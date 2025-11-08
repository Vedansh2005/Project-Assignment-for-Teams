var editSkills = [];
var currentUser = null;

function loadUserDashboard() {
    var username = sessionStorage.getItem('username') || localStorage.getItem('username');
    if (!username) {
        window.location.href = 'login.html';
        return;
    }
    
    // Try to get user by email/username
    fetch('users.php?action=getAll')
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        if (result.success && result.users) {
            var user = result.users.find(function(u) {
                return u.username === username || u.email === username;
            });
            if (user) {
                displayUserData(user);
                loadAssignedProjects(user);
                loadMyTasks();
                loadProjectTasks();
                return;
            }
        }
        // Fallback to localStorage
        loadFromLocalStorage();
    })
    .catch(function(error) {
        loadFromLocalStorage();
    });
}

function loadFromLocalStorage() {
    var username = localStorage.getItem('username');
    var users = getUsers();
    var user = users.find(function(u) {
        return u.username === username || u.email === username;
    });
    
    if (!user) {
        return;
    }
    
    displayUserData(user);
    loadAssignedProjects(user);
    loadMyTasks();
    loadProjectTasks();
}

function displayUserData(user) {
    currentUser = user;
    
    // Update welcome message
    var welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.textContent = 'Welcome back, ' + (user.firstName || user.username || 'User');
    }
    
    // Update profile card
    var profileCard = document.getElementById('profileCard');
    if (profileCard) {
        var skillsHtml = '';
        if (user.skills && Array.isArray(user.skills) && user.skills.length > 0) {
            for (var i = 0; i < user.skills.length; i++) {
                skillsHtml += '<span class="badge">' + user.skills[i] + '</span>';
            }
        } else if (typeof user.skills === 'string' && user.skills.trim() !== '') {
            try {
                var skillsArray = JSON.parse(user.skills);
                if (Array.isArray(skillsArray) && skillsArray.length > 0) {
                    for (var i = 0; i < skillsArray.length; i++) {
                        skillsHtml += '<span class="badge">' + skillsArray[i] + '</span>';
                    }
                } else {
                    skillsHtml = '<span class="badge">No skills added</span>';
                }
            } catch (e) {
                skillsHtml = '<span class="badge">No skills added</span>';
            }
        } else {
            skillsHtml = '<span class="badge">No skills added</span>';
        }
        
        var qualificationsHtml = '';
        if (user.qualifications && Array.isArray(user.qualifications) && user.qualifications.length > 0) {
            for (var i = 0; i < user.qualifications.length; i++) {
                qualificationsHtml += '<p>• ' + user.qualifications[i] + '</p>';
            }
        } else if (typeof user.qualifications === 'string' && user.qualifications.trim() !== '') {
            try {
                var qualArray = JSON.parse(user.qualifications);
                if (Array.isArray(qualArray) && qualArray.length > 0) {
                    for (var i = 0; i < qualArray.length; i++) {
                        qualificationsHtml += '<p>• ' + qualArray[i] + '</p>';
                    }
                } else {
                    qualificationsHtml = '<p>No qualifications added</p>';
                }
            } catch (e) {
                qualificationsHtml = '<p>No qualifications added</p>';
            }
        } else {
            qualificationsHtml = '<p>No qualifications added</p>';
        }
        
        profileCard.innerHTML = '<h2>Your Profile <button id="editProfileBtn" class="btn" style="padding: 5px 15px; font-size: 12px; float: right;">Edit</button></h2>' +
                                '<div class="clearfix"></div>' +
                                '<p><strong>Name:</strong> ' + (user.firstName || user.username || 'N/A') + '</p>' +
                                '<p><strong>Email:</strong> ' + (user.email || 'N/A') + '</p>' +
                                '<p><strong>Experience:</strong> ' + (user.experience || '0') + ' years</p>' +
                                '<p><strong>Skills:</strong></p>' + skillsHtml +
                                '<p style="margin-top: 15px;"><strong>Qualifications:</strong></p>' + qualificationsHtml;
        
        // Add event listener to edit button
        var editBtn = document.getElementById('editProfileBtn');
        if (editBtn) {
            editBtn.addEventListener('click', openEditModal);
        }
    }
}

function loadAssignedProjects(user) {
    // Debug: Log user data to see what we're working with
    console.log('Loading projects for user:', user);
    console.log('User projects field:', user.projects);
    
    fetch('projects.php?action=getAll')
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        var projects = result.success ? result.projects : getProjects();
        console.log('All projects:', projects);
        
        var assignedProjects = [];
        
        // Method 1: Check user.projects field (projects assigned to user)
        if (user.projects) {
            // Handle both string and array formats
            var userProjectIds = user.projects;
            if (typeof userProjectIds === 'string') {
                try {
                    userProjectIds = JSON.parse(userProjectIds);
                } catch (e) {
                    console.error('Error parsing user projects:', e);
                    userProjectIds = [];
                }
            }
            
            // Ensure it's an array
            if (!Array.isArray(userProjectIds)) {
                userProjectIds = [];
            }
            
            console.log('User project IDs from user.projects:', userProjectIds);
            
            // Find matching projects
            if (userProjectIds.length > 0) {
                for (var i = 0; i < userProjectIds.length; i++) {
                    var projectId = userProjectIds[i];
                    var project = projects.find(function(p) { 
                        return p.id === projectId || p.id === String(projectId); 
                    });
                    if (project && !assignedProjects.find(function(p) { return p.id === project.id; })) {
                        assignedProjects.push(project);
                    }
                }
            }
        }
        
        // Method 2: Also check projects.assignedUsers field (fallback method)
        // This ensures we catch projects even if user.projects is not updated
        if (user.id) {
            for (var j = 0; j < projects.length; j++) {
                var proj = projects[j];
                if (proj.assignedUsers && Array.isArray(proj.assignedUsers)) {
                    // Check if user ID is in the assignedUsers array
                    var isAssigned = proj.assignedUsers.some(function(uid) {
                        return uid === user.id || uid === String(user.id);
                    });
                    
                    if (isAssigned && !assignedProjects.find(function(p) { return p.id === proj.id; })) {
                        assignedProjects.push(proj);
                        console.log('Found project via assignedUsers:', proj.name);
                    }
                }
            }
        }
        
        console.log('Assigned projects found:', assignedProjects);
        
        // Update the assigned projects card
        var tasksCard = document.getElementById('assignedProjectsCard');
        if (tasksCard) {
            if (assignedProjects.length > 0) {
                var tasksHtml = '<h2>My Assigned Projects</h2>';
                for (var i = 0; i < assignedProjects.length; i++) {
                    var project = assignedProjects[i];
                    tasksHtml += '<div class="task-item">' +
                                '<h3>' + (project.name || 'Unnamed Project') + '</h3>' +
                                '<p style="color: #666; font-size: 14px;">' + (project.description || 'No description') + '</p>' +
                                '<p style="margin-top: 10px;"><strong>Status:</strong> ' + (project.status || 'active') + '</p>' +
                                '<p><strong>Progress:</strong> ' + (project.progress || 0) + '%</p>' +
                                '</div>';
                }
                tasksCard.innerHTML = tasksHtml;
            } else {
                tasksCard.innerHTML = '<h2>My Assigned Projects</h2><p>No projects assigned yet. Contact your admin to get assigned to a project.</p>';
            }
        } else {
            console.error('Assigned projects card not found in DOM');
        }
    })
    .catch(function(error) {
        console.error('Error loading projects:', error);
        var tasksCard = document.getElementById('assignedProjectsCard');
        if (tasksCard) {
            tasksCard.innerHTML = '<h2>My Assigned Projects</h2><p>Error loading projects. Please try refreshing the page.</p>';
        }
    });
}

function openEditModal() {
    var username = sessionStorage.getItem('username') || localStorage.getItem('username');
    
    fetch('users.php?action=getAll')
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        if (result.success && result.users) {
            var user = result.users.find(function(u) {
                return u.username === username || u.email === username;
            });
            if (user) {
                currentUser = user;
                populateEditForm(currentUser);
                return;
            }
        }
        loadFromLocalStorageForEdit();
    })
    .catch(function(error) {
        loadFromLocalStorageForEdit();
    });
}

function loadFromLocalStorageForEdit() {
    var username = localStorage.getItem('username');
    var users = getUsers();
    currentUser = users.find(function(u) {
        return u.username === username || u.email === username;
    });
    
    if (!currentUser) {
        alert('User not found');
        return;
    }
    
    populateEditForm(currentUser);
}

function populateEditForm(user) {
    document.getElementById('editExperience').value = user.experience || '0';
    document.getElementById('editQualifications').value = (user.qualifications && user.qualifications.length > 0) ? user.qualifications.join('\n') : '';
    
    editSkills = user.skills ? user.skills.slice() : [];
    updateEditSkillsDisplay();
    
    document.getElementById('editProfileModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editProfileModal').style.display = 'none';
    editSkills = [];
    currentUser = null;
}

function addEditSkill() {
    var skillInput = document.getElementById('editSkillInput');
    var skill = skillInput.value.trim();
    if (skill && editSkills.indexOf(skill) === -1) {
        editSkills.push(skill);
        updateEditSkillsDisplay();
        skillInput.value = '';
    }
}

function removeEditSkill(skill) {
    var index = editSkills.indexOf(skill);
    if (index > -1) {
        editSkills.splice(index, 1);
        updateEditSkillsDisplay();
    }
}

function updateEditSkillsDisplay() {
    var skillsList = document.getElementById('editSkillsList');
    skillsList.innerHTML = '';
    for (var i = 0; i < editSkills.length; i++) {
        var tag = document.createElement('span');
        tag.className = 'skill-tag';
        var skillName = editSkills[i];
        var removeBtn = document.createElement('span');
        removeBtn.textContent = ' ×';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.color = '#666';
        removeBtn.onclick = (function(skill) {
            return function() {
                removeEditSkill(skill);
            };
        })(skillName);
        tag.textContent = skillName;
        tag.appendChild(removeBtn);
        skillsList.appendChild(tag);
    }
}

function loadMyTasks() {
    var username = sessionStorage.getItem('username') || localStorage.getItem('username');
    if (!username) {
        console.log('No username found, cannot load tasks');
        return;
    }
    
    console.log('Loading tasks for user:', username);
    
    // Get current user
    fetch('users.php?action=getAll')
    .then(function(response) { 
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        return response.json(); 
    })
    .then(function(result) {
        console.log('Users result:', result);
        if (result.success && result.users) {
            var user = result.users.find(function(u) {
                return u.username === username || u.email === username;
            });
            console.log('Found user:', user);
            if (user && user.id) {
                console.log('Loading tasks for user ID:', user.id, 'Type:', typeof user.id);
                // Load tasks for this user - try both string and number format
                var userId = String(user.id);
                console.log('Fetching tasks with userId:', userId);
                
                // Fetch tasks for this specific user
                fetch('tasks.php?action=getAll&userId=' + encodeURIComponent(userId))
                .then(function(response) { 
                    // Check if response is ok
                    if (!response.ok) {
                        // Try to get error message from response
                        return response.text().then(function(text) {
                            console.error('API Error Response:', text);
                            throw new Error('Failed to fetch tasks: ' + response.status);
                        });
                    }
                    
                    // Check content type
                    var contentType = response.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        return response.text().then(function(text) {
                            console.error('Non-JSON response:', text);
                            throw new Error('Server returned non-JSON response');
                        });
                    }
                    
                    return response.json(); 
                })
                .then(function(taskResult) {
                    // Validate response structure
                    if (!taskResult) {
                        console.error('Empty response from server');
                        displayMyTasks([]);
                        return;
                    }
                    
                    var tasks = [];
                    
                    if (taskResult.success && Array.isArray(taskResult.tasks)) {
                        tasks = taskResult.tasks;
                    } else if (taskResult.success === false) {
                        console.error('API returned error:', taskResult.message || 'Unknown error');
                        displayMyTasks([]);
                        return;
                    }
                    
                    // If no tasks found with userId filter, try fetching all and filtering client-side
                    // This is a fallback in case there's a userId mismatch issue
                    if (tasks.length === 0) {
                        console.log('No tasks found with userId filter, trying fallback...');
                        return fetch('tasks.php?action=getAll')
                        .then(function(response) { 
                            if (!response.ok) {
                                throw new Error('Fallback request failed: ' + response.status);
                            }
                            return response.json(); 
                        })
                        .then(function(allTasksResult) {
                            if (allTasksResult && allTasksResult.success && Array.isArray(allTasksResult.tasks)) {
                                // Filter client-side by userId
                                tasks = allTasksResult.tasks.filter(function(task) {
                                    if (!task || !task.userId) return false;
                                    // Try multiple comparison methods
                                    var taskUserId = String(task.userId).trim();
                                    var searchUserId = String(userId).trim();
                                    return taskUserId === searchUserId;
                                });
                                console.log('Found ' + tasks.length + ' tasks after client-side filtering');
                            }
                            return tasks;
                        })
                        .catch(function(fallbackError) {
                            console.error('Fallback fetch failed:', fallbackError);
                            return [];
                        });
                    }
                    
                    return tasks;
                })
                .then(function(tasks) {
                    if (!Array.isArray(tasks)) {
                        tasks = [];
                    }
                    console.log('Displaying ' + tasks.length + ' tasks for user:', userId);
                    displayMyTasks(tasks);
                })
                .catch(function(error) {
                    console.error('Error loading tasks:', error);
                    displayMyTasks([]);
                });
            } else {
                console.error('User not found or no user ID. User object:', user);
                displayMyTasks([]);
            }
        } else {
            console.error('Failed to get users:', result);
            displayMyTasks([]);
        }
    })
    .catch(function(error) {
        console.error('Error loading user:', error);
        displayMyTasks([]);
    });
}

function displayMyTasks(tasks) {
    var tasksCard = document.getElementById('myTasksCard');
    if (!tasksCard) {
        return;
    }
    
    // Ensure tasks is an array
    if (!Array.isArray(tasks)) {
        tasks = [];
    }
    
    // Update progress stats based on actual tasks
    updateProgressStats(tasks);
    
    if (tasks.length === 0) {
        tasksCard.innerHTML = '<h2>My Tasks</h2><p style="color: #666; padding: 20px;">No tasks assigned to you yet. Contact your admin to get assigned tasks.</p>';
        return;
    }
    
    var tasksHtml = '<h2>My Tasks</h2>';
    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        if (!task) continue;
        
        var priorityClass = task.priority === 'high' ? 'style="background-color: #fee2e2; color: #991b1b;"' : 
                           task.priority === 'low' ? 'style="background-color: #dbeafe; color: #1e40af;"' : 
                           'style="background-color: #fef3c7; color: #92400e;"';
        var statusClass = task.status === 'completed' ? 'style="color: #22c55e; font-weight: bold;"' : 
                         task.status === 'in_progress' ? 'style="color: #0ea5e9; font-weight: bold;"' : 
                         'style="color: #666; font-weight: bold;"';
        
        tasksHtml += '<div class="task-item" style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; background-color: #f9f9f9; border-left: 4px solid ' + 
                    (task.priority === 'high' ? '#dc2626' : task.priority === 'low' ? '#3b82f6' : '#eab308') + ';">' +
                    '<h3 style="margin-top: 0; color: #333;">' + (task.title || 'Untitled Task') + '</h3>' +
                    '<p style="color: #666; font-size: 14px; margin: 5px 0;">' + (task.description || 'No description') + '</p>' +
                    '<div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 15px;">' +
                    '<div><strong>Project:</strong> ' + (task.projectName || 'Unknown') + '</div>' +
                    '<div><strong>Type:</strong> <span class="badge">' + (task.taskType || 'N/A') + '</span></div>' +
                    '<div><strong>Priority:</strong> <span class="badge" ' + priorityClass + '>' + (task.priority || 'medium') + '</span></div>' +
                    '<div><strong>Status:</strong> <span ' + statusClass + '>' + (task.status || 'pending') + '</span></div>' +
                    '<div><strong>Progress:</strong> ' + (task.progress || 0) + '%</div>' +
                    (task.dueDate ? '<div><strong>Due Date:</strong> ' + task.dueDate + '</div>' : '') +
                    '</div>' +
                    '<div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">' +
                    '<label style="display: block; margin-bottom: 5px;"><strong>Update Progress:</strong></label>' +
                    '<div style="display: flex; align-items: center; gap: 10px;">' +
                    '<input type="range" min="0" max="100" value="' + (task.progress || 0) + '" ' +
                    'onchange="updateTaskProgress(\'' + task.id + '\', this.value)" ' +
                    'style="flex: 1; max-width: 300px;">' +
                    '<span id="progress-' + task.id + '" style="min-width: 50px; font-weight: bold;">' + (task.progress || 0) + '%</span>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
    }
    tasksCard.innerHTML = tasksHtml;
}

// Update progress statistics based on tasks
function updateProgressStats(tasks) {
    var progressCard = document.getElementById('progressCard');
    if (!progressCard) return;
    
    if (!tasks || tasks.length === 0) {
        progressCard.innerHTML = '<h2>Your Progress</h2>' +
                                '<div class="stats"><p style="color: #666; font-size: 14px;">Completed</p><p style="font-size: 36px; font-weight: bold; color: #22c55e; margin: 0;">0</p></div>' +
                                '<div class="stats"><p style="color: #666; font-size: 14px;">In Progress</p><p style="font-size: 36px; font-weight: bold; color: #0ea5e9; margin: 0;">0</p></div>' +
                                '<div class="stats"><p style="color: #666; font-size: 14px;">Pending</p><p style="font-size: 36px; font-weight: bold; color: #666; margin: 0;">0</p></div>' +
                                '<div class="clearfix"></div>';
        return;
    }
    
    var completed = 0;
    var inProgress = 0;
    var pending = 0;
    
    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        if (!task || !task.status) continue;
        
        if (task.status === 'completed') {
            completed++;
        } else if (task.status === 'in_progress') {
            inProgress++;
        } else {
            pending++;
        }
    }
    
    progressCard.innerHTML = '<h2>Your Progress</h2>' +
                            '<div class="stats"><p style="color: #666; font-size: 14px;">Completed</p><p style="font-size: 36px; font-weight: bold; color: #22c55e; margin: 0;">' + completed + '</p></div>' +
                            '<div class="stats"><p style="color: #666; font-size: 14px;">In Progress</p><p style="font-size: 36px; font-weight: bold; color: #0ea5e9; margin: 0;">' + inProgress + '</p></div>' +
                            '<div class="stats"><p style="color: #666; font-size: 14px;">Pending</p><p style="font-size: 36px; font-weight: bold; color: #666; margin: 0;">' + pending + '</p></div>' +
                            '<div class="clearfix"></div>';
}

// Make function globally accessible
window.updateTaskProgress = function(taskId, progress) {
    var progressSpan = document.getElementById('progress-' + taskId);
    if (progressSpan) {
        progressSpan.textContent = progress + '%';
    }
    
    var formData = new FormData();
    formData.append('action', 'updateProgress');
    formData.append('taskId', taskId);
    formData.append('progress', progress);
    
    fetch('tasks.php', {
        method: 'POST',
        body: formData
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        if (result.success) {
            // Reload tasks to show updated status
            loadMyTasks();
            // Also reload project tasks
            loadProjectTasks();
        } else {
            alert('Error updating progress: ' + result.message);
        }
    })
    .catch(function(error) {
        console.error('Error updating progress:', error);
        alert('Error updating progress. Please try again.');
    });
}

function loadProjectTasks() {
    var username = sessionStorage.getItem('username') || localStorage.getItem('username');
    if (!username) {
        return;
    }
    
    // Get current user and their projects
    fetch('users.php?action=getAll')
    .then(function(response) { return response.json(); })
    .then(function(result) {
        if (result.success && result.users) {
            var user = result.users.find(function(u) {
                return u.username === username || u.email === username;
            });
            if (user) {
                // Get user's projects
                var userProjects = [];
                if (user.projects && Array.isArray(user.projects)) {
                    userProjects = user.projects;
                } else if (typeof user.projects === 'string') {
                    try {
                        userProjects = JSON.parse(user.projects);
                    } catch (e) {
                        userProjects = [];
                    }
                }
                
                // Also check projects.assignedUsers
                fetch('projects.php?action=getAll')
                .then(function(response) { return response.json(); })
                .then(function(projectResult) {
                    var allProjects = projectResult.success ? projectResult.projects : [];
                    for (var i = 0; i < allProjects.length; i++) {
                        var proj = allProjects[i];
                        if (proj.assignedUsers && Array.isArray(proj.assignedUsers)) {
                            var isAssigned = proj.assignedUsers.some(function(uid) {
                                return uid === user.id || uid === String(user.id);
                            });
                            if (isAssigned && userProjects.indexOf(proj.id) === -1) {
                                userProjects.push(proj.id);
                            }
                        }
                    }
                    
                    // Load all tasks for these projects
                    if (userProjects.length > 0) {
                        displayProjectTasks(userProjects, allProjects);
                    } else {
                        var tasksCard = document.getElementById('projectTasksCard');
                        if (tasksCard) {
                            tasksCard.innerHTML = '<h2>All Project Tasks</h2><p>No projects assigned. You need to be assigned to a project first.</p>';
                        }
                    }
                });
            }
        }
    })
    .catch(function(error) {
        console.error('Error loading user projects:', error);
    });
}

function displayProjectTasks(projectIds, allProjects) {
    // Load tasks for all projects
    var allTasks = [];
    var projectIndex = 0;
    
    function loadNextProject() {
        if (projectIndex >= projectIds.length) {
            // All projects loaded, display tasks
            var tasksCard = document.getElementById('projectTasksCard');
            if (!tasksCard) return;
            
            if (allTasks.length === 0) {
                tasksCard.innerHTML = '<h2>All Project Tasks</h2><p>No tasks found in your assigned projects.</p>';
                return;
            }
            
            // Group tasks by project
            var tasksByProject = {};
            for (var i = 0; i < allTasks.length; i++) {
                var task = allTasks[i];
                var projectName = task.projectName || 'Unknown Project';
                if (!tasksByProject[projectName]) {
                    tasksByProject[projectName] = [];
                }
                tasksByProject[projectName].push(task);
            }
            
            var tasksHtml = '<h2>All Project Tasks</h2><p style="color: #666; font-size: 14px; margin-bottom: 15px;">Review all tasks in your assigned projects</p>';
            
            for (var projectName in tasksByProject) {
                var projectTasks = tasksByProject[projectName];
                tasksHtml += '<div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd;">';
                tasksHtml += '<h3 style="margin-top: 0;">' + projectName + '</h3>';
                
                for (var j = 0; j < projectTasks.length; j++) {
                    var task = projectTasks[j];
                    var priorityClass = task.priority === 'high' ? 'style="background-color: #fee2e2; color: #991b1b;"' : 
                                       task.priority === 'low' ? 'style="background-color: #dbeafe; color: #1e40af;"' : 
                                       'style="background-color: #fef3c7; color: #92400e;"';
                    var statusClass = task.status === 'completed' ? 'style="color: #22c55e;"' : 
                                     task.status === 'in_progress' ? 'style="color: #0ea5e9;"' : 
                                     'style="color: #666;"';
                    
                    tasksHtml += '<div class="task-item" style="margin-bottom: 10px;">' +
                                '<h4>' + task.title + '</h4>' +
                                '<p style="color: #666; font-size: 14px;">' + (task.description || 'No description') + '</p>' +
                                '<p><strong>Assigned to:</strong> ' + (task.firstName || 'Unknown') + 
                                (task.experience ? ' (' + task.experience + ' years exp)' : '') + '</p>' +
                                '<p><strong>Type:</strong> <span class="badge">' + task.taskType + '</span></p>' +
                                '<p><strong>Priority:</strong> <span class="badge" ' + priorityClass + '>' + task.priority + '</span></p>' +
                                '<p><strong>Status:</strong> <span ' + statusClass + '>' + task.status + '</span></p>' +
                                '<p><strong>Progress:</strong> ' + task.progress + '%</p>' +
                                (task.dueDate ? '<p><strong>Due Date:</strong> ' + task.dueDate + '</p>' : '') +
                                '</div>';
                }
                tasksHtml += '</div>';
            }
            
            tasksCard.innerHTML = tasksHtml;
            return;
        }
        
        var projectId = projectIds[projectIndex];
        fetch('tasks.php?action=getByProject&projectId=' + encodeURIComponent(projectId))
        .then(function(response) {
            if (!response.ok) {
                return response.text().then(function(text) {
                    console.error('API Error Response for project:', text);
                    throw new Error('Failed to fetch tasks: ' + response.status);
                });
            }
            
            // Check content type
            var contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return response.text().then(function(text) {
                    console.error('Non-JSON response:', text);
                    throw new Error('Server returned non-JSON response');
                });
            }
            
            return response.json();
        })
        .then(function(result) {
            if (result && result.success && Array.isArray(result.tasks)) {
                // Add project name to each task
                var project = allProjects.find(function(p) { return p.id === projectId; });
                for (var k = 0; k < result.tasks.length; k++) {
                    result.tasks[k].projectName = project ? project.name : 'Unknown Project';
                    allTasks.push(result.tasks[k]);
                }
            } else if (result && result.success === false) {
                console.error('API returned error for project:', result.message || 'Unknown error');
            }
            projectIndex++;
            loadNextProject();
        })
        .catch(function(error) {
            console.error('Error loading tasks for project:', error);
            projectIndex++;
            loadNextProject();
        });
    }
    
    loadNextProject();
}

document.addEventListener('DOMContentLoaded', function() {
    loadUserDashboard();
    
    var editSkillInput = document.getElementById('editSkillInput');
    var addEditSkillBtn = document.getElementById('addEditSkillBtn');
    
    if (addEditSkillBtn) {
        addEditSkillBtn.addEventListener('click', addEditSkill);
    }
    
    if (editSkillInput) {
        editSkillInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addEditSkill();
            }
        });
    }
    
    var cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditModal);
    }
    
    var editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!currentUser) {
                alert('User not found');
                return;
            }
            
            var experience = document.getElementById('editExperience').value;
            var qualifications = document.getElementById('editQualifications').value.trim();
            var qualificationsList = qualifications.split('\n').filter(function(q) {
                return q.trim().length > 0;
            });
            
            var formData = new FormData();
            formData.append('action', 'update');
            formData.append('userId', currentUser.id);
            formData.append('experience', experience);
            formData.append('skills', JSON.stringify(editSkills));
            formData.append('qualifications', JSON.stringify(qualificationsList));
            
            fetch('users.php', {
                method: 'POST',
                body: formData
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(result) {
                if (result.success) {
                    alert('Profile updated successfully!');
                    closeEditModal();
                    loadUserDashboard();
                } else {
                    alert('Error updating profile: ' + result.message);
                }
            })
            .catch(function(error) {
                // Fallback to localStorage
                var result = updateUserProfile(currentUser.id, experience, editSkills, qualificationsList);
                if (result.success) {
                    alert('Profile updated successfully!');
                    closeEditModal();
                    loadUserDashboard();
                } else {
                    alert('Error updating profile: ' + result.message);
                }
            });
        });
    }
    
    window.onclick = function(event) {
        var modal = document.getElementById('editProfileModal');
        if (event.target === modal) {
            closeEditModal();
        }
    };
});

