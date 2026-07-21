import { Hash, Calendar } from "lucide-react";
import { KanbanTask } from "@/src/types/board";
import {
  PriorityBadge,
  AssigneeAvatar,
  TaskLabel,
} from "@/src/app/components/common/task";

export const KanbanCardContent = ({ task }: { task: KanbanTask }) => {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-blue-600">{task.id}</span>

        <PriorityBadge priority={task.priority} />
      </div>

      <p className="text-sm font-semibold text-gray-800 leading-snug mb-2">
        {task.title}
      </p>

      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map((label) => (
            <TaskLabel key={label} label={label} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-1">
        <AssigneeAvatar
          initials={task.assigneeInitials}
          color={task.assigneeColor}
          size="md"
        />

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-0.5">
            <Hash size={11} />
            {task.storyPoints}
          </span>

          <span className="flex items-center gap-0.5">
            <Calendar size={11} />
            {task.dueDate}
          </span>
        </div>
      </div>
    </>
  );
};
