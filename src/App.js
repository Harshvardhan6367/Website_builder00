// [file name]: App.js
// [file content begin]
// src/App.js
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ProjectCreator from './components/ProjectCreator/ProjectCreator';
import ProjectList from './components/ProjectList/ProjectList';
import PreviewPanel from './components/PreviewPanel/PreviewPanel';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import AIAgentPanel from './components/AIAgent/AIAgentPanel'; // New import
import { ProjectProvider, useProject } from './context/ProjectContext';
import { AIProvider } from './context/AIContext';
import './styles/global.css';

const AppContent = () => {
  // Initialize state from localStorage
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('ai-website-active-tab') || 'new-project');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    const saved = localStorage.getItem('ai-website-curr-project-id');
    return saved ? Number(saved) : null;
  });
  const { projects } = useProject();

  // Persist activeTab
  useEffect(() => {
    localStorage.setItem('ai-website-active-tab', activeTab);
  }, [activeTab]);

  // Persist selectedProjectId
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('ai-website-curr-project-id', selectedProjectId);
    } else {
      localStorage.removeItem('ai-website-curr-project-id');
    }
  }, [selectedProjectId]);

  // Validate selectedProject exists
  useEffect(() => {
    if (selectedProjectId && projects.length > 0) {
      const exists = projects.find(p => p.id === selectedProjectId);
      if (!exists) {
        setSelectedProjectId(null);
        setActiveTab('new-project');
      }
    }
  }, [projects, selectedProjectId]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Add this effect to force refresh when project updates
  useEffect(() => {
    // This will trigger when projects change
  }, [projects]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleProjectSelect = (project) => {
    setSelectedProjectId(project.id);
    setActiveTab('preview');
  };

  const handleAgentClose = () => {
    setIsAgentOpen(false);
    // Force a refresh of the preview when agent closes
    // This will be handled by the useEffect in PreviewPanel
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onAgentClick={() => setIsAgentOpen(true)} // Pass agent handler
      />

      <main className="main-content">
        {activeTab === 'new-project' && (
          <ProjectCreator onProjectCreated={handleProjectSelect} />
        )}

        {activeTab === 'recent-projects' && (
          <ProjectList onProjectSelect={handleProjectSelect} />
        )}

        {activeTab === 'preview' && selectedProject && (
          <PreviewPanel
            project={selectedProject}
            onAgentOpen={() => setIsAgentOpen(true)}
            key={selectedProject.id + (selectedProject._version || 0)} // Force re-render on update
          />
        )}

        {activeTab === 'templates' && (
          <div className="templates-section">
            <h2>Templates</h2>
            <p>Coming soon...</p>
          </div>
        )}
      </main>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* AI Agent Panel - Opens when needed */}
      {selectedProject && (
        <AIAgentPanel
          isOpen={isAgentOpen}
          onClose={handleAgentClose}
          project={selectedProject}
          key={selectedProject.id} // Force re-render when project changes
        />
      )}
    </div>
  );
};

function App() {
  return (
    <ProjectProvider>
      <AIProvider>
        <AppContent />
      </AIProvider>
    </ProjectProvider>
  );
}

export default App;
// [file content end]