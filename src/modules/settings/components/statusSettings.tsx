'use client';

import { useState } from 'react';
import { Check, ChevronRight, GripVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';

interface Status {
  id: number;
  color: string;
  name: string;
  slug: string;
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
    showArchived: true,
    initialStatuses: [
      { id: 1, color: '#6b7280', name: 'New', slug: 'new' },
      { id: 2, color: '#ef4444', name: 'Ready', slug: 'ready' },
      { id: 3, color: '#f97316', name: 'In progress', slug: 'in-progress' },
      { id: 4, color: '#eab308', name: 'Ready for test', slug: 'ready-for-test' },
      { id: 5, color: '#84cc16', name: 'Done', slug: 'done', isClosed: true },
      { id: 6, color: '#94a3b8', name: 'Archived', slug: 'archived', isClosed: true, isArchived: true },
    ],
  },
  {
    key: 'task',
    label: 'TASK STATUSES',
    showArchived: false,
    initialStatuses: [
      { id: 1, color: '#6b7280', name: 'New', slug: 'new' },
      { id: 2, color: '#f97316', name: 'In progress', slug: 'in-progress' },
      { id: 3, color: '#eab308', name: 'Ready for test', slug: 'ready-for-test' },
      { id: 4, color: '#84cc16', name: 'Closed', slug: 'closed', isClosed: true },
      { id: 5, color: '#3b82f6', name: 'Needs Info', slug: 'needs-info' },
    ],
  },
  {
    key: 'issue',
    label: 'BUG STATUSES',
    showArchived: false,
    initialStatuses: [
      { id: 1, color: '#6b7280', name: 'New', slug: 'new' },
      { id: 2, color: '#38bdf8', name: 'In progress', slug: 'in-progress' },
      { id: 3, color: '#eab308', name: 'Ready for test', slug: 'ready-for-test' },
      { id: 4, color: '#84cc16', name: 'Closed', slug: 'closed', isClosed: true },
      { id: 5, color: '#ef4444', name: 'Needs Info', slug: 'needs-info' },
      { id: 6, color: '#94a3b8', name: 'Rejected', slug: 'rejected', isClosed: true },
      { id: 7, color: '#3b82f6', name: 'Postponed', slug: 'postponed' },
    ],
  },
];

function toSlug(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
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
  onEdit: () => void;
  onDelete: () => void;
  onSaveEdit: (name: string, isClosed: boolean) => void;
  onCancelEdit: () => void;
}

function StatusRow({ status, showArchived, isEditing, onEdit, onDelete, onSaveEdit, onCancelEdit }: StatusRowProps) {
  const [editName, setEditName] = useState(status.name);
  const [editClosed, setEditClosed] = useState(status.isClosed ?? false);

  if (isEditing) {
    return (
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 border-b border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 px-4 py-3">
        <GripVertical size={16} className="hidden sm:block shrink-0 text-slate-300 dark:text-slate-600" />
        <span className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-black/5" style={{ backgroundColor: status.color }} />
        <WpInput
          value={editName}
          autoFocus
          wrapperClassName="!mb-0 min-w-0 flex-1"
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveEdit(editName, editClosed);
            if (e.key === 'Escape') onCancelEdit();
          }}
        />
        <select
          value={editClosed ? 'Yes' : 'No'}
          onChange={(e) => setEditClosed(e.target.value === 'Yes')}
          className="w-[80px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
        <WpButton type="button" variant="ghost" size="sm" onClick={() => onSaveEdit(editName, editClosed)} className="!h-9 !w-9 !p-0" aria-label="Save">
          <Check size={17} strokeWidth={2.5} />
        </WpButton>
        <WpButton type="button" variant="secondary" size="sm" onClick={onCancelEdit} className="!h-9 !w-9 !p-0" aria-label="Cancel">
          <X size={17} strokeWidth={2.5} />
        </WpButton>
      </div>
    );
  }

  return (
    <div className="group flex flex-wrap sm:flex-nowrap min-h-[52px] items-center gap-3 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 transition-all last:border-b-0 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:shadow-[inset_3px_0_0_#2563eb]">
      <GripVertical size={16} className="hidden sm:block shrink-0 text-transparent transition-colors group-hover:text-slate-300 dark:group-hover:text-slate-600" />
      <span className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-black/5 dark:ring-white/10" style={{ backgroundColor: status.color }} />
      <span className="w-full sm:w-40 shrink-0 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
        {status.name}
      </span>
      <span className="hidden sm:block min-w-0 flex-1 truncate text-sm text-slate-400 dark:text-slate-500">
        {status.slug}
      </span>
      <span className="hidden sm:flex w-20 shrink-0 justify-center">
        <ClosedCheck checked={status.isClosed} />
      </span>
      {showArchived && (
        <span className="hidden sm:flex w-20 shrink-0 justify-center">
          <ClosedCheck checked={status.isArchived} />
        </span>
      )}
      <div className="flex items-center gap-1 ml-auto opacity-0 transition-opacity group-hover:opacity-100">
        <WpButton type="button" variant="ghost" size="sm" onClick={onEdit} aria-label="Edit" className="!h-8 !w-8 !p-0">
          <Pencil size={14} />
        </WpButton>
        <WpButton type="button" variant="ghost" size="sm" onClick={onDelete} aria-label="Delete" className="!h-8 !w-8 !p-0 !text-slate-400 hover:!bg-red-100 dark:hover:!bg-red-900/30 hover:!text-red-500">
          <Trash2 size={14} />
        </WpButton>
      </div>
    </div>
  );
}

