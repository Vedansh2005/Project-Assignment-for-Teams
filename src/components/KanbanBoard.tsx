import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, PriorityLevel } from '../types';
import { 
  Plus, 
  Clock, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

const COLUMNS: { id: TaskStatus; title: string; color: string; badgeClass: string }[] = [
  { id: 'backlog', title: 'Backlog', color: '#64748b', badgeClass: 'badge-medium' },
  { id: 'in_progress', title: 'In Progress', color: '#6366f1', badgeClass: 'badge-urgent' },
  { id: 'in_review', title: 'Code Review', color: '#f59e0b', badgeClass: 'badge-high' },
  { id: 'completed', title: 'Completed', color: '#10b981', badgeClass: 'badge-low' }
];

export const KanbanBoard: React.FC<{ onOpenNewTask: () => void }> = ({ onOpenNewTask }) => {
  const { tasks, projects, users, currentUser, moveTaskStatus, deleteTask } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) return false;
    if (filterAssignee === 'me' && task.assignedToId !== currentUser.id) return false;
    if (filterAssignee !== 'all' && filterAssignee !== 'me' && task.assignedToId !== filterAssignee) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    moveTaskStatus(taskId, newStatus);
    if (newStatus === 'completed') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 }
      });
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['backlog', 'in_progress', 'in_review', 'completed'];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['backlog', 'in_progress', 'in_review', 'completed'];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Board Header & Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            Interactive Kanban Board
            <span className="badge badge-skill">{filteredTasks.length} Tasks</span>
          </h2>
          <p style={{ fontSize: '0.85rem' }}>Drag & drop or move tasks across workflow phases with live status updates</p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Filter size={15} />
            <span>Filters:</span>
          </div>

          <select
            className="form-control"
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <select
            className="form-control"
            value={filterAssignee}
            onChange={e => setFilterAssignee(e.target.value)}
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="all">All Assignees</option>
            <option value="me">Assigned to Me ({currentUser.name})</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          <select
            className="form-control"
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button className="btn btn-sm btn-primary" onClick={onOpenNewTask}>
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* Kanban 4 Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        {COLUMNS.map(column => {
          const colTasks = filteredTasks.filter(t => t.status === column.id);

          return (
            <div
              key={column.id}
              className="glass-panel"
              onDragOver={e => e.preventDefault()}
              onDrop={() => {
                if (draggedTaskId) {
                  handleStatusChange(draggedTaskId, column.id);
                  setDraggedTaskId(null);
                }
              }}
              style={{
                background: 'var(--bg-card)',
                padding: '1rem',
                minHeight: '520px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: column.color }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{column.title}</h3>
                  <span style={{
                    fontSize: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--text-secondary)'
                  }}>
                    {colTasks.length}
                  </span>
                </div>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={onOpenNewTask}
                  style={{ padding: '0.2rem 0.4rem', color: 'var(--text-muted)' }}
                  title="Add task to this column"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Cards in Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                {colTasks.length === 0 ? (
                  <div style={{
                    padding: '2.5rem 1rem',
                    textAlign: 'center',
                    border: '1px dashed var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem'
                  }}>
                    No tasks in {column.title.toLowerCase()}
                  </div>
                ) : (
                  colTasks.map(task => {
                    const project = projects.find(p => p.id === task.projectId);
                    const assignee = users.find(u => u.id === task.assignedToId);
                    const prev = getPrevStatus(task.status);
                    const next = getNextStatus(task.status);

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => setDraggedTaskId(task.id)}
                        className="glass-panel"
                        style={{
                          background: 'var(--bg-card-solid)',
                          padding: '0.95rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.65rem',
                          cursor: 'grab',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        {/* Project Tag & Priority */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em'
                          }}>
                            {project?.title.slice(0, 22) || 'General Project'}
                          </span>
                          <span className={`badge badge-${task.priority}`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                            {task.title}
                          </h4>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            {task.description}
                          </p>
                        </div>

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {task.tags.map(tag => (
                              <span key={tag} className="badge badge-skill" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer: Due date, Estimate, Assignee & Actions */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid var(--border-subtle)',
                          marginTop: '0.2rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={13} /> {task.estimatedHours}h
                            </span>
                            <span>{task.dueDate}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {assignee ? (
                              <div
                                className="avatar avatar-sm"
                                style={{ background: assignee.avatarGradient, width: '1.75rem', height: '1.75rem', fontSize: '0.7rem' }}
                                title={`Assigned to: ${assignee.name} (${assignee.title})`}
                              >
                                {assignee.name.split(' ').map(n => n[0]).join('')}
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                Unassigned
                              </div>
                            )}

                            {/* Move Left Button */}
                            {prev && (
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleStatusChange(task.id, prev)}
                                title={`Move to ${prev.replace('_', ' ')}`}
                                style={{ padding: '0.2rem 0.35rem' }}
                              >
                                <ArrowLeft size={13} />
                              </button>
                            )}

                            {/* Move Right Button */}
                            {next && (
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleStatusChange(task.id, next)}
                                title={`Move to ${next.replace('_', ' ')}`}
                                style={{ padding: '0.2rem 0.35rem' }}
                              >
                                <ArrowRight size={13} />
                              </button>
                            )}

                            {/* Delete Task */}
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => deleteTask(task.id)}
                              title="Delete task"
                              style={{ padding: '0.2rem 0.35rem', color: 'var(--text-muted)' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
