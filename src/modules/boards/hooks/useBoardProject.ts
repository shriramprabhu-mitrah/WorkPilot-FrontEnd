'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/src/store';
import { setSelectedProject, setSprints } from '@/src/store/slices/project';
import { useGetProjectsWithSprints } from '@/src/modules/project/hooks/useProject';

export interface UseBoardProjectReturn {
  orgSlug: string;
  projectSlug: string;
  taskKey: string | undefined;
  storeProject: ReturnType<typeof useAppSelector> extends infer State
    ? State extends { project: { selectedProject: infer P } }
      ? P
      : never
    : never;
  storeSprint: ReturnType<typeof useAppSelector> extends infer State
    ? State extends { project: { selectedSprint: infer S } }
      ? S
      : never
    : never;
  effectiveProject: ReturnType<typeof useAppSelector> extends infer State
    ? State extends { project: { selectedProject: infer P } }
      ? P
      : never
    : never;
  selectedProject: string;
  selectedSprint: string;
  isProjectNotFound: boolean;
  isLoadingProjects: boolean;
}

export const useBoardProject = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();

  const orgSlug = (params?.orgSlug as string) || '';
  const projectSlug = (params?.projectSlug as string) || '';
  const rawTaskKey = params?.taskKey;
  const taskKey = Array.isArray(rawTaskKey) ? rawTaskKey[0] : (rawTaskKey as string | undefined);

  const { projectsWithSprints, isLoadingProjectsWithSprints } = useGetProjectsWithSprints();

  // Find project matching current URL project slug if present
  const matchedProject = useMemo(() => {
    if (!projectSlug || isLoadingProjectsWithSprints) return null;
    const lowerSlug = projectSlug.toLowerCase();
    return (
      projectsWithSprints.find(
        (p) =>
          p.slug?.toLowerCase() === lowerSlug ||
          p.id === projectSlug ||
          p.key?.toLowerCase() === lowerSlug ||
          p.name?.toLowerCase() === lowerSlug
      ) || null
    );
  }, [projectSlug, projectsWithSprints, isLoadingProjectsWithSprints]);

  const isProjectNotFound = useMemo(() => {
    if (!projectSlug || isLoadingProjectsWithSprints) return false;
    return !matchedProject;
  }, [projectSlug, matchedProject, isLoadingProjectsWithSprints]);

  const { selectedProject: storeProject, selectedSprint: storeSprint } = useAppSelector(
    (state) => state.project
  );

  // If on a projectSlug route, strictly use matchedProject; otherwise use Redux storeProject
  const effectiveProject = projectSlug ? matchedProject : storeProject;
  const selectedProject = effectiveProject?.id ?? '';
  const selectedSprint = storeSprint?.id ?? '';

  // Sync project to Redux when matched from URL projectSlug
  useEffect(() => {
    if (matchedProject && matchedProject.id !== storeProject?.id) {
      dispatch(setSelectedProject(matchedProject as Parameters<typeof setSelectedProject>[0]));
      dispatch(setSprints(matchedProject.sprints || []));
    }
  }, [matchedProject, storeProject?.id, dispatch]);

  // If on /boards without projectSlug in URL, redirect to /[orgSlug]/[slug]/boards
  useEffect(() => {
    if (!projectSlug && storeProject?.slug && orgSlug) {
      router.replace(`/${orgSlug}/${storeProject.slug}/boards${taskKey ? `/${taskKey}` : ''}`);
    }
  }, [projectSlug, storeProject?.slug, orgSlug, taskKey, router]);

  return {
    orgSlug,
    projectSlug,
    taskKey,
    storeProject,
    storeSprint,
    effectiveProject,
    selectedProject,
    selectedSprint,
    isProjectNotFound,
    isLoadingProjects: isLoadingProjectsWithSprints,
  };
};
