'use client';

import { useEffect, useRef, useState } from 'react';
import { Archive, Check, ChevronDown, User } from 'lucide-react';
import { colors } from '@/src/styles/colors';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useGetProjectMembers } from '@/src/modules/project/hooks/useProject';
import { AssigneeAvatar } from '../../task';
import { DetailRow } from '../../task-detail/components/detail-row';
import { WpButton } from '../../button';
import { WpInput } from '../../input';
import { useGetSprints } from '@/src/modules/project/hooks/useSprint';

// Same helpers the parent has (copied unchanged)
const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const AVATAR_COLORS = [
  colors.avatarBlue,
  colors.avatarGreen,
  colors.avatarPink,
  colors.avatarAmber,
  colors.avatarIndigo,
];

const getMemberColor = (userId: string) =>
  AVATAR_COLORS[userId.charCodeAt(0) % AVATAR_COLORS.length];

interface AssigneeFieldProps {
  projectId: string;
  assigneeId: string;
  assigneeName: string;
  assigneeInitials: string;
  assigneeColor?: string;
  canEditUserStory: boolean;
  currentUserId?: string | null;
  handleUpdate: (patch: {
    assigneeId?: string;
    assigneeName?: string;
    assigneeColor?: string;
  }) => Promise<void> | void;
  handleAssignToMe: () => void;
}

