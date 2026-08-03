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
// import TeamWorkloadCard from "../components/TeamWorkLoadCard";
// import { assignedTasks, completedTasks, teamLabels } from "../data/teamWorkLoadData";
import RecentActivityCard from '../components/RecentActivites';
import TaskStatusCard from '../components/TaskStatusCard';
import TeamWorkloadCard from '../components/TeamWorkLoadCard';
import { assignedTasks, completedTasks, teamLabels } from '../data/teamWorkLoadData';
import UpcomingDeadlines from '../components/UpcomingDeadlines';
import { STATS, weekLabels, weeklyCompleted, weeklyPlanned } from '../../reports/data';
import { useGetOrganization } from '../../organization/hooks/useOrganization';
import { useEffect, useState } from 'react';
import DashboardSkeleton from '../components/dashboardSkeletons';

export const DashBoardTemplate = () => {
  useGetOrganization();
  // temp loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }
  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-full">
      <StatCardsSection stats={STATS} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 w-full max-w-full">
        <div className="lg:col-span-2">
          <TaskStatusCard />
        </div>

        <div className="lg:col-span-3 w-full">
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
          <TeamWorkloadCard
            chartHeight={200}
            labels={teamLabels}
            assigned={assignedTasks}
            completed={completedTasks}
          />
        </div>
        <div className="lg:col-span-5 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 w-full">
          <RecentActivityCard />
          <UpcomingDeadlines />
        </div>
      </div>
    </div>
  );
};
