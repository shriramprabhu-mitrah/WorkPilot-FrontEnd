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
      {
        id: 1,
        color: '#6b7280',
        name: 'New',
        slug: 'new',
      },
      {
        id: 2,
        color: '#ef4444',
        name: 'Ready',
        slug: 'ready',
      },
      {
        id: 3,
        color: '#f97316',
        name: 'In progress',
        slug: 'in-progress',
      },
      {
        id: 4,
        color: '#eab308',
        name: 'Ready for test',
        slug: 'ready-for-test',
      },
      {
        id: 5,
        color: '#84cc16',
        name: 'Done',
        slug: 'done',
        isClosed: true,
      },
      {
        id: 6,
        color: '#94a3b8',
        name: 'Archived',
        slug: 'archived',
        isClosed: true,
        isArchived: true,
      },
    ],
  },
  {
    key: 'task',
    label: 'TASK STATUSES',
    showArchived: false,
    initialStatuses: [
      {
        id: 1,
        color: '#6b7280',
        name: 'New',
        slug: 'new',
      },
      {
        id: 2,
        color: '#f97316',
        name: 'In progress',
        slug: 'in-progress',
      },
      {
        id: 3,
        color: '#eab308',
        name: 'Ready for test',
        slug: 'ready-for-test',
      },
      {
        id: 4,
        color: '#84cc16',
        name: 'Closed',
        slug: 'closed',
        isClosed: true,
      },
      {
        id: 5,
        color: '#3b82f6',
        name: 'Needs Info',
        slug: 'needs-info',
      },
    ],
  },
  {
    key: 'issue',
    label: 'BUG STATUSES',
    showArchived: false,
    initialStatuses: [
      {
        id: 1,
        color: '#6b7280',
        name: 'New',
        slug: 'new',
      },
      {
        id: 2,
        color: '#38bdf8',
        name: 'In progress',
        slug: 'in-progress',
      },
      {
        id: 3,
        color: '#eab308',
        name: 'Ready for test',
        slug: 'ready-for-test',
      },
      {
        id: 4,
        color: '#84cc16',
        name: 'Closed',
        slug: 'closed',
        isClosed: true,
      },
      {
        id: 5,
        color: '#ef4444',
        name: 'Needs Info',
        slug: 'needs-info',
      },
      {
        id: 6,
        color: '#94a3b8',
        name: 'Rejected',
        slug: 'rejected',
        isClosed: true,
      },
      {
        id: 7,
        color: '#3b82f6',
        name: 'Postponed',
        slug: 'postponed',
      },
    ],
  },
];

function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ClosedCheck({ checked }: { checked?: boolean }) {
  if (!checked) {
    return <span className="text-xs text-[#cbd5e1]">—</span>;
  }

  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border-2 border-[#2563eb] text-[#2563eb]">
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

function StatusRow({
  status,
  showArchived,
  isEditing,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
}: StatusRowProps) {
  const [editName, setEditName] = useState(status.name);
  const [editClosed, setEditClosed] = useState(status.isClosed ?? false);

  const handleEditStart = () => {
    setEditName(status.name);
    setEditClosed(status.isClosed ?? false);
    onEdit();
  };

  if (isEditing) {
    return (
      <div className="flex min-w-[700px] items-center gap-4 border-b border-[#dbeafe] bg-[#f8fbff] px-4 py-3">
        <GripVertical size={16} className="shrink-0 text-[#94a3b8]" />

        <span
          className="h-8 w-8 shrink-0 rounded-lg shadow-[0_2px_6px_rgba(37,99,235,0.15)] ring-1 ring-blue-100"
          style={{
            backgroundColor: status.color,
          }}
        />

        <WpInput
          value={editName}
          autoFocus
          wrapperClassName="!mb-0 min-w-0 flex-1"
          onChange={(event) => setEditName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onSaveEdit(editName, editClosed);
            }

            if (event.key === 'Escape') {
              onCancelEdit();
            }
          }}
        />

        <select
          value={editClosed ? 'Yes' : 'No'}
          onChange={(event) => setEditClosed(event.target.value === 'Yes')}
          className="w-[90px] rounded-lg border border-[#cbd5e1] bg-white px-2 py-2 text-sm text-[#334155] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>

        <WpButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onSaveEdit(editName, editClosed)}
          className="!h-9 !w-9 !p-0"
          aria-label="Save"
        >
          <Check size={17} strokeWidth={2.5} />
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
    <div className="group flex min-h-[56px] min-w-[700px] items-center gap-4 border-b border-[#edf2f7] bg-white px-4 py-2.5 transition-all last:border-b-0 hover:bg-[#f8fbff] hover:shadow-[inset_3px_0_0_#2563eb]">
      <GripVertical
        size={16}
        className="shrink-0 text-transparent transition-colors group-hover:text-[#94a3b8]"
      />

      <span
        className="h-8 w-8 shrink-0 rounded-lg shadow-[0_2px_6px_rgba(37,99,235,0.15)] ring-1 ring-black/5"
        style={{
          backgroundColor: status.color,
        }}
      />

      <span className="w-48 shrink-0 truncate text-sm font-medium text-[#24344d]">
        {status.name}
      </span>

      <span className="min-w-0 flex-1 truncate text-sm text-[#64748b]">{status.slug}</span>

      <span className="flex w-24 shrink-0 justify-center">
        <ClosedCheck checked={status.isClosed} />
      </span>

      {showArchived && (
        <span className="flex w-24 shrink-0 justify-center">
          <ClosedCheck checked={status.isArchived} />
        </span>
      )}

      <div className="flex w-16 shrink-0 items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <WpButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleEditStart}
          aria-label="Edit status"
          className="!h-8 !w-8 !p-0"
        >
          <Pencil size={14} />
        </WpButton>

        <WpButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          aria-label="Delete status"
          className="!h-8 !w-8 !p-0 !text-[#64748b] hover:!bg-[#fee2e2] hover:!text-[#ef4444]"
        >
          <Trash2 size={14} />
        </WpButton>
      </div>
    </div>
  );
}

