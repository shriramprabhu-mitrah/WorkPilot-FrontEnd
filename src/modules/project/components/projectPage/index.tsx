"use client";
import ProjectCard from "../projectCard";
import { Projects } from "../../data/project";
import { useState } from "react";
import { useMemo } from "react";
import { ProjectFilter, filters } from "@/src/app/components/common/enum";
import { Search, SlidersHorizontal } from "lucide-react";

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
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-[25px] font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-gray-500">
            5 projects across your workspace
          </p>
        </div>
        <button className="mr-70 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 mt-5">
          + New Project
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-60">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white text-sm pr-4 py-2 pl-9 pr-4 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${selectedFilter === filter
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
          <SlidersHorizontal size={16} />
          Sort
        </button>
      </div>

      <div className="max-w-[1380px]">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {displayedProjects.map((project) => (
            <ProjectCard
              key={project.name}
              project={project}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default ProjectPage
