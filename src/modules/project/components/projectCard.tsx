import { Project } from '../types/project';
import { Calendar } from 'lucide-react';
import { AssigneeAvatar } from '@/src/app/components/common/task';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md">
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

      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-gray-500">Progress</span>
          <span>{project.progress}%</span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

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

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{project.tasks}</span>

          <div className="flex items-center gap-1">
            <Calendar size={10} strokeWidth={2} />
            <span>{project.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
