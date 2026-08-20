import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, GitBranch, Plus } from 'lucide-react';
import type { SubTask } from '@/src/types/board';
import { colors } from '@/src/styles/colors';
import { AssigneeAvatar } from '../../task';
import { PriorityDot, StatusBadge, STATUS_CYCLE } from './badges';

export const SubtasksSection = ({
  subtasks,
  onChange,
  onOpenSubtask,
}: {
  subtasks: SubTask[];
  onChange: (updated: SubTask[]) => void;
  onOpenSubtask: (sub: SubTask) => void;
}) => {
  const [open, setOpen] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const newInputRef = useRef<HTMLInputElement>(null);
  const doneCount = subtasks.filter((subtask) => subtask.status === 'done').length;
  const progress = subtasks.length ? Math.round((doneCount / subtasks.length) * 100) : 0;

  useEffect(() => {
    if (creating) newInputRef.current?.focus();
  }, [creating]);

  const cycleStatus = (id: string) => {
    onChange(
      subtasks.map((subtask) => {
        if (subtask.id !== id) return subtask;
        const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(subtask.status) + 1) % STATUS_CYCLE.length];
        return { ...subtask, status: next };
      })
    );
  };

  const createSubtask = () => {
    const title = newTitle.trim();
    if (!title) {
      setCreating(false);
      return;
    }

    const newSubtask: SubTask = {
      id: `SUB-${Date.now()}`,
      title,
      status: 'todo',
      priority: 'Medium',
      assigneeInitials: '',
      assigneeColor: colors.avatarIndigo,
      labels: [],
      activity: [],
    };

    onChange([...subtasks, newSubtask]);
    setNewTitle('');
    setCreating(false);
  };

  return (
    <section className="mb-6 pb-6 border-b border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setOpen((value) => !value)}
          className="flex items-center gap-1.5 text-base font-semibold text-gray-800 hover:text-gray-600 transition-colors"
        >
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          Tasks
          <span className="text-sm font-normal text-gray-400 ml-1">
            ({doneCount}/{subtasks.length})
          </span>
        </button>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        >
          <Plus size={14} /> Create
        </button>
      </div>

      {subtasks.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: progress === 100 ? '#22c55e' : colors.primary,
              }}
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0 w-14 text-right">{progress}% Done</span>
        </div>
      )}

      {open && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {subtasks.length > 0 && (
            <div
              className="grid text-sm font-semibold text-gray-500 border-b border-gray-200 px-3 py-2.5 bg-gray-50"
              style={{ gridTemplateColumns: '1fr 90px 36px 110px' }}
            >
              <span>Title</span>
              <span>Priority</span>
              <span>As.</span>
              <span>Status</span>
            </div>
          )}

          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="grid items-center border-b border-gray-100 last:border-0 px-3 py-3 hover:bg-blue-50/40 transition-colors cursor-pointer group"
              style={{ gridTemplateColumns: '1fr 90px 36px 110px' }}
              onClick={() => onOpenSubtask(subtask)}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <GitBranch size={12} className="text-blue-400 shrink-0" />
                <span className="text-xs font-semibold text-blue-500 shrink-0">{subtask.id}</span>
                <span
                  className={`text-sm truncate ${
                    subtask.status === 'done'
                      ? 'line-through text-gray-400'
                      : 'text-gray-700 group-hover:text-blue-600'
                  }`}
                >
                  {subtask.title}
                </span>
              </div>
              <div onClick={(event) => event.stopPropagation()}>
                <PriorityDot priority={subtask.priority} />
              </div>
              <div onClick={(event) => event.stopPropagation()}>
                <AssigneeAvatar
                  initials={subtask.assigneeInitials}
                  color={subtask.assigneeColor}
                  size="sm"
                />
              </div>
              <div onClick={(event) => event.stopPropagation()}>
                <StatusBadge status={subtask.status} onClick={() => cycleStatus(subtask.id)} />
              </div>
            </div>
          ))}

          {creating && (
            <div className="px-3 py-2.5 border-t border-gray-100 bg-blue-50/30">
              <input
                ref={newInputRef}
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') createSubtask();
                  if (event.key === 'Escape') {
                    setNewTitle('');
                    setCreating(false);
                  }
                }}
                onBlur={createSubtask}
                placeholder="What needs to be done?"
                className="w-full text-sm border border-blue-400 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              />
              <p className="text-[10px] text-gray-400 mt-1 ml-1">Enter to save · Esc to cancel</p>
            </div>
          )}

          {subtasks.length === 0 && !creating && (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-gray-400">No child tickets yet.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
