import { PriorityBadge } from '@/src/app/components/common/task';
import { TaskColumnData } from '../types/sprint';

interface TaskColumnProps {
  column: TaskColumnData;
}

const TaskColumn = ({ column }: TaskColumnProps) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.dotColor }} />

          <h3 className="text-sm font-semibold text-gray-900">{column.status}</h3>
        </div>

        <span className="text-sm font-semibold text-gray-500">{column.count}</span>
      </div>

      {!column.task ? (
        <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
          Empty
        </div>
      ) : (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-2.5">
          <p className="mb-2 text-sm font-medium text-gray-800">{column.task.title}</p>

          <PriorityBadge priority={column.task.priority} />
        </div>
      )}
    </div>
  );
};

export default TaskColumn;
