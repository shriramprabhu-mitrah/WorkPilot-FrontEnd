'use client';

import { useState } from 'react';
import { Project } from '../types/project';
import ProjectDetail from '../components/projectDetail';
const ProjectSprintTemplate = () => {
  const [project] = useState<Project | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const storedProject = sessionStorage.getItem('selectedProject');

    if (!storedProject) {
      return null;
    }

    try {
      return JSON.parse(storedProject) as Project;
    } catch {
      return null;
    }
  });
  if (!project) {
    return null;
  }
  return <ProjectDetail project={project} />;
};

export default ProjectSprintTemplate;
