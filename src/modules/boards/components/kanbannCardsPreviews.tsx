import { KanbanTask } from '@/src/types/board';
import { Calendar, GitBranch } from 'lucide-react';
import { PriorityBadge, AssigneeAvatar } from '@/src/app/components/common/task';

export const KanbanCardPreview = ({ task }: { task: KanbanTask }) => {
  const parts = task.dueDate?.split('-');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const display =
    parts?.length === 3 ? `${months[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}` : task.dueDate;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-xl opacity-95">
      <p
        className="text-sm font-semibold text-gray-800 leading-snug mb-2 truncate"
        title={task.title}
      >
        {task.title}
      </p>
      {task.dueDate && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <Calendar size={11} className="text-gray-400" />
          <span>{display}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <GitBranch size={12} className="text-blue-400" />
          <span className="text-xs font-semibold text-blue-500">{task.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <AssigneeAvatar initials={task.assigneeInitials} color={task.assigneeColor} size="sm" />
        </div>
      </div>
    </div>
  );
};
