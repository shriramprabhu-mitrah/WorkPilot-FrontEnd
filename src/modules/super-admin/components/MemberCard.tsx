import React from 'react';
import { Member } from '../data/mockData';

interface MemberCardProps {
  member: Member;
}

const avatarColors = [
  'bg-blue-500',
  'bg-pink-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-teal-500',
  'bg-rose-500',
  'bg-indigo-500',
];

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (id: string) => {
    const index = parseInt(id, 10) % avatarColors.length;
    return avatarColors[index];
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={`w-10 h-10 rounded-full ${getAvatarColor(member.id)} flex items-center justify-center text-white font-bold text-sm shrink-0`}
        >
          {getInitials(member.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">{member.name}</h4>
          <p className="text-xs text-gray-500 dark:text-slate-400">{member.role}</p>
        </div>
      </div>
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
          member.status === 'Active'
            ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
            : 'text-gray-400 dark:text-slate-400 bg-gray-50 dark:bg-slate-700'
        }`}
      >
        {member.status}
      </span>
    </div>
  );
};