export const AssigneeField = ({
  projectId,
  assigneeId,
  assigneeName,
  assigneeInitials,
  assigneeColor,
  canEditUserStory,
  currentUserId,
  handleUpdate,
  handleAssignToMe,
}: AssigneeFieldProps) => {
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const debouncedAssigneeSearch = useDebounce(assigneeSearch, 500);
  const assigneeMenuRef = useRef<HTMLDivElement>(null);

  const { members, isLoadingMembers, isFetchingMembers } = useGetProjectMembers(
    projectId,
    { page: 1, page_size: 10, name: debouncedAssigneeSearch },
    showAssigneeMenu
  );

  // Moved from the parent's document mousedown handler (assignee branch)
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (assigneeMenuRef.current && !assigneeMenuRef.current.contains(event.target as Node)) {
        setShowAssigneeMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <DetailRow label="Assignee">
      <div className="relative" ref={assigneeMenuRef}>
        <button
          disabled={!canEditUserStory}
          onClick={() => {
            if (!canEditUserStory) return;
            setShowAssigneeMenu((v) => !v);
          }}
          className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors w-full text-left ${
            !canEditUserStory ? 'cursor-default' : 'hover:bg-gray-100'
          }`}
        >
          {assigneeId ? (
            <AssigneeAvatar initials={assigneeInitials} color={assigneeColor || ''} size="sm" />
          ) : (
            <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <User size={12} className="text-gray-400" />
            </span>
          )}
          <span className="text-sm text-gray-700 truncate">{assigneeName || 'Unassigned'}</span>
          {canEditUserStory && <ChevronDown size={12} className="ml-auto text-gray-400 shrink-0" />}
        </button>
        {showAssigneeMenu && canEditUserStory && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <WpInput
                value={assigneeSearch}
                onChange={(e) => setAssigneeSearch(e.target.value)}
                placeholder="Search assignee..."
              />
            </div>
            {(isLoadingMembers || isFetchingMembers) && (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">Searching...</div>
            )}
            {!isLoadingMembers &&
              !isFetchingMembers &&
              members?.map((m) => {
                const name = m.full_name ?? m.user?.name ?? '';
                const displayName =
                  name || m.user?.email?.split('@')[0] || m.user?.email || 'Unknown User';
                const initials = getInitials(name || m.user?.email?.split('@')[0] || 'U');
                const color = m.color || getMemberColor(m.user_id);
                return (
                  <WpButton
                    key={m.user_id}
                    type="button"
                    variant="ghost"
                    onClick={async () => {
                      setShowAssigneeMenu(false);
                      setAssigneeSearch('');
                      await handleUpdate({
                        assigneeId: m.user_id,
                        assigneeName: displayName,
                        assigneeColor: color,
                      });
                    }}
                    className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm hover:bg-gray-50 text-gray-900"
                  >
                    <AssigneeAvatar initials={initials} color={color} size="sm" />
                    <span className="truncate">{displayName}</span>
                    {m.user_id === assigneeId && (
                      <Check size={12} className="ml-auto text-blue-600 shrink-0" />
                    )}
                  </WpButton>
                );
              })}
            {!isLoadingMembers && !isFetchingMembers && !assigneeSearch && (
              <WpButton
                type="button"
                variant="ghost"
                onClick={async () => {
                  setShowAssigneeMenu(false);
                  setAssigneeSearch('');
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
          </div>
        )}
      </div>
      {canEditUserStory && assigneeId !== currentUserId && (
        <WpButton
          variant="ghost"
          onClick={handleAssignToMe}
          className="!bg-transparent !border-0 !shadow-none !px-2 !py-1 text-sm text-gray-800 hover:!bg-transparent !ml-5"
        >
          Assign to me
        </WpButton>
      )}
    </DetailRow>
  );
};

interface ReporterFieldProps {
  projectId: string;
  reporterId: string;
  reporterName: string;
  reporterInitials: string;
  reporterColor?: string;
  canEditUserStory: boolean;
  handleUpdate: (patch: { reporterId?: string; reporterName?: string }) => Promise<void> | void;
}

export const ReporterField = ({
  projectId,
  reporterId,
  reporterName,
  reporterInitials,
  reporterColor,
  canEditUserStory,
  handleUpdate,
}: ReporterFieldProps) => {
  const [showReporterMenu, setShowReporterMenu] = useState(false);
  const [reporterSearch, setReporterSearch] = useState('');
  const debouncedReporterSearch = useDebounce(reporterSearch, 500);
  const reporterMenuRef = useRef<HTMLDivElement>(null);

  const {
    members: reporterMembers,
    isLoadingMembers: isLoadingReporterMembers,
    isFetchingMembers: isFetchingReporterMembers,
  } = useGetProjectMembers(
    projectId,
    { page: 1, page_size: 10, name: debouncedReporterSearch },
    showReporterMenu
  );

  // Moved from the parent's document mousedown handler (reporter branch)
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (reporterMenuRef.current && !reporterMenuRef.current.contains(event.target as Node)) {
        setShowReporterMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <DetailRow label="Reporter">
      <div className="relative" ref={reporterMenuRef}>
        <button
          disabled={!canEditUserStory}
          onClick={() => {
            if (!canEditUserStory) return;
            setShowReporterMenu((v) => !v);
          }}
          className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors w-full text-left ${
            !canEditUserStory ? 'cursor-default' : 'hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          {reporterId ? (
            <AssigneeAvatar initials={reporterInitials} color={reporterColor || ''} size="sm" />
          ) : (
            <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center shrink-0">
              <User size={12} className="text-gray-400 dark:text-slate-400" />
            </span>
          )}
          <span className="text-sm text-gray-700 dark:text-slate-300 truncate">{reporterName}</span>
          {canEditUserStory && (
            <ChevronDown size={12} className="ml-auto text-gray-400 dark:text-slate-500 shrink-0" />
          )}
        </button>

        {showReporterMenu && canEditUserStory && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-200 dark:border-slate-700">
              <WpInput
                value={reporterSearch}
                onChange={(e) => setReporterSearch(e.target.value)}
                placeholder="Search reporter..."
              />
            </div>

            {/* Loading */}
            {(isLoadingReporterMembers || isFetchingReporterMembers) && (
              <div className="px-3 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">
                Searching...
              </div>
            )}

            {/* Member list */}
            {!isLoadingReporterMembers &&
              !isFetchingReporterMembers &&
              reporterMembers?.map((m) => {
                const name = m.full_name ?? m.user?.name ?? '';
                const displayName =
                  name || m.user?.email?.split('@')[0] || m.user?.email || 'Unknown User';
                const initials = getInitials(name || m.user?.email?.split('@')[0] || 'U');
                const color = m.color || getMemberColor(m.user_id);
                const isSelected = m.user_id === reporterId;
                return (
                  <WpButton
                    key={m.user_id}
                    type="button"
                    variant="ghost"
                    onClick={async () => {
                      setShowReporterMenu(false);
                      setReporterSearch('');
                      await handleUpdate({
                        reporterId: m.user_id,
                        reporterName: displayName,
                      });
                    }}
                    className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100"
                  >
                    <AssigneeAvatar initials={initials} color={color} size="sm" />
                    <span className="truncate">{displayName}</span>
                    {isSelected && (
                      <Check
                        size={12}
                        className="ml-auto text-blue-600 dark:text-blue-400 shrink-0"
                      />
                    )}
                  </WpButton>
                );
              })}

            {/* No results */}
            {!isLoadingReporterMembers &&
              !isFetchingReporterMembers &&
              reporterSearch &&
              reporterMembers?.length === 0 && (
                <div className="px-3 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">
                  No members found
                </div>
              )}
          </div>
        )}
      </div>
    </DetailRow>
  );
};

interface SprintFieldProps {
  projectId: string;
  sprintId: string;
  canEditUserStory: boolean;
  // stays in the parent because handleMoveToBacklog also writes to it
  selectedSprintName: string;
  setSelectedSprintName: (name: string) => void;
  handleUpdate: (patch: { sprintId?: string }) => Promise<void> | void;
  handleMoveToBacklog: () => Promise<void> | void;
}

export const SprintField = ({
  projectId,
  sprintId,
  canEditUserStory,
  selectedSprintName,
  setSelectedSprintName,
  handleUpdate,
  handleMoveToBacklog,
}: SprintFieldProps) => {
  const [sprintSearch, setSprintSearch] = useState('');
  const [showSprintMenu, setShowSprintMenu] = useState(false);
  const [isUpdatingSprint, setIsUpdatingSprint] = useState(false);
  const debouncedSprintSearch = useDebounce(sprintSearch, 500);
  const sprintMenuRef = useRef<HTMLDivElement>(null);

  const { sprints, isLoadingSprints, isFetchingSprints } = useGetSprints(
    projectId,
    {
      page: 1,
      page_size: 10,
      search: debouncedSprintSearch,
    },
    true
  );

  return (
    <DetailRow label="Sprint">
      <div className="relative" ref={sprintMenuRef}>
        {/* Selected Sprint */}
        <button
          type="button"
          disabled={isUpdatingSprint || !canEditUserStory}
          onClick={() => {
            if (isUpdatingSprint || !canEditUserStory) return;
            setShowSprintMenu((v) => !v);
          }}
          className={`flex items-center gap-2 px-2 py-1 rounded-lg w-full text-left ${
            !canEditUserStory
              ? 'cursor-default'
              : isUpdatingSprint
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:bg-gray-100'
          }`}
        >
          <span className="text-sm text-gray-700 truncate">
            {selectedSprintName ||
              (sprintId
                ? sprints?.find((sprint) => sprint.id === sprintId)?.name || 'Sprint assigned'
                : 'No sprint')}
          </span>

          {canEditUserStory && <ChevronDown size={12} className="ml-auto text-gray-400 shrink-0" />}
        </button>

        {/* Sprint Dropdown */}
        {showSprintMenu && !isUpdatingSprint && canEditUserStory && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-200">
              <WpInput
                value={sprintSearch}
                onChange={(e) => setSprintSearch(e.target.value)}
                placeholder="Search sprint..."
              />
            </div>

            {/* No sprint / Backlog option */}
            <button
              type="button"
              disabled={isUpdatingSprint}
              onClick={async () => {
                if (isUpdatingSprint) return;
                if (!sprintId) {
                  setShowSprintMenu(false);
                  setSprintSearch('');
                  return;
                }
                try {
                  setIsUpdatingSprint(true);
                  setShowSprintMenu(false);
                  setSprintSearch('');
                  setSelectedSprintName('');
                  await handleMoveToBacklog();
                } finally {
                  setIsUpdatingSprint(false);
                }
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-b border-gray-100 dark:border-slate-700 ${
                !sprintId
                  ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <Archive size={13} className="text-gray-400 shrink-0" />
              <span className="truncate">No sprint (Backlog)</span>
              {!sprintId && <Check size={13} className="ml-auto text-blue-600 shrink-0" />}
            </button>

            {/* Loading */}
            {(isLoadingSprints || isFetchingSprints) && (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">Searching...</div>
            )}

            {!isLoadingSprints &&
              !isFetchingSprints &&
              sprints?.map((sprint) => {
                const isSelected = sprint.id === sprintId;
                return (
                  <button
                    key={sprint.id}
                    type="button"
                    disabled={isUpdatingSprint}
                    onClick={async () => {
                      if (isUpdatingSprint) return;
                      if (isSelected) {
                        setShowSprintMenu(false);
                        setSprintSearch('');
                        return;
                      }
                      const previousSprintName =
                        selectedSprintName ||
                        (sprintId
                          ? sprints?.find((s) => s.id === sprintId)?.name || 'Sprint assigned'
                          : 'No sprint');

                      try {
                        setIsUpdatingSprint(true);
                        setShowSprintMenu(false);
                        setSprintSearch('');
                        setSelectedSprintName(sprint.name);
                        await handleUpdate({
                          sprintId: sprint.id,
                        });
                      } catch {
                        setSelectedSprintName(previousSprintName);
                      } finally {
                        setIsUpdatingSprint(false);
                      }
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 text-left ${
                      isUpdatingSprint ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{sprint.name}</span>

                    {isSelected && <Check size={13} className="ml-auto text-blue-600 shrink-0" />}
                  </button>
                );
              })}

            {/* No Results */}
            {!isLoadingSprints && !isFetchingSprints && sprints?.length === 0 && (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">No sprints found</div>
            )}
          </div>
        )}
      </div>
    </DetailRow>
  );
};