interface AddStatusRowProps {
  onAdd: (name: string, color: string, isClosed: boolean) => void;
  onCancel: () => void;
}

function AddStatusRow({ onAdd, onCancel }: AddStatusRowProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [isClosed, setIsClosed] = useState(false);

  const handleAdd = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    onAdd(trimmedName, color, isClosed);

    setName('');
    setColor('#2563eb');
    setIsClosed(false);
  };

  return (
    <div className="flex min-w-[700px] items-center gap-4 border-t border-[#dbeafe] bg-[#f0f7ff] px-4 py-3 shadow-[inset_0_1px_0_rgba(37,99,235,0.08)]">
      <span className="w-4 shrink-0" />

      <div className="flex w-8 shrink-0 items-center justify-center">
        <input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          className="h-8 w-8 cursor-pointer rounded-lg border border-[#bfdbfe] bg-white p-1 shadow-[0_2px_6px_rgba(37,99,235,0.15)]"
          title="Choose status color"
        />
      </div>

      <WpInput
        value={name}
        autoFocus
        placeholder="Write a name for the new status"
        wrapperClassName="!mb-0 min-w-0 flex-1"
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleAdd();
          }

          if (event.key === 'Escape') {
            onCancel();
          }
        }}
      />

      <select
        value={isClosed ? 'Yes' : 'No'}
        onChange={(event) => setIsClosed(event.target.value === 'Yes')}
        className="w-[90px] rounded-lg border border-[#cbd5e1] bg-white px-2 py-2 text-sm text-[#334155] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
      >
        <option value="No">No</option>
        <option value="Yes">Yes</option>
      </select>
      <WpButton
        type="button"
        variant="primary"
        size="sm"
        onClick={handleAdd}
        className="!h-8 !w-8 !min-h-0 !p-0"
        aria-label="Add status"
      >
        <Check size={15} strokeWidth={2.5} />
      </WpButton>

      <WpButton
        type="button"
        variant="secondary"
        size="sm"
        onClick={onCancel}
        className="!h-8 !w-8 !min-h-0 !p-0"
        aria-label="Cancel"
      >
        <X size={15} strokeWidth={2.5} />
      </WpButton>
    </div>
  );
}

interface StatusSectionProps {
  config: SectionConfig;
}

