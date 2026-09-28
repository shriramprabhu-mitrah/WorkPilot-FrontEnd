import { Project } from '../types/project';
import { Calendar } from 'lucide-react';
import { AssigneeAvatar } from '@/src/app/components/common/task';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  view?: 'grid' | 'list';
}

const ProjectCard = ({ project, onClick, view = 'grid' }: ProjectCardProps) => {
  if (view === 'list') {
    return (
      <div
        onClick={onClick}
        className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all hover:border-blue-500 hover:shadow-md cursor-pointer"
      >
        {/* Left */}
        <div className="flex flex-1 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">
            {project.initials}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200">
              {project.name}
            </h3>
            <p className="mt-1 text-xs text-gray-400 dark:text-slate-200">{project.code}</p>
            <p className="mt-2 max-w-xl text-sm text-gray-500 dark:text-slate-200">
              {project.description}
            </p>
          </div>
        </div>

        {/* Center */}
        <div className="mx-10 flex items-center gap-10">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-slate-200">Created</p>
            <div className="mt-1 flex items-center justify-center gap-1 text-sm dark:text-slate-200">
              <Calendar size={15} />
              {project.date}
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-slate-200">Sprints</p>
            <p className="mt-1 font-semibold dark:text-slate-200">{project.sprint_count}</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex justify-end">
          <span
            className={`inline-flex h-6 items-center rounded-full px-3 text-xs font-medium ${
              project.status === 'Active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            }`}
          >
            {project.status}
          </span>
        </div>
      </div>
    );
  }
  return (
    <div
      onClick={onClick}
      className="group w-full cursor-pointer rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
            {project.initials}
          </div>

          <div className="min-w-0">
            <h3
              className="truncate text-base font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400"
              title={project.name}
            >
              {project.name}
            </h3>

            <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-400">{project.code}</p>
          </div>
        </div>

        {/* Status */}
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            project.status === 'Active'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              project.status === 'Active' ? 'bg-green-500' : 'bg-blue-500'
            }`}
          />
          {project.status}
        </span>
      </div>

      {/* Description */}
      <p className="mt-3 line-clamp-2 text-sm leading-5 text-gray-500 dark:text-slate-300">
        {project.description || 'No description available.'}
      </p>

      {/* Members */}
      <div className="mt-4 flex items-center">
        <div className="flex -space-x-2">
          {project.members.slice(0, 3).map((member, index) => (
            <AssigneeAvatar key={index} initials={member.name} color={member.color} size="sm" />
          ))}

          {project.members.length > 3 && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-semibold text-gray-600 dark:border-gray-800 dark:bg-gray-700 dark:text-slate-200">
              +{project.members.length - 3}
            </div>
          )}
        </div>

        {project.members.length > 0 && (
          <span className="ml-2 text-xs text-gray-400 dark:text-slate-400">
            {project.members.length} {project.members.length === 1 ? 'member' : 'members'}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] text-gray-400 dark:text-slate-500">Sprints</p>
          <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-slate-100">
            {project.sprint_count}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-gray-400 dark:text-slate-500">Created</p>
          <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-slate-100">
            {project.date}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
