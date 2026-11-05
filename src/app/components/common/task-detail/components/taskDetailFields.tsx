'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, User } from 'lucide-react';
import { colors } from '@/src/styles/colors';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useInfiniteGetProjectMembers } from '@/src/modules/project/hooks/useProject';
import { AssigneeAvatar } from '../../task';
import { WpButton } from '../../button';
import { WpInput } from '../../input';
import { DetailRow } from './detail-row';
import { getInitials } from '../../format';

export interface AssigneePatch {
  assigneeId: string;
  assigneeName?: string;
  assigneeInitials?: string;
  assigneeColor?: string;
}

interface AssigneeFieldProps {
  projectId: string;
  assigneeId: string;
  assigneeName: string;
  assigneeInitials: string;
  assigneeColor?: string;
  canEditTask: boolean;
  currentUserName?: string | null;
  isAssigning?: boolean;
  handleUpdate: (patch: AssigneePatch) => Promise<unknown> | void;
  handleAssignToMe: () => void;
}

export const AssigneeField = ({
  projectId,
  assigneeId,
  assigneeName,
  assigneeInitials,
  assigneeColor,
  canEditTask,
  currentUserName,
  isAssigning,
  handleUpdate,
  handleAssignToMe,
}: AssigneeFieldProps) => {
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const debouncedAssigneeSearch = useDebounce(assigneeSearch, 500);
  const assigneeMenuRef = useRef<HTMLDivElement>(null);
  const assigneeListRef = useRef<HTMLDivElement>(null);

  const {
    members,
    isLoadingMembers,
    isFetchingMembers,
    isFetchingNextMembers,
    hasNextMembers,
    fetchNextMembers,
  } = useInfiniteGetProjectMembers(
    projectId,
    {
      page_size: 7,
      name: debouncedAssigneeSearch,
    },
    !!projectId && showAssigneeMenu
  );

  // Close menu on outside click
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (assigneeMenuRef.current && !assigneeMenuRef.current.contains(event.target as Node)) {
        setShowAssigneeMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  // Infinite scroll pagination
  useEffect(() => {
    const list = assigneeListRef.current;

    if (!list || !showAssigneeMenu) return;

    const handleScroll = () => {
      const isNearBottom =
        list.scrollTop + list.clientHeight >= list.scrollHeight - 30;

      if (
        isNearBottom &&
        hasNextMembers &&
        !isFetchingNextMembers &&
        !isFetchingMembers
      ) {
        void fetchNextMembers();
      }
    };

    list.addEventListener('scroll', handleScroll);

    return () => {
      list.removeEventListener('scroll', handleScroll);
    };
  }, [
    showAssigneeMenu,
    hasNextMembers,
    isFetchingNextMembers,
    isFetchingMembers,
    fetchNextMembers,
    members.length,
  ]);

  const closeMenu = () => {
    setShowAssigneeMenu(false);
    setAssigneeSearch('');
  };

  return (
    <DetailRow label="Assignee">
      <div className="relative" ref={assigneeMenuRef}>
        <button
          type="button"
          disabled={!canEditTask}
          onClick={() => setShowAssigneeMenu((v) => !v)}
          className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors w-full text-left ${
            canEditTask
              ? 'hover:bg-gray-100 dark:hover:bg-slate-700'
              : 'cursor-default'
          }`}
        >
          {assigneeId ? (
            <AssigneeAvatar
              initials={assigneeInitials}
              color={assigneeColor || ''}
              size="sm"
            />
          ) : (
            <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <User size={12} className="text-gray-400" />
            </span>
          )}
          <span className="text-sm text-gray-700 dark:text-slate-300 truncate">
            {assigneeName || 'Unassigned'}
          </span>
          {canEditTask && (
            <ChevronDown
              size={12}
              className="ml-auto text-gray-400 dark:text-slate-500 shrink-0"
            />
          )}
        </button>

        {showAssigneeMenu && canEditTask && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-200 dark:border-slate-700">
              <WpInput
                value={assigneeSearch}
                onChange={(e) => setAssigneeSearch(e.target.value)}
                placeholder="Search assignee..."
              />
            </div>

            {/* Unassigned option */}
            {!isLoadingMembers && !isFetchingMembers && !assigneeSearch && (
              <WpButton
                type="button"
                variant="ghost"
                onClick={async () => {
                  closeMenu();
                  await handleUpdate({ assigneeId: '' });
                }}
                className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm text-gray-500 hover:bg-gray-50"
              >
                <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <User size={11} className="text-gray-400" />
                </span>
                Unassigned
              </WpButton>
            )}

            {/* Initial loading */}
            {isLoadingMembers && (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">
                Searching...
              </div>
            )}

            {/* Member list with scroll pagination */}
            {!isLoadingMembers && (
              <div
                ref={assigneeListRef}
                className="max-h-60 overflow-y-auto"
              >
                {members?.map((m) => {
                  const name = m.full_name ?? m.user?.name ?? '';

                  const displayName =
                    name ||
                    m.user?.email?.split('@')[0] ||
                    m.user?.email ||
                    'Unknown User';

                  const initials = getInitials(
                    name || m.user?.email?.split('@')[0] || 'U'
                  );

                  const color = m.color || '';

                  return (
                    <WpButton
                      key={m.user_id}
                      type="button"
                      variant="ghost"
                      onClick={async () => {
                        closeMenu();

                        await handleUpdate({
                          assigneeId: m.user_id,
                          assigneeName: displayName,
                          assigneeInitials: initials,
                          assigneeColor: color,
                        });
                      }}
                      className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100"
                    >
                      <AssigneeAvatar
                        initials={initials}
                        color={color}
                        size="sm"
                      />

                      <span className="truncate">{displayName}</span>

                      {m.user_id === assigneeId && (
                        <Check
                          size={12}
                          className="ml-auto text-blue-600 dark:text-blue-400 shrink-0"
                        />
                      )}
                    </WpButton>
                  );
                })}

                {/* Loading next page */}
                {isFetchingNextMembers && (
                  <div className="px-3 py-2 text-center text-xs text-gray-500">
                    Loading more...
                  </div>
                )}

                {/* Empty state */}
                {!isFetchingMembers && members?.length === 0 && (
                  <div className="px-3 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">
                    No members found
                  </div>
                )}

                {/* End of list */}
                {!hasNextMembers && (members?.length ?? 0) > 0 && (
                  <div className="px-3 py-2 text-center text-xs text-gray-400">
                    No more members
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {assigneeName !== currentUserName && (
        <WpButton
          variant="ghost"
          onClick={handleAssignToMe}
          disabled={isAssigning}
          className="!bg-transparent !border-0 !shadow-none !px-2 !py-1 text-sm text-gray-800 hover:!bg-transparent !ml-5"
        >
          {isAssigning ? 'Assigning...' : 'Assign to me'}
        </WpButton>
      )}
    </DetailRow>
  );
};

export interface ReporterPatch {
  reporterId: string;
  reporterName: string;
  reporterInitials: string;
  reporterColor: string;
}

interface ReporterFieldProps {
  projectId: string;
  reporterId: string;
  reporterName: string;
  reporterInitials: string;
  reporterColor?: string;
  canEditTask: boolean;
  handleUpdate: (patch: ReporterPatch) => Promise<unknown> | void;
}

export const ReporterField = ({
  projectId,
  reporterId,
  reporterName,
  reporterInitials,
  reporterColor,
  canEditTask,
  handleUpdate,
}: ReporterFieldProps) => {
  const [showReporterMenu, setShowReporterMenu] = useState(false);
  const [reporterSearch, setReporterSearch] = useState('');
  const debouncedReporterSearch = useDebounce(reporterSearch, 500);
  const reporterMenuRef = useRef<HTMLDivElement>(null);
  const reporterListRef = useRef<HTMLDivElement>(null);

  const {
    members: reporterMembers,
    isLoadingMembers: isLoadingReporterMembers,
    isFetchingMembers: isFetchingReporterMembers,
    isFetchingNextMembers: isFetchingNextReporterMembers,
    hasNextMembers: hasNextReporterMembers,
    fetchNextMembers: fetchNextReporterMembers,
  } = useInfiniteGetProjectMembers(
    projectId,
    {
      page_size: 7,
      name: debouncedReporterSearch,
    },
    !!projectId && showReporterMenu
  );

  // Close menu on outside click
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (reporterMenuRef.current && !reporterMenuRef.current.contains(event.target as Node)) {
        setShowReporterMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Infinite scroll pagination
  useEffect(() => {
    const list = reporterListRef.current;

    if (!list || !showReporterMenu) return;

    const handleScroll = () => {
      const isNearBottom =
        list.scrollTop + list.clientHeight >= list.scrollHeight - 30;

      if (
        isNearBottom &&
        hasNextReporterMembers &&
        !isFetchingNextReporterMembers &&
        !isFetchingReporterMembers
      ) {
        void fetchNextReporterMembers();
      }
    };

    list.addEventListener('scroll', handleScroll);

    return () => {
      list.removeEventListener('scroll', handleScroll);
    };
  }, [
    showReporterMenu,
    hasNextReporterMembers,
    isFetchingNextReporterMembers,
    isFetchingReporterMembers,
    fetchNextReporterMembers,
    reporterMembers.length,
  ]);

  const closeMenu = () => {
    setShowReporterMenu(false);
    setReporterSearch('');
  };

  return (
    <DetailRow label="Reporter">
      <div className="relative" ref={reporterMenuRef}>
        <button
          type="button"
          disabled={!canEditTask}
          onClick={() => setShowReporterMenu((v) => !v)}
          className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors w-full text-left ${
            canEditTask
              ? 'hover:bg-gray-100 dark:hover:bg-slate-700'
              : 'cursor-default'
          }`}
        >
          {reporterId ? (
            <AssigneeAvatar
              initials={reporterInitials || getInitials(reporterName)}
              color={reporterColor || colors.avatarIndigo}
              size="sm"
            />
          ) : (
            <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center shrink-0">
              <User size={12} className="text-gray-400 dark:text-slate-400" />
            </span>
          )}
          <span className="text-sm text-gray-700 dark:text-slate-300 truncate">
            {reporterName || 'None'}
          </span>
          {canEditTask && (
            <ChevronDown size={12} className="ml-auto text-gray-400 dark:text-slate-500 shrink-0" />
          )}
        </button>

        {showReporterMenu && canEditTask && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-200 dark:border-slate-700">
              <WpInput
                autoFocus
                value={reporterSearch}
                onChange={(e) => setReporterSearch(e.target.value)}
                placeholder="Search reporter..."
              />
            </div>

            {/* Initial loading */}
            {isLoadingReporterMembers && (
              <div className="px-3 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">
                Searching...
              </div>
            )}

            {/* Member list with scroll pagination */}
            {!isLoadingReporterMembers && (
              <div
                ref={reporterListRef}
                className="max-h-60 overflow-y-auto"
              >
                {reporterMembers?.map((m) => {
                  const name = m.full_name ?? m.user?.name ?? '';

                  const displayName =
                    name ||
                    m.user?.email?.split('@')[0] ||
                    m.user?.email ||
                    'Unknown User';

                  const initials = getInitials(
                    name || m.user?.email?.split('@')[0] || 'U'
                  );

                  const color = m.color || '';

                  return (
                    <WpButton
                      key={m.user_id}
                      type="button"
                      variant="ghost"
                      onClick={async () => {
                        closeMenu();

                        await handleUpdate({
                          reporterId: m.user_id,
                          reporterName: displayName,
                          reporterInitials: initials,
                          reporterColor: color,
                        });
                      }}
                      className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100"
                    >
                      <AssigneeAvatar
                        initials={initials}
                        color={color}
                        size="sm"
                      />

                      <span className="truncate">{displayName}</span>

                      {m.user_id === reporterId && (
                        <Check
                          size={12}
                          className="ml-auto text-blue-600 dark:text-blue-400 shrink-0"
                        />
                      )}
                    </WpButton>
                  );
                })}

                {/* Loading next page */}
                {isFetchingNextReporterMembers && (
                  <div className="px-3 py-2 text-center text-xs text-gray-500">
                    Loading more...
                  </div>
                )}

                {/* Empty state */}
                {!isFetchingReporterMembers &&
                  reporterMembers?.length === 0 && (
                    <div className="px-3 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">
                      No members found
                    </div>
                  )}

                {/* End of list */}
                {!hasNextReporterMembers &&
                  reporterMembers.length > 0 && (
                    <div className="px-3 py-2 text-center text-xs text-gray-400">
                      No more members
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </DetailRow>
  );
};