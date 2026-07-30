import Panel from '@/src/app/components/common/panel/panel';
import MemberProgressBar from '@/src/app/components/common/progressbar/progressbar';
import { defaultMembers } from '@/src/modules/reports/data';

interface TeamPerformanceCardProps {
  members?: Array<{ name: string; done: number; total: number; color: string }>;
}

export default function TeamPerformanceCard({
  members = defaultMembers,
}: TeamPerformanceCardProps) {
  return (
    <Panel title="Team Performance" subtitle="Completion rate by team member">
      <div className="flex flex-col gap-3 sm:gap-5 mt-3 justify-center h-full">
        {members.map((member) => (
          <MemberProgressBar
            key={member.name}
            name={member.name}
            done={member.done}
            total={member.total}
            color={member.color}
          />
        ))}
      </div>
    </Panel>
  );
}