function StatusSection({ config }: StatusSectionProps) {
  const [statuses, setStatuses] = useState<Status[]>(config.initialStatuses);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const nextId = Math.max(0, ...statuses.map((status) => status.id)) + 1;

  const handleDelete = (id: number) => {
    setStatuses((previous) => previous.filter((status) => status.id !== id));

    if (editingId === id) {
      setEditingId(null);
    }
  };

  const handleSaveEdit = (id: number, name: string, isClosed: boolean) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    setStatuses((previous) =>
      previous.map((status) =>
        status.id === id
          ? {
              ...status,
              name: trimmedName,
              slug: toSlug(trimmedName),
              isClosed,
            }
          : status
      )
    );

    setEditingId(null);
  };

  const handleAdd = (name: string, color: string, isClosed: boolean) => {
    setStatuses((previous) => [
      ...previous,
      {
        id: nextId,
        color,
        name,
        slug: toSlug(name),
        isClosed,
      },
    ]);

    setIsAdding(false);
  };

  const handleAccordionClick = () => {
    setIsOpen((previous) => {
      const next = !previous;
      if (!next) {
        setIsAdding(false);
        setEditingId(null);
      }
      return next;
    });
  };

  const handleAddClick = () => {
    setIsOpen(true);
    setIsAdding(true);
    setEditingId(null);
  };

  return (
    <div
      className={`mb-4 overflow-hidden rounded-xl border bg-white transition-all ${
        isOpen
          ? 'border-[#bfdbfe] shadow-[0_4px_14px_rgba(37,99,235,0.10)]'
          : 'border-[#e2e8f0] shadow-[0_2px_8px_rgba(37,99,235,0.05)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.08)]'
      }`}
    >
      <div
        className={`flex min-h-[62px] items-center px-5 transition-all ${
          isOpen ? 'border-b border-[#bfdbfe] bg-[#eff6ff]' : 'bg-white hover:bg-[#f8fbff]'
        }`}
      >
        <button
          type="button"
          onClick={handleAccordionClick}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
              isOpen ? 'bg-[#dbeafe] text-[#2563eb] shadow-sm' : 'bg-[#f8fafc] text-[#64748b]'
            }`}
          >
            <ChevronRight
              size={18}
              strokeWidth={2.5}
              className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
            />
          </span>

          <span
            className={`text-[13px] font-bold leading-5 tracking-wide ${
              isOpen ? 'text-[#2563eb]' : 'text-[#334155]'
            }`}
          >
            {config.label}
          </span>

          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              isOpen ? 'bg-[#dbeafe] text-[#2563eb]' : 'bg-[#f1f5f9] text-[#64748b]'
            }`}
          >
            {statuses.length}
          </span>
        </button>

        <WpButton
          type="button"
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} strokeWidth={2.5} />}
          onClick={handleAddClick}
          className="ml-4 shrink-0 text-[11px] font-bold tracking-wide"
        >
          ADD NEW STATUS
        </WpButton>
      </div>

      {isOpen && (
        <div className="overflow-x-auto">
          <div className="flex min-w-[700px] items-center gap-4 border-b border-[#dbeafe] bg-[#f8fbff] px-4 py-2.5">
            <span className="w-4 shrink-0" />

            <span className="w-8 shrink-0 text-xs font-semibold text-[#475569]">Color</span>

            <span className="w-48 shrink-0 text-xs font-semibold text-[#475569]">Name</span>
            <span className="min-w-0 flex-1 text-xs font-semibold text-[#475569]">Slug</span>
            <span className="w-24 shrink-0 text-center text-xs font-semibold text-[#475569]">
              Is closed?
            </span>

            {config.showArchived && (
              <span className="w-24 shrink-0 text-center text-xs font-semibold text-[#475569]">
                Archived
              </span>
            )}

            <span className="w-16 shrink-0" />
          </div>

          <div className="bg-white">
            {statuses.map((status) => (
              <StatusRow
                key={status.id}
                status={status}
                showArchived={config.showArchived}
                isEditing={editingId === status.id}
                onEdit={() => {
                  setIsAdding(false);
                  setEditingId(status.id);
                }}
                onDelete={() => handleDelete(status.id)}
                onSaveEdit={(name, isClosed) => handleSaveEdit(status.id, name, isClosed)}
                onCancelEdit={() => setEditingId(null)}
              />
            ))}

            {isAdding && <AddStatusRow onAdd={handleAdd} onCancel={() => setIsAdding(false)} />}

            {statuses.length === 0 && !isAdding && (
              <div className="flex min-w-[700px] flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb]">
                  <Plus size={18} />
                </div>

                <p className="text-sm font-medium text-[#334155]">No statuses available</p>
                <p className="mt-1 text-xs text-[#94a3b8]">Add a new status to get started.</p>
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
    <div className="min-h-[calc(100vh-120px)] bg-[#f8fafc] px-6 py-6">
      <div className="mb-7">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-[#2563eb]" />

          <h2 className="text-2xl font-bold tracking-tight text-[#2563eb]">Statuses</h2>
        </div>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-[#64748b]">
          Add, remove or edit the color and name of the statuses your epics, user stories, tasks and
          issues will go through.
        </p>
      </div>

      <div className="space-y-1">
        {SECTIONS.map((section) => (
          <StatusSection key={section.key} config={section} />
        ))}
      </div>
    </div>
  );
}
