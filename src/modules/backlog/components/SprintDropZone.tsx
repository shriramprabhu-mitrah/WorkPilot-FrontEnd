'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Inbox, Link } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { colors } from '@/src/styles/colors';
import { SprintDetail } from '@/src/types/project';
import { UserStoryResponse } from '@/src/types/userstories';
import { DraggableUserStory } from './DraggableUserStory';
import { useOrgNavigation } from '@/src/hooks/useOrgNavigation';

interface SprintDropZoneProps {
  sprint: SprintDetail;
  userStories: UserStoryResponse[];
  projectId: string;
  onStoryClick?: (story: UserStoryResponse) => void;
}

export const SprintDropZone = ({
  sprint,
  userStories,
  projectId,
  onStoryClick,
}: SprintDropZoneProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { setNodeRef, isOver } = useDroppable({
    id: `sprint-${sprint.id}`,
    data: { sprintId: sprint.id },
  });
  const { push } = useOrgNavigation();
  const sprintStories = userStories.filter((story) => story.sprint_id === sprint.id);

  return (
    <div
      className={`rounded-xl border overflow-hidden mb-3 transition-all duration-200 ${
        isOver
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 shadow-xl ring-2 ring-blue-300 ring-opacity-50 scale-[1.02]'
          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
      }`}
    >
      <div
        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 cursor-pointer transition-all select-none border-b ${
          isOver
            ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : 'hover:bg-gray-50 dark:hover:bg-slate-700/50 border-gray-100 dark:border-slate-700'
        }`}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className={`transition-colors shrink-0 ${isOver ? 'text-blue-500' : 'text-gray-400 dark:text-slate-500'}`}>
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            push(`/projects/sprints?sprintId=${sprint.id}`);
          }}
          className={`font-semibold text-sm truncate cursor-pointer transition-colors ${
            isOver ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          {sprint.name}
        </span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 transition-all ${
            isOver
              ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 scale-110'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
          }`}
        >
          {sprintStories.length} {sprintStories.length === 1 ? 'story' : 'stories'}
        </span>
        {sprint.start_date && sprint.end_date && (
          <span className={`hidden sm:inline text-xs shrink-0 transition-colors ${isOver ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`}>
            {new Date(sprint.start_date).toLocaleDateString()} -{' '}
            {new Date(sprint.end_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {isOpen && (
        <div ref={setNodeRef} className="min-h-[100px]">
          {isOver && (
            <div className="px-3 sm:px-4 pb-2 pt-2">
              <div className="border-2 border-dashed border-blue-400 rounded-lg p-4 text-center bg-white bg-opacity-60 backdrop-blur-sm animate-pulse">
                <div className="flex items-center justify-center gap-2">
                  <Inbox className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-700 font-semibold">Drop user story here</p>
                </div>
              </div>
            </div>
          )}

          {sprintStories.length === 0 && !isOver ? (
            <div className="flex flex-col items-center justify-center py-6 px-4">
              <Inbox className="w-8 h-8 text-gray-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-slate-400 text-center">
                No user stories assigned to this sprint
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 text-center">
                Drag stories here to assign them
              </p>
            </div>
          ) : (
            sprintStories.map((story) => (
              <DraggableUserStory
                key={story.id}
                story={story}
                projectId={projectId}
                onStoryClick={onStoryClick}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
