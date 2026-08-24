import React from 'react';
import { Project } from '../data/mockData';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return { color: 'text-green-600', bg: 'bg-green-50' };
      case 'Running':
        return { color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'Planning':
        return { color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'Cancelled':
        return { color: 'text-red-600', bg: 'bg-red-50' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const statusStyle = getStatusStyle(project.status);

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0">
          {project.key}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">{project.name}</h4>
          <p className="text-xs text-gray-500 dark:text-slate-400">{project.organization}</p>
        </div>
      </div>
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${statusStyle.color} ${statusStyle.bg}`}
      >
        {project.status}
      </span>
    </div>
  );
};
