import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { colors } from '@/src/styles/colors';
import { KanbanTask } from '@/src/types/board';
import {
  useGetBoardStatusTasks,
  type BoardPageFilters,
} from '@/src/modules/boards/hooks/useBoards';
import { TaskCard } from './taskCard';
import { OptimisticUpdate, MapTaskFn } from './types';

interface StatusCellProps {
  storyId: string;
  statusId: string;
  tasks: KanbanTask[];
  isOver: boolean;
  onTaskClick?: (task: KanbanTask) => void;
  onRefetch: () => void;
  hasMore: boolean;
  projectId: string;
  mapTask: MapTaskFn;
  allTasksRef: React.MutableRefObject<Map<string, KanbanTask>>;
  optimisticUpdates: Map<string, OptimisticUpdate>;
  pageFilters: BoardPageFilters;
}

export const StatusCell: React.FC<StatusCellProps> = ({
  storyId,
  statusId,
  tasks: initialTasks,
  isOver,
  onTaskClick,
  onRefetch,
  hasMore,
  projectId,
  mapTask,
  allTasksRef,
  optimisticUpdates,
  pageFilters,
}) => {
  const { setNodeRef } = useDroppable({
    id: `${storyId}-${statusId}`,
    data: { type: 'cell', storyId, statusId },
  });

  const canLoadMore = hasMore;

  const [scrollActivated, setScrollActivated] = useState(false);

  const {
    tasks: extraRawTasks,
    isFetchingNextTasks,
    isLoadingTasks,
    fetchNextTasks,
    hasNextTasks,
  } = useGetBoardStatusTasks(
    projectId,
    storyId,
    statusId,
    scrollActivated && canLoadMore,
    pageFilters
  );

  const allDisplayedTasks = useMemo(() => {
    const byId = new Map<string, KanbanTask>();

    initialTasks.forEach((t) => {
      if (t.id) byId.set(t.id, t);
    });

    if (canLoadMore) {
      extraRawTasks.forEach((t) => {
        const key = t.key ?? t.id ?? '';
        if (key && !byId.has(key)) {
          byId.set(key, mapTask(t, storyId, statusId));
        }
      });
    }

    optimisticUpdates.forEach((upd, taskId) => {
      const belongsHere =
        upd.statusId === statusId && (upd.storyId === undefined || upd.storyId === storyId);

      if (!belongsHere) {
        byId.delete(taskId);
      } else if (!byId.has(taskId) && upd.task) {
        byId.set(taskId, {
          ...upd.task,
          columnId: statusId,
          parent: upd.storyId ?? upd.task.parent,
        });
      }
    });

    return Array.from(byId.values());
  }, [initialTasks, extraRawTasks, canLoadMore, mapTask, storyId, statusId, optimisticUpdates]);

  useEffect(() => {
    const tasksRegistry = allTasksRef.current;
    allDisplayedTasks.forEach((task) => {
      if (task.id) {
        tasksRegistry.set(task.id, task);
      }
    });
    // Cleanup: remove tasks that are no longer in this cell
    return () => {
      allDisplayedTasks.forEach((task) => {
        if (task.id) {
          tasksRegistry.delete(task.id);
        }
      });
    };
  }, [allDisplayedTasks, allTasksRef]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollActivated || !canLoadMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextTasks && !isFetchingNextTasks) {
          fetchNextTasks();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scrollActivated, canLoadMore, hasNextTasks, isFetchingNextTasks, fetchNextTasks]);

  const needsScroll = allDisplayedTasks.length >= 3 || canLoadMore;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!canLoadMore || scrollActivated) return;
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (nearBottom) {
      setScrollActivated(true);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!needsScroll) return;
    const el = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    if ((e.deltaY > 0 && !isAtBottom) || (e.deltaY < 0 && !isAtTop)) {
      e.stopPropagation();
    }
  };

  const taskIds = allDisplayedTasks.map((task) => task.id).filter((id): id is string => !!id);

  return (
    <div
      ref={setNodeRef}
      onScroll={handleScroll}
      onWheel={handleWheel}
      style={{
        ...(isOver ? { backgroundColor: colors.dropBg, outlineColor: colors.dropRing } : {}),
        ...(needsScroll ? { maxHeight: '300px', overflowY: 'scroll' } : {}),
      }}
      className={`min-h-[100px] p-2 rounded-lg transition-colors duration-200 ${
        isOver ? 'outline outline-2 outline-offset-[-2px]' : ''
      }`}
    >
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {allDisplayedTasks.map((task) => (
            <TaskCard key={task.id} task={task} onTaskClick={onTaskClick} onRefetch={onRefetch} />
          ))}
          {/* Sentinel — sits at the bottom; IntersectionObserver fires fetchNextTasks */}
          {canLoadMore && !isFetchingNextTasks && (
            <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
          )}
          {/* Spinner while loading next page */}
          {(isFetchingNextTasks || isLoadingTasks) && canLoadMore && (
            <div className="flex justify-center py-3">
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};
