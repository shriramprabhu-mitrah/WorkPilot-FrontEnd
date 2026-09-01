'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StatCardsSection from '../../reports/components/StatCardsSection';
import BurndownCard from '../../reports/components/BurndownCard';
import SprintProgressCard from '../../reports/components/SprintProgressCard';
import TeamWorkloadCard from '../components/TeamWorkLoadCard';
import RecentActivityCard from '../components/RecentActivites';
import TaskStatusCard from '../components/TaskStatusCard';
import UpcomingDeadlines from '../components/UpcomingDeadlines';
import { STATS, weekLabels, weeklyPlanned, weeklyCompleted } from '../../reports/data';
import { useGetOrganization } from '../../organization/hooks/useOrganization';
import { useGetDashboard, useGetRecentActivities } from '../hooks/useDashboard';
import { useAppSelector, useAppDispatch } from '@/src/store';
import { setSelectedProject, setSprints } from '@/src/store/slices/project';
import { ProjectSelectionPopover } from '@/src/app/components/common/project-selection-popover';
import { ProjectNotFound } from '@/src/app/components/common/project-not-found';
import { useGetProjectsWithSprints } from '../../project/hooks/useProject';
import DashboardSkeleton from '../components/dashboardSkeletons';
import { colors } from '@/src/styles/colors';
import type { SprintBurndownBlock } from '@/src/types/dashboard';

const POPOVER_DISMISSED_KEY = 'project-selection-popover-dismissed';
const CREATE_PROJECT_POPOVER_DISMISSED_KEY = 'create-project-popover-dismissed';

