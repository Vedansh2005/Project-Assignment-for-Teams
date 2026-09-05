import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PriorityLevel } from '../types';
import { X, Plus, Sparkles } from 'lucide-react';

export const NewProjectModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { addProject, users } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('AI / Platform');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState('2026-11-30');
  const [leadId, setLeadId] = useState(users[0]?.id || '');
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    'TypeScript',
    'React',
    'PostgreSQL'
  ]);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills([...requiredSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addProject({
      title: title.trim(),
      description: description.trim() || 'High-impact collaborative team milestone.',
      category,
      status: 'active',
      priority,
      startDate,
      deadline,
      requiredSkills,
      leadId
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
              <Sparkles size={18} />
            </div>
            <h3 style={{ fontSize: '1.3rem' }}>Initialize New Project</h3>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Distributed Vector Retrieval Gateway"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Project Overview & Objectives</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Describe deliverables, technical scope, and outcomes..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category / Discipline</label>
              <select
                className="form-control"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="AI / Platform">AI / Platform</option>
                <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                <option value="Web & UI Engineering">Web & UI Engineering</option>
                <option value="Security & Auth">Security & Auth</option>
                <option value="Mobile / Client">Mobile / Client</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level</label>
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
              <label className="form-label">Target Deadline</label>
              <input
                type="date"
                className="form-control"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Project Lead</label>
              <select
                className="form-control"
                value={leadId}
                onChange={e => setLeadId(e.target.value)}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.title.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Required Skills Picker */}
          <div className="form-group">
            <label className="form-label">Required Technical Competencies (for Smart Matcher)</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Type skill (e.g. Python, Docker, UI/UX) and press Add"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddSkill}>
                <Plus size={15} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {requiredSkills.map(skill => (
                <span key={skill} className="badge badge-skill" style={{ padding: '0.3rem 0.6rem' }}>
                  {skill}
                  <X
                    size={13}
                    style={{ cursor: 'pointer', marginLeft: '0.25rem' }}
                    onClick={() => handleRemoveSkill(skill)}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Initialize Project
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
