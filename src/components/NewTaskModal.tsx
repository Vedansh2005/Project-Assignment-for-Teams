import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PriorityLevel, TaskStatus } from '../types';
import { X, CheckSquare } from 'lucide-react';

export const NewTaskModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { addTask, projects, users } = useApp();

  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [assignedToId, setAssignedToId] = useState(users[0]?.id || '');
  const [dueDate, setDueDate] = useState('2026-09-18');
  const [estimatedHours, setEstimatedHours] = useState(8);
  const [tagInput, setTagInput] = useState('Frontend, React');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    addTask({
      projectId: projectId || projects[0]?.id,
      title: title.trim(),
      description: description.trim() || 'Implement task specifications and unit tests.',
      status,
      priority,
      assignedToId: assignedToId || undefined,
      dueDate,
      estimatedHours: Number(estimatedHours) || 4,
      tags
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: 'var(--gradient-primary)',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              color: '#fff',
              display: 'flex'
            }}>
              <CheckSquare size={18} />
            </div>
            <h3 style={{ fontSize: '1.3rem' }}>Create Kanban Task</h3>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Associated Project *</label>
            <select
              className="form-control"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              required
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Optimize Redis Query Caching & TTLs"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Task Description</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Technical details, acceptance criteria..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Workflow Column</label>
              <select
                className="form-control"
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
              >
                <option value="backlog">Backlog</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">Code Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-control"
                value={priority}
                onChange={e => setPriority(e.target.value as PriorityLevel)}
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Assigned Engineer</label>
              <select
                className="form-control"
                value={assignedToId}
                onChange={e => setAssignedToId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.title.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Hours</label>
              <input
                type="number"
                min={1}
                max={80}
                className="form-control"
                value={estimatedHours}
                onChange={e => setEstimatedHours(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-control"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Cache, Redis, API"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Task to Board
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
