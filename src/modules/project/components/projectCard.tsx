import { Project } from "../types/project";

interface ProjectCardProps {
  project: Project;
}

const avatarColors: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  yellow: "bg-yellow-500",
  indigo: "bg-indigo-500",
  red: "bg-red-500",
};

const ProjectCard =({ project }: ProjectCardProps)=> {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
            {project.initials}
          </div>

          <div>
            <h3 className="font-semibold text-xl">{project.name}</h3>
            <p className="text-xs text-gray-400">{project.code}</p>
          </div>
        </div>
<span
  className={`inline-flex h-6 items-center rounded-full px-3 text-xs font-medium ${
    project.status === "Active"
      ? "bg-green-100 text-green-700"
      : "bg-blue-100 text-blue-700"
  }`}
>
  {project.status}
</span>
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-gray-600 leading-6">
        {project.description}
      </p>

      {/* Progress */}
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-sm">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>

        <div className="h-2 rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.members.map((member, index) => (
            <div
              key={index}
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white ${
                avatarColors[member.color]
              }`}
            >
              {member.name}
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-500">
          {project.tasks} • {project.date}
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;