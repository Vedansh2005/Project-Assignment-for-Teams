function showTab(tabName) {
    var tabs = document.querySelectorAll('.tab-content');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    document.getElementById(tabName).classList.add('active');
    
    var buttons = document.querySelectorAll('.tabs button');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }
    
    if (tabName === 'users') {
        loadUsers();
    } else if (tabName === 'projects') {
        loadProjects();
    } else if (tabName === 'assign') {
        loadAssignProjects();
    } else if (tabName === 'tasks') {
        loadTasks();
    }
}

function setupTabButtons() {
    var tabUsers = document.getElementById('tabUsers');
    var tabProjects = document.getElementById('tabProjects');
    var tabAssign = document.getElementById('tabAssign');
    
    if (tabUsers) {
        tabUsers.addEventListener('click', function() {
            var buttons = document.querySelectorAll('.tabs button');
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].classList.remove('active');
            }
            this.classList.add('active');
            showTab('users');
        });
    }
    
    if (tabProjects) {
        tabProjects.addEventListener('click', function() {
            var buttons = document.querySelectorAll('.tabs button');
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].classList.remove('active');
            }
            this.classList.add('active');
            showTab('projects');
        });
    }
    
    if (tabAssign) {
        tabAssign.addEventListener('click', function() {
            var buttons = document.querySelectorAll('.tabs button');
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].classList.remove('active');
            }
            this.classList.add('active');
            showTab('assign');
        });
    }
    
    var tabTasks = document.getElementById('tabTasks');
    if (tabTasks) {
        tabTasks.addEventListener('click', function() {
            var buttons = document.querySelectorAll('.tabs button');
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].classList.remove('active');
            }
            this.classList.add('active');
            showTab('tasks');
        });
    }
}

function loadUsers() {
    fetch('users.php?action=getAll')
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        var users = result.success ? result.users : getUsers();
        displayUsers(users);
    })
    .catch(function(error) {
        var users = getUsers();
        displayUsers(users);
    });
}

function displayUsers(users) {
    var usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    if (users.length === 0) {
        usersList.innerHTML = '<p>No users registered yet.</p>';
        return;
    }
    
    fetch('projects.php?action=getAll')
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        var projects = result.success ? result.projects : getProjects();
        buildUsersTable(users, projects);
    })
    .catch(function(error) {
        var projects = getProjects();
        buildUsersTable(users, projects);
    });
}

