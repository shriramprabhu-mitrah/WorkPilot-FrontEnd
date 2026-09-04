'use client';

import { useState, useMemo, useEffect } from 'react';
import { Check, ChevronRight, GripVertical, Pencil, Loader2, Plus, Trash2, X } from 'lucide-react';
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
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

interface Status {
  id: string;
  color: string;
  name: string;
  display_order?: number;
  // slug: string;
  isClosed?: boolean;
  isArchived?: boolean;
}

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

function ClosedCheck({ checked }: { checked?: boolean }) {
  if (!checked) return <span className="text-xs text-slate-300 dark:text-slate-600">—</span>;
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400">
      <Check size={11} strokeWidth={3} />
    </span>
  );
}

interface StatusRowProps {
  status: Status;
  showArchived: boolean;
  isEditing: boolean;
  isOverlay?: boolean;
  isSaving?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSaveEdit: (name: string, color: string, isClosed: boolean) => void;
  onCancelEdit: () => void;
}

function StatusRow({
  status,
  showArchived,
  isEditing,
  isOverlay,
  isSaving,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
}: StatusRowProps) {
  const [editName, setEditName] = useState(status.name);
  const [editColor, setEditColor] = useState(status.color);
  const [editClosed, setEditClosed] = useState(status.isClosed ?? false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: status.id,
    disabled: isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex flex-wrap sm:flex-nowrap items-center gap-3 border-b border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 px-4 py-3"
      >
        <GripVertical
          size={16}
          className="hidden sm:block shrink-0 text-slate-300 dark:text-slate-600 cursor-not-allowed"
        />
        <div className="relative h-8 w-8 shrink-0">
          <span
            className="absolute inset-0 rounded-lg ring-1 ring-black/5 dark:ring-white/10"
            style={{ backgroundColor: editColor }}
          />

          <input
            type="color"
            value={editColor}
            onChange={(e) => setEditColor(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            title="Choose status color"
          />
        </div>

        <div className="flex min-w-0 flex-1 items-center rounded-lg border border-blue-500 bg-white dark:bg-slate-800">
          <input
            type="text"
            value={editColor}
            onChange={(e) => {
              let value = e.target.value;

              if (!value.startsWith('#')) {
                value = `#${value}`;
              }

              if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                setEditColor(value);
              }
            }}
            className="w-[80px] shrink-0 border-0 bg-transparent pl-3 text-sm font-medium text-slate-500 outline-none dark:text-slate-400"
          />

          <input
            value={editName}
            autoFocus
            className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none"
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isSaving) {
                onSaveEdit(editName, editColor, editClosed);
              }

              if (e.key === 'Escape' && !isSaving) {
                onCancelEdit();
              }
            }}
          />
        </div>
        <select
          value={editClosed ? 'Yes' : 'No'}
          onChange={(e) => setEditClosed(e.target.value === 'Yes')}
          className="w-[80px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
        <WpButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onSaveEdit(editName, editColor, editClosed)}
          disabled={isSaving}
          className="!h-9 !w-9 !p-0"
          aria-label="Save"
        >
          {isSaving ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Check size={17} strokeWidth={2.5} />
          )}
        </WpButton>
        <WpButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancelEdit}
          className="!h-9 !w-9 !p-0"
          aria-label="Cancel"
        >
          <X size={17} strokeWidth={2.5} />
        </WpButton>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group grid grid-cols-[32px_32px_minmax(0,1fr)_80px_auto] items-center gap-3 min-h-[52px] border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 transition-all last:border-b-0 ${isDragging
        ? 'opacity-40 bg-slate-50 dark:bg-slate-800/40 border-dashed border-blue-300'
        : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:shadow-[inset_3px_0_0_#2563eb]'
        } ${isOverlay
          ? 'shadow-xl ring-2 ring-blue-500/30 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800'
          : ''
        }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="hidden sm:flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 touch-none py-1 transition-colors"
        title="Drag to reorder"
      >
        <GripVertical size={16} />
      </div>
      <span
        className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-black/5 dark:ring-white/10"
        style={{ backgroundColor: status.color }}
      />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
        {status.name}
      </span>
      <span className="hidden sm:flex w-full justify-center">
        <ClosedCheck checked={status.isClosed} />
      </span>
      {showArchived && (
        <span className="hidden sm:flex w-20 shrink-0 justify-center">
          <ClosedCheck checked={status.isArchived} />
        </span>
      )}
      <div
        className={`ml-auto flex shrink-0 items-center gap-1 ${isOverlay ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
      >
        <WpButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          aria-label="Edit"
          className="!h-8 !w-8 !p-0"
        >
          <Pencil size={14} />
        </WpButton>
        <WpButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          aria-label="Delete"
          className="!h-8 !w-8 !p-0 !text-slate-400 hover:!bg-red-100 dark:hover:!bg-red-900/30 hover:!text-red-500"
        >
          <Trash2 size={14} />
        </WpButton>
      </div>
    </div>
  );
}

function AddStatusRow({
  onAdd,
  onCancel,
  isSaving,
}: {
  onAdd: (name: string, color: string, isClosed: boolean) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [isClosed, setIsClosed] = useState(false);

  const handleAdd = () => {
    if (isSaving) return;

    const trimmed = name.trim();

    if (!trimmed) return;

    onAdd(trimmed, color, isClosed);
  };

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 border-t border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 px-4 py-3">
      <div className="relative h-8 w-8 shrink-0">
        <span
          className="absolute inset-0 rounded-lg ring-1 ring-black/5 dark:ring-white/10"
          style={{ backgroundColor: color }}
        />

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          title="Choose status color"
        />
      </div>

      <div className="flex min-w-0 flex-1 items-center rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <input
          type="text"
          value={color}
          onChange={(e) => {
            let value = e.target.value;

            if (!value.startsWith('#')) {
              value = `#${value}`;
            }

            if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
              setColor(value);
            }
          }}
          className="w-[80px] shrink-0 border-0 bg-transparent pl-3 text-sm font-medium text-slate-500 outline-none dark:text-slate-400"
        />

        <input
          value={name}
          autoFocus
          placeholder="Write a name for the new status"
          className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
            if (e.key === 'Escape') onCancel();
          }}
        />
      </div>
      <select
        value={isClosed ? 'Yes' : 'No'}
        onChange={(e) => setIsClosed(e.target.value === 'Yes')}
        className="w-[80px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
      >
        <option value="No">No</option>
        <option value="Yes">Yes</option>
      </select>
      <WpButton
        type="button"
        variant="primary"
        size="sm"
        onClick={handleAdd}
        disabled={isSaving}
        className="!h-8 !w-8 !min-h-0 !p-0"
        aria-label="Add"
      >
        {isSaving ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Check size={15} strokeWidth={2.5} />
        )}
      </WpButton>
      <WpButton
        type="button"
        variant="secondary"
        size="sm"
        onClick={onCancel}
        disabled={isSaving}
        className="!h-8 !w-8 !min-h-0 !p-0"
        aria-label="Cancel"
      >
        <X size={15} strokeWidth={2.5} />
      </WpButton>
    </div>
  );
}

