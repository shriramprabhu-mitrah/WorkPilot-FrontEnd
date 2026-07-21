"use client";
import { Search, Download, Columns3, ChevronDown, SlidersHorizontal } from "lucide-react";
import { FilterDropdown } from "./FilterDropdown";
import { useState } from "react";
import { filters } from "../data/fliter";
import { tasksData } from "../data/tasks";
type TaskHeaderProps = {
    searchTerm: string;
    selectedFilters: {
        status: string;
        priority: string;
        assignee: string;
        sprint: string;
    };
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;

    setSelectedFilters: React.Dispatch<
        React.SetStateAction<{
            status: string;
            priority: string;
            assignee: string;
            sprint: string;
        }>
    >;
};
export const TaskHeader = ({
    selectedFilters,
    setSelectedFilters,
    searchTerm,
    setSearchTerm
}: TaskHeaderProps) => {
    const handleFilterChange = (key: string, value: string) => {
        setSelectedFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    return (
        <div className="mb-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Task List
                </h1>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50">
                        <Download size={16} />
                        Export
                    </button>

                    <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50">
                        <Columns3 size={16} />
                        Columns
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9 w-52 rounded-lg border border-gray-200 pl-10 pr-3 text-sm"
                    />
                </div>
                <div className="flex flex-wrap gap-3">
                    {filters.map((filter) => (
                        <FilterDropdown
                            key={filter.key}
                            value={selectedFilters[filter.key as keyof typeof selectedFilters]}
                            options={filter.options}
                            onChange={(value) => handleFilterChange(filter.key, value)}
                        />
                    ))}
                </div>
                <button className="flex h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-xs">
                    <SlidersHorizontal size={16} />
                    More Filters
                </button>
            </div>
        </div>
    );
};

