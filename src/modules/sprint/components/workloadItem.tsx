import { AssigneeAvatar } from '@/src/app/components/common/task';
import { colors } from '@/src/styles/colors';
import { Workload } from '../types/sprint';

interface WorkloadItemProps {
  member: Workload;
}

const WorkloadItem = ({ member }: WorkloadItemProps) => {
  const percentage = member.total === 0 ? 0 : Math.round((member.completed / member.total) * 100);

  return (
    <div
      className="flex items-center gap-2 py-1.5"
      style={{
        backgroundColor: colors.white,
      }}
    >
      <AssigneeAvatar initials={member.initials} color={member.color} />

      <div className="flex-1">
        <p className="mb-1 text-sm font-medium" style={{ color: colors.gray900 }}>
          {member.name}
        </p>

        <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: colors.gray200 }}>
          <div
            className="h-1.5 rounded-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: colors.primary,
            }}
          />
        </div>
      </div>

      <div className="flex w-13 justify-between text-xs">
        <span style={{ color: colors.gray500 }}>
          {member.completed}/{member.total}
        </span>

        <span className="font-medium" style={{ color: colors.gray600 }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default WorkloadItem;