function buildUsersTable(users, projects) {
    var usersList = document.getElementById('usersList');
    var table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>Name</th><th>Email</th><th>Experience</th><th>Skills</th><th>Qualifications</th><th>Assigned Projects</th><th>Tasks</th><th>Actions</th></tr></thead><tbody></tbody>';
    var tbody = table.querySelector('tbody');
    
    // Also check projects.assignedUsers to find all users with projects
    var usersWithProjects = {};
    for (var p = 0; p < projects.length; p++) {
        var proj = projects[p];
        if (proj.assignedUsers && Array.isArray(proj.assignedUsers)) {
            for (var u = 0; u < proj.assignedUsers.length; u++) {
                usersWithProjects[proj.assignedUsers[u]] = true;
            }
        }
    }
    
    // Load all tasks first to get counts
    fetch('tasks.php?action=getAll')
    .then(function(response) { return response.json(); })
    .then(function(taskResult) {
        var allTasks = taskResult.success ? taskResult.tasks : [];
        
        // Count tasks per user
        var taskCounts = {};
        for (var t = 0; t < allTasks.length; t++) {
            var task = allTasks[t];
            if (task.userId) {
                taskCounts[task.userId] = (taskCounts[task.userId] || 0) + 1;
            }
        }
        
        // Build table with task counts
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var row = document.createElement('tr');
            
            var skillsText = user.skills && user.skills.length > 0 ? user.skills.join(', ') : 'None';
            var qualificationsText = user.qualifications && user.qualifications.length > 0 ? user.qualifications.join(', ') : 'None';
            
            var assignedProjects = [];
            var hasProjects = false;
            
            // Check user.projects
            if (user.projects && Array.isArray(user.projects) && user.projects.length > 0) {
                hasProjects = true;
                for (var j = 0; j < user.projects.length; j++) {
                    var project = projects.find(function(p) { return p.id === user.projects[j]; });
                    if (project) {
                        assignedProjects.push(project.name);
                    }
                }
            }
            
            // Also check if user is in projects.assignedUsers
            if (!hasProjects && usersWithProjects[user.id]) {
                hasProjects = true;
                for (var p = 0; p < projects.length; p++) {
                    var proj = projects[p];
                    if (proj.assignedUsers && Array.isArray(proj.assignedUsers)) {
                        if (proj.assignedUsers.indexOf(user.id) !== -1 || proj.assignedUsers.indexOf(String(user.id)) !== -1) {
                            if (assignedProjects.indexOf(proj.name) === -1) {
                                assignedProjects.push(proj.name);
                            }
                        }
                    }
                }
            }
            
            var projectsText = assignedProjects.length > 0 ? assignedProjects.join(', ') : 'None';
            var taskCount = taskCounts[user.id] || 0;
            
            // Highlight users with projects
            var rowStyle = hasProjects ? 'style="background-color: #f0f9ff;"' : '';
            row.setAttribute('style', hasProjects ? 'background-color: #f0f9ff;' : '');
            
            var assignButtonHtml = '';
            if (hasProjects) {
                assignButtonHtml = '<button class="btn" onclick="assignTaskToUser(\'' + user.id + '\', \'' + user.firstName.replace(/'/g, "\\'") + '\')" style="padding: 5px 10px; font-size: 12px; background-color: #0ea5e9;">+ Assign Task</button>';
            } else {
                assignButtonHtml = '<span style="color: #9ca3af; font-size: 12px; padding: 5px 10px; display: inline-block;" title="User must be assigned to a project first">No Project</span>';
            }
            
            row.innerHTML = '<td>' + user.firstName + '</td>' +
                           '<td>' + user.email + '</td>' +
                           '<td>' + (user.experience || '0') + ' years</td>' +
                           '<td>' + skillsText + '</td>' +
                           '<td>' + qualificationsText + '</td>' +
                           '<td>' + (hasProjects ? '<strong style="color: #0ea5e9;">' + projectsText + '</strong>' : projectsText) + '</td>' +
                           '<td><strong>' + taskCount + '</strong> task' + (taskCount !== 1 ? 's' : '') + '</td>' +
                           '<td>' + assignButtonHtml + '</td>';
            tbody.appendChild(row);
        }
        
        usersList.appendChild(table);
    })
    .catch(function(error) {
        console.error('Error loading tasks:', error);
        // Build table without task counts
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var row = document.createElement('tr');
            
            var skillsText = user.skills && user.skills.length > 0 ? user.skills.join(', ') : 'None';
            var qualificationsText = user.qualifications && user.qualifications.length > 0 ? user.qualifications.join(', ') : 'None';
            
            var assignedProjects = [];
            var hasProjects = false;
            
            if (user.projects && Array.isArray(user.projects) && user.projects.length > 0) {
                hasProjects = true;
                for (var j = 0; j < user.projects.length; j++) {
                    var project = projects.find(function(p) { return p.id === user.projects[j]; });
                    if (project) {
                        assignedProjects.push(project.name);
                    }
                }
            }
            
            // Check projects.assignedUsers
            if (!hasProjects) {
                for (var p = 0; p < projects.length; p++) {
                    var proj = projects[p];
                    if (proj.assignedUsers && Array.isArray(proj.assignedUsers)) {
                        if (proj.assignedUsers.indexOf(user.id) !== -1 || proj.assignedUsers.indexOf(String(user.id)) !== -1) {
                            hasProjects = true;
                            if (assignedProjects.indexOf(proj.name) === -1) {
                                assignedProjects.push(proj.name);
                            }
                        }
                    }
                }
            }
            
            var projectsText = assignedProjects.length > 0 ? assignedProjects.join(', ') : 'None';
            
            var assignButtonHtml = '';
            if (hasProjects) {
                assignButtonHtml = '<button class="btn" onclick="assignTaskToUser(\'' + user.id + '\', \'' + user.firstName.replace(/'/g, "\\'") + '\')" style="padding: 5px 10px; font-size: 12px; background-color: #0ea5e9;">+ Assign Task</button>';
            } else {
                assignButtonHtml = '<span style="color: #9ca3af; font-size: 12px; padding: 5px 10px; display: inline-block;" title="User must be assigned to a project first">No Project</span>';
            }
            
            row.innerHTML = '<td>' + user.firstName + '</td>' +
                           '<td>' + user.email + '</td>' +
                           '<td>' + (user.experience || '0') + ' years</td>' +
                           '<td>' + skillsText + '</td>' +
                           '<td>' + qualificationsText + '</td>' +
                           '<td>' + (hasProjects ? '<strong style="color: #0ea5e9;">' + projectsText + '</strong>' : projectsText) + '</td>' +
                           '<td>0 tasks</td>' +
                           '<td>' + assignButtonHtml + '</td>';
            tbody.appendChild(row);
        }
        usersList.appendChild(table);
    });
}

