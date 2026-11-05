'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { WpButton } from '@/src/app/components/common/button';
import {
  useGetUserStoryStatuses,
  useCreateUserStoryStatus,
  useUpdateUserStoryStatus,
  useDeleteUserStoryStatus,
} from '@/src/modules/tasks/hooks/useUserStory';
import { useAppSelector } from '@/src/store';
import {
  useGetStatus,
  useCreateStatus,
  useUpdateStatus,
  useDeleteStatus,
} from '../../project/hooks/useLabels';
import { logger } from '@/src/lib/utils/logger';
import DeleteConfirmModal from '@/src/app/components/common/deleteModal';
import { StatusRow, StatusRowSkeleton, AddStatusRow, type Status } from './statusRows';

// Stable reference so a default value never creates a new array on every render
const EMPTY_STATUSES: never[] = [];

type SectionType = 'epic' | 'userStory' | 'task' | 'issue';

interface SectionConfig {
  key: SectionType;
  label: string;
  showArchived: boolean;
  initialStatuses: Status[];
}

const SECTIONS: SectionConfig[] = [
  {
    key: 'userStory',
    label: 'USER STORY STATUSES',
    showArchived: false,
    initialStatuses: [],
  },
  {
    key: 'task',
    label: 'TASK STATUSES',
    showArchived: false,
    initialStatuses: [],
  },
];

function toSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function StatusSection({ config, projectId }: { config: SectionConfig; projectId: string }) {
  const [statuses, setStatuses] = useState<Status[]>(config.initialStatuses);
  const isUserStory = config.key === 'userStory';
  const isTask = config.key === 'task';

  const { userStoryStatuses, isLoadingUserStoryStatuses } = useGetUserStoryStatuses(
    projectId,
    isUserStory
  );
  const { data: taskStatuses = EMPTY_STATUSES, isLoading: isLoadingTask } = useGetStatus(
    projectId,
    isTask
  );
  const { createUserStoryStatusAsync } = useCreateUserStoryStatus();
  const { updateUserStoryStatusAsync } = useUpdateUserStoryStatus();
  const { deleteUserStoryStatusAsync } = useDeleteUserStoryStatus();

  const createStatus = useCreateStatus();
  const updateStatus = useUpdateStatus();
  const deleteStatus = useDeleteStatus();

  const serverStatuses: Status[] = useMemo(() => {
    const list = isUserStory
      ? userStoryStatuses.map((status) => ({
          id: String(status.id),
          name: status.name,
          color: status.color,
          display_order: status.display_order,
          slug: toSlug(status.name),
          isClosed: status.is_final,
        }))
      : isTask
        ? taskStatuses.map((status) => ({
            id: String(status.id),
            name: status.name,
            color: status.color,
            display_order: status.display_order,
            slug: toSlug(status.name),
            isClosed: status.is_final,
          }))
        : statuses;

    return [...list].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [isUserStory, isTask, userStoryStatuses, taskStatuses, statuses]);

  const [items, setItems] = useState<Status[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(serverStatuses);
  }, [serverStatuses]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);
  const [isSavingNewStatus, setIsSavingNewStatus] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLoading = isUserStory ? isLoadingUserStoryStatuses : isTask ? isLoadingTask : false;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const activeStatus = useMemo(
    () => (activeId ? items.find((s) => s.id === activeId) : null),
    [items, activeId]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      display_order: idx,
    }));

    setItems(updatedItems);

    const targetStatusId = String(active.id);
    const newDisplayOrder = newIndex;

    try {
      if (isUserStory) {
        await updateUserStoryStatusAsync({
          projectId,
          statusId: targetStatusId,
          payload: {
            display_order: newDisplayOrder,
          },
        });
      } else if (isTask) {
        await updateStatus.mutateAsync({
          projectId,
          statusId: targetStatusId,
          payload: {
            display_order: newDisplayOrder,
          },
        });
      } else {
        setStatuses(updatedItems);
      }
    } catch {
      setItems(serverStatuses);
    }
  };

  const nextId =
    Math.max(0, ...statuses.map((s) => Number(s.id)).filter((id) => !Number.isNaN(id))) + 1;

  const handleDeleteClick = (id: string, name: string) => {
    setStatusToDelete({ id, name });
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!statusToDelete) return;

    const { id } = statusToDelete;

    if (isUserStory) {
      try {
        setIsDeleting(true);
        await deleteUserStoryStatusAsync({
          projectId,
          statusId: id,
        });

        if (editingId === id) {
          setEditingId(null);
        }
        setShowDeleteConfirm(false);
        setStatusToDelete(null);
        toast.success('User story status deleted successfully');
      } catch (error) {
        logger.log(error);
        toast.error('Failed to delete user story status');
      } finally {
        setIsDeleting(false);
      }

      return;
    }
    if (isTask) {
      try {
        setIsDeleting(true);
        await deleteStatus.mutateAsync({
          projectId,
          statusId: id,
        });

        if (editingId === id) {
          setEditingId(null);
        }
        setShowDeleteConfirm(false);
        setStatusToDelete(null);
        toast.success('Task status deleted successfully');
      } catch {
        toast.error('Failed to delete task status');
      } finally {
        setIsDeleting(false);
      }

      return;
    }
    setStatuses((prev) => prev.filter((s) => s.id !== id));

    if (editingId === id) {
      setEditingId(null);
    }
    setShowDeleteConfirm(false);
    setStatusToDelete(null);
  };

  const handleSaveEdit = async (id: string, name: string, color: string, isClosed: boolean) => {
    if (savingStatusId) return;

    const trimmed = name.trim();

    if (!trimmed) return;

    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return;
    }

    try {
      setSavingStatusId(id);

      if (isUserStory) {
        await updateUserStoryStatusAsync({
          projectId,
          statusId: id,
          payload: {
            name: trimmed,
            color,
            is_final: isClosed,
          },
        });
        toast.success('User story status updated successfully');
      }

      if (isTask) {
        await updateStatus.mutateAsync({
          projectId,
          statusId: id,
          payload: {
            name: trimmed,
            color,
            is_final: isClosed,
          },
        });
        toast.success('Task status updated successfully');
      }

      if (!isUserStory && !isTask) {
        setStatuses((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  name: trimmed,
                  slug: toSlug(trimmed),
                  color,
                  isClosed,
                }
              : s
          )
        );
      }

      setEditingId(null);
    } catch (error) {
      logger.log(error);
    } finally {
      setSavingStatusId(null);
    }
  };

  const handleAdd = async (name: string, color: string, isClosed: boolean) => {
    if (isSavingNewStatus) return;

    const trimmed = name.trim();

    if (!trimmed) return;

    const newOrder = items.length;

    try {
      setIsSavingNewStatus(true);

      if (isUserStory) {
        await createUserStoryStatusAsync({
          projectId,
          payload: {
            name: trimmed,
            color,
            is_final: isClosed,
            display_order: newOrder,
          },
        });
      }

      if (isTask) {
        await createStatus.mutateAsync({
          projectId,
          payload: {
            name: trimmed,
            color,
            is_final: isClosed,
            display_order: newOrder,
          },
        });
        toast.success('Task status created successfully');
      }

      if (!isUserStory && !isTask) {
        setStatuses((prev) => [
          ...prev,
          {
            id: String(nextId),
            color,
            name: trimmed,
            slug: toSlug(trimmed),
            isClosed,
            display_order: newOrder,
          },
        ]);
      }

      setIsAdding(false);
    } catch (error) {
      logger.log(error);
    } finally {
      setIsSavingNewStatus(false);
    }
  };
  return (
    <div
      className={`mb-4 w-full lg:w-[55%] overflow-hidden rounded-xl border transition-all ${
        isOpen
          ? 'border-blue-200 dark:border-blue-800 shadow-[0_4px_14px_rgba(37,99,235,0.10)]'
          : 'border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'
      } bg-white dark:bg-slate-800`}
    >
      {/* Section header */}
      <div
        className={`flex min-h-[60px] items-center px-4 sm:px-5 transition-all ${
          isOpen
            ? 'border-b border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20'
            : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setIsOpen((p) => {
              const n = !p;
              if (!n) {
                setIsAdding(false);
                setEditingId(null);
              }
              return n;
            });
          }}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
              isOpen
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            <ChevronRight
              size={18}
              strokeWidth={2.5}
              className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
            />
          </span>
          <span
            className={`text-[13px] font-bold tracking-wide ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}
          >
            {config.label}
          </span>

          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              isOpen
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            {items.length}
          </span>
        </button>
        <WpButton
          type="button"
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} strokeWidth={2.5} />}
          onClick={() => {
            setIsOpen(true);
            setIsAdding(true);
            setEditingId(null);
          }}
          className="ml-4 shrink-0 text-[11px] font-bold tracking-wide hidden sm:inline-flex"
        >
          ADD STATUS
        </WpButton>
        <WpButton
          type="button"
          variant="primary"
          size="sm"
          onClick={() => {
            setIsOpen(true);
            setIsAdding(true);
            setEditingId(null);
          }}
          className="ml-3 shrink-0 !h-8 !w-8 !p-0 sm:hidden"
          aria-label="Add status"
        >
          <Plus size={16} />
        </WpButton>
      </div>

      {isOpen && (
        <div className="w-full overflow-hidden">
          {/* Column headers — desktop */}
          <div className="hidden sm:grid grid-cols-[32px_32px_minmax(0,1fr)_80px_auto] items-center gap-3 px-4 py-2">
            <span />

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-100">Color</span>

            <span className="min-w-0 text-xs font-semibold text-slate-500 dark:text-slate-100">
              Name
            </span>

            <span className="text-center -translate-x-17 text-xs font-semibold text-slate-500 dark:text-slate-100">
              Closed?
            </span>

            {config.showArchived && (
              <span className="text-center text-xs font-semibold text-slate-500 dark:text-slate-100">
                Archived
              </span>
            )}

            <span />
          </div>

          <div className="pb-4">
            {isLoading ? (
              // Show skeleton loaders while loading
              <>
                <StatusRowSkeleton />
                <StatusRowSkeleton />
                <StatusRowSkeleton />
              </>
            ) : (
              <>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={items.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {items.map((status) => (
                      <StatusRow
                        key={status.id}
                        status={status}
                        showArchived={config.showArchived}
                        isEditing={editingId === status.id}
                        isSaving={savingStatusId === status.id}
                        onEdit={() => {
                          setIsAdding(false);
                          setEditingId(status.id);
                        }}
                        onDelete={() => handleDeleteClick(status.id, status.name)}
                        onSaveEdit={(name, color, isClosed) =>
                          handleSaveEdit(status.id, name, color, isClosed)
                        }
                        onCancelEdit={() => setEditingId(null)}
                      />
                    ))}
                  </SortableContext>

                  <DragOverlay>
                    {activeStatus ? (
                      <StatusRow
                        status={activeStatus}
                        showArchived={config.showArchived}
                        isEditing={false}
                        isOverlay
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onSaveEdit={() => {}}
                        onCancelEdit={() => {}}
                      />
                    ) : null}
                  </DragOverlay>
                </DndContext>

                {isAdding && (
                  <AddStatusRow
                    onAdd={handleAdd}
                    onCancel={() => setIsAdding(false)}
                    isSaving={isSavingNewStatus}
                  />
                )}

                {items.length === 0 && !isAdding && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <Plus size={18} />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      No statuses available
                    </p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      Add a new status to get started.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && statusToDelete && (
        <DeleteConfirmModal
          title="Delete Status"
          message={`Are you sure you want to delete the "${statusToDelete.name}" status? This action cannot be undone and may affect ${isUserStory ? 'user stories' : 'tasks'} using this status.`}
          isDeleting={isDeleting}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setStatusToDelete(null);
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
export default function StatusSettings() {
  const projectId = useAppSelector((state) => state.project.selectedProject?.id);

  if (!projectId) {
    return (
      <div className="px-8 py-10 text-center text-gray-500">Please select a project first.</div>
    );
  }
  return (
    <div className="min-h-[calc(100vh-160px)] px-0 py-2 pb-16">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-blue-600" />
        <h2 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
          Statuses
        </h2>
      </div>
      <p className="mb-6 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-100">
        Add, remove or edit the color and name of the statuses your epics, user stories, tasks and
        issues will go through.
      </p>
      <div className="space-y-1 pb-1">
        {SECTIONS.map((section) => (
          <StatusSection key={section.key} config={section} projectId={projectId} />
        ))}
      </div>
    </div>
  );
}
