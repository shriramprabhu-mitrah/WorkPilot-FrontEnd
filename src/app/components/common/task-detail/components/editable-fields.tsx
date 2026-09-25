import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Hash, Pencil, Plus } from 'lucide-react';
import type { Priority } from '@/src/types/board';
import { PriorityDot } from './badges';
import { WpDatePicker } from '@/src/app/components/common/datepicker';
import type { LabelListItem } from '@/src/types/label';
import {
  useAttachLabel,
  useCreateLabel,
  useDeleteLabel,
  useGetLabels,
  useRemoveLabel,
  useUpdateLabel,
} from '@/src/modules/project/hooks/useLabels';

export const EditableText = ({
  value,
  onChange,
  placeholder = 'None',
  className = '',
  textClassName = 'text-sm font-medium',
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const commit = () => {
    onChange(draft.trim() || '');
    setEditing(false);
  };

  if (disabled) {
    return (
      <span
        className={`${textClassName} ${
          value ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400 dark:text-slate-500'
        } ${className}`}
      >
        {value || placeholder}
      </span>
    );
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit();
          }

          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`w-full ${textClassName} border border-blue-400 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200 ${className}`}
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={`flex items-center gap-1.5 w-full text-left group/edit ${className}`}
    >
      <span
        className={`${textClassName} ${
          value ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400 dark:text-slate-500'
        }`}
      >
        {value || placeholder}
      </span>

      <Pencil
        size={12}
        className="text-gray-300 opacity-0 group-hover/edit:opacity-100 transition-opacity shrink-0"
      />
    </button>
  );
};

export const EditableDate = ({
  value,
  onChange,
  placeholder = 'None',
  includeTime = false,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  includeTime?: boolean;
  disabled?: boolean;
}) => {
  const [localValue, setLocalValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalValue(value);
    }, 0);

    return () => clearTimeout(timer);
  }, [value]);

  const handleChange = (newValue: string) => {
    if (disabled) return;

    setLocalValue(newValue);
  };

  const handleCommit = (newValue: string) => {
    if (disabled) return;

    setLocalValue(newValue);
    onChange(newValue);
  };

  if (disabled) {
    return (
      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
        {localValue ? new Date(localValue).toLocaleDateString() : placeholder}
      </span>
    );
  }

  return (
    <div className="relative">
      <WpDatePicker
        value={localValue}
        onChange={handleChange}
        onCommit={handleCommit}
        placeholder={placeholder}
        showTime={includeTime}
      />
    </div>
  );
};

export const EditableNumber = ({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const commit = () => {
    const n = Number.parseInt(draft, 10);

    onChange(Number.isNaN(n) ? value : n);
    setEditing(false);
  };

  if (disabled) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-gray-800 dark:text-slate-100">
        <Hash size={12} className="text-gray-400" />
        {value}
      </span>
    );
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={draft}
        min={1}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit();
          }

          if (e.key === 'Escape') {
            setDraft(String(value));
            setEditing(false);
          }
        }}
        className="w-20 text-sm border border-blue-400 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      className="flex items-center gap-1.5 group/edit"
    >
      <span className="flex items-center gap-1.5 text-sm text-gray-800 dark:text-slate-100">
        <Hash size={12} className="text-gray-400" />
        {value}
      </span>

      <Pencil
        size={11}
        className="text-gray-300 opacity-0 group-hover/edit:opacity-100 transition-opacity shrink-0"
      />
    </button>
  );
};

const PRIORITY_LIST: Priority[] = ['Critical', 'High', 'Medium', 'Low'];