function loadProjects() {
    fetch('projects.php?action=getAll')
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        var projects = result.success ? result.projects : getProjects();
        displayProjects(projects);
    })
    .catch(function(error) {
        var projects = getProjects();
        displayProjects(projects);
    });
}

function displayProjects(projects) {
    var projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';
    
    if (projects.length === 0) {
        projectsList.innerHTML = '<p>No projects created yet. Click "Create New Project" to get started.</p>';
        return;
    }
    
    fetch('users.php?action=getAll')
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        var users = result.success ? result.users : getUsers();
        buildProjectsDisplay(projects, users);
    })
    .catch(function(error) {
        var users = getUsers();
        buildProjectsDisplay(projects, users);
    });
}

function buildProjectsDisplay(projects, users) {
    var projectsList = document.getElementById('projectsList');
    for (var i = 0; i < projects.length; i++) {
        var project = projects[i];
        var box = document.createElement('div');
        box.className = 'project-box';
        
        var assignedUsers = [];
        if (project.assignedUsers && Array.isArray(project.assignedUsers) && project.assignedUsers.length > 0) {
            for (var j = 0; j < project.assignedUsers.length; j++) {
                var user = users.find(function(u) { return u.id === project.assignedUsers[j]; });
                if (user) {
                    assignedUsers.push(user.firstName);
                }
            }
        }
        
        box.innerHTML = '<h3>' + project.name + '</h3>' +
                       '<p style="color: #666; font-size: 14px;">' + project.description + '</p>' +
                       '<p><strong>Assigned Users:</strong> ' + (assignedUsers.length > 0 ? assignedUsers.join(', ') : 'None') + '</p>' +
                       '<p><strong>Status:</strong> ' + project.status + '</p>' +
                       '<p><strong>Progress:</strong> ' + project.progress + '%</p>' +
                       '<button class="btn" onclick="assignTaskToProject(\'' + project.id + '\', \'' + project.name + '\')" style="margin-top: 10px; padding: 8px 15px;">Assign Task to Project</button>';
        projectsList.appendChild(box);
    }
}

function loadAssignProjects() {
    fetch('projects.php?action=getAll')
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        var projects = result.success ? result.projects : getProjects();
        fetch('users.php?action=getAll')
        .then(function(response) {
            return response.json();
        })
        .then(function(userResult) {
            var users = userResult.success ? userResult.users : getUsers();
            displayAssignProjects(projects, users);
        })
        .catch(function(error) {
            var users = getUsers();
            displayAssignProjects(projects, users);
        });
    })
    .catch(function(error) {
        var projects = getProjects();
        var users = getUsers();
        displayAssignProjects(projects, users);
    });
}

function displayAssignProjects(projects, users) {
    var assignList = document.getElementById('assignProjectsList');
    assignList.innerHTML = '';
    
    if (projects.length === 0) {
        assignList.innerHTML = '<p>No projects available. Create a project first.</p>';
        return;
    }
    
    for (var i = 0; i < projects.length; i++) {
        var project = projects[i];
        var box = document.createElement('div');
        box.className = 'project-box';
        box.style.marginBottom = '20px';
        
        var assignedUsers = [];
        if (project.assignedUsers && Array.isArray(project.assignedUsers) && project.assignedUsers.length > 0) {
            for (var j = 0; j < project.assignedUsers.length; j++) {
                var user = users.find(function(u) { return u.id === project.assignedUsers[j]; });
                if (user) {
                    assignedUsers.push(user.firstName);
                }
            }
        }
        
        var assignBtn = document.createElement('button');
        assignBtn.className = 'btn';
        assignBtn.style.marginTop = '10px';
        assignBtn.style.marginRight = '10px';
        assignBtn.textContent = 'Assign Users';
        assignBtn.onclick = (function(pid) {
            return function() {
                openAssignModal(pid);
            };
        })(project.id);
        
        var assignTaskBtn = document.createElement('button');
        assignTaskBtn.className = 'btn';
        assignTaskBtn.style.marginTop = '10px';
        assignTaskBtn.textContent = 'Assign Task';
        assignTaskBtn.onclick = (function(pid, pname) {
            return function() {
                assignTaskToProject(pid, pname);
            };
        })(project.id, project.name);
        
        box.innerHTML = '<h3>' + project.name + '</h3>' +
                       '<p style="color: #666; font-size: 14px;">' + project.description + '</p>' +
                       '<p><strong>Currently Assigned:</strong> ' + (assignedUsers.length > 0 ? assignedUsers.join(', ') : 'None') + '</p>';
        box.appendChild(assignBtn);
        box.appendChild(assignTaskBtn);
        assignList.appendChild(box);
    }
}

