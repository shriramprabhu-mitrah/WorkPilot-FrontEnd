'use client';

import {
  Check,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { WpButton } from '@/src/app/components/common/button';

import type { WorkflowStatus } from '../data';

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

interface SortableStatusRowProps {
  status: WorkflowStatus;
  selectedStatusId: string | null;
  onSelectStatus: (statusId: string) => void;
  onEdit: (status: WorkflowStatus) => void;
  onDelete: (statusId: string) => void;
  canDelete: boolean;
}

const SortableStatusRow = ({
  status,
  selectedStatusId,
  onSelectStatus,
  onEdit,
  onDelete,
  canDelete,
}: SortableStatusRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: status.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSelected =
    selectedStatusId === status.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center rounded-md transition ${isDragging
          ? 'z-10 bg-white shadow-md'
          : isSelected
            ? 'bg-gray-100'
            : 'hover:bg-gray-50'
        }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex h-9 w-7 shrink-0 cursor-grab items-center justify-center text-gray-300 hover:text-gray-500 active:cursor-grabbing"
        aria-label={`Reorder ${status.name}`}
      >
        <GripVertical size={14} />
      </button>

      {/* Status */}
      <button
        type="button"
        onClick={() =>
          onSelectStatus(status.id)
        }
        className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left"
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            backgroundColor: status.color,
          }}
        />

        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-800">
          {status.name}
        </span>

        <span className="mr-2 shrink-0 text-[10px] text-gray-400">
          {status.category}
        </span>
      </button>

      {/* Actions */}
      <div className="mr-1 hidden items-center gap-0.5 group-hover:flex">
        <button
          type="button"
          onClick={() => onEdit(status)}
          className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
          aria-label={`Edit ${status.name}`}
        >
          <Pencil size={12} />
        </button>

        <button
          type="button"
          onClick={() =>
            onDelete(status.id)
          }
          disabled={!canDelete}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={`Delete ${status.name}`}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

interface WorkflowStatusesProps {
  statuses: WorkflowStatus[];
  selectedStatusId: string | null;
  onSelectStatus: (statusId: string) => void;
  onAddStatus: (name: string) => void;
  onUpdateStatus: (
    statusId: string,
    updates: Partial<WorkflowStatus>
  ) => void;
  onDeleteStatus: (statusId: string) => void;
  onReorder: (
    activeId: string,
    overId: string
  ) => void;
}

const categories = [
  'To Do',
  'In Progress',
  'Done',
  'Cancelled',
];

