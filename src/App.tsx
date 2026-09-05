import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { SmartMatcher } from './components/SmartMatcher';
import { KanbanBoard } from './components/KanbanBoard';
import { ProjectsView } from './components/ProjectsView';
import { TeamRosterView } from './components/TeamRosterView';
import { NewProjectModal } from './components/NewProjectModal';
import { NewTaskModal } from './components/NewTaskModal';
import { EditSkillsModal } from './components/EditSkillsModal';
import { ToastContainer } from './components/ToastContainer';
import { User } from './types';
import { Zap, Heart, Sparkles, Terminal } from 'lucide-react';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isNewProjectOpen, setIsNewProjectOpen] = useState<boolean>(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        onOpenNewTask={() => setIsNewTaskOpen(true)}
      />

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1, paddingBottom: '3rem' }}>
        {activeTab === 'overview' && (
          <OverviewDashboard
            setActiveTab={setActiveTab}
            onOpenNewProject={() => setIsNewProjectOpen(true)}
            onOpenNewTask={() => setIsNewTaskOpen(true)}
          />
        )}

        {activeTab === 'matcher' && (
          <SmartMatcher />
        )}

        {activeTab === 'kanban' && (
          <KanbanBoard onOpenNewTask={() => setIsNewTaskOpen(true)} />
        )}

        {activeTab === 'projects' && (
          <ProjectsView
            onOpenNewProject={() => setIsNewProjectOpen(true)}
            onGoToMatcher={() => setActiveTab('matcher')}
          />
        )}

        {activeTab === 'team' && (
          <TeamRosterView
            onOpenEditSkills={(user) => setEditingUser(user)}
          />
        )}
      </main>

      {/* Modern Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        padding: '1.75rem 2rem',
        marginTop: 'auto'
      }}>
        <div className="app-container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '1.75rem',
              height: '1.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Zap size={14} fill="currentColor" />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>TeamFlow (PAFT 2.0)</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>— Next-Gen Project Assignment for Teams</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Built with React 19 + TypeScript + Vite</span>
            <span>•</span>
            <span>Zero External Server Dependencies</span>
            <span>•</span>
            <span style={{ color: 'var(--text-accent)' }}>Legacy PHP files preserved in /legacy_php</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />

      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
      />

      <EditSkillsModal
        isOpen={Boolean(editingUser)}
        user={editingUser}
        onClose={() => setEditingUser(null)}
      />

      {/* Toast System */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
