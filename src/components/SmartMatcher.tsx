import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateSmartMatches } from '../data/mockData';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  UserMinus, 
  Briefcase, 
  Cpu, 
  Clock, 
  Layers,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SmartMatcher: React.FC = () => {
  const { projects, users, assignMemberToProject, removeMemberFromProject, addToast } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  if (!currentProject) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <h3>No projects available for matching.</h3>
        <p>Create a project first to utilize the smart skill engine.</p>
      </div>
    );
  }

  const matchResults = calculateSmartMatches(currentProject, users);

  const handleAutoAssignBestTeam = () => {
    // Select top candidates not yet assigned
    const unassigned = matchResults.filter(r => !currentProject.assignedMemberIds.includes(r.member.id));
    const topPicks = unassigned.slice(0, 2);

    if (topPicks.length === 0) {
      addToast('Top matching candidates are already on the team!', 'info');
      return;
    }

    topPicks.forEach(pick => {
      assignMemberToProject(currentProject.id, pick.member.id);
    });

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    });

    addToast(`Smart Engine automatically formed the ideal team for "${currentProject.title}"!`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner: Project Selector & Intelligence Specs */}
      <div className="glass-panel glass-panel-glow" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <div style={{
                background: 'var(--gradient-primary)',
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Sparkles size={20} />
              </div>
              <h2 style={{ fontSize: '1.5rem' }}>Smart Team Assignment & Skill Matcher</h2>
              <span className="badge badge-skill">Algorithmic Scoring Engine</span>
            </div>
            <p style={{ fontSize: '0.88rem' }}>
              Deep skill-vector matching that optimizes candidate proficiencies, availability capacity, and project competencies.
            </p>
          </div>

          {/* Project Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Project:</label>
            <select
              className="form-control"
              value={currentProject.id}
              onChange={e => setSelectedProjectId(e.target.value)}
              style={{ width: 'auto', minWidth: '260px', fontWeight: 600 }}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            <button className="btn btn-primary" onClick={handleAutoAssignBestTeam}>
              <Sparkles size={16} />
              Auto-Form Ideal Team
            </button>
          </div>
        </div>

        {/* Project Profile Summary Card */}
        <div style={{
          background: 'var(--bg-input)',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-card)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</span>
            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{currentProject.category}</div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Deadline</span>
            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{currentProject.deadline}</div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Team Size</span>
            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{currentProject.assignedMemberIds.length} Members Assigned</div>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Required Competencies</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.2rem' }}>
              {currentProject.requiredSkills.map(skill => (
                <span key={skill} className="badge badge-skill" style={{ fontSize: '0.72rem' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Ranking List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Ranked Candidate Matches ({matchResults.length})</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sorted by Algorithmic Fit Score</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
          {matchResults.map((result, idx) => {
            const isAssigned = currentProject.assignedMemberIds.includes(result.member.id);

            // Match color tone
            let scoreColor = '#10b981';
            let scoreGradient = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            if (result.matchScore < 50) {
              scoreColor = '#f43f5e';
              scoreGradient = 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)';
            } else if (result.matchScore < 80) {
              scoreColor = '#f59e0b';
              scoreGradient = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            }

            const freeCapacity = Math.max(0, result.member.availabilityHoursPerWeek - result.member.currentWorkloadHours);

            return (
              <div
                key={result.member.id}
                className="glass-panel"
                style={{
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderLeft: `4px solid ${scoreColor}`,
                  background: isAssigned ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-card)'
                }}
              >
                {/* Header: Avatar, Info & Match Score Ring */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.85rem' }}>
                    <div 
                      className="avatar avatar-lg"
                      style={{ background: result.member.avatarGradient }}
                    >
                      {result.member.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{result.member.name}</h4>
                        {idx === 0 && (
                          <span className="badge badge-urgent" style={{ fontSize: '0.65rem' }}>
                            <Award size={12} /> Top Match
                          </span>
                        )}
                        {isAssigned && (
                          <span className="badge badge-low" style={{ fontSize: '0.65rem' }}>
                            Assigned
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{result.member.title}</p>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {result.member.department} • {result.member.experienceYears} yrs experience
                      </span>
                    </div>
                  </div>

                  {/* Big Fit Score Badge */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.5rem 0.85rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    minWidth: '85px'
                  }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: scoreColor }}>
                      {result.matchScore}%
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Fit Score
                    </span>
                  </div>
                </div>

                {/* Fit Explanation & Workload Capacity */}
                <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontStyle: 'italic', background: 'rgba(255, 255, 255, 0.03)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  "{result.fitSummary}"
                </p>

                {/* Workload Capacity Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Workload Capacity</span>
                    <span style={{ fontWeight: 600 }}>
                      {result.member.currentWorkloadHours}h / {result.member.availabilityHoursPerWeek}h used ({freeCapacity}h free)
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${(result.member.currentWorkloadHours / result.member.availabilityHoursPerWeek) * 100}%`,
                        background: result.workloadStatus === 'overloaded' ? 'var(--gradient-danger)' : 'var(--gradient-primary)'
                      }} 
                    />
                  </div>
                </div>

                {/* Matched vs Missing Skills */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginRight: '0.3rem' }}>Matched:</span>
                    {result.matchingSkills.length === 0 ? (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>None direct</span>
                    ) : (
                      result.matchingSkills.map(skill => (
                        <span key={skill} className="badge badge-low" style={{ fontSize: '0.7rem' }}>
                          <CheckCircle2 size={12} /> {skill}
                        </span>
                      ))
                    )}
                  </div>

                  {result.missingSkills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginRight: '0.3rem' }}>Missing:</span>
                      {result.missingSkills.map(skill => (
                        <span key={skill} style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}>
                          <XCircle size={11} /> {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  {isAssigned ? (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => removeMemberFromProject(currentProject.id, result.member.id)}
                    >
                      <UserMinus size={14} /> Remove from Team
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => assignMemberToProject(currentProject.id, result.member.id)}
                    >
                      <UserPlus size={14} /> Assign to Project
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
