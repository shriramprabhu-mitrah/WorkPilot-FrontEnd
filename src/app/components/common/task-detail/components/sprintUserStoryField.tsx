'use client';
import { useEffect, useRef, useState } from 'react';
import { Archive, Check, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useInfiniteGetSprints } from '@/src/modules/project/hooks/useSprint';
import { useInfiniteGetUserStories } from '@/src/modules/tasks/hooks/useUserStory';
import { logger } from '@/src/lib/utils/logger';
import { WpInput } from '../../input';
import { DetailRow } from './detail-row';

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
  const sprintListRef = useRef<HTMLDivElement>(null);
  const { sprints, isLoadingSprints, isFetchingNextSprints, hasNextSprints, fetchNextSprints } =
    useInfiniteGetSprints(
      projectId,
      {
        page_size: 7,
        search: debouncedSprintSearch,
      },
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

  useEffect(() => {
    const list = sprintListRef.current;
    if (!list || !showSprintMenu) return;
    const handleScroll = () => {
      const isNearBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 30;
      if (isNearBottom && hasNextSprints && !isFetchingNextSprints) {
        void fetchNextSprints();
      }
    };
    list.addEventListener('scroll', handleScroll);
    return () => {
      list.removeEventListener('scroll', handleScroll);
    };
  }, [showSprintMenu, hasNextSprints, isFetchingNextSprints, fetchNextSprints, sprints.length]);
  const changeSprint = async (id: string, name: string, successMessage: string) => {
    if (isUpdatingSprint) return;
    try {
      setIsUpdatingSprint(true);
      closeMenu();
      await handleUpdate({
        sprint_id: id,
        sprint: name,
      });
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
            <div className="p-2 border-b border-gray-200 dark:border-slate-700">
              <WpInput
                value={sprintSearch}
                onChange={(e) => setSprintSearch(e.target.value)}
                placeholder="Search sprint..."
              />
            </div>
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
            {isLoadingSprints && (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">Loading sprints...</div>
            )}

            {/* Sprint list with scroll pagination */}
            {!isLoadingSprints && (
              <div ref={sprintListRef} className="max-h-60 overflow-y-auto">
                {sprints.map((sprint) => {
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

                {isFetchingNextSprints && (
                  <div className="px-3 py-2 text-center text-xs text-gray-500">Loading more...</div>
                )}

                {sprints.length === 0 && (
                  <div className="px-3 py-3 text-sm text-gray-500 text-center">
                    No sprints found
                  </div>
                )}

                {!hasNextSprints && sprints.length > 0 && (
                  <div className="px-3 py-2 text-center text-xs text-gray-400">No more sprints</div>
                )}
              </div>
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
  const userStoryListRef = useRef<HTMLDivElement>(null);

  const {
    userStories,
    isLoadingUserStories,
    isFetchingNextUserStories,
    hasNextUserStories,
    fetchNextUserStories,
  } = useInfiniteGetUserStories(
    projectId,
    {
      page_size: 7,
      search: debouncedUserStorySearch,
    },
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

  useEffect(() => {
    const list = userStoryListRef.current;
    if (!list || !showUserStoryMenu) return;
    const handleScroll = () => {
      const isNearBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 30;
      if (isNearBottom && hasNextUserStories && !isFetchingNextUserStories) {
        void fetchNextUserStories();
      }
    };
    list.addEventListener('scroll', handleScroll);
    return () => {
      list.removeEventListener('scroll', handleScroll);
    };
  }, [
    showUserStoryMenu,
    hasNextUserStories,
    isFetchingNextUserStories,
    fetchNextUserStories,
    userStories.length,
  ]);

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

            {isLoadingUserStories && (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">
                Loading user stories...
              </div>
            )}

            {!isLoadingUserStories && (
              <div ref={userStoryListRef} className="max-h-60 overflow-y-auto">
                {userStories.map((story) => {
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

                {/* Loading next page */}
                {isFetchingNextUserStories && (
                  <div className="px-3 py-2 text-center text-xs text-gray-500">Loading more...</div>
                )}

                {userStories.length === 0 && (
                  <div className="px-3 py-3 text-sm text-gray-500 text-center">
                    No user stories found
                  </div>
                )}
                {!hasNextUserStories && userStories.length > 0 && (
                  <div className="px-3 py-2 text-center text-xs text-gray-400">
                    No more user stories
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
