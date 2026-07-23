'use client';
import ProjectCard from '../projectCard';
import { Projects } from '../../data/project';
import { useState } from 'react';
import { ProjectFilter, filters } from '@/src/app/components/common/enum';
import { Search, SlidersHorizontal } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';

const ProjectPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ProjectFilter>(ProjectFilter.ALL);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [displayedProjects, setDisplayedProjects] = useState(Projects);

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

  return (
    <div className="min-h-screen bg-gray-50 p-0.5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[25px] font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-gray-500">
            {displayedProjects.length} projects across your workspace
          </p>
        </div>
        <WpButton size="sm">+ New Project</WpButton>
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
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </div>
  );
};
export default ProjectPage;
