import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { Sprint } from '../types/project';

interface SprintListProps {
  sprints: Sprint[];
  isLoading: boolean;
  isRefreshingSprints: boolean;
  expandedSprint: string | null;
  canCreateSprint: boolean;
  canEditSprint: boolean;
  onAddSprint: () => void;
  onSprintClick: (sprint: Sprint) => void;
  onToggleExpand: (sprintId: string) => void;
  onStartSprint: (sprint: Sprint) => void;
  onCompleteSprint: (sprint: Sprint) => void;
}

const SprintList = ({
  sprints,
  isLoading,
  isRefreshingSprints,
  expandedSprint,
  canCreateSprint,
  canEditSprint,
  onAddSprint,
  onSprintClick,
  onToggleExpand,
  onStartSprint,
  onCompleteSprint,
}: SprintListProps) => {
  return (
    <div className="mt-5 space-y-3">
      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />

            <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
              {isRefreshingSprints ? 'Loading updated sprints...' : 'Loading sprint details...'}
            </p>
          </div>
        </div>
      ) : sprints.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-2 rounded-2xl bg-blue-50 p-2 dark:bg-blue-900/20">
              <Image
                src="/images/agile method-amico.svg"
                alt="No Sprints"
                width={240}
                height={240}
                className="h-60 w-60"
              />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900 dark:text-slate-200">
              No Sprints Found
            </h2>

            <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-slate-400">
              No sprints have been created for this project yet.
            </p>

            <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
              Create your first sprint to start planning and tracking work.
            </p>

            {canCreateSprint && (
              <WpButton variant="primary" size="md" onClick={onAddSprint} className="mt-7">
                + Add Sprint
              </WpButton>
            )}
          </div>
        </div>
      ) : (
        sprints.map((sprint) => {
          const isExpanded = expandedSprint === sprint.id;

          return (
            <div
              key={sprint.id}
              className={`
            overflow-hidden rounded-xl border bg-white
            shadow-sm transition-all duration-200
            dark:bg-slate-900
            ${
              isExpanded
                ? 'border-blue-200 shadow-md dark:border-blue-900/60'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md dark:border-slate-700 dark:hover:border-slate-600'
            }
          `}
            >
              {/* Sprint header */}
              <div className="flex w-full items-center justify-between gap-4 p-5">
                <button
                  type="button"
                  onClick={() => onSprintClick(sprint)}
                  className="group flex min-w-0 flex-1 items-start text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3
                        title={sprint.name}
                        className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-slate-200 dark:group-hover:text-blue-400"
                      >
                        {sprint.name}
                      </h3>

                      <span
                        className={`
                      shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold
                      ${
                        sprint.status === 'Active'
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : sprint.status === 'Completed'
                            ? 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      }
                    `}
                      >
                        {sprint.status}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-slate-100">
                      <span>{sprint.startDate || 'No start date'}</span>
                      <span className="text-gray-300 dark:text-slate-100">→</span>
                      <span>{sprint.endDate || 'No end date'}</span>
                    </div>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-2">
                  {sprint.status === 'Planned' && canEditSprint && (
                    <WpButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onStartSprint(sprint)}
                    >
                      Start Sprint
                    </WpButton>
                  )}

                  {sprint.status === 'Active' && canEditSprint && (
                    <WpButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onCompleteSprint(sprint)}
                    >
                      Complete Sprint
                    </WpButton>
                  )}

                  <button
                    type="button"
                    aria-label={isExpanded ? 'Collapse sprint' : 'Expand sprint'}
                    onClick={() => onToggleExpand(sprint.id)}
                    className="
                  rounded-lg p-2
                  text-gray-400 transition-all
                  hover:bg-gray-100 hover:text-gray-700
                  dark:text-slate-400
                  dark:hover:bg-slate-800
                  dark:hover:text-slate-200
                "
                  >
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Expanded sprint details */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/70 p-5 dark:border-slate-700 dark:bg-slate-800/40">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {/* Start Date */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-200">
                        Start Date
                      </p>

                      <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-200">
                        {sprint.startDate || '-'}
                      </p>
                    </div>

                    {/* End Date */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-200">
                        End Date
                      </p>

                      <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-200">
                        {sprint.endDate || '-'}
                      </p>
                    </div>

                    {/* Tasks */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-200">
                        Tasks
                      </p>

                      <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-200">
                        {sprint.tasks}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default SprintList;