export const DashBoardTemplate = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const orgSlug = (params?.orgSlug as string) || '';
  const projectSlug = (params?.projectSlug as string) || '';

  const { selectedProject: storeProject, selectedSprint } = useAppSelector(
    (state) => state.project
  );
  const user = useAppSelector((state) => state.user);
  const isOrgAdmin = user.role === 'org_admin';

  const { isOrganizationLoading } = useGetOrganization();
  const { projectsWithSprints, isLoadingProjectsWithSprints } = useGetProjectsWithSprints();
  const hasProjects = projectsWithSprints && projectsWithSprints.length > 0;

  // Find project matching current URL project slug if present
  const matchedProject = useMemo(() => {
    if (!projectSlug || isLoadingProjectsWithSprints) return null;
    return (
      projectsWithSprints.find(
        (p) =>
          p.slug === projectSlug ||
          p.id === projectSlug ||
          p.key?.toLowerCase() === projectSlug.toLowerCase()
      ) || null
    );
  }, [projectSlug, projectsWithSprints, isLoadingProjectsWithSprints]);

  const isProjectNotFound = useMemo(() => {
    if (!projectSlug || isLoadingProjectsWithSprints) return false;
    return !matchedProject;
  }, [projectSlug, matchedProject, isLoadingProjectsWithSprints]);

  // If on a projectSlug route, strictly use matchedProject; otherwise use storeProject
  const effectiveProject = projectSlug ? matchedProject : storeProject;

  // Sync project to Redux when matched from URL projectSlug
  useEffect(() => {
    if (matchedProject && matchedProject.id !== storeProject?.id) {
      dispatch(setSelectedProject(matchedProject as Parameters<typeof setSelectedProject>[0]));
      dispatch(setSprints(matchedProject.sprints || []));
    }
  }, [matchedProject, storeProject?.id, dispatch]);

  // If on legacy /dashboard without projectSlug in URL, redirect to /[orgSlug]/[slug]/dashboard
  useEffect(() => {
    if (!projectSlug && storeProject?.slug && orgSlug) {
      router.replace(`/${orgSlug}/${storeProject.slug}/dashboard`);
    }
  }, [projectSlug, storeProject?.slug, orgSlug, router]);

  const { activities, activityUser, isLoadingActivities } = useGetRecentActivities(1, 7);

  const { dashboard, isLoadingDashboard } = useGetDashboard(
    effectiveProject?.id ?? '',
    selectedSprint?.id
  );

  // Derived data from the single API response
  const overview = dashboard?.overview;

  const taskStatus = dashboard?.task_status ?? {};

  const sprintBurndown = dashboard?.sprint_burndown;

  const teamWorkload = Array.isArray(dashboard?.team_workload) ? dashboard.team_workload : [];
  // Normalize: with sprint_id → single object; without → array
  const burndownSprints: SprintBurndownBlock[] = Array.isArray(sprintBurndown)
    ? sprintBurndown
    : sprintBurndown && typeof sprintBurndown === 'object' && 'sprint_id' in sprintBurndown
      ? [sprintBurndown as SprintBurndownBlock]
      : [];
  const teamLabels = teamWorkload.map((m) => m.full_name);

  const teamColors = teamWorkload.map((m) => m.color || colors.gray400);

  const assignedTasks = teamWorkload.map((m) => m.task_count);
  const points = teamWorkload.map((m) => m.points);

  // Popover dismissal state
  const [loading, setLoading] = useState(true);

  const [hasBeenDismissed, setHasBeenDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(POPOVER_DISMISSED_KEY) === 'true';
    }
    return false;
  });

  const [createProjectPopoverDismissed, setCreateProjectPopoverDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CREATE_PROJECT_POPOVER_DISMISSED_KEY) === 'true';
    }
    return false;
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const showCreateProjectPopover =
    !loading &&
    !isLoadingProjectsWithSprints &&
    !hasProjects &&
    isOrgAdmin &&
    !createProjectPopoverDismissed;

  const showSelectProjectPopover =
    !loading &&
    !isLoadingProjectsWithSprints &&
    hasProjects &&
    !effectiveProject &&
    !hasBeenDismissed;

  const handleDismissSelectPopover = () => {
    setHasBeenDismissed(true);
    localStorage.setItem(POPOVER_DISMISSED_KEY, 'true');
  };

  const handleDismissCreateProjectPopover = () => {
    setCreateProjectPopoverDismissed(true);
    localStorage.setItem(CREATE_PROJECT_POPOVER_DISMISSED_KEY, 'true');
  };

  if (isProjectNotFound) {
    return <ProjectNotFound slug={projectSlug} />;
  }

  if (
    isOrganizationLoading ||
    isLoadingProjectsWithSprints ||
    isLoadingDashboard ||
    isLoadingActivities
  ) {
    return <DashboardSkeleton />;
  }
  return (
    <>
      <ProjectSelectionPopover
        show={showSelectProjectPopover}
        onDismiss={handleDismissSelectPopover}
        variant="select"
      />
      <ProjectSelectionPopover
        show={showCreateProjectPopover}
        onDismiss={handleDismissCreateProjectPopover}
        variant="create"
      />

      <div className="space-y-4 md:space-y-6 w-full max-w-full">
        <StatCardsSection
          stats={[
            { ...STATS[0], value: overview?.total_tasks ?? 0 },
            { ...STATS[1], value: overview?.completed ?? 0 },
            { ...STATS[2], value: overview?.pending ?? 0 },
            { ...STATS[3], value: overview?.overdue ?? 0 },
            { ...STATS[4], label: 'Due Soon', value: overview?.due_soon ?? 0 },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 w-full max-w-full">
          <div className="lg:col-span-2">
            <TaskStatusCard taskStatus={taskStatus} />
          </div>

          <div className="lg:col-span-3 w-full">
            <BurndownCard chartHeight={300} burndownSprints={burndownSprints} />
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 w-full">
            <SprintProgressCard
              isMobile={false}
              chartHeight={200}
              labels={weekLabels}
              planned={weeklyPlanned}
              completed={weeklyCompleted}
              title="Weekly Progress"
              subtitle="Planned vs completed tasks by weekday"
            />
            <TeamWorkloadCard
              chartHeight={200}
              labels={teamLabels}
              colors={teamColors}
              assigned={assignedTasks}
              points={points}
            />
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 w-full">
            <RecentActivityCard activities={activities} user={activityUser} />
            <UpcomingDeadlines />
          </div>
        </div>
      </div>
    </>
  );
};
