'use client';
import ProjectCard from '../projectCard';
import { useState, useMemo } from 'react';
import { ProjectFilter, filters } from '@/src/app/components/common/enum';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { Project } from '../../types/project';
import { useRouter } from 'next/navigation';
import { useCreateProject, useGetProjects } from '../../hooks/useProject';
import { CreateProjectPayload, Project as ApiProject } from '@/src/types/project';
import { useAppDispatch } from '@/src/store';
import { setSelectedProject } from '@/src/store/slices/project';
import { useDebounce } from '@/src/hooks/useDebounce';

// Helper function to map API project to UI project format
const mapApiProjectToUiProject = (apiProject: ApiProject): Project => {
  return {
    name: apiProject.name,
    description: apiProject.description || 'No description added.',
    initials: apiProject?.name
      ?.trim()
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    code: apiProject.key,
    status:
      apiProject.status === 'active'
        ? 'Active'
        : apiProject.status === 'on_hold'
          ? 'On Hold'
          : apiProject.status === 'completed'
            ? 'Completed'
            : apiProject.status === 'archived'
              ? 'Archived'
              : 'Active',
    progress: 0,
    members: [],
    tasks: '0',
    date: apiProject.created_at
      ? new Date(apiProject.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '',
  };
};

export const PROJECT_STATUS_API_MAP = {
  [ProjectFilter.ACTIVE]: 'active',
  [ProjectFilter.PLANNING]: 'planning',
  [ProjectFilter.ON_HOLD]: 'on_hold',
  [ProjectFilter.COMPLETED]: 'completed',
  [ProjectFilter.CANCELLED]: 'cancelled',
  [ProjectFilter.ARCHIVED]: 'archived',
} as const;

const ProjectPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ProjectFilter>(ProjectFilter.ALL);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { createProjectAsync, isCreatingProject } = useCreateProject();
  const debouncedSearch = useDebounce(searchTerm, 500);

  const {
    projects: apiProjects,
    isLoadingProjects,
    refetchProjects,
  } = useGetProjects({
    name: debouncedSearch,
    status:
      selectedFilter === ProjectFilter.ALL ? undefined : PROJECT_STATUS_API_MAP[selectedFilter],
  });

  // Convert API projects to UI format
  const allProjects = useMemo((): Project[] => {
    if (!apiProjects || !Array.isArray(apiProjects)) return [];
    return apiProjects.map(mapApiProjectToUiProject);
  }, [apiProjects]);

  // Create a mapping of project codes to API projects for easy lookup
  const apiProjectsMap = useMemo(() => {
    if (!apiProjects || !Array.isArray(apiProjects)) return new Map<string, ApiProject>();
    return new Map(apiProjects.map((proj: ApiProject) => [proj.key, proj]));
  }, [apiProjects]);

  // Filter and search projects
  const displayedProjects = useMemo(() => {
    // Apply sort
    const sorted = [...allProjects].sort((a, b) =>
      sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );

    return sorted;
  }, [allProjects, selectedFilter, searchTerm, sortOrder]);

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;

    try {
      const payload: CreateProjectPayload = {
        name: projectName,
        description: description || undefined,
      };

      await createProjectAsync(payload);

      // Refetch the projects list to get the updated data
      await refetchProjects();

      // Reset form
      setProjectName('');
      setDescription('');
      setIsModalOpen(false);
    } catch (error) {}
  };

  const handleProjectClick = (project: Project, apiProject: ApiProject) => {
    dispatch(setSelectedProject(apiProject));

    router.push('/projects/sprints');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-0.5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[25px] font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-gray-500">
            {isLoadingProjects
              ? 'Loading projects...'
              : `${displayedProjects.length} projects across your workspace`}
          </p>
        </div>
        <WpButton size="sm" onClick={() => setIsModalOpen(true)}>
          + New Project
        </WpButton>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <WpInput
          type="text"
          placeholder="Search projects..."
          icon={<Search size={15} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none"
        />

        <div className="flex items-center gap-2">
          {filters.map((statusFilter) => (
            <WpButton
              key={statusFilter}
              size="sm"
              variant={selectedFilter === statusFilter ? 'primary' : 'secondary'}
              className={selectedFilter === statusFilter ? '' : 'text-gray-600 hover:text-gray-700'}
              onClick={() => setSelectedFilter(statusFilter)}
            >
              {statusFilter}
            </WpButton>
          ))}
        </div>
        <WpButton
          variant="secondary"
          size="sm"
          leftIcon={<SlidersHorizontal size={16} />}
          onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
        >
          Sort {sortOrder === 'asc' ? '↑' : '↓'}
        </WpButton>
      </div>

      {isLoadingProjects ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-gray-500">Loading projects...</p>
          </div>
        </div>
      ) : displayedProjects.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-500">
              {searchTerm || selectedFilter !== ProjectFilter.ALL
                ? 'No projects found matching your criteria'
                : 'No projects yet. Create your first project to get started!'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {displayedProjects.map((project) => {
            const apiProject = apiProjectsMap.get(project.code);
            return (
              <ProjectCard
                key={project.code}
                project={project}
                onClick={() => apiProject && handleProjectClick(project, apiProject)}
              />
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-[512px] overflow-hidden rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <h2 className="text-[25px] font-bold text-gray-900">New Project</h2>

              <WpButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="!p-2 text-gray-400 hover:text-gray-600"
                leftIcon={<X size={18} />}
              />
            </div>

            {/* Modal Body */}
            <div className="space-y-5 px-6 py-6">
              <div>
                <WpInput
                  id="project-name"
                  label="Project name"
                  placeholder="e.g. WorkPilot Mobile App"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  showRequired
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the project goal and scope..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <WpButton
                variant="secondary"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={isCreatingProject}
              >
                Cancel
              </WpButton>

              <WpButton
                size="sm"
                disabled={!projectName.trim() || isCreatingProject}
                onClick={handleCreateProject}
              >
                {isCreatingProject ? 'Creating...' : 'Create Project'}
              </WpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProjectPage;
