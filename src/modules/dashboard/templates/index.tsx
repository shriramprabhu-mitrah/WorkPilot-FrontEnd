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
export const DashBoardTemplate = () => {
  return (
    <div className="space-y-6 w-350">
      <StatCardsSection stats={STATS} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-6xl">
        <div className="lg:col-span-2">
          <TaskStatusCard />
        </div>

        <div className="lg:col-span-3 w-232">
          <BurndownCard chartHeight={300} />
        </div>
        <div className="lg:col-span-5 grid grid-cols-1 lg:grid-cols-2 gap-6 w-350">
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
        <div className="lg:col-span-5 grid grid-cols-1 lg:grid-cols-2 gap-6 w-350">
          <RecentActivityCard />
          <UpcomingDeadlines />
        </div>
      </div>
    </div>
  );
};
