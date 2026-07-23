import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, Check, FileText, Link2, MoreHorizontal, Plus, X } from 'lucide-react';
import type { ColumnId, KanbanTask, Priority, SubTask } from '@/src/types/board';
import { colors } from '@/src/styles/colors';
import { AssigneeAvatar } from '../task';
import { ActivitySection } from './components/activity-section';
import { COLUMN_CONFIG, COLUMN_ORDER } from './components/badges';
import { DetailRow } from './components/detail-row';
import {
  EditableDate,
  EditableLabels,
  EditableNumber,
  EditablePriority,
  EditableText,
} from './components/editable-fields';
import { SubtasksSection } from './components/subtasks-section';

export interface TaskDetailDrawerProps {
  task: KanbanTask;
  onClose: () => void;
}

const useResizable = (initial: number, min: number, max: number) => {
  const [width, setWidth] = useState(initial);
  const dragging = useRef(false);

  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      dragging.current = true;
      const startX = event.clientX;
      const startWidth = width;

      const onMove = (moveEvent: MouseEvent) => {
        if (!dragging.current) return;
        const delta = startX - moveEvent.clientX;
        setWidth(Math.min(max, Math.max(min, startWidth + delta)));
      };

      const onUp = () => {
        dragging.current = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [width, min, max]
  );

  return { width, onMouseDown };
};

export const TaskDetailDrawer = ({ task, onClose }: TaskDetailDrawerProps) => {
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks ?? []);
  const [status, setStatus] = useState<ColumnId>(task.columnId);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [description, setDescription] = useState(task.description ?? '');
  const [editingDesc, setEditingDesc] = useState(false);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [labels, setLabels] = useState<string[]>(task.labels);
  const [dueDate, setDueDate] = useState(task.dueDate ?? '');
  const [startDate, setStartDate] = useState(task.startDate ?? '');
  const [storyPoints, setStoryPoints] = useState(task.storyPoints);
  const [sprint, setSprint] = useState(task.sprint ?? '');
  const [parent, setParent] = useState(task.parent ?? '');
  const [assignee, setAssignee] = useState(task.assigneeInitials);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const { width: rightWidth, onMouseDown: onDividerMouseDown } = useResizable(320, 240, 480);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-3"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]"
        style={{ maxWidth: '1100px', height: 'min(860px, 94vh)' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <FileText size={13} className="text-white" />
            </span>
            <span className="text-base font-bold text-blue-600">{task.id}</span>
            {task.sprint && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-sm font-medium text-gray-500">{task.sprint}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <MoreHorizontal size={17} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-6 border-r border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-5 leading-snug">{task.title}</h1>

            <div className="flex items-center gap-2 mb-6">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Plus size={14} /> Add child issue
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Link2 size={14} /> Link issue
              </button>
              <button className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
                <MoreHorizontal size={15} />
              </button>
            </div>

            <section className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-base font-semibold text-gray-800 mb-2">Description</p>
              {editingDesc ? (
                <div>
                  <textarea
                    autoFocus
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:border-blue-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setEditingDesc(false)}
                      className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white transition-colors"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setDescription(task.description ?? '');
                        setEditingDesc(false);
                      }}
                      className="px-4 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setEditingDesc(true)}
                  className="text-sm text-gray-600 leading-relaxed cursor-text rounded-lg px-3 py-2.5 -mx-3 hover:bg-gray-50 transition-colors min-h-[48px]"
                >
                  {description || <span className="text-gray-400">Add a description…</span>}
                </div>
              )}
            </section>

            <SubtasksSection subtasks={subtasks} onChange={setSubtasks} onOpenSubtask={() => {}} />

            <section className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-base font-semibold text-gray-800 mb-2">Linked work items</p>
              <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                + Add linked work item
              </button>
            </section>

            <ActivitySection items={task.activity ?? []} />
          </div>

          <div
            onMouseDown={onDividerMouseDown}
            className="w-1.5 shrink-0 cursor-col-resize hover:bg-blue-100 active:bg-blue-200 transition-colors group flex items-center justify-center"
            style={{ backgroundColor: 'transparent' }}
          >
            <div className="w-0.5 h-8 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors" />
          </div>

          <div className="shrink-0 overflow-y-auto bg-gray-50/60" style={{ width: rightWidth }}>
            <div className="px-5 py-5 border-b border-gray-300">
              <p className="text-base font-semibold text-gray-800 mb-2">Status</p>
              <div className="relative" ref={statusMenuRef}>
                <button
                  onClick={() => setShowStatusMenu((value) => !value)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold w-full justify-between transition-all shadow-sm border"
                  style={{
                    color: COLUMN_CONFIG[status].color,
                    backgroundColor: COLUMN_CONFIG[status].bg,
                    borderColor: `${COLUMN_CONFIG[status].dot}55`,
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLUMN_CONFIG[status].dot }}
                    />
                    {COLUMN_CONFIG[status].label}
                  </span>
                  <ChevronDown size={14} />
                </button>
                {showStatusMenu && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                    {COLUMN_ORDER.map((column) => (
                      <button
                        key={column}
                        onClick={() => {
                          setStatus(column);
                          setShowStatusMenu(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2.5 hover:bg-gray-50"
                        style={{
                          fontWeight: column === status ? 700 : 500,
                          color: COLUMN_CONFIG[column].color,
                          backgroundColor: column === status ? COLUMN_CONFIG[column].bg : undefined,
                        }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLUMN_CONFIG[column].dot }}
                        />
                        {COLUMN_CONFIG[column].label}
                        {column === status && <Check size={13} className="ml-auto" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-5 border-b border-gray-200">
              <p className="text-base font-semibold text-gray-800 mb-2">Details</p>

              <DetailRow label="Assignee">
                <div className="flex items-center gap-2 group/edit">
                  <AssigneeAvatar
                    initials={task.assigneeInitials}
                    color={task.assigneeColor}
                    size="sm"
                  />
                  <EditableText value={assignee} onChange={setAssignee} placeholder="Unassigned" />
                </div>
              </DetailRow>

              <DetailRow label="Reporter">
                {task.reporterInitials ? (
                  <div className="flex items-center gap-2">
                    <AssigneeAvatar
                      initials={task.reporterInitials}
                      color={task.reporterColor ?? colors.avatarIndigo}
                      size="sm"
                    />
                    <span className="text-sm text-gray-700">{task.reporter}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">None</span>
                )}
              </DetailRow>

              <DetailRow label="Priority">
                <EditablePriority value={priority} onChange={setPriority} />
              </DetailRow>

              <DetailRow label="Sprint">
                <EditableText value={sprint} onChange={setSprint} placeholder="No sprint" />
              </DetailRow>

              <DetailRow label="Labels">
                <EditableLabels value={labels} onChange={setLabels} />
              </DetailRow>

              <DetailRow label="Due date">
                <EditableDate value={dueDate} onChange={setDueDate} placeholder="Set due date" />
              </DetailRow>

              <DetailRow label="Start date">
                <EditableDate
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Set start date"
                />
              </DetailRow>

              <DetailRow label="Story pts">
                <EditableNumber value={storyPoints} onChange={setStoryPoints} />
              </DetailRow>

              <DetailRow label="Parent">
                <EditableText value={parent} onChange={setParent} placeholder="None" />
              </DetailRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