export const EditablePriority = ({
  value,
  onChange,
  disabled = false,
}: {
  value: Priority;
  onChange: (v: Priority) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, []);

  if (disabled) {
    return (
      <div className="flex items-center gap-1">
        <PriorityDot priority={value} />
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1 group/edit">
        <PriorityDot priority={value} />

        <Pencil
          size={11}
          className="text-gray-300 opacity-0 group-hover/edit:opacity-100 transition-opacity shrink-0"
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-xl z-20 overflow-hidden min-w-[130px]">
          {PRIORITY_LIST.map((priority) => (
            <button
              key={priority}
              onClick={() => {
                setOpen(false);
                onChange(priority);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <PriorityDot priority={priority} />

              {priority === value && (
                <Check size={11} className="ml-auto text-blue-500 dark:text-blue-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const LABEL_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const getRandomLabelColor = (): string => {
  const randomIndex = Math.floor(Math.random() * LABEL_COLORS.length);

  return LABEL_COLORS[randomIndex];
};

export const EditableLabels = ({
  projectId,
  taskId,
  value,
  onChange,
  disabled = false,
}: {
  projectId: string;
  taskId: string;
  value: string[];
  onChange: (labelIds: string[]) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelName, setEditingLabelName] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const { data: labelsRes, isLoading } = useGetLabels(projectId);

  const createLabel = useCreateLabel();
  const updateLabel = useUpdateLabel();
  const deleteLabel = useDeleteLabel();
  const attachLabel = useAttachLabel();
  const removeLabel = useRemoveLabel();

  const allLabels = useMemo<LabelListItem[]>(() => labelsRes?.data ?? [], [labelsRes?.data]);

  const selectedLabels = useMemo(
    () => allLabels.filter((label) => value.includes(label.id)),
    [allLabels, value]
  );

  const availableLabels = useMemo(
    () =>
      allLabels.filter(
        (label) =>
          !value.includes(label.id) && label.name.toLowerCase().includes(search.toLowerCase())
      ),
    [allLabels, value, search]
  );

  const exactMatchExists = useMemo(
    () => allLabels.some((label) => label.name.toLowerCase() === search.trim().toLowerCase()),
    [allLabels, search]
  );

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
        setEditingLabelId(null);
        setEditingLabelName('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (editingLabelId) {
      editInputRef.current?.focus();
    }
  }, [editingLabelId]);

  const handleToggleLabel = (labelId: string) => {
    if (!taskId) {
      // Fallback to local state if no taskId
      if (value.includes(labelId)) {
        onChange(value.filter((id) => id !== labelId));
      } else {
        onChange([...value, labelId]);
      }
      return;
    }

    if (value.includes(labelId)) {
      // Remove label from task via API
      removeLabel.mutate(
        {
          projectId,
          taskId,
          labelId,
        },
        {
          onSuccess: () => {
            onChange(value.filter((id) => id !== labelId));
          },
        }
      );
    } else {
      // Attach label to task via API
      attachLabel.mutate(
        {
          projectId,
          taskId,
          labelId,
        },
        {
          onSuccess: () => {
            onChange([...value, labelId]);
          },
        }
      );
    }
  };

  const handleRemoveLabelFromTask = (labelId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!taskId) {
      // Fallback to local state
      onChange(value.filter((id) => id !== labelId));
      return;
    }

    // Remove label from task (does NOT delete the global label)
    removeLabel.mutate(
      {
        projectId,
        taskId,
        labelId,
      },
      {
        onSuccess: () => {
          onChange(value.filter((id) => id !== labelId));
        },
      }
    );
  };

  const startEditingLabel = (label: LabelListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLabelId(label.id);
    setEditingLabelName(label.name);
  };

  const cancelEditingLabel = () => {
    setEditingLabelId(null);
    setEditingLabelName('');
  };

  const handleUpdateLabel = (label: LabelListItem) => {
    const name = editingLabelName.trim();

    if (!name) {
      return;
    }

    if (name === label.name) {
      cancelEditingLabel();
      return;
    }

    // Update the global/project-level label
    updateLabel.mutate(
      {
        projectId,
        labelId: label.id,
        payload: {
          name,
          color: label.color,
        },
      },
      {
        onSuccess: () => {
          cancelEditingLabel();
        },
      }
    );
  };

  const handleDeleteLabel = (labelId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Delete the global/project-level label
    deleteLabel.mutate(
      {
        projectId,
        labelId,
      },
      {
        onSuccess: () => {
          if (editingLabelId === labelId) {
            cancelEditingLabel();
          }

          // If the label was attached to this task, update local state
          if (value.includes(labelId)) {
            onChange(value.filter((id) => id !== labelId));
          }
        },
      }
    );
  };

  const handleCreateLabel = () => {
    const name = search.trim();

    if (!name) return;

    createLabel.mutate(
      {
        projectId,
        payload: {
          name,
          color: getRandomLabelColor(),
        },
      },
      {
        onSuccess: (res) => {
          const newLabel = res?.data as LabelListItem | undefined;

          if (newLabel?.id && taskId) {
            // Automatically attach the newly created label to the task
            attachLabel.mutate(
              {
                projectId,
                taskId,
                labelId: newLabel.id,
              },
              {
                onSuccess: () => {
                  onChange([...value, newLabel.id]);
                },
              }
            );
          } else if (newLabel?.id) {
            onChange([...value, newLabel.id]);
          }

          setSearch('');
        },
      }
    );
  };

  if (disabled) {
    return (
      <div className="flex flex-wrap gap-1">
        {selectedLabels.map((label) => (
          <span
            key={label.id}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: `${label.color}22`,
              color: label.color,
            }}
          >
            {label.name}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="relative flex flex-wrap gap-1" ref={containerRef}>
      {selectedLabels.map((label) => {
        const isEditing = editingLabelId === label.id;

        if (isEditing) {
          return (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            >
              <input
                ref={editInputRef}
                value={editingLabelName}
                onChange={(e) => setEditingLabelName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateLabel(label);
                  }

                  if (e.key === 'Escape') {
                    cancelEditingLabel();
                  }
                }}
                className="w-20 min-w-0 bg-transparent outline-none text-xs text-gray-800 dark:text-slate-200"
                disabled={updateLabel.isPending}
              />

              <button
                type="button"
                onClick={() => handleUpdateLabel(label)}
                disabled={updateLabel.isPending || !editingLabelName.trim()}
                className="text-green-500 hover:text-green-600 disabled:opacity-50 transition-colors"
                title="Update label"
              >
                <Check size={12} />
              </button>

              <button
                type="button"
                onClick={cancelEditingLabel}
                disabled={updateLabel.isPending}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Cancel"
              >
                ×
              </button>
            </span>
          );
        }

        return (
          <span
            key={label.id}
            className="group/label inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: `${label.color}22`,
              color: label.color,
            }}
          >
            <span>{label.name}</span>

            <button
              type="button"
              onClick={(e) => handleRemoveLabelFromTask(label.id, e)}
              className="hover:text-red-500 transition-colors leading-none"
              title="Remove label from task"
            >
              ×
            </button>
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-0.5 text-xs text-gray-400 hover:text-blue-500 transition-colors px-1"
      >
        <Plus size={11} />
        Add
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-10 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg p-2">
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !exactMatchExists && search.trim()) {
                handleCreateLabel();
              }
            }}
            placeholder="Search or create..."
            className="w-full text-xs border border-gray-200 dark:border-slate-600 rounded px-2 py-1 mb-1.5 focus:outline-none focus:ring-1 focus:ring-blue-200 bg-transparent"
          />

          <div className="max-h-40 overflow-y-auto flex flex-col gap-0.5">
            {isLoading && <span className="text-xs text-gray-400 px-1">Loading...</span>}

            {/* Show ALL labels from the project, not just unselected ones */}
            {allLabels
              .filter((label) => label.name.toLowerCase().includes(search.toLowerCase()))
              .map((label) => {
                const isSelected = value.includes(label.id);

                return (
                  <div
                    key={label.id}
                    className="group/dropdown-label flex items-center justify-between text-xs px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleLabel(label.id)}
                      className="flex items-center gap-1.5 flex-1 text-left"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: label.color,
                        }}
                      />
                      <span className={isSelected ? 'font-semibold' : ''}>{label.name}</span>
                      {isSelected && <Check size={11} className="text-blue-500 ml-auto" />}
                    </button>
                  </div>
                );
              })}

            {!isLoading && search.trim() && !exactMatchExists && (
              <button
                type="button"
                onClick={handleCreateLabel}
                disabled={createLabel.isPending}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-500 text-left disabled:opacity-50"
              >
                <Plus size={11} />
                Create {`"${search.trim()}"`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
