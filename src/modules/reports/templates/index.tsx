'use client';

import { useResize } from '@/src/hooks/useResize';
import ReportsHeader from '@/src/modules/reports/components/ReportsHeader';
import StatCardsSection from '@/src/modules/reports/components/StatCardsSection';
import StatusDistributionCard from '@/src/modules/reports/components/StatusDistributionCard';
import PriorityDistributionCard from '@/src/modules/reports/components/PriorityDistributionCard';
import SprintProgressCard from '@/src/modules/reports/components/SprintProgressCard';
import TeamPerformanceCard from '@/src/modules/reports/components/TeamPerformanceCard';
import BurndownCard from '@/src/modules/reports/components/BurndownCard';
import { sprintCompleted, sprintLabels, sprintPlanned, STATS } from '../data';
import { useEffect, useState } from 'react';
import ReportsSkeleton from '../components/reportsSkeleton';
export const SummaryTemplate = () => {
  const { width } = useResize();
  const isMobile = width < 640;
  const chartH = isMobile ? 240 : 300;
  const burndownH = isMobile ? 260 : 340;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ReportsSkeleton />;
  }
  return (
    <div className="flex flex-col gap-4 sm:gap-5 h-full">
      <ReportsHeader />
      <StatCardsSection stats={STATS} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 shrink-0">
        <StatusDistributionCard isMobile={isMobile} chartHeight={chartH} />
        <PriorityDistributionCard isMobile={isMobile} chartHeight={chartH} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 shrink-0">
        <SprintProgressCard
          isMobile={isMobile}
          chartHeight={chartH}
          labels={sprintLabels}
          planned={sprintPlanned}
          completed={sprintCompleted}
        />
        <TeamPerformanceCard />
      </div>

      <BurndownCard chartHeight={burndownH} />
    </div>
  );
};
