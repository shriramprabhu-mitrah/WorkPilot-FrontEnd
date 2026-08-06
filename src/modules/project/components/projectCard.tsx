import { Project } from '../types/project';
import { Calendar } from 'lucide-react';
import { AssigneeAvatar } from '@/src/app/components/common/task';
import { WpButton } from '@/src/app/components/common/button';

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
        className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-500 hover:shadow-md cursor-pointer"
      >
        {/* Left */}
        <div className="flex flex-1 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">
            {project.initials}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
            <p className="mt-1 text-xs text-gray-400">{project.code}</p>
            <p className="mt-2 max-w-xl text-sm text-gray-500">{project.description}</p>
          </div>
        </div>

        {/* Center */}
        <div className="mx-10 flex items-center gap-10">
          <div className="text-center">
            <p className="text-xs text-gray-500">Created</p>
            <div className="mt-1 flex items-center justify-center gap-1 text-sm">
              <Calendar size={15} />
              {project.date}
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">Sprints</p>
            <p className="mt-1 font-semibold">{project.tasks}</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex justify-end">
          <span
            className={`inline-flex h-6 items-center rounded-full px-3 text-xs font-medium ${
              project.status === 'Active'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
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
      className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md"
    >
      <div className="flex justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
            {project.initials}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-700 transition-colors hover:text-blue-700">
              {project.name}
            </h3>
            <p className="text-xs text-gray-400">{project.code}</p>
          </div>
        </div>
        <span
          className={`inline-flex h-6 items-center rounded-full px-3 text-xs font-medium ${
            project.status === 'Active'
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {project.status}
        </span>
      </div>

      <p className="mb-4 line-clamp-2 mt-2 text-sm leading-relaxed text-gray-500">
        {project.description}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.members.slice(0, 3).map((member, index) => (
            <AssigneeAvatar key={index} initials={member.name} color={member.color} size="sm" />
          ))}

          {project.members.length > 3 && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[11px] font-medium text-gray-600">
              +{project.members.length - 3}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-4 border-gray-100">
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500 mr-2">Sprints</p>
            <p className="mt-1 text-xs text-gray-500 mr-2">{project.tasks}</p>
          </div>

          <div className="" />

          <div className="flex-2 text-center">
            <p className="text-xs text-gray-500">Created</p>
            <p className="mt-1 text-xs text-gray-500">{project.date}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
