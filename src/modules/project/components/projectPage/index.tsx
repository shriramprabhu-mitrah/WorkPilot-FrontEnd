'use client';
import ProjectCard from '../projectCard';
import { useState, useMemo, useEffect } from 'react';
import { ProjectFilter, filters } from '@/src/app/components/common/enum';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { Project } from '../../types/project';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCreateProject, useGetProjects } from '../../hooks/useProject';
import { useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/src/services/project';
import { CreateProjectPayload, Project as ApiProject } from '@/src/types/project';
import { useAppDispatch } from '@/src/store';
import { setSelectedProject, setProjectLoading } from '@/src/store/slices/project';
import { useDebounce } from '@/src/hooks/useDebounce';
import { usePermissions } from '@/src/hooks/usePermissions';
import ProjectSkeleton from '../projectSkeleton';
import { ViewToggle, ViewType } from '../viewToggle';
import Image from 'next/image';
import { useOrgNavigation } from '@/src/hooks/useOrgNavigation';

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
    sprint_count: apiProject.sprint_count ?? 0,
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
  const router = useRouter();
  const { push } = useOrgNavigation();
  const searchParams = useSearchParams();
  const { hasPermission } = usePermissions();

  // Derive initial modal state from URL params
  const shouldOpenModal =
    searchParams.get('openCreate') === 'true' && hasPermission('PROJECT_CREATE');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ProjectFilter>(ProjectFilter.ALL);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(shouldOpenModal);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const dispatch = useAppDispatch();
  const { createProjectAsync, isCreatingProject } = useCreateProject();
  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [view, setView] = useState<ViewType>('grid');
  const [page, setPage] = useState(1);

  const pageSize = 10;
  const {
    projects: apiProjects,
    meta,
    isLoadingProjects,
    isFetchingProjects,
  } = useGetProjects({
    page,
    page_size: pageSize,
    name: debouncedSearch,
    status:
      selectedFilter === ProjectFilter.ALL ? undefined : PROJECT_STATUS_API_MAP[selectedFilter],
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleFilterChange = (value: ProjectFilter) => {
    setSelectedFilter(value);
    setPage(1);
  };
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
  }, [allProjects, sortOrder]);

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;

    try {
      const payload: CreateProjectPayload = {
        name: projectName,
        description: description || undefined,
      };

      await createProjectAsync(payload);
      setIsModalOpen(false);

      setProjectName('');
      setDescription('');
    } catch (error) {}
  };

  const handleProjectClick = async (project: Project, apiProject: ApiProject) => {
    if (!apiProject.id) return;
    dispatch(setProjectLoading(true));
    push('/projects/sprints');
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
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-gray-50">
      <div className="sticky top-0 z-20 bg-gray-50 px-1 pt-1 pb-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-[25px] font-bold text-gray-900">Projects</h1>
            <p className="mt-2 text-gray-500">
              {displayedProjects.length} projects across your workspace
            </p>
          </div>

          <div className="self-start mr-12 flex items-center gap-2">
            {hasPermission('PROJECT_CREATE') && (
              <WpButton size="sm" onClick={() => setIsModalOpen(true)}>
                + New Project
              </WpButton>
            )}
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <WpInput
            type="text"
            placeholder="Search projects..."
            icon={<Search size={15} />}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none"
          />

          <div className="flex items-center gap-2">
            {filters.map((statusFilter) => (
              <WpButton
                key={statusFilter}
                size="sm"
                variant={selectedFilter === statusFilter ? 'primary' : 'secondary'}
                className={
                  selectedFilter === statusFilter ? '' : 'text-gray-600 hover:text-gray-700'
                }
                onClick={() => handleFilterChange(statusFilter)}
              >
                {statusFilter}
              </WpButton>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <ViewToggle view={view} onChange={setView} />

            <WpButton
              variant="secondary"
              size="sm"
              leftIcon={<SlidersHorizontal size={16} />}
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            >
              Sort {sortOrder === 'asc' ? '↑' : '↓'}
            </WpButton>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto [scrollbar-width:thin] pb-8">
        {isFetchingProjects && !isLoadingProjects && (
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating projects...
          </div>
        )}

        {isLoadingProjects ? (
          <ProjectSkeleton />
        ) : displayedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            {searchTerm || selectedFilter !== ProjectFilter.ALL ? (
              <p className="text-gray-500">No projects found matching your criteria.</p>
            ) : (
              <>
                <div className="relative mb-8 h-64 w-64">
                  <Image
                    src="/images/Empty-rafiki.svg"
                    alt="No Projects"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Ready to build something?</h2>
                <p className="mt-3 max-w-md text-center text-gray-500">
                  Projects help organize boards, sprints, tasks, and reports. Create your first
                  project to get started.
                </p>

                {hasPermission('PROJECT_CREATE') && (
                  <WpButton size="sm" className="mt-8" onClick={() => setIsModalOpen(true)}>
                    + Create Project
                  </WpButton>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            <div
              className={
                view === 'grid'
                  ? 'grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3'
                  : 'flex flex-col gap-4'
              }
            >
              {displayedProjects.map((project) => {
                const apiProject = apiProjectsMap.get(project?.id);
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    view={view}
                    onClick={() => apiProject && handleProjectClick(project, apiProject)}
                  />
                );
              })}
            </div>

            <div className="mt-6 mr-2 flex justify-end">
              <div className="flex items-center gap-2">
                <WpButton
                  variant="secondary"
                  size="sm"
                  disabled={!meta?.has_previous}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  <ChevronLeft size={16} />
                </WpButton>

                {Array.from({ length: meta?.total_pages ?? 1 }, (_, i) => (
                  <WpButton
                    key={i + 1}
                    size="sm"
                    variant={page === i + 1 ? 'primary' : 'secondary'}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </WpButton>
                ))}

                <WpButton
                  variant="secondary"
                  size="sm"
                  disabled={!meta?.has_next}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  <ChevronRight size={16} />
                </WpButton>
              </div>
            </div>
          </>
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
                  onClick={() => {
                    setProjectName('');
                    setDescription('');
                    setIsModalOpen(false);
                  }}
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
                  onClick={() => {
                    setProjectName('');
                    setDescription('');
                    setIsModalOpen(false);
                  }}
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
    </div>
  );
};
export default ProjectPage;
