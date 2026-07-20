"use client";

import { Hash, Calendar } from "lucide-react";
import { BacklogTask } from "../data";
import {
  PriorityBadge,
  StatusBadge,
  AssigneeAvatar,
  TaskLabel,
} from "@/src/app/components/common/task";
import { colors } from "@/src/styles/colors";

export const BacklogRow = ({ task }: { task: BacklogTask }) => (
  <div
    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 border-b last:border-0 hover:bg-gray-50 transition-colors"
    style={{ borderColor: colors.gray100 }}
  >
    <span
      className="text-[11px] sm:text-xs font-semibold w-12 sm:w-14 shrink-0"
      style={{ color: colors.primary }}
    >
      {task.id}
    </span>

    <div className="w-16 sm:w-20 shrink-0">
      <PriorityBadge priority={task.priority} />
    </div>

    <span
      className="text-sm flex-1 min-w-0 truncate"
      style={{ color: colors.gray800 }}
    >
      {task.title}
    </span>

    <div className="hidden sm:flex items-center gap-1 shrink-0 min-w-0 max-w-[160px] overflow-hidden">
      {task.labels.map((label) => (
        <TaskLabel key={label} label={label} />
      ))}
    </div>

    <div className="hidden md:flex w-24 shrink-0 justify-start">
      <StatusBadge status={task.status} />
    </div>

    <span
      className="flex items-center gap-0.5 text-xs w-8 sm:w-10 shrink-0"
      style={{ color: colors.gray400 }}
    >
      <Hash size={11} />
      {task.storyPoints}
    </span>

    <span
      className="hidden sm:flex items-center gap-1 text-xs leading-none w-16 shrink-0"
      style={{ color: colors.gray400 }}
    >
      <Calendar size={11} className="shrink-0" />
      <span className="truncate">{task.dueDate}</span>
    </span>

    <AssigneeAvatar
      initials={task.assigneeInitials}
      color={task.assigneeColor}
    />
  </div>
);
