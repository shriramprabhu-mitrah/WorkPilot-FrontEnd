'use client';

import StatCardsSection from '../../reports/components/StatCardsSection';
// import {
//   STATS,
//   weekLabels,
//   weeklyCompleted,
//   weeklyPlanned,
// } from "../../reports/data";
// import TaskStatusCard from "../components/TaskStatusCard";
import BurndownCard from '../../reports/components/BurndownCard';
import SprintProgressCard from '../../reports/components/SprintProgressCard';
import { assignedTasks, completedTasks, teamLabels } from '../data/teamWorkLoadData';
import RecentActivityCard from '../components/RecentActivites';
import TaskStatusCard from '../components/TaskStatusCard';
import TeamWorkloadCard from '../components/TeamWorkLoadCard';
import UpcomingDeadlines from '../components/UpcomingDeadlines';
import { STATS, weekLabels, weeklyCompleted, weeklyPlanned } from '../../reports/data';
import { useGetOrganization } from '../../organization/hooks/useOrganization';
import { useEffect, useState } from 'react';
import DashboardSkeleton from '../components/dashboardSkeletons';
import { useGetDashboard, useGetRecentActivities } from '../hooks/useDashboard';
import { useAppSelector } from '@/src/store';
import { ProjectSelectionPopover } from '@/src/app/components/common/project-selection-popover';
import { useGetProjectsWithSprints } from '../../project/hooks/useProject';

const POPOVER_DISMISSED_KEY = 'project-selection-popover-dismissed';
const CREATE_PROJECT_POPOVER_DISMISSED_KEY = 'create-project-popover-dismissed';

export const DashBoardTemplate = () => {
  const taskStatus = {
    Completed: 1,
    'In Progress': 1,
    Todo: 5,
  };
  const { activities, activityUser, isLoadingActivities } = useGetRecentActivities(1, 10);

  const { selectedProject, selectedSprint } = useAppSelector((state) => state.project);
  const user = useAppSelector((state) => state.user);
  const isOrgAdmin = user.role === 'org_admin';

  const { organization, isOrganizationLoading } = useGetOrganization();

  const { projectsWithSprints, isLoadingProjectsWithSprints } = useGetProjectsWithSprints();
  const hasProjects = projectsWithSprints && projectsWithSprints.length > 0;

  // const { dashboard, isLoadingDashboard } = useGetDashboard(
  //   organization?.data?.id ?? '',
  //   selectedSprint?.id
  // );
  const { dashboard, isLoadingDashboard } = useGetDashboard(
    organization?.data?.id ?? '',
    selectedSprint?.id,
    false
  );
  // temp loading
  const [loading, setLoading] = useState(true);

  // Track if popovers have been dismissed - initialize from localStorage
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
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Determine which popover to show
  // Show create project popover if: no projects exist, user is org_admin, not dismissed, not loading
  const showCreateProjectPopover =
    !loading &&
    !isLoadingProjectsWithSprints &&
    !hasProjects &&
    isOrgAdmin &&
    !createProjectPopoverDismissed;

  // Show select project popover if: projects exist, no project selected, not dismissed, not loading
  const showSelectProjectPopover =
    !loading &&
    !isLoadingProjectsWithSprints &&
    hasProjects &&
    !selectedProject &&
    !hasBeenDismissed;

  const handleDismissSelectPopover = () => {
    setHasBeenDismissed(true);
    localStorage.setItem(POPOVER_DISMISSED_KEY, 'true');
  };

  const handleDismissCreateProjectPopover = () => {
    setCreateProjectPopoverDismissed(true);
    localStorage.setItem(CREATE_PROJECT_POPOVER_DISMISSED_KEY, 'true');
  };

  // if (
  //   loading ||
  //   isOrganizationLoading ||
  //   isLoadingDashboard ||
  //   isLoadingActivities
  // ) {
  //   if (
  //   loading ||
  //   isOrganizationLoading ||
  //   isLoadingActivities
  // ) {
  //     return <DashboardSkeleton />;
  //   }
  // const taskStatus = dashboard?.task_status ?? {};
  const teamWorkload = dashboard?.team_workload ?? [];

  const teamLabels = teamWorkload.map((member) => member.full_name);
  const assignedTasks = teamWorkload.map((member) => member.task_count);
  const points = teamWorkload.map((member) => member.points);
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
        {/* <StatCardsSection
        stats={[
          {
            ...STATS[0],
            value: dashboard?.overview.total_tasks ?? 0,
          },
          {
            ...STATS[1],
            value: dashboard?.overview.completed ?? 0,
          },
          {
            ...STATS[2],
            value: dashboard?.overview.pending ?? 0,
          },
          {
            ...STATS[3],
            value: dashboard?.overview.overdue ?? 0,
          },
          {
            ...STATS[4],
            label: 'Due Soon',
            value: dashboard?.overview.due_soon ?? 0,
          },
        ]}
      /> */}
        <StatCardsSection stats={STATS} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 w-full max-w-full">
          <div className="lg:col-span-2">
            {/* <TaskStatusCard
            taskStatus={taskStatus}
          /> */}
            {/* <TaskStatusCard /> */}
            <TaskStatusCard taskStatus={taskStatus} />
          </div>

          <div className="lg:col-span-3 w-full">
            {/* <BurndownCard
            chartHeight={300}
            burndownData={dashboard?.sprint_burndown ?? []}
          /> */}
            <BurndownCard chartHeight={300} />
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
            {/* <TeamWorkloadCard
            chartHeight={200}
            labels={teamLabels}
            assigned={assignedTasks}
            completed={points}
          /> */}
            <TeamWorkloadCard
              chartHeight={200}
              labels={teamLabels}
              assigned={assignedTasks}
              completed={completedTasks}
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