function showNewProjectModal() {
    document.getElementById('newProjectModal').style.display = 'block';
    document.getElementById('projectName').value = '';
    document.getElementById('projectDescription').value = '';
}

function closeNewProjectModal() {
    document.getElementById('newProjectModal').style.display = 'none';
}

function saveNewProject() {
    var name = document.getElementById('projectName').value.trim();
    var description = document.getElementById('projectDescription').value.trim();
    
    if (!name || !description) {
        alert('Please fill in all fields');
        return;
    }
    
    var formData = new FormData();
    formData.append('action', 'create');
    formData.append('name', name);
    formData.append('description', description);
    
    fetch('projects.php', {
        method: 'POST',
        body: formData
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        if (result.success) {
            closeNewProjectModal();
            loadProjects();
            alert('Project created successfully!');
        } else {
            // Fallback to localStorage
            createProject(name, description);
            closeNewProjectModal();
            loadProjects();
            alert('Project created successfully!');
        }
    })
    .catch(function(error) {
        createProject(name, description);
        closeNewProjectModal();
        loadProjects();
        alert('Project created successfully!');
    });
}

function openAssignModal(projectId) {
    var modal = document.getElementById('assignProjectModal');
    var projectSelect = document.getElementById('assignProjectSelect');
    var usersSelect = document.getElementById('assignUsersSelect');
    
    fetch('projects.php?action=getAll')
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        var projects = result.success ? result.projects : getProjects();
        var project = projects.find(function(p) { return p.id === projectId; });
        
        projectSelect.innerHTML = '';
        for (var i = 0; i < projects.length; i++) {
            var option = document.createElement('option');
            option.value = projects[i].id;
            option.textContent = projects[i].name;
            if (projects[i].id === projectId) {
                option.selected = true;
            }
            projectSelect.appendChild(option);
        }
        
        fetch('users.php?action=getAll')
        .then(function(response) {
            return response.json();
        })
        .then(function(userResult) {
            var users = userResult.success ? userResult.users : getUsers();
            populateUsersSelect(users, project, usersSelect);
            modal.style.display = 'block';
        })
        .catch(function(error) {
            var users = getUsers();
            populateUsersSelect(users, project, usersSelect);
            modal.style.display = 'block';
        });
    })
    .catch(function(error) {
        var projects = getProjects();
        var users = getUsers();
        var project = projects.find(function(p) { return p.id === projectId; });
        
        projectSelect.innerHTML = '';
        for (var i = 0; i < projects.length; i++) {
            var option = document.createElement('option');
            option.value = projects[i].id;
            option.textContent = projects[i].name;
            if (projects[i].id === projectId) {
                option.selected = true;
            }
            projectSelect.appendChild(option);
        }
        
        populateUsersSelect(users, project, usersSelect);
        modal.style.display = 'block';
    });
}

window.deleteTask = function(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    var formData = new FormData();
    formData.append('action', 'delete');
    formData.append('taskId', taskId);
    
    fetch('tasks.php', {
        method: 'POST',
        body: formData
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        if (result.success) {
            loadTasks();
            // Also reload users table to update task counts
            loadUsers();
            alert('Task deleted successfully!');
        } else {
            alert('Error deleting task: ' + (result.message || 'Unknown error'));
        }
    })
    .catch(function(error) {
        console.error('Error:', error);
        alert('Error deleting task. Please try again.');
    });
}

