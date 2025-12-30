import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectVersion } from '@/types/project';

const STORAGE_KEY = 'project_engine_history';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentFiles, setCurrentFiles] = useState<Record<string, string>>({});

  // Load projects from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProjects(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load projects:', e);
      }
    }
  }, []);

  // Save projects to localStorage
  const saveProjects = useCallback((updatedProjects: Project[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
  }, []);

  // Create a new project
  const createProject = useCallback((title: string): Project => {
    const newProject: Project = {
      id: `project_${Date.now()}`,
      title,
      versions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCurrentProject(newProject);
    return newProject;
  }, []);

  // Add a version to the current project
  const addVersion = useCallback((prompt: string, files: Record<string, string>, snapshot?: string) => {
    if (!currentProject) return;

    const newVersion: ProjectVersion = {
      id: `version_${Date.now()}`,
      prompt,
      files: { ...files },
      snapshot,
      timestamp: Date.now(),
    };

    const updatedProject = {
      ...currentProject,
      versions: [newVersion, ...currentProject.versions],
      updatedAt: Date.now(),
    };

    setCurrentProject(updatedProject);
    setCurrentFiles(files);

    const projectIndex = projects.findIndex(p => p.id === currentProject.id);
    let updatedProjects: Project[];
    
    if (projectIndex >= 0) {
      updatedProjects = [...projects];
      updatedProjects[projectIndex] = updatedProject;
    } else {
      updatedProjects = [updatedProject, ...projects];
    }

    saveProjects(updatedProjects);
  }, [currentProject, projects, saveProjects]);

  // Load a specific version
  const loadVersion = useCallback((versionId: string) => {
    if (!currentProject) return;
    
    const version = currentProject.versions.find(v => v.id === versionId);
    if (version) {
      setCurrentFiles({ ...version.files });
    }
  }, [currentProject]);

  // Open an existing project
  const openProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      if (project.versions.length > 0) {
        setCurrentFiles({ ...project.versions[0].files });
      }
    }
  }, [projects]);

  // Delete a project
  const deleteProject = useCallback((projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    saveProjects(updatedProjects);
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
      setCurrentFiles({});
    }
  }, [projects, currentProject, saveProjects]);

  return {
    projects,
    currentProject,
    currentFiles,
    setCurrentFiles,
    createProject,
    addVersion,
    loadVersion,
    openProject,
    deleteProject,
  };
};
