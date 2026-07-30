'use client';

import { useAppSelector } from '@/src/store';
import ProjectDetail from '../components/projectDetail';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Project } from '../types/project';

const ProjectSprintTemplate = () => {
  const router = useRouter();
  const selectedApiProject = useAppSelector((state) => state.project.selectedProject);

  const selectedProject = useMemo((): (Project & { id?: string }) | null => {
    if (!selectedApiProject) return null;

    return {
      id: selectedApiProject.id, // Pass the project ID
      name: selectedApiProject.name,
      description: selectedApiProject.description || 'No description added.',
      initials: selectedApiProject?.key?.slice(0, 2)?.toUpperCase(),
      code: selectedApiProject.key,
      status:
        selectedApiProject.status === 'active'
          ? 'Active'
          : selectedApiProject.status === 'on_hold'
            ? 'On Hold'
            : selectedApiProject.status === 'completed'
              ? 'Completed'
              : selectedApiProject.status === 'archived'
                ? 'Archived'
                : 'Active',
      progress: 0,
      members: [],
      tasks: '0',
      date: selectedApiProject.created_at
        ? new Date(selectedApiProject.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : '',
    };
  }, [selectedApiProject]);

  useEffect(() => {
    if (!selectedApiProject) {
      router.push('/projects');
    }
  }, [selectedApiProject, router]);

  if (!selectedProject) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No project selected. Redirecting...</p>
        </div>
      </div>
    );
  }

  return <ProjectDetail project={selectedProject} />;
};

export default ProjectSprintTemplate;
