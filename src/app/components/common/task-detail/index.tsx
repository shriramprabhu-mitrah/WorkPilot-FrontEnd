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
import { useResize } from '@/src/hooks/useResize';
import { taskService } from '@/src/services/tasks';
import { logger } from '@/src/lib/utils/logger';

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
  const [taskData, setTaskData] = useState({
    subtasks: task.subtasks ?? [],
    status: task.columnId,
    description: task.description ?? '',
    priority: task.priority,
    labels: task.labels,
    dueDate: task.dueDate ?? '',
    startDate: task.startDate ?? '',
    storyPoints: task.storyPoints,
    sprint: task.sprint ?? '',
    parent: task.parent ?? '',
    assignee: task.assigneeInitials,
    assigneeColor: task.assigneeColor,
  });

  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef<string | null>(null);

  useEffect(() => {
    if (hasFetched.current === task.taskId) return;

    hasFetched.current = task.taskId ?? null;
    const fetchDetail = async () => {
      if (!task.projectId || !task.taskId) return;

      try {
        setIsLoading(true);
        const res = await taskService.getTaskById(task.projectId, task.taskId);
        if (res.data) {
          const d = res.data;
          const assigneeName = d.assignee_name ?? '';
          const initials = assigneeName
            ? assigneeName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : task.assigneeInitials;
          setTaskData((prev) => ({
            ...prev,
            description: d.description ?? prev.description,
            priority: d.priority
              ? ((d.priority.charAt(0).toUpperCase() +
                  d.priority.slice(1).toLowerCase()) as Priority)
              : prev.priority,
            dueDate: d.due_date ? d.due_date.split('T')[0] : prev.dueDate,
            storyPoints: d.story_points ?? prev.storyPoints,
            sprint: d.sprint_name ?? prev.sprint,
            assignee: initials,
            assigneeColor: task.assigneeColor,
          }));
        }
      } catch (error) {
        logger.log('Failed to fetch task detail', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [task.taskId, task.projectId]);

  const [uiState, setUiState] = useState({
    showStatusMenu: false,
    editingDesc: false,
  });

  const { width: screenWidth } = useResize();
  const isMobile = screenWidth < 640;
  const [mobileTab, setMobileTab] = useState<'content' | 'details'>('content');
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const { width: rightWidth, onMouseDown: onDividerMouseDown } = useResizable(320, 240, 480);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setUiState((prev) => ({ ...prev, showStatusMenu: false }));
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
        className="relative bg-white w-full sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]"
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
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Mobile tab switcher */}
        <div className="flex sm:hidden border-b border-gray-200 shrink-0">
          <button
            onClick={() => setMobileTab('content')}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              mobileTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setMobileTab('details')}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              mobileTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            Details
          </button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <div className="flex flex-col items-center gap-2">
                <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            </div>
          )}
          <div
            className={`flex-1 overflow-y-auto px-4 sm:px-8 py-6 border-r border-gray-200 ${
              mobileTab === 'details' ? 'hidden sm:block' : 'block'
            }`}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-5 leading-snug">{task.title}</h1>

            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Plus size={14} /> Add child issue
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Link2 size={14} /> Link issue
              </button>
            </div>

            <section className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-base font-semibold text-gray-800 mb-2">Description</p>
              {uiState.editingDesc ? (
                <div>
                  <textarea
                    autoFocus
                    value={taskData.description}
                    onChange={(event) =>
                      setTaskData((prev) => ({ ...prev, description: event.target.value }))
                    }
                    rows={4}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:border-blue-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setUiState((prev) => ({ ...prev, editingDesc: false }))}
                      className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white transition-colors"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setTaskData((prev) => ({ ...prev, description: task.description ?? '' }));
                        setUiState((prev) => ({ ...prev, editingDesc: false }));
                      }}
                      className="px-4 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setUiState((prev) => ({ ...prev, editingDesc: true }))}
                  className="text-sm text-gray-600 leading-relaxed cursor-text rounded-lg px-3 py-2.5 -mx-3 hover:bg-gray-50 transition-colors min-h-[48px]"
                >
                  {taskData.description || (
                    <span className="text-gray-400">Add a description…</span>
                  )}
                </div>
              )}
            </section>

            <SubtasksSection
              subtasks={taskData.subtasks}
              onChange={(subtasks) => setTaskData((prev) => ({ ...prev, subtasks }))}
              onOpenSubtask={() => {}}
            />

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
            className="hidden sm:flex w-1.5 shrink-0 cursor-col-resize hover:bg-blue-100 active:bg-blue-200 transition-colors group items-center justify-center"
            style={{ backgroundColor: 'transparent' }}
          >
            <div className="w-0.5 h-8 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors" />
          </div>

          <div
            className={`overflow-y-auto bg-gray-50/60 ${
              mobileTab === 'content' ? 'hidden sm:block sm:shrink-0' : 'block w-full sm:shrink-0'
            }`}
            style={{ width: isMobile ? undefined : rightWidth }}
          >
            <div className="px-5 py-5 border-b border-gray-300">
              <p className="text-base font-semibold text-gray-800 mb-2">Status</p>
              <div className="relative" ref={statusMenuRef}>
                <button
                  onClick={() =>
                    setUiState((prev) => ({ ...prev, showStatusMenu: !prev.showStatusMenu }))
                  }
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold w-full justify-between transition-all shadow-sm border"
                  style={{
                    color: COLUMN_CONFIG[taskData.status].color,
                    backgroundColor: COLUMN_CONFIG[taskData.status].bg,
                    borderColor: `${COLUMN_CONFIG[taskData.status].dot}55`,
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLUMN_CONFIG[taskData.status].dot }}
                    />
                    {COLUMN_CONFIG[taskData.status].label}
                  </span>
                  <ChevronDown size={14} />
                </button>
                {uiState.showStatusMenu && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                    {COLUMN_ORDER.map((column) => (
                      <button
                        key={column}
                        onClick={() => {
                          setTaskData((prev) => ({ ...prev, status: column }));
                          setUiState((prev) => ({ ...prev, showStatusMenu: false }));
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2.5 hover:bg-gray-50"
                        style={{
                          fontWeight: column === taskData.status ? 700 : 500,
                          color: COLUMN_CONFIG[column].color,
                          backgroundColor:
                            column === taskData.status ? COLUMN_CONFIG[column].bg : undefined,
                        }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLUMN_CONFIG[column].dot }}
                        />
                        {COLUMN_CONFIG[column].label}
                        {column === taskData.status && <Check size={13} className="ml-auto" />}
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
                    initials={taskData.assignee}
                    color={taskData.assigneeColor}
                    size="sm"
                  />
                  <EditableText
                    value={taskData.assignee}
                    onChange={(assignee) => setTaskData((prev) => ({ ...prev, assignee }))}
                    placeholder="Unassigned"
                  />
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
                <EditablePriority
                  value={taskData.priority}
                  onChange={(priority) => setTaskData((prev) => ({ ...prev, priority }))}
                />
              </DetailRow>

              <DetailRow label="Sprint">
                <EditableText
                  value={taskData.sprint}
                  onChange={(sprint) => setTaskData((prev) => ({ ...prev, sprint }))}
                  placeholder="No sprint"
                />
              </DetailRow>

              <DetailRow label="Labels">
                <EditableLabels
                  value={taskData.labels}
                  onChange={(labels) => setTaskData((prev) => ({ ...prev, labels }))}
                />
              </DetailRow>

              <DetailRow label="Due date">
                <EditableDate
                  value={taskData.dueDate}
                  onChange={(dueDate) => setTaskData((prev) => ({ ...prev, dueDate }))}
                  placeholder="Set due date"
                />
              </DetailRow>

              <DetailRow label="Start date">
                <EditableDate
                  value={taskData.startDate}
                  onChange={(startDate) => setTaskData((prev) => ({ ...prev, startDate }))}
                  placeholder="Set start date"
                />
              </DetailRow>

              <DetailRow label="Story pts">
                <EditableNumber
                  value={taskData.storyPoints}
                  onChange={(storyPoints) => setTaskData((prev) => ({ ...prev, storyPoints }))}
                />
              </DetailRow>

              <DetailRow label="Parent">
                <EditableText
                  value={taskData.parent}
                  onChange={(parent) => setTaskData((prev) => ({ ...prev, parent }))}
                  placeholder="None"
                />
              </DetailRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
