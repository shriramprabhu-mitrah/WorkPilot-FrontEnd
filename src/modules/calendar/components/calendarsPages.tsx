'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CalendarView from './calendarsViews';
import UpcomingEvents from './upcominggEventss';
import TodayCard from './todaysCards';
import EventLegends from './eventsLegendss';
import { Views, View } from 'react-big-calendar';
import { expandMultiDayEvents } from '../../../utils/calendar';
import { useAppSelector, useAppDispatch } from '@/src/store';
import { setSelectedProject, setSprints } from '@/src/store/slices/project';
import { useGetSprints } from '@/src/modules/project/hooks/useSprint';
import { useGetProjectsWithSprints } from '@/src/modules/project/hooks/useProject';
import { ProjectNotFound } from '@/src/app/components/common/project-not-found';
import { usePermissions } from '@/src/hooks/usePermissions';
import CalendarSkeleton from './calendarSkeleton';
import type { SprintDetail } from '@/src/types/project';
import type { CalendarEvent } from '../types';

const CalendarPage = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const orgSlug = (params?.orgSlug as string) || '';
  const projectSlug = (params?.projectSlug as string) || '';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

  const { canViewSprints } = usePermissions();
  const storeProject = useAppSelector((state) => state.project.selectedProject);
  const { projectsWithSprints, isLoadingProjectsWithSprints } = useGetProjectsWithSprints();

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
  const projectId = effectiveProject?.id ?? '';

  // Sync project to Redux when matched from URL projectSlug
  useEffect(() => {
    if (matchedProject && matchedProject.id !== storeProject?.id) {
      dispatch(setSelectedProject(matchedProject as Parameters<typeof setSelectedProject>[0]));
      dispatch(setSprints(matchedProject.sprints || []));
    }
  }, [matchedProject, storeProject?.id, dispatch]);

  // If on legacy /calendar without projectSlug in URL, redirect to /[orgSlug]/[slug]/calendar
  useEffect(() => {
    if (!projectSlug && storeProject?.slug && orgSlug) {
      router.replace(`/${orgSlug}/${storeProject.slug}/calendar`);
    }
  }, [projectSlug, storeProject?.slug, orgSlug, router]);

  const { sprints, isLoadingSprints } = useGetSprints(
    projectId,
    undefined,
    !!projectId && canViewSprints
  );

  if (isProjectNotFound) {
    return <ProjectNotFound slug={projectSlug} />;
  }

  const sprintEvents: CalendarEvent[] = (sprints ?? []).map((sprint: SprintDetail) => ({
    id: sprint.id,
    title: sprint.name,
    start: new Date(sprint.start_date),
    end: new Date(sprint.end_date),
    type: 'Sprint',
  }));

  const allEvents = [...sprintEvents];
  const displayEvents = currentView === Views.MONTH ? allEvents : expandMultiDayEvents(allEvents);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 dark:bg-slate-950 px-3 pb-3 pt-0 sm:px-6 sm:pb-6 sm:pt-1">
      <div className="mb-2 sm:mb-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
          Calendar
        </h1>
        <p className="mt-0 text-gray-500 dark:text-slate-400">
          Plan, track and manage your project schedule.
        </p>
      </div>

      {!canViewSprints ? (
        <div className="flex flex-1 items-center justify-center py-20 px-3 sm:px-0">
          <div className="flex flex-col items-center justify-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/kanban method-pana.svg"
              alt="Access Restricted"
              className="h-80 w-80 opacity-60 mb-2"
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Access Restricted
            </h2>
            <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400 text-sm">
              You do not have permission to view sprints on the calendar.
            </p>
          </div>
        </div>
      ) : isLoadingSprints && !!projectId ? (
        <CalendarSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-4">
          <div className="xl:col-span-3">
            <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-4 shadow-sm">
              <CalendarView
                events={displayEvents}
                currentDate={currentDate}
                currentView={currentView}
                onViewChange={setCurrentView}
                onNavigate={setCurrentDate}
                projectId={projectId}
              />
              <EventLegends />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <UpcomingEvents events={allEvents} currentDate={currentDate} />
            <TodayCard events={allEvents} currentDate={currentDate} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
