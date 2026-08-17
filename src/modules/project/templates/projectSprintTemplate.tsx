'use client';

import { useAppSelector, useAppDispatch } from '@/src/store';
import ProjectDetail from '../components/projectDetail';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Project } from '../types/project';
import ProjectSkeleton from '../components/projectDetailSkeleton';
import AddSprintModal from '../components/addSprint';
import { projectService } from '@/src/services/project';
import { setSelectedProject, setProjectLoading } from '@/src/store/slices/project';
import { useOrgNavigation } from '@/src/hooks/useOrgNavigation';

const ProjectSprintTemplate = () => {
  const router = useRouter();
  const { push } = useOrgNavigation();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const selectedApiProject = useAppSelector((state) => state.project.selectedProject);
  const isLoading = useAppSelector((state) => state.project.isLoading);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);

  // Handle projectId param from eye icon navigation
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (!projectId) return;
    const fetchAndSet = async () => {
      dispatch(setProjectLoading(true));
      try {
        const res = await projectService.getProjectDetail(projectId);
        const detail = res.data;
        if (!detail) return;
        const { creator, ...rest } = detail;
        dispatch(setSelectedProject({ ...rest, owner: creator ?? 'Unassigned' }));
      } finally {
        dispatch(setProjectLoading(false));
      }
    };
    fetchAndSet();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const openCreate = searchParams.get('openCreate');
    if (openCreate === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSprintModalOpen(true);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

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
      push('/projects');
    }
  }, [selectedApiProject, push]);

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

  return (
    <>
      <ProjectDetail project={selectedProject} />
      {isSprintModalOpen && selectedApiProject?.id && (
        <AddSprintModal
          projectId={selectedApiProject.id}
          onClose={() => setIsSprintModalOpen(false)}
        />
      )}
    </>
  );
};

export default ProjectSprintTemplate;
