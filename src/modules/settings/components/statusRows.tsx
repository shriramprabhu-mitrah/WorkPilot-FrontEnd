'use client';

import { useState } from 'react';
import { Check, GripVertical, Pencil, Loader2, Trash2, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WpButton } from '@/src/app/components/common/button';

export interface Status {
  id: string;
  color: string;
  name: string;
  display_order?: number;
  // slug: string;
  isClosed?: boolean;
  isArchived?: boolean;
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

export function StatusRow({
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
      className={`group grid grid-cols-[32px_32px_minmax(0,1fr)_80px_auto] items-center gap-3 min-h-[52px] border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 transition-all last:border-b-0 ${
        isDragging
          ? 'opacity-40 bg-slate-50 dark:bg-slate-800/40 border-dashed border-blue-300'
          : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:shadow-[inset_3px_0_0_#2563eb]'
      } ${
        isOverlay
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

export function StatusRowSkeleton() {
  return (
    <div className="grid grid-cols-[32px_32px_minmax(0,1fr)_80px_auto] items-center gap-3 min-h-[52px] border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 animate-pulse">
      <div className="hidden sm:block h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
      <div className="hidden sm:flex w-full justify-center">
        <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded-md" />
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1 opacity-0">
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}

export function AddStatusRow({
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
