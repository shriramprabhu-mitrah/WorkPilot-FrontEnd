"use client";

import { useMemo, useRef, useState } from "react";
import { Filter, UserCircle2 } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import type { DropAnimation } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ASSIGNEE_AVATARS, BOARD_COLUMNS } from "../data";
import { KanbanColumn as KanbanColumnType, KanbanTask } from "@/src/types/board";
import { KanbanColumn } from "../components/KanbanColumn";
import { KanbanCard } from "../components/KanbanCard";
import { FilterPanel, FilterState } from "@/src/app/components/common/filter-panel";
import { colors } from "@/src/styles/colors";
import { useOutsideClick } from "@/src/hooks/useOutsideClick";

export const KanbanBoardTemplate = () => {
  const [columns, setColumns] = useState<KanbanColumnType[]>(BOARD_COLUMNS);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priorities: [],
    assignees: [],
    labels: [],
  });

  const filterRef = useRef<HTMLDivElement>(null);
  useOutsideClick(filterRef, () => setShowFilter(false));

  // Derive unique assignees & labels from all tasks
  const allAssignees = useMemo(() => {
    const set = new Set<string>();
    columns.forEach((col) => col.tasks.forEach((t) => set.add(t.assigneeInitials)));
    return Array.from(set).sort();
  }, [columns]);

  const allLabels = useMemo(() => {
    const set = new Set<string>();
    columns.forEach((col) => col.tasks.forEach((t) => t.labels.forEach((l) => set.add(l))));
    return Array.from(set).sort();
  }, [columns]);

  const hasActiveFilter =
    filters.priorities.length > 0 ||
    filters.assignees.length > 0 ||
    filters.labels.length > 0;

  // Apply filters — only filter display, not drag state
  const filteredColumns = useMemo(() => {
    if (!hasActiveFilter) return columns;
    return columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((t) => {
        const matchPriority =
          filters.priorities.length === 0 || filters.priorities.includes(t.priority);
        const matchAssignee =
          filters.assignees.length === 0 || filters.assignees.includes(t.assigneeInitials);
        const matchLabel =
          filters.labels.length === 0 || t.labels.some((l) => filters.labels.includes(l));
        return matchPriority && matchAssignee && matchLabel;
      }),
    }));
  }, [columns, filters, hasActiveFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.4" } },
    }),
    duration: 200,
    easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
  };

  const findColumnByTaskId = (taskId: string) =>
    columns.find((col) => col.tasks.some((t) => t.id === taskId));

  const onDragStart = ({ active }: DragStartEvent) => {
    const col = findColumnByTaskId(active.id as string);
    const task = col?.tasks.find((t) => t.id === active.id);
    setActiveTask(task ?? null);
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumnByTaskId(activeId);
    const overCol =
      columns.find((c) => c.id === overId) ?? findColumnByTaskId(overId);

    if (!activeCol || !overCol || activeCol.id === overCol.id) {
      setOverColumnId(overCol?.id ?? null);
      return;
    }

    setOverColumnId(overCol.id);

    setColumns((prev) => {
      const next = prev.map((c) => ({ ...c, tasks: [...c.tasks] }));
      const src = next.find((c) => c.id === activeCol.id)!;
      const dst = next.find((c) => c.id === overCol.id)!;

      const taskIdx = src.tasks.findIndex((t) => t.id === activeId);
      const [moved] = src.tasks.splice(taskIdx, 1);
      moved.columnId = dst.id;

      const overTaskIdx = dst.tasks.findIndex((t) => t.id === overId);
      if (overTaskIdx >= 0) {
        dst.tasks.splice(overTaskIdx, 0, moved);
      } else {
        dst.tasks.push(moved);
      }

      return next;
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    setOverColumnId(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumnByTaskId(activeId);
    const overCol =
      columns.find((c) => c.id === overId) ?? findColumnByTaskId(overId);

    if (!activeCol || !overCol || activeCol.id !== overCol.id) return;

    const oldIdx = activeCol.tasks.findIndex((t) => t.id === activeId);
    const newIdx = overCol.tasks.findIndex((t) => t.id === overId);
    if (oldIdx === newIdx) return;

    setColumns((prev) =>
      prev.map((col) =>
        col.id === activeCol.id
          ? { ...col, tasks: arrayMove(col.tasks, oldIdx, newIdx) }
          : col,
      ),
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.gray900 }}>
            Sprint 12 Board
          </h1>
          <p className="text-sm mt-0.5" style={{ color: colors.gray500 }}>
            Atlas Platform · Jul 1 – Jul 15
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter button */}
          <div ref={filterRef} className="relative">
            <button
              onClick={() => setShowFilter((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-sm font-medium transition-colors shadow-sm"
              style={{
                borderColor: hasActiveFilter ? colors.primary : colors.gray200,
                backgroundColor: hasActiveFilter ? colors.primaryLight : colors.white,
                color: hasActiveFilter ? colors.primary : colors.gray700,
              }}
            >
              <Filter size={15} />
              <span>Filter</span>
              {hasActiveFilter && (
                <span
                  className="w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  {filters.priorities.length + filters.assignees.length + filters.labels.length}
                </span>
              )}
            </button>

            {showFilter && (
              <FilterPanel
                filters={filters}
                allAssignees={allAssignees}
                allLabels={allLabels}
                onChange={setFilters}
                onClose={() => setShowFilter(false)}
              />
            )}
          </div>

          <button
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-sm font-medium transition-colors shadow-sm"
            style={{ borderColor: colors.gray200, backgroundColor: colors.white, color: colors.gray700 }}
          >
            <UserCircle2 size={15} />
            <span className="hidden xs:inline">Assignee</span>
          </button>

          <div className="flex -space-x-2">
            {ASSIGNEE_AVATARS.map((a) => (
              <div
                key={a.initials}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: a.color }}
              >
                {a.initials}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active filter summary */}
      {hasActiveFilter && (
        <div className="flex items-center gap-2 flex-wrap mb-4 flex-shrink-0">
          <span className="text-xs" style={{ color: colors.gray500 }}>Active filters:</span>
          {filters.priorities.map((p) => (
            <span
              key={p}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
            >
              {p}
              <button onClick={() => setFilters((f) => ({ ...f, priorities: f.priorities.filter((x) => x !== p) }))}>
                ×
              </button>
            </span>
          ))}
          {filters.assignees.map((a) => (
            <span
              key={a}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
            >
              {a}
              <button onClick={() => setFilters((f) => ({ ...f, assignees: f.assignees.filter((x) => x !== a) }))}>
                ×
              </button>
            </span>
          ))}
          {filters.labels.map((l) => (
            <span
              key={l}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
            >
              {l}
              <button onClick={() => setFilters((f) => ({ ...f, labels: f.labels.filter((x) => x !== l) }))}>
                ×
              </button>
            </span>
          ))}
          <button
            className="text-xs font-medium"
            style={{ color: colors.error }}
            onClick={() => setFilters({ priorities: [], assignees: [], labels: [] })}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start [scrollbar-width:thin]">
          {filteredColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              isOver={overColumnId === column.id}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask && (
            <div className="rotate-[1.5deg] scale-[1.03] shadow-2xl opacity-95 rounded-xl">
              <KanbanCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