function populateUsersSelect(users, project, usersSelect) {
    usersSelect.innerHTML = '';
    for (var i = 0; i < users.length; i++) {
        var option = document.createElement('option');
        option.value = users[i].id;
        option.textContent = users[i].firstName + ' (' + users[i].email + ')';
        if (project && project.assignedUsers && Array.isArray(project.assignedUsers) && project.assignedUsers.indexOf(users[i].id) > -1) {
            option.selected = true;
        }
        usersSelect.appendChild(option);
    }
}

function closeAssignModal() {
    document.getElementById('assignProjectModal').style.display = 'none';
}

function saveAssignment() {
    var projectId = document.getElementById('assignProjectSelect').value;
    var usersSelect = document.getElementById('assignUsersSelect');
    var selectedUsers = [];
    
    if (!projectId) {
        alert('Please select a project');
        return;
    }
    
    for (var i = 0; i < usersSelect.options.length; i++) {
        if (usersSelect.options[i].selected) {
            selectedUsers.push(usersSelect.options[i].value);
        }
    }
    
    var formData = new FormData();
    formData.append('action', 'assign');
    formData.append('projectId', projectId);
    formData.append('userIds', JSON.stringify(selectedUsers));
    
    fetch('projects.php', {
        method: 'POST',
        body: formData
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        if (result.success) {
            closeAssignModal();
            loadAssignProjects();
            loadUsers();
            loadProjects();
            alert('Project assignment updated!');
        } else {
            // Fallback to localStorage
            var projects = getProjects();
            var project = projects.find(function(p) { return p.id === projectId; });
            
            if (!project) {
                alert('Project not found');
                return;
            }
            
            var currentUsers = project.assignedUsers || [];
            for (var i = 0; i < currentUsers.length; i++) {
                removeUserFromProject(currentUsers[i], projectId);
            }
            
            for (var i = 0; i < selectedUsers.length; i++) {
                assignUserToProject(selectedUsers[i], projectId);
            }
            
            closeAssignModal();
            loadAssignProjects();
            loadUsers();
            loadProjects();
            alert('Project assignment updated!');
        }
    })
    .catch(function(error) {
        var projects = getProjects();
        var project = projects.find(function(p) { return p.id === projectId; });
        
        if (!project) {
            alert('Project not found');
            return;
        }
        
        var currentUsers = project.assignedUsers || [];
        for (var i = 0; i < currentUsers.length; i++) {
            removeUserFromProject(currentUsers[i], projectId);
        }
        
        for (var i = 0; i < selectedUsers.length; i++) {
            assignUserToProject(selectedUsers[i], projectId);
        }
        
        closeAssignModal();
        loadAssignProjects();
        loadUsers();
        loadProjects();
        alert('Project assignment updated!');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupTabButtons();
    loadUsers();
    loadProjects();
    loadAssignProjects();
    
    var newProjectBtn = document.getElementById('newProjectBtn');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', showNewProjectModal);
    }
    
    var cancelProjectBtn = document.getElementById('cancelProjectBtn');
    if (cancelProjectBtn) {
        cancelProjectBtn.addEventListener('click', closeNewProjectModal);
    }
    
    var saveProjectBtn = document.getElementById('saveProjectBtn');
    if (saveProjectBtn) {
        saveProjectBtn.addEventListener('click', saveNewProject);
    }
    
    var cancelAssignBtn = document.getElementById('cancelAssignBtn');
    if (cancelAssignBtn) {
        cancelAssignBtn.addEventListener('click', closeAssignModal);
    }
    
    var saveAssignBtn = document.getElementById('saveAssignBtn');
    if (saveAssignBtn) {
        saveAssignBtn.addEventListener('click', saveAssignment);
    }
    
    var newTaskBtn = document.getElementById('newTaskBtn');
    if (newTaskBtn) {
        newTaskBtn.addEventListener('click', showNewTaskModal);
    }
    
    var cancelTaskBtn = document.getElementById('cancelTaskBtn');
    if (cancelTaskBtn) {
        cancelTaskBtn.addEventListener('click', closeNewTaskModal);
    }
    
    var saveTaskBtn = document.getElementById('saveTaskBtn');
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', saveNewTask);
    }
    
    window.onclick = function(event) {
        var newProjectModal = document.getElementById('newProjectModal');
        var assignModal = document.getElementById('assignProjectModal');
        var newTaskModal = document.getElementById('newTaskModal');
        if (event.target === newProjectModal) {
            closeNewProjectModal();
        }
        if (event.target === assignModal) {
            closeAssignModal();
        }
        if (event.target === newTaskModal) {
            closeNewTaskModal();
        }
    };
});

