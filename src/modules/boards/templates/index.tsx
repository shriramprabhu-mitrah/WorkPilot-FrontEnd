'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Filter, UserCircle2 } from 'lucide-react';
import { taskService } from '@/src/services/tasks';
import { logger } from '@/src/lib/utils/logger';
import { useAppSelector } from '@/src/store';
import { TaskResponse } from '@/src/types/task';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type { DropAnimation } from '@dnd-kit/core';
import { ASSIGNEE_AVATARS, BOARD_COLUMNS } from '../data';
import { colors } from '@/src/styles/colors';
import { KanbanColumn as KanbanColumnType, KanbanTask } from '@/src/types/board';
import { KanbanColumn } from '../components/kanbannColumn';
import { KanbanCardPreview } from '../components/kanbannCardsPreviews';
import { FilterPanel, FilterState } from '@/src/app/components/common/filter-panel';
import { useOutsideClick } from '@/src/hooks/useOutsideClick';
import { WpButton } from '@/src/app/components/common/button';
import BoardSkeleton from '../components/boardSkeleton';

export const KanbanBoardTemplate = () => {
  const [columns, setColumns] = useState<KanbanColumnType[]>(BOARD_COLUMNS);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [boardLoading, setBoardLoading] = useState(false);
  const dropTargetRef = useRef<{ columnId: string; index: number } | null>(null);

  const pendingUpdatesRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const { selectedProject: storeProject, selectedSprint: storeSprint } = useAppSelector(
    (state) => state.project
  );
  const selectedProject = storeProject?.id ?? '';
  const selectedSprint = storeSprint?.id ?? '';
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priorities: [],
    assignees: [],
    labels: [],
  });

  const filterRef = useRef<HTMLDivElement>(null);
  const boardScrollRef = useRef<HTMLDivElement>(null);
  const [boardMounted, setBoardMounted] = useState(false);
  const boardRefCallback = useCallback((node: HTMLDivElement | null) => {
    (boardScrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    setBoardMounted(!!node);
  }, []);
  const [firstVisibleCol, setFirstVisibleCol] = useState(0);
  const [visibleColCount, setVisibleColCount] = useState(0);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
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
    filters.priorities.length > 0 || filters.assignees.length > 0 || filters.labels.length > 0;

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
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  // Cleanup pending updates on unmount
  useEffect(() => {
    return () => {
      pendingUpdatesRef.current.forEach((timeout) => clearTimeout(timeout));
      pendingUpdatesRef.current.clear();
    };
  }, []);

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.4' } },
    }),
    duration: 150,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
  };

  const hasTasks = columns.some((col) => col.tasks.length > 0);

  useEffect(() => {
    if (loading || !hasTasks) return;
    const board = boardScrollRef.current;
    if (!board) return;

    const updateScrollState = () => {
      const { scrollWidth, clientWidth } = board;
      const maxScroll = scrollWidth - clientWidth;
      setHasHorizontalScroll(maxScroll > 1);
      if (maxScroll <= 1) {
        setFirstVisibleCol(0);
        setVisibleColCount(filteredColumns.length);
        return;
      }
      const boardRect = board.getBoundingClientRect();
      const colEls = Array.from(board.querySelectorAll('[data-col-index]')) as HTMLElement[];
      let first = -1;
      let last = -1;
      colEls.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > boardRect.left + 1 && rect.left < boardRect.right - 1) {
          if (first === -1) first = i;
          last = i;
        }
      });
      if (first === -1) {
        first = 0;
        last = 0;
      }
      setFirstVisibleCol(first);
      setVisibleColCount(last - first + 1);
    };

    const rafId = requestAnimationFrame(updateScrollState);
    board.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(board);

    return () => {
      cancelAnimationFrame(rafId);
      board.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      ro.disconnect();
    };
  }, [loading, hasTasks, boardMounted, filteredColumns.length]);

  const findColumnByTaskId = (taskId: string) =>
    columns.find((col) => col.tasks.some((t) => t.id === taskId));

  const onDragStart = ({ active }: DragStartEvent) => {
    const col = findColumnByTaskId(active.id as string);
    const task = col?.tasks.find((t) => t.id === active.id);
    setActiveTask(task ?? null);
  };

  const onDragOver = useCallback(
    ({ active, over }: DragOverEvent) => {
      if (!over) {
        setOverColumnId(null);
        dropTargetRef.current = null;
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeCol = findColumnByTaskId(activeId);
      const overCol = columns.find((c) => c.id === overId) ?? findColumnByTaskId(overId);

      if (!activeCol || !overCol) {
        setOverColumnId(null);
        dropTargetRef.current = null;
        return;
      }

      const isOverColumnItself = overId === overCol.id;
      let index: number;

      if (isOverColumnItself) {
        index = overCol.tasks.length;
      } else {
        const overIndex = overCol.tasks.findIndex((t) => t.id === overId);
        const activeRect = active.rect.current.translated;
        const overRect = over.rect;
        const isBelowOverItem =
          !!activeRect && !!overRect && activeRect.top > overRect.top + overRect.height;
        index = overIndex >= 0 ? overIndex + (isBelowOverItem ? 1 : 0) : overCol.tasks.length;
      }

      // Only trigger re-render if column highlight actually changed
      setOverColumnId((prev) => (prev === overCol.id ? prev : overCol.id));
      dropTargetRef.current = { columnId: overCol.id, index };
    },
    [columns]
  ); // eslint-disable-line

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    setOverColumnId(null);
    if (!over) {
      dropTargetRef.current = null;
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumnByTaskId(activeId);
    const overCol = columns.find((c) => c.id === overId) ?? findColumnByTaskId(overId);

    if (!activeCol || !overCol) return;

    const taskIndex = activeCol.tasks.findIndex((t) => t.id === activeId);
    if (taskIndex === -1) return;

    const task = activeCol.tasks[taskIndex];
    const targetIndex =
      dropTargetRef.current?.columnId === overCol.id
        ? dropTargetRef.current.index
        : overCol.tasks.length;

    setColumns((prev) => {
      const next = prev.map((col) => ({ ...col, tasks: [...col.tasks] }));
      const sourceCol = next.find((col) => col.id === activeCol.id);
      const targetCol = next.find((col) => col.id === overCol.id);

      if (!sourceCol || !targetCol) return prev;

      sourceCol.tasks.splice(taskIndex, 1);
      const movedTask = { ...task, columnId: targetCol.id };
      const insertIndex =
        activeCol.id === overCol.id && targetIndex > taskIndex ? targetIndex - 1 : targetIndex;

      if (insertIndex >= 0) {
        targetCol.tasks.splice(insertIndex, 0, movedTask);
      } else {
        targetCol.tasks.push(movedTask);
      }

      return next;
    });

    if (activeCol.id !== overCol.id && task.taskId) {
      const newStatus = COLUMN_TO_STATUS[overCol.id];
      if (newStatus) {
        taskService
          .updateTask(task?.projectId ?? '', task.taskId, { status: newStatus })
          .catch((err) => logger.log('Failed to update task status', err));
      }
    }

    dropTargetRef.current = null;
  };

  const STATUS_TO_COLUMN: Record<string, string> = {
    todo: 'todo',
    in_progress: 'in_progress',
    in_review: 'in_review',
    testing: 'testing',
    completed: 'done',
    blocked: 'blocked',
  };

  const COLUMN_TO_STATUS: Record<string, string> = Object.fromEntries(
    Object.entries(STATUS_TO_COLUMN).map(([status, col]) => [col, status])
  );

  const mapTasksToColumns = (tasks: TaskResponse[]) => {
    return BOARD_COLUMNS.map((col) => ({
      ...col,
      tasks: tasks
        .filter((t) => (STATUS_TO_COLUMN[t.status] ?? t.status) === col.id)
        .map((t) => ({
          id: t.key ?? t.id ?? '',
          taskId: t.id ?? '',
          projectId: selectedProject,
          title: t.title ?? '',
          priority: t.priority
            ? ((t.priority.charAt(0).toUpperCase() +
                t.priority.slice(1).toLowerCase()) as KanbanTask['priority'])
            : 'Medium',
          labels: [],
          assigneeInitials: t.assignee_name
            ? t.assignee_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : '',
          assigneeColor: colors.avatarBlue,
          storyPoints: t.story_points ?? 0,
          dueDate: t.due_date ? t.due_date.split('T')[0] : '',
          columnId: col.id,
          sprint: t.sprint_name ?? '',
        })),
    }));
  };

  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedProject) return;
      setBoardLoading(true);
      try {
        const params = selectedSprint ? { sprint_id: selectedSprint } : {};
        const res = await taskService.getTasks(selectedProject, params);
        if (res.data) {
          setColumns(mapTasksToColumns(res.data) as KanbanColumnType[]);
        }
      } catch (error) {
        logger.log('Failed to fetch tasks', error);
      } finally {
        setBoardLoading(false);
      }
    };
    fetchTasks();
  }, [selectedProject, selectedSprint]);

  return (
    <div className="relative flex flex-col h-full min-h-0 overflow-hidden px-3 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 mb-1">Kanban Board</h1>
          <p className="text-sm text-gray-500">
            Visualize and manage your team&apos;s tasks across workflow stages.
          </p>
          {storeProject && (
            <p className="text-xs text-gray-400 mt-0.5">
              {storeProject.name}
              {storeSprint ? ` · ${storeSprint.name}` : ' · All Sprints'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter button */}
          <div ref={filterRef} className="relative">
            <WpButton
              variant={hasActiveFilter ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowFilter((v) => !v)}
              leftIcon={<Filter size={15} />}
            >
              <span>Filter</span>
              {hasActiveFilter && (
                <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[10px] font-bold flex items-center justify-center">
                  {filters.priorities.length + filters.assignees.length + filters.labels.length}
                </span>
              )}
            </WpButton>

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

          <WpButton variant="secondary" size="sm" leftIcon={<UserCircle2 size={15} />}>
            <span className="hidden xs:inline">Assignee</span>
          </WpButton>

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
          <span className="text-xs" style={{ color: colors.gray500 }}>
            Active filters:
          </span>
          {filters.priorities.map((p) => (
            <span
              key={p}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
            >
              {p}
              <WpButton
                variant="ghost"
                size="sm"
                className="!p-0 !text-xs leading-none"
                onClick={() =>
                  setFilters((f) => ({ ...f, priorities: f.priorities.filter((x) => x !== p) }))
                }
              >
                ×
              </WpButton>
            </span>
          ))}
          {filters.assignees.map((a) => (
            <span
              key={a}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
            >
              {a}
              <WpButton
                variant="ghost"
                size="sm"
                className="!p-0 !text-xs leading-none"
                onClick={() =>
                  setFilters((f) => ({ ...f, assignees: f.assignees.filter((x) => x !== a) }))
                }
              >
                ×
              </WpButton>
            </span>
          ))}
          {filters.labels.map((l) => (
            <span
              key={l}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
            >
              {l}
              <WpButton
                variant="ghost"
                size="sm"
                className="!p-0 !text-xs leading-none"
                onClick={() =>
                  setFilters((f) => ({ ...f, labels: f.labels.filter((x) => x !== l) }))
                }
              >
                ×
              </WpButton>
            </span>
          ))}
          <WpButton
            variant="ghost"
            size="sm"
            className="!text-xs"
            style={{ color: colors.error }}
            onClick={() => setFilters({ priorities: [], assignees: [], labels: [] })}
          >
            Clear all
          </WpButton>
        </div>
      )}

      {/* Board */}
      {boardLoading ? (
        <BoardSkeleton />
      ) : !hasTasks ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center">
            <img src="/images/kanban method-pana.svg" alt="No Tasks" className="h-90 w-90" />

            <h2 className="text-2xl font-bold text-gray-900">No tasks found</h2>

            <p className="mt-3 max-w-md text-center text-gray-500">
              There are no tasks for this selection. Try a different project or sprint.
            </p>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={(args) =>
            pointerWithin(args).length ? pointerWithin(args) : closestCenter(args)
          }
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div
            ref={boardRefCallback}
            className="board-scroll flex gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden pb-4 flex-1 min-h-0 -mx-3 sm:mx-0 px-3 sm:px-0"
            style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {filteredColumns.map((column, i) => (
              <div key={column.id} data-col-index={i} className="h-full">
                <KanbanColumn column={column} isOver={overColumnId === column.id} />
              </div>
            ))}
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask && <KanbanCardPreview task={activeTask} />}
          </DragOverlay>
        </DndContext>
      )}
      {hasHorizontalScroll && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-10 sm:bottom-7 z-50 h-[45px] rounded-[7px] border border-[#dfe1e6] bg-white p-[4px] shadow-[0_2px_6px_rgba(9,30,66,0.15)]"
          style={{ width: `clamp(80px, ${filteredColumns.length * 20 + 8}px, calc(100vw - 32px))` }}
        >
          <div className="flex h-full w-full items-center gap-[2px]">
            {filteredColumns.map((_, i) => {
              const isVisible = i >= firstVisibleCol && i < firstVisibleCol + visibleColCount;
              return (
                <button
                  key={i}
                  type="button"
                  className="relative h-[30px] flex-1 rounded-[4px] border-0 p-0"
                  style={{ backgroundColor: isVisible ? '#ffffff' : '#f1f2f4' }}
                  onClick={() => {
                    const board = boardScrollRef.current;
                    if (!board) return;
                    const colWidth = board.scrollWidth / filteredColumns.length;
                    board.scrollTo({ left: colWidth * i, behavior: 'smooth' });
                  }}
                  aria-label={`Scroll to column ${i + 1}`}
                >
                  {isVisible && (
                    <span className="absolute inset-0 rounded-[4px] border-2 border-[#0c66e4] bg-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