function AddStatusRow({ onAdd, onCancel }: { onAdd: (name: string, color: string, isClosed: boolean) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [isClosed, setIsClosed] = useState(false);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, color, isClosed);
    setName('');
    setColor('#2563eb');
    setIsClosed(false);
  };

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 border-t border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 px-4 py-3">
      <span className="hidden sm:block w-4 shrink-0" />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="h-8 w-8 cursor-pointer rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800 p-1 shadow shrink-0"
        title="Choose status color"
      />
      <WpInput
        value={name}
        autoFocus
        placeholder="Write a name for the new status"
        wrapperClassName="!mb-0 min-w-0 flex-1"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <select
        value={isClosed ? 'Yes' : 'No'}
        onChange={(e) => setIsClosed(e.target.value === 'Yes')}
        className="w-[80px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
      >
        <option value="No">No</option>
        <option value="Yes">Yes</option>
      </select>
      <WpButton type="button" variant="primary" size="sm" onClick={handleAdd} className="!h-8 !w-8 !min-h-0 !p-0" aria-label="Add">
        <Check size={15} strokeWidth={2.5} />
      </WpButton>
      <WpButton type="button" variant="secondary" size="sm" onClick={onCancel} className="!h-8 !w-8 !min-h-0 !p-0" aria-label="Cancel">
        <X size={15} strokeWidth={2.5} />
      </WpButton>
    </div>
  );
}

function StatusSection({ config }: { config: SectionConfig }) {
  const [statuses, setStatuses] = useState<Status[]>(config.initialStatuses);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const nextId = Math.max(0, ...statuses.map((s) => s.id)) + 1;

  const handleDelete = (id: number) => {
    setStatuses((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleSaveEdit = (id: number, name: string, isClosed: boolean) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setStatuses((prev) => prev.map((s) => s.id === id ? { ...s, name: trimmed, slug: toSlug(trimmed), isClosed } : s));
    setEditingId(null);
  };

  const handleAdd = (name: string, color: string, isClosed: boolean) => {
    setStatuses((prev) => [...prev, { id: nextId, color, name, slug: toSlug(name), isClosed }]);
    setIsAdding(false);
  };

  return (
    <div className={`mb-4 overflow-hidden rounded-xl border transition-all ${
      isOpen
        ? 'border-blue-200 dark:border-blue-800 shadow-[0_4px_14px_rgba(37,99,235,0.10)]'
        : 'border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'
    } bg-white dark:bg-slate-800`}>
      {/* Section header */}
      <div className={`flex min-h-[60px] items-center px-4 sm:px-5 transition-all ${
        isOpen ? 'border-b border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50'
      }`}>
        <button
          type="button"
          onClick={() => { setIsOpen((p) => { const n = !p; if (!n) { setIsAdding(false); setEditingId(null); } return n; }); }}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
        >
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
            isOpen ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
          }`}>
            <ChevronRight size={18} strokeWidth={2.5} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
          </span>
          <span className={`text-[13px] font-bold tracking-wide ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
            {config.label}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            isOpen ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
          }`}>
            {statuses.length}
          </span>
        </button>
        <WpButton
          type="button"
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} strokeWidth={2.5} />}
          onClick={() => { setIsOpen(true); setIsAdding(true); setEditingId(null); }}
          className="ml-4 shrink-0 text-[11px] font-bold tracking-wide hidden sm:inline-flex"
        >
          ADD STATUS
        </WpButton>
        <WpButton
          type="button"
          variant="primary"
          size="sm"
          onClick={() => { setIsOpen(true); setIsAdding(true); setEditingId(null); }}
          className="ml-3 shrink-0 !h-8 !w-8 !p-0 sm:hidden"
          aria-label="Add status"
        >
          <Plus size={16} />
        </WpButton>
      </div>

      {isOpen && (
        <div className="overflow-x-auto">
          {/* Column headers — desktop */}
          <div className="hidden sm:flex min-w-[600px] items-center gap-3 border-b border-blue-50 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5">
            <span className="w-4 shrink-0" />
            <span className="w-8 shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">Color</span>
            <span className="w-40 shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">Name</span>
            <span className="min-w-0 flex-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Slug</span>
            <span className="w-20 shrink-0 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">Closed?</span>
            {config.showArchived && (
              <span className="w-20 shrink-0 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">Archived</span>
            )}
            <span className="w-16 shrink-0" />
          </div>

          <div>
            {statuses.map((status) => (
              <StatusRow
                key={status.id}
                status={status}
                showArchived={config.showArchived}
                isEditing={editingId === status.id}
                onEdit={() => { setIsAdding(false); setEditingId(status.id); }}
                onDelete={() => handleDelete(status.id)}
                onSaveEdit={(name, isClosed) => handleSaveEdit(status.id, name, isClosed)}
                onCancelEdit={() => setEditingId(null)}
              />
            ))}

            {isAdding && <AddStatusRow onAdd={handleAdd} onCancel={() => setIsAdding(false)} />}

            {statuses.length === 0 && !isAdding && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Plus size={18} />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No statuses available</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Add a new status to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StatusSettings() {
  return (
    <div className="min-h-[calc(100vh-160px)] px-0 py-2">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-blue-600" />
        <h2 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">Statuses</h2>
      </div>
      <p className="mb-6 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
        Add, remove or edit the color and name of the statuses your epics, user stories, tasks and issues will go through.
      </p>
      <div className="space-y-1">
        {SECTIONS.map((section) => (
          <StatusSection key={section.key} config={section} />
        ))}
      </div>
    </div>
  );
}
