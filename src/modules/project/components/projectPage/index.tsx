'use client';
import ProjectCard from '../projectCard';
import { Projects } from '../../data/project';
import { useState } from 'react';
import { ProjectFilter, filters } from '@/src/app/components/common/enum';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { Project } from '../../types/project';
import { useRouter } from 'next/navigation';

const ProjectPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ProjectFilter>(ProjectFilter.ALL);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>(Projects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  const getFilteredProjects = (filter: ProjectFilter) => {
    return filter === ProjectFilter.ALL
      ? Projects
      : Projects.filter((project) => project.status === filter);
  };

  const updateProjects = (
    filter: ProjectFilter,
    search?: string,
    sort?: 'asc' | 'desc',
    type?: string
  ) => {
    const filteredData = getFilteredProjects(filter);

    if (type === 'status') {
      setDisplayedProjects(filteredData);
    } else if (search !== undefined) {
      if (!search.trim()) {
        setDisplayedProjects(filteredData);
      } else {
        const searchedData = filteredData.filter((project) =>
          project.name.toLowerCase().includes(search.toLowerCase())
        );
        setDisplayedProjects(searchedData);
      }
    } else if (sort) {
      const sortedData = [...displayedProjects].sort((a, b) =>
        sort === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      );
      setDisplayedProjects(sortedData);
    }
  };

  const handleCreateProject = () => {
    if (!projectName.trim()) return;

    const newProject: Project = {
      name: projectName,
      description: description || 'No description added.',
      initials: projectName
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      code: `PRJ-${Date.now().toString().slice(-4)}`,
      status: 'Active',
      progress: 0,
      members: [],
      tasks: '0',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    setDisplayedProjects((prevProjects) => [...prevProjects, newProject]);
    setProjectName('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-0.5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[25px] font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-gray-500">
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
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);
            updateProjects(selectedFilter, value);
          }}
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none"
        />

        <div className="flex items-center gap-2">
          {filters.map((statusFilter) => (
            <WpButton
              key={statusFilter}
              size="sm"
              variant={selectedFilter === statusFilter ? 'primary' : 'secondary'}
              className={selectedFilter === statusFilter ? '' : 'text-gray-600 hover:text-gray-700'}
              onClick={() => {
                setSelectedFilter(statusFilter);
                updateProjects(statusFilter, undefined, undefined, 'status');
              }}
            >
              {statusFilter}
            </WpButton>
          ))}
        </div>
        <WpButton
          variant="secondary"
          size="sm"
          leftIcon={<SlidersHorizontal size={16} />}
          onClick={() => {
            const newSort = sortOrder === 'asc' ? 'desc' : 'asc';
            setSortOrder(newSort);
            updateProjects(selectedFilter, undefined, newSort);
          }}
        >
          Sort
        </WpButton>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {displayedProjects.map((project) => (
          <ProjectCard
            key={project.name}
            project={project}
            onClick={() => {
              sessionStorage.setItem('selectedProject', JSON.stringify(project));
              router.push('/projects/sprints');
            }}
          />
        ))}
      </div>
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
              <WpButton variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </WpButton>

              <WpButton size="sm" disabled={!projectName.trim()} onClick={handleCreateProject}>
                Create Project
              </WpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProjectPage;
