'use client';

import { useEffect, useRef, useState } from 'react';
import { Archive, Check, ChevronDown, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { colors } from '@/src/styles/colors';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useGetProjectMembers } from '@/src/modules/project/hooks/useProject';
import { useGetSprints } from '@/src/modules/project/hooks/useSprint';
import { AssigneeAvatar } from '../../task';
import { WpButton } from '../../button';
import { WpInput } from '../../input';
import { DetailRow } from './detail-row';
import { useGetUserStories } from '@/src/modules/tasks/hooks/useUserStory';
import { logger } from '@/src/lib/utils/logger';

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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

  const { members, isLoadingMembers, isFetchingMembers } = useGetProjectMembers(
    projectId,
    { page: 1, page_size: 10, name: debouncedAssigneeSearch },
    showAssigneeMenu
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

  return (
    <DetailRow label="Assignee">
      <div className="relative" ref={assigneeMenuRef}>
        <button
          disabled={!canEditTask}
          onClick={() => setShowAssigneeMenu((v) => !v)}
          className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors w-full text-left ${
            canEditTask ? 'hover:bg-gray-100 dark:hover:bg-slate-700' : 'cursor-default'
          }`}
        >
          {assigneeId ? (
            <AssigneeAvatar initials={assigneeInitials} color={assigneeColor || ''} size="sm" />
          ) : (
            <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <User size={12} className="text-gray-400" />
            </span>
          )}
          <span className="text-sm text-gray-700 dark:text-slate-300 truncate">
            {assigneeName || 'Unassigned'}
          </span>
          {canEditTask && (
            <ChevronDown size={12} className="ml-auto text-gray-400 dark:text-slate-500 shrink-0" />
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

            {/* Loading */}
            {(isLoadingMembers || isFetchingMembers) && (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">Searching...</div>
            )}

            {/* Member list */}
            {!isLoadingMembers &&
              !isFetchingMembers &&
              members?.map((m) => {
                const name = m.full_name ?? m.user?.name ?? '';
                const displayName =
                  name || m.user?.email?.split('@')[0] || m.user?.email || 'Unknown User';
                const initials = getInitials(name || m.user?.email?.split('@')[0] || 'U');
                const color = m.color || '';
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
                        assigneeInitials: initials,
                        assigneeColor: color,
                      });
                    }}
                    className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100"
                  >
                    <AssigneeAvatar initials={initials} color={color} size="sm" />
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

            {/* No results */}
            {!isLoadingMembers &&
              !isFetchingMembers &&
              assigneeSearch &&
              (!members || members.length === 0) && (
                <div className="px-3 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">
                  No members found
                </div>
              )}

            {/* Unassigned option */}
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

  const {
    members: reporterMembers,
    isLoadingMembers: isLoadingReporterMembers,
    isFetchingMembers: isFetchingReporterMembers,
  } = useGetProjectMembers(
    projectId,
    { page: 1, page_size: 10, name: debouncedReporterSearch },
    showReporterMenu
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

  return (
    <DetailRow label="Reporter">
      <div className="relative" ref={reporterMenuRef}>
        <button
          disabled={!canEditTask}
          onClick={() => setShowReporterMenu((v) => !v)}
          className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors w-full text-left ${
            canEditTask ? 'hover:bg-gray-100 dark:hover:bg-slate-700' : 'cursor-default'
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
                const color = m.color || '';
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
                        reporterInitials: initials,
                        reporterColor: color,
                      });
                    }}
                    className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100"
                  >
                    <AssigneeAvatar initials={initials} color={color} size="sm" />
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

            {/* No results */}
            {!isLoadingReporterMembers &&
              !isFetchingReporterMembers &&
              reporterSearch &&
              (!reporterMembers || reporterMembers.length === 0) && (
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
  sprintName: string;
  canEditTask: boolean;
  handleUpdate: (patch: { sprint_id: string; sprint: string }) => Promise<unknown> | void;
}

export const SprintField = ({
  projectId,
  sprintId,
  sprintName,
  canEditTask,
  handleUpdate,
}: SprintFieldProps) => {
  const [showSprintMenu, setShowSprintMenu] = useState(false);
  const [sprintSearch, setSprintSearch] = useState('');
  const [isUpdatingSprint, setIsUpdatingSprint] = useState(false);
  const debouncedSprintSearch = useDebounce(sprintSearch, 500);
  const sprintMenuRef = useRef<HTMLDivElement>(null);

  const { sprints, isLoadingSprints, isFetchingSprints } = useGetSprints(
    projectId,
    { page: 1, page_size: 10, search: debouncedSprintSearch },
    !!projectId && showSprintMenu
  );

  // Close menu on outside click
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (sprintMenuRef.current && !sprintMenuRef.current.contains(event.target as Node)) {
        setShowSprintMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeMenu = () => {
    setShowSprintMenu(false);
    setSprintSearch('');
  };

  const changeSprint = async (id: string, name: string, successMessage: string) => {
    if (isUpdatingSprint) return;
    try {
      setIsUpdatingSprint(true);
      closeMenu();
      await handleUpdate({ sprint_id: id, sprint: name });
      toast.success(successMessage);
    } catch {
      toast.error('Failed to update sprint');
    } finally {
      setIsUpdatingSprint(false);
    }
  };

  return (
    <DetailRow label="Sprint">
      <div className="relative" ref={sprintMenuRef}>
        <button
          type="button"
          disabled={isUpdatingSprint || !canEditTask}
          onClick={() => {
            if (isUpdatingSprint || !canEditTask) return;
            setShowSprintMenu((v) => !v);
          }}
          className={`flex items-center gap-2 px-2 py-1 rounded-lg w-full text-left ${
            !canEditTask
              ? 'cursor-default'
              : isUpdatingSprint
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <span className="text-sm text-gray-700 dark:text-slate-300 truncate">
            {sprintName || 'No sprint'}
          </span>
          {canEditTask && <ChevronDown size={12} className="ml-auto text-gray-400 shrink-0" />}
        </button>

        {showSprintMenu && !isUpdatingSprint && canEditTask && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-200 dark:border-slate-700">
              <WpInput
                value={sprintSearch}
                onChange={(e) => setSprintSearch(e.target.value)}
                placeholder="Search sprint..."
              />
            </div>

            {/* No sprint / Backlog */}
            <button
              type="button"
              onClick={() => {
                if (!sprintId) return closeMenu();
                changeSprint('', '', 'Sprint removed');
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

            {/* Sprint list */}
            {!isLoadingSprints &&
              !isFetchingSprints &&
              sprints?.map((sprint) => {
                const isSelected = sprint.id === sprintId;
                return (
                  <button
                    key={sprint.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) return closeMenu();
                      changeSprint(sprint.id, sprint.name, 'Sprint updated');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-slate-200 text-left hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <span className="truncate">{sprint.name}</span>
                    {isSelected && <Check size={13} className="ml-auto text-blue-600 shrink-0" />}
                  </button>
                );
              })}

            {/* No results */}
            {!isLoadingSprints && !isFetchingSprints && sprints?.length === 0 && (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">No sprints found</div>
            )}
          </div>
        )}
      </div>
    </DetailRow>
  );
};

interface UserStoryFieldProps {
  projectId: string;
  userStoryId: string;
  userStoryTitle: string;
  canEditTask: boolean;
  canViewUserStories: boolean;
  // parent's handleUpdate: optimistic update + rollback, throws on failure
  handleUpdate: (patch: {
    user_story_id: string;
    user_story_title: string;
  }) => Promise<unknown> | void;
}

export const UserStoryField = ({
  projectId,
  userStoryId,
  userStoryTitle,
  canEditTask,
  canViewUserStories,
  handleUpdate,
}: UserStoryFieldProps) => {
  const [showUserStoryMenu, setShowUserStoryMenu] = useState(false);
  const [userStorySearch, setUserStorySearch] = useState('');
  const [isUpdatingUserStory, setIsUpdatingUserStory] = useState(false);
  const debouncedUserStorySearch = useDebounce(userStorySearch, 500);
  const userStoryMenuRef = useRef<HTMLDivElement>(null);

  const { userStories, isLoadingUserStories, isFetchingUserStories } = useGetUserStories(
    projectId,
    { page: 1, page_size: 10, search: debouncedUserStorySearch },
    !!projectId && canViewUserStories && showUserStoryMenu
  );

  // Close menu on outside click
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (userStoryMenuRef.current && !userStoryMenuRef.current.contains(event.target as Node)) {
        setShowUserStoryMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeMenu = () => {
    setShowUserStoryMenu(false);
    setUserStorySearch('');
  };

  return (
    <DetailRow label="User Story">
      <div className="relative" ref={userStoryMenuRef}>
        <button
          type="button"
          disabled={isUpdatingUserStory || !canEditTask}
          onClick={() => {
            if (isUpdatingUserStory || !canEditTask) return;
            setShowUserStoryMenu((v) => !v);
          }}
          className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors w-full text-left ${
            isUpdatingUserStory || !canEditTask
              ? 'opacity-60 cursor-not-allowed'
              : 'hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <span className="text-sm text-gray-700 dark:text-slate-300 truncate">
            {userStoryTitle || 'No user story'}
          </span>

          {canEditTask && (
            <ChevronDown size={12} className="ml-auto text-gray-400 dark:text-slate-500 shrink-0" />
          )}
        </button>

        {showUserStoryMenu && !isUpdatingUserStory && canEditTask && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-[100] overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-200 dark:border-slate-700">
              <WpInput
                value={userStorySearch}
                onChange={(e) => setUserStorySearch(e.target.value)}
                placeholder="Search user story..."
                autoFocus
              />
            </div>

            {/* Loading */}
            {(isLoadingUserStories || isFetchingUserStories) && (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">Searching...</div>
            )}

            {/* User stories */}
            {!isLoadingUserStories &&
              !isFetchingUserStories &&
              userStories?.map((story) => {
                const isSelected = story.id === userStoryId;

                return (
                  <button
                    key={story.id}
                    type="button"
                    onClick={async () => {
                      if (isSelected) return closeMenu();

                      try {
                        setIsUpdatingUserStory(true);
                        closeMenu();
                        // handleUpdate does the optimistic update and rolls back on error
                        await handleUpdate({
                          user_story_id: story.id,
                          user_story_title: story.title,
                        });
                      } catch (error) {
                        logger.log('Failed to update user story', error);
                      } finally {
                        setIsUpdatingUserStory(false);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <span className="truncate">{story.title}</span>
                    {isSelected && <Check size={13} className="ml-auto text-blue-600 shrink-0" />}
                  </button>
                );
              })}

            {/* No results */}
            {!isLoadingUserStories && !isFetchingUserStories && userStories?.length === 0 && (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">
                No user stories found
              </div>
            )}
          </div>
        )}
      </div>
    </DetailRow>
  );
};
