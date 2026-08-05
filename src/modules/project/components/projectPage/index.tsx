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
import { useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/src/services/project';
import { CreateProjectPayload, Project as ApiProject } from '@/src/types/project';
import { useAppDispatch } from '@/src/store';
import { setSelectedProject, setProjectLoading } from '@/src/store/slices/project';
import { useDebounce } from '@/src/hooks/useDebounce';
import ProjectSkeleton from '../projectSkeleton';

// Helper function to map API project to UI project format
const mapApiProjectToUiProject = (apiProject: ApiProject): Project => {
  return {
    id: apiProject.id,
    name: apiProject.name,
    description: apiProject.description || 'No description added.',
    initials: apiProject?.name
      ?.trim()
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    code: String(apiProject.key ?? ''),
    status:
      apiProject.status === 'active'
        ? 'Active'
        : apiProject.status === 'on_hold'
          ? 'On Hold'
          : apiProject.status === 'completed'
            ? 'Completed'
            : apiProject.status === 'archived'
              ? 'Archived'
              : apiProject.status === 'planning'
                ? 'Planning'
                : apiProject.status === 'cancelled'
                  ? 'Cancelled'
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
    owner: String(apiProject?.creator) || 'Unassigned',
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
  const queryClient = useQueryClient();
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
  const allProjects = useMemo((): Project[] => {
    if (!apiProjects || !Array.isArray(apiProjects)) return [];
    return apiProjects.map(mapApiProjectToUiProject);
  }, [apiProjects]);

  const apiProjectsMap = useMemo(() => {
    if (!apiProjects || !Array.isArray(apiProjects)) return new Map<string, ApiProject>();
    return new Map(apiProjects.map((proj: ApiProject) => [proj.id, proj]));
  }, [apiProjects]);

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
      setIsModalOpen(false);
      await refetchProjects();

      setProjectName('');
      setDescription('');
    } catch (error) {}
  };

  const handleProjectClick = async (project: Project, apiProject: ApiProject) => {
    if (!apiProject.id) return;
    dispatch(setProjectLoading(true));
    router.push('/projects/sprints');
    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['projectDetail', apiProject.id],
        queryFn: () => projectService.getProjectDetail(String(apiProject?.id)),
      });
      const detail = res.data;
      if (!detail) throw new Error('No detail');
      const { creator, ...detailRest } = detail;
      dispatch(
        setSelectedProject({
          ...detailRest,
          key: detailRest.key ?? apiProject.key,
          owner: creator ?? 'Unassigned',
          start_date: apiProject.start_date,
        })
      );
    } catch {
      dispatch(
        setSelectedProject({
          id: apiProject.id,
          organization_id: apiProject.organization_id || '',
          name: apiProject.name,
          description: apiProject.description,
          status: apiProject.status || 'active',
          created_at: apiProject.created_at || '',
          key: apiProject.key,
          start_date: apiProject.start_date,
          end_date: apiProject.end_date,
          owner_id: apiProject.owner_id,
          owner: String(apiProject.creator) || 'Unassigned',
          created_by: '',
          members: [],
          sprints: [],
        })
      );
    } finally {
      dispatch(setProjectLoading(false));
    }
  };
  if (isLoadingProjects) {
    return (
      <div className="min-h-screen bg-gray-50 p-0.5">
        <ProjectSkeleton />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-0.5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[25px] font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-gray-500">
            {displayedProjects.length} projects across your workspace
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

      {displayedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          {searchTerm || selectedFilter !== ProjectFilter.ALL ? (
            <p className="text-gray-500">No projects found matching your criteria.</p>
          ) : (
            <>
              <img src="/images/Empty-rafiki.svg" alt="No Projects" className="mb-8 h-64 w-64" />

              <h2 className="text-2xl font-bold text-gray-900">Ready to build something?</h2>

              <p className="mt-3 max-w-md text-center text-gray-500">
                Projects help organize boards, sprints, tasks, and reports. Create your first
                project to get started.
              </p>

              <WpButton size="sm" className="mt-8" onClick={() => setIsModalOpen(true)}>
                + Create Project
              </WpButton>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {displayedProjects.map((project) => {
            const apiProject = apiProjectsMap.get(project?.id);
            return (
              <ProjectCard
                key={project.id}
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