// Task Management Functions
function loadTasks() {
    fetch('tasks.php?action=getAll')
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        var tasks = result.success ? result.tasks : [];
        displayTasks(tasks);
    })
    .catch(function(error) {
        console.error('Error loading tasks:', error);
        displayTasks([]);
    });
}

function displayTasks(tasks) {
    var tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">No tasks created yet. Click "+ Create New Task" to get started.</p>';
        return;
    }
    
    // Show summary
    var completedTasks = tasks.filter(function(t) { return t.status === 'completed'; }).length;
    var inProgressTasks = tasks.filter(function(t) { return t.status === 'in_progress'; }).length;
    var pendingTasks = tasks.filter(function(t) { return t.status === 'pending'; }).length;
    
    var summaryHtml = '<div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border: 1px solid #ddd;">' +
                     '<h3 style="margin-top: 0;">Task Summary</h3>' +
                     '<div style="display: flex; gap: 20px;">' +
                     '<div><strong>Total:</strong> ' + tasks.length + '</div>' +
                     '<div style="color: #22c55e;"><strong>Completed:</strong> ' + completedTasks + '</div>' +
                     '<div style="color: #0ea5e9;"><strong>In Progress:</strong> ' + inProgressTasks + '</div>' +
                     '<div style="color: #666;"><strong>Pending:</strong> ' + pendingTasks + '</div>' +
                     '</div></div>';
    tasksList.innerHTML = summaryHtml;
    
    // Group tasks by project
    var tasksByProject = {};
    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        var projectName = task.projectName || 'Unknown Project';
        if (!tasksByProject[projectName]) {
            tasksByProject[projectName] = [];
        }
        tasksByProject[projectName].push(task);
    }
    
    for (var projectName in tasksByProject) {
        var projectTasks = tasksByProject[projectName];
        var projectBox = document.createElement('div');
        projectBox.className = 'project-box';
        projectBox.style.marginBottom = '20px';
        projectBox.style.width = '100%';
        projectBox.style.float = 'none';
        
        var tasksHtml = '<h3 style="border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;">' + projectName + ' (' + projectTasks.length + ' tasks)</h3>';
        for (var j = 0; j < projectTasks.length; j++) {
            var task = projectTasks[j];
            var priorityClass = task.priority === 'high' ? 'style="background-color: #fee2e2; color: #991b1b;"' : 
                               task.priority === 'low' ? 'style="background-color: #dbeafe; color: #1e40af;"' : 
                               'style="background-color: #fef3c7; color: #92400e;"';
            var statusClass = task.status === 'completed' ? 'style="color: #22c55e; font-weight: bold;"' : 
                             task.status === 'in_progress' ? 'style="color: #0ea5e9; font-weight: bold;"' : 
                             'style="color: #666; font-weight: bold;"';
            
            tasksHtml += '<div class="task-item" style="margin-top: 10px; padding: 15px; border: 1px solid #ddd; background-color: white; border-left: 4px solid ' + 
                        (task.priority === 'high' ? '#dc2626' : task.priority === 'low' ? '#3b82f6' : '#eab308') + ';">' +
                        '<div style="display: flex; justify-content: space-between; align-items: start;">' +
                        '<div style="flex: 1;">' +
                        '<h4 style="margin-top: 0; color: #333;">' + task.title + '</h4>' +
                        '<p style="color: #666; font-size: 14px; margin: 5px 0;">' + (task.description || 'No description') + '</p>' +
                        '<div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 15px;">' +
                        '<div><strong>Assigned to:</strong> ' + (task.firstName || 'Unknown') + '</div>' +
                        '<div><strong>Type:</strong> <span class="badge">' + task.taskType + '</span></div>' +
                        '<div><strong>Priority:</strong> <span class="badge" ' + priorityClass + '>' + task.priority + '</span></div>' +
                        '<div><strong>Status:</strong> <span ' + statusClass + '>' + task.status + '</span></div>' +
                        '<div><strong>Progress:</strong> ' + task.progress + '%</div>' +
                        (task.dueDate ? '<div><strong>Due:</strong> ' + task.dueDate + '</div>' : '') +
                        '</div>' +
                        '</div>' +
                        '<div>' +
                        '<button class="btn" onclick="deleteTask(\'' + task.id + '\')" style="padding: 5px 10px; font-size: 12px; background-color: #dc2626; margin-left: 10px;">Delete</button>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
        }
        
        projectBox.innerHTML = tasksHtml;
        tasksList.appendChild(projectBox);
    }
}

