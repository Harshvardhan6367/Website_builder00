// src/components/ProjectCreator/ProjectCreator.js
import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useAI } from '../../context/AIContext';
import { FiZap, FiInfo, FiStar } from 'react-icons/fi';
import './ProjectCreator.css';

const ProjectCreator = ({ onProjectCreated }) => {
  const [description, setDescription] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [features, setFeatures] = useState({
    responsive: true,
    darkMode: true,
    animations: true,
    contactForm: false,
    gallery: false,
    blog: false,
  });

  const { createProject, updateProject } = useProject();
  const { isGenerating, generationProgress, generateWebsiteStream } = useAI();

  const handleGenerate = async () => {
    if (!description.trim()) {
      alert('Please describe the website you want to create');
      return;
    }

    // 1. Create the project immediately
    const project = createProject({
      name: projectName || `Project ${Date.now()}`,
      description,
      features,
    });

    // 2. Navigate immediately to the new project
    onProjectCreated(project);

    // 3. Start streaming generation in the background
    // We pass the project and the update function so the context can push updates
    generateWebsiteStream(project, updateProject);
  };

  const examplePrompts = [
    "Create a dynamic portfolio website with dark mode",
    "Build an e-commerce store with product filtering",
    "Design a modern blog with smooth animations",
    "Generate a landing page for a SaaS product",
    "Create a restaurant website with online ordering",
  ];

  const handleExampleClick = (prompt) => {
    setDescription(prompt);
  };

  return (
    <div className="project-creator">
      <div className="creator-header">
        <h1>AI Website Generator</h1>
        <p className="subtitle">Describe the website you want to create... Be specific about design, functionality, and features.</p>
      </div>

      <div className="creator-content">
        <div className="input-section">
          <div className="project-name-input">
            <label htmlFor="projectName">Project Name (Optional)</label>
            <input
              id="projectName"
              type="text"
              placeholder="My Awesome Website"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="name-input"
            />
          </div>

          <div className="description-section">
            <label htmlFor="description">
              <FiInfo /> Website Description
              <span className="char-count">{description.length}/1000</span>
            </label>
            <textarea
              id="description"
              placeholder="Example: Create a modern portfolio website with dark/light mode toggle, smooth animations, project showcase section, and contact form. Use gradient colors and glass morphism effects..."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
              rows={8}
              className="description-input"
            />
          </div>

          <div className="example-prompts">
            <h3><FiStar /> Try these examples:</h3>
            <div className="prompts-grid">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="prompt-chip"
                  onClick={() => handleExampleClick(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="advanced-section">
            <button
              className="advanced-toggle"
              onClick={() => setIsAdvanced(!isAdvanced)}
              type="button"
            >
              {isAdvanced ? '▼' : '▶'} Advanced Features
            </button>

            {isAdvanced && (
              <div className="features-grid">
                {Object.entries(features).map(([key, value]) => (
                  <label key={key} className="feature-checkbox">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setFeatures(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                    />
                    <span className="checkmark"></span>
                    <span className="feature-label">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="generation-section">
          <button
            className="generate-button"
            onClick={handleGenerate}
            disabled={isGenerating || !description.trim()}
          >
            <FiZap className="button-icon" />
            {isGenerating ? 'Generating...' : 'Generate Website'}
            {isGenerating && (
              <div className="progress-ring">
                <div className="progress-fill" style={{ transform: `rotate(${generationProgress * 3.6}deg)` }}></div>
              </div>
            )}
          </button>



          <div className="features-list">
            <h3>✨ What you'll get:</h3>
            <ul>
              <li>Fully responsive HTML/CSS/JS</li>
              <li>Modern design with animations</li>
              <li>Clean, maintainable code</li>
              <li>SEO optimized structure</li>
              <li>Cross-browser compatible</li>
              <li>One-click download</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreator;