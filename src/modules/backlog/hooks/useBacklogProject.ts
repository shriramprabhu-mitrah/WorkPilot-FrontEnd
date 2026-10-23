import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/src/store';
import { setSelectedProject, setSprints } from '@/src/store/slices/project';
import { useGetProjectsWithSprints } from '@/src/modules/project/hooks/useProject';

export const useBacklogProject = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const orgSlug = (params?.orgSlug as string) || '';
  const projectSlug = (params?.projectSlug as string) || '';
  const rawTaskKey = params?.taskKey;
  const taskKey = Array.isArray(rawTaskKey) ? rawTaskKey[0] : (rawTaskKey as string | undefined);

  const { projectsWithSprints, isLoadingProjectsWithSprints } = useGetProjectsWithSprints();
  const selectedApiProject = useAppSelector((s) => s.project.selectedProject);
  const selectedSprintStore = useAppSelector((s) => s.project.selectedSprint);

  const matchedProject = useMemo(() => {
    if (!projectSlug || isLoadingProjectsWithSprints) return null;
    const slug = projectSlug.toLowerCase();
    return (
      projectsWithSprints.find(
        (p) =>
          p.slug?.toLowerCase() === slug ||
          p.id === projectSlug ||
          p.key?.toLowerCase() === slug ||
          p.name?.toLowerCase() === slug
      ) || null
    );
  }, [projectSlug, projectsWithSprints, isLoadingProjectsWithSprints]);

  const isProjectNotFound = !!projectSlug && !isLoadingProjectsWithSprints && !matchedProject;

  // Sync project to Redux when matched from URL
  useEffect(() => {
    if (matchedProject && matchedProject.id !== selectedApiProject?.id) {
      dispatch(setSelectedProject(matchedProject as Parameters<typeof setSelectedProject>[0]));
      dispatch(setSprints(matchedProject.sprints || []));
    }
  }, [matchedProject, selectedApiProject?.id, dispatch]);

  // /backlog without a projectSlug -> /[orgSlug]/[slug]/backlog
  useEffect(() => {
    if (!projectSlug && selectedApiProject?.slug && orgSlug) {
      router.replace(
        `/${orgSlug}/${selectedApiProject.slug}/backlog${taskKey ? `/${taskKey}` : ''}`
      );
    }
  }, [projectSlug, selectedApiProject?.slug, orgSlug, taskKey, router]);

  const effectiveProject = projectSlug ? matchedProject : selectedApiProject;

  return {
    orgSlug,
    projectSlug,
    taskKey,
    isProjectNotFound,
    selectedApiProject,
    selectedSprintStore,
    selectedProject: effectiveProject?.id ?? '',
    selectedSprint: selectedSprintStore?.id ?? '',
    currentSlug: projectSlug || selectedApiProject?.slug || selectedApiProject?.id,
  };
};