function showNewTaskModal() {
    var modal = document.getElementById('newTaskModal');
    
    // Load projects
    fetch('projects.php?action=getAll')
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        var projects = result.success ? result.projects : getProjects();
        var projectSelect = document.getElementById('taskProjectSelect');
        projectSelect.innerHTML = '<option value="">Select Project</option>';
        for (var i = 0; i < projects.length; i++) {
            var option = document.createElement('option');
            option.value = projects[i].id;
            option.textContent = projects[i].name;
            projectSelect.appendChild(option);
        }
    });
    
    // Load users
    fetch('users.php?action=getAll')
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        var users = result.success ? result.users : getUsers();
        var userSelect = document.getElementById('taskUserSelect');
        userSelect.innerHTML = '<option value="">Select User</option>';
        for (var i = 0; i < users.length; i++) {
            var option = document.createElement('option');
            option.value = users[i].id;
            option.textContent = users[i].firstName + ' (' + users[i].email + ')';
            userSelect.appendChild(option);
        }
    });
    
    // Clear form
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskType').value = '';
    document.getElementById('taskPriority').value = 'medium';
    document.getElementById('taskDueDate').value = '';
    
    modal.style.display = 'block';
}

function closeNewTaskModal() {
    document.getElementById('newTaskModal').style.display = 'none';
}