function StatusSection({ config, projectId }: { config: SectionConfig; projectId: string }) {
  const [statuses, setStatuses] = useState<Status[]>(config.initialStatuses);
  const isUserStory = config.key === 'userStory';
  const isTask = config.key === 'task';

  const { userStoryStatuses } = useGetUserStoryStatuses(projectId, isUserStory);
  const { data: taskStatuses = [] } = useGetStatus(projectId, isTask);
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

  const [items, setItems] = useState<Status[]>(serverStatuses);
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

  const handleDelete = async (id: string) => {
    if (isUserStory) {
      try {
        await deleteUserStoryStatusAsync({
          projectId,
          statusId: id,
        });

        if (editingId === id) {
          setEditingId(null);
        }
      } catch (error) {
        // Toast/error handled by API service
        logger.log(error);
      }

      return;
    }
    if (isTask) {
      try {
        await deleteStatus.mutateAsync({
          projectId,
          statusId: id,
        });

        if (editingId === id) {
          setEditingId(null);
        }
      } catch {
        // Error is handled by API service
      }

      return;
    }
    setStatuses((prev) => prev.filter((s) => s.id !== id));

    if (editingId === id) {
      setEditingId(null);
    }
  };

  const handleSaveEdit = async (
    id: string,
    name: string,
    color: string,
    isClosed: boolean
  ) => {
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

  const handleAdd = async (
    name: string,
    color: string,
    isClosed: boolean
  ) => {
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
      className={`mb-4 w-full lg:w-[55%] overflow-hidden rounded-xl border transition-all ${isOpen
        ? 'border-blue-200 dark:border-blue-800 shadow-[0_4px_14px_rgba(37,99,235,0.10)]'
        : 'border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'
        } bg-white dark:bg-slate-800`}
    >
      {/* Section header */}
      <div
        className={`flex min-h-[60px] items-center px-4 sm:px-5 transition-all ${isOpen
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
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${isOpen
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
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isOpen
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

            <span className="text-xs font-semibold text-slate-500">Color</span>

            <span className="min-w-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Name
            </span>

            <span className="text-center -translate-x-17 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Closed?
            </span>

            {config.showArchived && (
              <span className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                Archived
              </span>
            )}

            <span />
          </div>

          <div className="pb-4">
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
                    onDelete={() => handleDelete(status.id)}
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
                    onEdit={() => { }}
                    onDelete={() => { }}
                    onSaveEdit={() => { }}
                    onCancelEdit={() => { }}
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
          </div>
        </div>
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
      <p className="mb-6 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
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
