"use client";

import { X } from "lucide-react";
import { Priority } from "@/src/types/board";
import { colors } from "@/src/styles/colors";
import { Chip } from "@/src/app/components/common/chip";

export interface FilterState {
  priorities: Priority[];
  assignees: string[];
  labels: string[];
}

interface Props {
  filters: FilterState;
  allAssignees: string[];
  allLabels: string[];
  onChange: (filters: FilterState) => void;
  onClose: () => void;
}

const PRIORITIES: Priority[] = ["Critical", "High", "Medium", "Low"];

const priorityColors: Record<Priority, string> = {
  Critical: colors.priorityCriticalText,
  High: colors.priorityHighText,
  Medium: colors.priorityMediumText,
  Low: colors.priorityLowText,
};

const toggle = <T,>(arr: T[], val: T): T[] =>
  arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

export const FilterPanel = ({
  filters,
  allAssignees,
  allLabels,
  onChange,
  onClose,
}: Props) => {
  const hasActive =
    filters.priorities.length > 0 ||
    filters.assignees.length > 0 ||
    filters.labels.length > 0;

  return (
    <div
      className="absolute top-full right-0 mt-2 z-50 w-72 rounded-xl shadow-xl border p-4 flex flex-col gap-4"
      style={{ backgroundColor: colors.white, borderColor: colors.gray200 }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-semibold"
          style={{ color: colors.gray800 }}
        >
          Filters
        </span>
        <div className="flex items-center gap-2">
          {hasActive && (
            <button
              onClick={() =>
                onChange({ priorities: [], assignees: [], labels: [] })
              }
              className="text-xs font-medium"
              style={{ color: colors.primary }}
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-300 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div>
        <p
          className="text-xs font-semibold mb-2 uppercase tracking-wide"
          style={{ color: colors.gray600 }}
        >
          Priority
        </p>
        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map((p) => (
            <Chip
              key={p}
              label={p}
              active={filters.priorities.includes(p)}
              color={priorityColors[p]}
              onClick={() =>
                onChange({
                  ...filters,
                  priorities: toggle(filters.priorities, p),
                })
              }
            />
          ))}
        </div>
      </div>

      {allAssignees.length > 0 && (
        <div>
          <p
            className="text-xs font-semibold mb-2 uppercase tracking-wide"
            style={{ color: colors.gray600 }}
          >
            Assignee
          </p>
          <div className="flex flex-wrap gap-2">
            {allAssignees.map((a) => (
              <Chip
                key={a}
                label={a}
                active={filters.assignees.includes(a)}
                onClick={() =>
                  onChange({
                    ...filters,
                    assignees: toggle(filters.assignees, a),
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {allLabels.length > 0 && (
        <div>
          <p
            className="text-xs font-semibold mb-2 uppercase tracking-wide"
            style={{ color: colors.gray600 }}
          >
            Label
          </p>
          <div className="flex flex-wrap gap-2">
            {allLabels.map((l) => (
              <Chip
                key={l}
                label={l}
                active={filters.labels.includes(l)}
                onClick={() =>
                  onChange({ ...filters, labels: toggle(filters.labels, l) })
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