function saveNewTask() {
    var projectId = document.getElementById('taskProjectSelect').value;
    var userId = document.getElementById('taskUserSelect').value;
    var title = document.getElementById('taskTitle').value.trim();
    var description = document.getElementById('taskDescription').value.trim();
    var taskType = document.getElementById('taskType').value;
    var priority = document.getElementById('taskPriority').value;
    var dueDate = document.getElementById('taskDueDate').value;
    
    if (!projectId || !userId || !title || !taskType) {
        alert('Please fill in all required fields');
        return;
    }
    
    var formData = new FormData();
    formData.append('action', 'create');
    formData.append('projectId', projectId);
    formData.append('userId', userId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('taskType', taskType);
    formData.append('priority', priority);
    if (dueDate) {
        formData.append('dueDate', dueDate);
    }
    
    fetch('tasks.php', {
        method: 'POST',
        body: formData
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        if (result.success) {
            closeNewTaskModal();
            loadTasks();
            // Also reload users table to update task counts
            loadUsers();
            alert('Task created successfully!');
        } else {
            alert('Error creating task: ' + (result.message || 'Unknown error'));
        }
    })
    .catch(function(error) {
        console.error('Error:', error);
        alert('Error creating task. Please try again.');
    });
}

// Make functions globally accessible
window.assignTaskToUser = function(userId, userName) {
    // Double check - prevent function execution if somehow called for user without projects
    var modal = document.getElementById('newTaskModal');
    
    // Load user to get their projects
    fetch('users.php?action=getAll')
    .then(function(response) {
        return response.json();
    })
    .then(function(userResult) {
        var users = userResult.success ? userResult.users : getUsers();
        var selectedUser = users.find(function(u) { return u.id === userId; });
        
        if (!selectedUser) {
            alert('User not found');
            return;
        }
        
        // Get user's projects
        var userProjectIds = [];
        if (selectedUser.projects && Array.isArray(selectedUser.projects)) {
            userProjectIds = selectedUser.projects;
        } else if (typeof selectedUser.projects === 'string') {
            try {
                userProjectIds = JSON.parse(selectedUser.projects);
            } catch (e) {
                userProjectIds = [];
            }
        }
        
        // Also check projects.assignedUsers
        fetch('projects.php?action=getAll')
        .then(function(response) {
            return response.json();
        })
        .then(function(result) {
            var allProjects = result.success ? result.projects : getProjects();
            
            // Find projects where user is assigned
            for (var i = 0; i < allProjects.length; i++) {
                var proj = allProjects[i];
                if (proj.assignedUsers && Array.isArray(proj.assignedUsers)) {
                    var isAssigned = proj.assignedUsers.some(function(uid) {
                        return uid === userId || uid === String(userId);
                    });
                    if (isAssigned && userProjectIds.indexOf(proj.id) === -1) {
                        userProjectIds.push(proj.id);
                    }
                }
            }
            
            // If user has no projects, show alert and return early
            if (userProjectIds.length === 0) {
                alert('This user has no projects assigned. Please assign them to a project first in the "Assign Projects" tab before creating tasks.');
                return;
            }
            
            var projectSelect = document.getElementById('taskProjectSelect');
            projectSelect.innerHTML = '<option value="">Select Project</option>';
            
            // Only show projects the user is assigned to
            for (var i = 0; i < allProjects.length; i++) {
                var project = allProjects[i];
                if (userProjectIds.indexOf(project.id) !== -1) {
                    var option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = project.name;
                    projectSelect.appendChild(option);
                }
            }
            
            // Pre-select user
            var userSelect = document.getElementById('taskUserSelect');
            userSelect.innerHTML = '<option value="">Select User</option>';
            for (var i = 0; i < users.length; i++) {
                var option = document.createElement('option');
                option.value = users[i].id;
                option.textContent = users[i].firstName + ' (' + users[i].email + ')';
                if (users[i].id === userId) {
                    option.selected = true;
                }
                userSelect.appendChild(option);
            }
            
            // Clear other fields
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDescription').value = '';
            document.getElementById('taskType').value = '';
            document.getElementById('taskPriority').value = 'medium';
            document.getElementById('taskDueDate').value = '';
            
            modal.style.display = 'block';
        });
    });
}

window.assignTaskToProject = function(projectId, projectName) {
    var modal = document.getElementById('newTaskModal');
    
    // Pre-select project
    fetch('projects.php?action=getAll')
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        var projects = result.success ? result.projects : getProjects();
        var selectedProject = projects.find(function(p) { return p.id === projectId; });
        
        if (!selectedProject) {
            alert('Project not found');
            return;
        }
        
        // Get assigned users for this project
        var assignedUserIds = [];
        if (selectedProject.assignedUsers && Array.isArray(selectedProject.assignedUsers)) {
            assignedUserIds = selectedProject.assignedUsers;
        } else if (typeof selectedProject.assignedUsers === 'string') {
            try {
                assignedUserIds = JSON.parse(selectedProject.assignedUsers);
            } catch (e) {
                assignedUserIds = [];
            }
        }
        
        // Also check users.projects
        fetch('users.php?action=getAll')
        .then(function(response) {
            return response.json();
        })
        .then(function(userResult) {
            var allUsers = userResult.success ? userResult.users : getUsers();
            
            // Find users who have this project in their projects array
            for (var i = 0; i < allUsers.length; i++) {
                var user = allUsers[i];
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
                
                if (userProjects.indexOf(projectId) !== -1) {
                    if (assignedUserIds.indexOf(user.id) === -1 && assignedUserIds.indexOf(String(user.id)) === -1) {
                        assignedUserIds.push(user.id);
                    }
                }
            }
            
            if (assignedUserIds.length === 0) {
                alert('No users are assigned to this project. Please assign users to the project first.');
                return;
            }
            
            var projectSelect = document.getElementById('taskProjectSelect');
            projectSelect.innerHTML = '<option value="">Select Project</option>';
            for (var i = 0; i < projects.length; i++) {
                var option = document.createElement('option');
                option.value = projects[i].id;
                option.textContent = projects[i].name;
                if (projects[i].id === projectId) {
                    option.selected = true;
                }
                projectSelect.appendChild(option);
            }
            
            // Only show users assigned to this project
            var userSelect = document.getElementById('taskUserSelect');
            userSelect.innerHTML = '<option value="">Select User</option>';
            for (var i = 0; i < allUsers.length; i++) {
                var user = allUsers[i];
                var isAssigned = assignedUserIds.some(function(uid) {
                    return uid === user.id || uid === String(user.id);
                });
                
                if (isAssigned) {
                    var option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = user.firstName + ' (' + user.email + ')';
                    userSelect.appendChild(option);
                }
            }
            
            // Clear other fields
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDescription').value = '';
            document.getElementById('taskType').value = '';
            document.getElementById('taskPriority').value = 'medium';
            document.getElementById('taskDueDate').value = '';
            
            modal.style.display = 'block';
        });
    });
}

