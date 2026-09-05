import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserSkill, SkillLevel } from '../types';
import { X, Plus, Trash2, Award } from 'lucide-react';

export const EditSkillsModal: React.FC<{
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}> = ({ isOpen, user, onClose }) => {
  const { updateUserSkills } = useApp();

  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Advanced');

  useEffect(() => {
    if (user) {
      setSkills(user.skills || []);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleAddSkill = () => {
    if (skillName.trim()) {
      const exists = skills.some(s => s.name.toLowerCase() === skillName.trim().toLowerCase());
      if (!exists) {
        setSkills([...skills, { name: skillName.trim(), level: skillLevel }]);
        setSkillName('');
      }
    }
  };

  const handleRemoveSkill = (name: string) => {
    setSkills(skills.filter(s => s.name !== name));
  };

  const handleSave = () => {
    updateUserSkills(user.id, skills);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: 'var(--gradient-primary)',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              color: '#fff',
              display: 'flex'
            }}>
              <Award size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Edit Skills Portfolio</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Updating competencies for {user.name}</p>
            </div>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Add Skill Row */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Skill name (e.g. GraphQL, Rust, UI/UX)"
            value={skillName}
            onChange={e => setSkillName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
          />

          <select
            className="form-control"
            value={skillLevel}
            onChange={e => setSkillLevel(e.target.value as SkillLevel)}
            style={{ width: 'auto', minWidth: '130px' }}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>

          <button type="button" className="btn btn-primary" onClick={handleAddSkill}>
            <Plus size={16} /> Add
          </button>
        </div>

        {/* Current Skills List */}
        <div style={{
          maxHeight: '280px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '0.5rem',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-card)'
        }}>
          {skills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              No skills listed. Add some skills above!
            </div>
          ) : (
            skills.map(s => (
              <div
                key={s.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.55rem 0.85rem',
                  background: 'var(--bg-card-solid)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.name}</span>
                  <span className="badge-skill-level">{s.level}</span>
                </div>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleRemoveSkill(s.name)}
                  style={{ padding: '0.2rem 0.4rem', color: 'var(--text-muted)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Save Portfolio
          </button>
        </div>

      </div>
    </div>
  );
};
