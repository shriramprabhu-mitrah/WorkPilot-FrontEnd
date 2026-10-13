interface AssigneeMember {
  id?: string;
  user_id?: string;
  full_name?: string;
  color?: string;
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
  return (
    <div className="flex -space-x-2">
      {displayMembers.length > 0 ? (
        displayMembers.slice(0, 5).map((member) => {
          const memberName = member.full_name || member.user?.full_name || 'Unknown';

          const userId = member.user_id || member.user?.id || member.id || '';

          const initials = getInitials(memberName);
          const isSelected = assigneeIdFilter.includes(userId);

          return (
            <button
              key={member.id || member.user_id || member.user?.id}
              type="button"
              onClick={() => toggleAssigneeFilter(userId, memberName)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold transition-all hover:scale-110 cursor-pointer ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-white'
              }`}
              style={{ backgroundColor: member.color }}
              title={`${memberName}${isSelected ? ' (filtering)' : ''}`}
            >
              {initials}
            </button>
          );
        })
      ) : (
        <span className="text-xs text-gray-400 dark:text-gray-500">No team members</span>
      )}
    </div>
  );
}
