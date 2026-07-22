"use client";
import ProjectCard from "../projectCard";
import { Projects } from "../../data/project";
import { useState, useMemo } from "react";
import { ProjectFilter, filters } from "@/src/app/components/common/enum";
import { Search, SlidersHorizontal } from "lucide-react";
import { WpButton } from "@/src/app/components/common/button";
import { WpInput } from "@/src/app/components/common/input";

const ProjectPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<ProjectFilter>(ProjectFilter.ALL);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const displayedProjects = useMemo(() => {
    return [...Projects]
      .filter((project) => selectedFilter === ProjectFilter.ALL || project.status === selectedFilter)
      .filter((project) => !searchTerm || project.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  }, [selectedFilter, searchTerm, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50 p-0.5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[25px] font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-gray-500">5 projects across your workspace</p>
        </div>
        <WpButton size="sm">+ New Project</WpButton>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <WpInput
          type="text"
          placeholder="Search projects..."
          icon={<Search size={15} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          wrapperClassName="w-60"
          className="!py-1.5"
        />
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <WpButton
              key={filter}
              size="sm"
              variant={selectedFilter === filter ? "primary" : "secondary"}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </WpButton>
          ))}
        </div>
        <WpButton
          variant="secondary"
          size="sm"
          leftIcon={<SlidersHorizontal size={16} />}
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          Sort
        </WpButton>
      </div>

      <div className="max-w-[1380px]">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {displayedProjects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
};
export default ProjectPage;
