import { Pencil, Trash2 } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { getInitials } from '@/src/app/components/common/format';
import { ProjectDetailMember } from '@/src/types/project';
import { Project } from '../types/project';

interface ProjectInfoCardProps {
  project: Project & { id?: string };
  sprintsCount: number;
  ownerName: string;
  teamSize: number;
  members: ProjectDetailMember[] | undefined;
  isUpdatingProject: boolean;
  isRefreshingMembers: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onViewMembers: () => void;
}

const ProjectInfoCard = ({
  project,
  sprintsCount,
  ownerName,
  teamSize,
  members,
  isUpdatingProject,
  isRefreshingMembers,
  canEditProject,
  canDeleteProject,
  onEdit,
  onDelete,
  onViewMembers,
}: ProjectInfoCardProps) => (
  <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
    {isUpdatingProject && (
      <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm dark:bg-slate-900/70">
        <div className="flex flex-col items-center gap-2">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
          <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
            Updating project...
          </p>
        </div>
      </div>
    )}

    <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
          {project?.initials}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-bold text-gray-900 dark:text-slate-100">
              {project?.name}
            </h1>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {project?.status}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-gray-500 dark:text-slate-400">
            {project?.description || 'No project description available'}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {canEditProject && (
          <WpButton
            variant="secondary"
            size="sm"
            onClick={onEdit}
            className="!h-9 !w-9 !p-0"
            aria-label="Edit project"
          >
            <Pencil size={16} />
          </WpButton>
        )}

        {canDeleteProject && (
          <WpButton
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="!h-9 !w-9 !p-0 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            aria-label="Delete project"
          >
            <Trash2 size={16} />
          </WpButton>
        )}
      </div>
    </div>

    <div className="border-t border-gray-100 dark:border-slate-800" />

    <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 dark:divide-slate-800 sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
      <div className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-200">
          Created
        </p>
        <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
          {project?.date || '—'}
        </p>
      </div>

      <div className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-200">
          Total Sprints
        </p>
        <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
          {sprintsCount}
        </p>
      </div>

      <div className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-200">
          Project Owner
        </p>
        <p className="mt-2 truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
          {ownerName}
        </p>
      </div>

      <div className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-200">
          Team Size
        </p>
        <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
          {teamSize}
          <span className="ml-1 font-normal text-gray-500 dark:text-slate-400">members</span>
        </p>
      </div>

      <div className="col-span-2 p-5 sm:col-span-1">
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-200">
          Team Members
        </p>

        {isRefreshingMembers ? (
          <div className="flex h-8 items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-r-transparent" />
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              Updating...
            </span>
          </div>
        ) : members && members.length > 0 ? (
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {members.slice(0, 5).map((member, index) => (
                <div
                  key={member.user_id}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-sm dark:border-slate-900"
                  style={{
                    zIndex: 5 - index,
                    backgroundColor: member.color || '#64748b',
                  }}
                  title={member.full_name || member.username}
                >
                  {getInitials(member.full_name || member.username)}
                </div>
              ))}

              {members.length > 5 && (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-600 shadow-sm dark:border-slate-900 dark:bg-slate-700 dark:text-slate-200"
                  title={`${members.length - 5} more members`}
                >
                  +{members.length - 5}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onViewMembers}
              className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-slate-400">No members</p>
        )}
      </div>
    </div>
  </div>
);

export default ProjectInfoCard;
