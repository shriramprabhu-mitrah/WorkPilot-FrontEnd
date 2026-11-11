interface AssigneeMember {
  id?: string;
  user_id?: string;
  full_name?: string;
  color?: string | null;
  user?: {
    id?: string;
    full_name?: string;
  };
}

interface AssigneeAvatarsProps {
  displayMembers: AssigneeMember[];
  assigneeIdFilter: string[];
  toggleAssigneeFilter: (userId: string, memberName: string) => void;
  getInitials: (name: string) => string;
}

export function AssigneeAvatars({
  displayMembers,
  assigneeIdFilter,
  toggleAssigneeFilter,
  getInitials,
}: AssigneeAvatarsProps) {
  const visibleMembers = displayMembers.slice(0, 5);
  const remainingCount = displayMembers.length - 5;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleMembers.map((member, index) => {
          const memberName = member.full_name || member.user?.full_name || 'Unknown';
          const userId = member.user_id || member.user?.id || member.id || '';
          const isSelected = assigneeIdFilter.includes(userId);

          return (
            <button
              key={userId || index}
              type="button"
              onClick={() => toggleAssigneeFilter(userId, memberName)}
              className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold text-white transition-all hover:scale-110 sm:h-8 sm:w-8 ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-300'
                  : 'border-white dark:border-slate-900'
              }`}
              style={{
                zIndex: visibleMembers.length - index,
                backgroundColor: member.color || '#64748b',
              }}
              title={`${memberName}${isSelected ? ' (filtering)' : ''}`}
            >
              {getInitials(memberName)}
            </button>
          );
        })}

        {remainingCount > 0 && (
          <div
            className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-600 dark:border-slate-900 dark:bg-slate-700 dark:text-slate-200 sm:h-8 sm:w-8"
            style={{ zIndex: 0 }}
            title={`${remainingCount} more members`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
}