const WorkflowStatuses = ({
  statuses,
  selectedStatusId,
  onSelectStatus,
  onAddStatus,
  onUpdateStatus,
  onDeleteStatus,
  onReorder,
}: WorkflowStatusesProps) => {
  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editName, setEditName] =
    useState('');

  const [editCategory, setEditCategory] =
    useState('');

  const [editColor, setEditColor] =
    useState('#64748B');

  const [newStatusName, setNewStatusName] =
    useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const startEditing = (
    status: WorkflowStatus
  ) => {
    setEditingId(status.id);
    setEditName(status.name);
    setEditCategory(status.category);
    setEditColor(status.color);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditCategory('');
    setEditColor('#64748B');
  };

  const saveEditing = () => {
    if (
      !editingId ||
      !editName.trim()
    ) {
      return;
    }

    onUpdateStatus(editingId, {
      name: editName.trim(),
      category: editCategory,
      color: editColor,
    });

    cancelEditing();
  };

  const handleAddStatus = () => {
    const name = newStatusName.trim();

    if (!name) {
      return;
    }

    onAddStatus(name);

    setNewStatusName('');
    setShowForm(false);
  };

  const handleDelete = (
    statusId: string
  ) => {
    if (statuses.length <= 1) {
      return;
    }

    onDeleteStatus(statusId);
  };

  const handleDragEnd = (
    event: DragEndEvent
  ) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    if (active.id === over.id) {
      return;
    }

    onReorder(
      String(active.id),
      String(over.id)
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Status list */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {statuses.length === 0 ? (
          <div className="flex min-h-[180px] items-center justify-center text-[12px] text-gray-400">
            No statuses
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={statuses.map(
                (status) => status.id
              )}
              strategy={
                verticalListSortingStrategy
              }
            >
              <div className="space-y-1">
                {statuses.map((status) => {
                  const isEditing =
                    editingId === status.id;

                  /*
                   * Keep the edit form outside the
                   * sortable row so dragging remains
                   * simple and stable.
                   */
                  if (isEditing) {
                    return (
                      <div
                        key={status.id}
                        className="rounded-md border border-blue-200 bg-blue-50/50 p-3"
                      >
                        {/* Name */}
                        <div className="mb-2">
                          <label className="mb-1 block text-[10px] font-medium text-gray-500">
                            Name
                          </label>

                          <input
                            value={editName}
                            onChange={(event) =>
                              setEditName(
                                event.target.value
                              )
                            }
                            autoFocus
                            onKeyDown={(event) => {
                              if (
                                event.key ===
                                'Enter'
                              ) {
                                saveEditing();
                              }

                              if (
                                event.key ===
                                'Escape'
                              ) {
                                cancelEditing();
                              }
                            }}
                            className="h-[32px] w-full rounded-md border border-gray-200 bg-white px-2 text-[12px] outline-none focus:border-blue-400"
                          />
                        </div>

                        {/* Category */}
                        <div className="mb-2">
                          <label className="mb-1 block text-[10px] font-medium text-gray-500">
                            Category
                          </label>

                          <select
                            value={editCategory}
                            onChange={(event) =>
                              setEditCategory(
                                event.target.value
                              )
                            }
                            className="h-[32px] w-full rounded-md border border-gray-200 bg-white px-2 text-[12px] outline-none focus:border-blue-400"
                          >
                            {categories.map(
                              (category) => (
                                <option
                                  key={category}
                                  value={category}
                                >
                                  {category}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* Color */}
                        <div className="mb-3">
                          <label className="mb-1 block text-[10px] font-medium text-gray-500">
                            Color
                          </label>

                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={editColor}
                              onChange={(event) =>
                                setEditColor(
                                  event.target.value
                                )
                              }
                              className="h-[32px] w-[40px] cursor-pointer rounded border border-gray-200 bg-white p-1"
                            />

                            <input
                              value={editColor}
                              onChange={(event) =>
                                setEditColor(
                                  event.target.value
                                )
                              }
                              className="h-[32px] flex-1 rounded-md border border-gray-200 bg-white px-2 text-[11px] uppercase outline-none focus:border-blue-400"
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={
                              cancelEditing
                            }
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                            aria-label="Cancel"
                          >
                            <X size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={
                              saveEditing
                            }
                            disabled={
                              !editName.trim()
                            }
                            className="rounded-md p-1.5 text-blue-600 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Save"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <SortableStatusRow
                      key={status.id}
                      status={status}
                      selectedStatusId={
                        selectedStatusId
                      }
                      onSelectStatus={
                        onSelectStatus
                      }
                      onEdit={startEditing}
                      onDelete={handleDelete}
                      canDelete={
                        statuses.length > 1
                      }
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add status */}
      <div className="shrink-0 border-t border-gray-200 p-3">
        {showForm ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-gray-800">
                Add status
              </span>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setNewStatusName('');
                }}
                className="rounded p-1 text-gray-400 hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            <input
              autoFocus
              value={newStatusName}
              onChange={(event) =>
                setNewStatusName(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter'
                ) {
                  handleAddStatus();
                }

                if (
                  event.key === 'Escape'
                ) {
                  setShowForm(false);
                  setNewStatusName('');
                }
              }}
              placeholder="Status name..."
              className="mb-2 h-[34px] w-full rounded-md border border-gray-200 bg-white px-2.5 text-[12px] outline-none focus:border-blue-400"
            />

            <WpButton
              type="button"
              size="sm"
              onClick={handleAddStatus}
              disabled={
                !newStatusName.trim()
              }
              className="w-full"
            >
              <Plus size={14} />
              Add status
            </WpButton>
          </div>
        ) : (
          <WpButton
            type="button"
            size="sm"
            onClick={() => setShowForm(true)}
            className="w-full"
          >
            <Plus size={14} />
            Add status
          </WpButton>
        )}
      </div>
    </div>
  );
};

export default WorkflowStatuses;