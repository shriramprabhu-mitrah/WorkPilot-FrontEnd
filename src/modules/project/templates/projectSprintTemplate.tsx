'use client';

import { useAppSelector } from '@/src/store';
import ProjectDetail from '../components/projectDetail';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Project } from '../types/project';
import ProjectSkeleton from '../components/projectDetailSkeleton';

const ProjectSprintTemplate = () => {
  const router = useRouter();
  const selectedApiProject = useAppSelector((state) => state.project.selectedProject);

  const isLoading = useAppSelector((state) => state.project.isLoading);

  const selectedProject = useMemo((): (Project & { id?: string }) | null => {
    if (!selectedApiProject) return null;

    return {
      id: selectedApiProject.id,
      name: selectedApiProject.name,
      description: selectedApiProject.description || 'No description added.',
      initials: selectedApiProject?.name
        ?.trim()
        .split(/\s+/)
        .map((word) => word.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      code: String(selectedApiProject.key),
      status:
        selectedApiProject.status === 'active'
          ? 'Active'
          : selectedApiProject.status === 'on_hold'
            ? 'On Hold'
            : selectedApiProject.status === 'completed'
              ? 'Completed'
              : selectedApiProject.status === 'archived'
                ? 'Archived'
                : selectedApiProject.status === 'cancelled'
                  ? 'Cancelled'
                  : selectedApiProject.status === 'planning'
                    ? 'Planning'
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
      owner: selectedApiProject?.creator || 'Unassigned',
    };
  }, [selectedApiProject]);

  useEffect(() => {
    if (!selectedApiProject) {
      router.push('/projects');
    }
  }, [selectedApiProject, router]);

  if (isLoading) {
    return <ProjectSkeleton />;
  }

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
