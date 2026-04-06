// src/context/ProjectContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => {
    try {
      const savedProjects = localStorage.getItem('ai-website-projects');
      return savedProjects ? JSON.parse(savedProjects) : [];
    } catch (error) {
      console.error('Failed to load projects from localStorage', error);
      return [];
    }
  });
  const [currentProject, setCurrentProject] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('ai-website-projects', JSON.stringify(projects));
    } catch (error) {
      console.error('Failed to save projects to localStorage', error);
    }
  }, [projects]);

  const createProject = (projectData) => {
    const newProject = {
      id: Date.now(),
      name: projectData.name || `Project #${projects.length + 1}`,
      description: projectData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'generating',
      html: '',
      css: '',
      js: '',
      previewUrl: '',
    };

    setProjects([newProject, ...projects]);
    setCurrentProject(newProject);

    return newProject;
  };

  const updateProject = (projectId, updates) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    ));

    if (currentProject?.id === projectId) {
      setCurrentProject(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
    }
  };

  const deleteProject = (projectId) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      createProject,
      updateProject,
      deleteProject,
      setCurrentProject,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);