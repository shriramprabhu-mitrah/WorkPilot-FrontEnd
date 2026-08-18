'use client';
import { useState, useEffect } from 'react';
import { projectService } from '@/src/services/project';
import { sprintService } from '@/src/services/sprint';
import { Project, SprintDetail } from '@/src/types/project';
import { logger } from '@/src/lib/utils/logger';

type FilterDropdownProps = {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

const SimpleDropdown = ({
  value,
  options,
  onChange,
  placeholder,
  disabled,
}: FilterDropdownProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`h-9 rounded-md border border-gray-200 bg-white px-3 text-xs ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export type ProjectSprintDropdownsProps = {
  selectedProject: string;
  setSelectedProject: (val: string) => void;
  selectedSprint: string;
  setSelectedSprint: (val: string) => void;
};

export const ProjectSprintDropdowns = ({
  selectedProject,
  setSelectedProject,
  selectedSprint,
  setSelectedSprint,
}: ProjectSprintDropdownsProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<SprintDetail[]>([]);

  useEffect(() => {
    projectService
      .getProject({ fieldName: 'id,name' })
      .then((res) => {
        // res.data should be the array of projects, given the processPaginatedResponse unwrapping
        const data = res.data || [];
        // If data is still wrapped in an object for some reason (e.g. data.data), extract it
        const actualData = Array.isArray(data) ? data : (data as { data?: Project[] }).data || [];
        setProjects(actualData);
      })
      .catch((err) => logger.error('Error fetching projects', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedProject) {
      sprintService
        .getSprints(selectedProject, { fieldName: 'id,name' })
        .then((res) => {
          const data = res.data || [];
          const actualData = Array.isArray(data)
            ? data
            : (data as { data?: SprintDetail[] }).data || [];
          setSprints(actualData);
          // Only reset sprint if it's no longer in the list
          if (
            selectedSprint &&
            actualData.length > 0 &&
            !actualData.find((s: SprintDetail) => s.id === selectedSprint)
          ) {
            setSelectedSprint('');
          }
        })
        .catch((err) => logger.error('Error fetching sprints', err));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSprints([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSprint('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject]);

  const projectOptions = (projects || []).map((p) => ({ label: p.name || '', value: p.id || '' }));
  const sprintOptions = (sprints || []).map((s) => ({ label: s.name || '', value: s.id || '' }));

  return (
    <div className="flex flex-wrap gap-3">
      <SimpleDropdown
        options={projectOptions}
        value={selectedProject}
        onChange={setSelectedProject}
        placeholder="Select Project"
      />
      <SimpleDropdown
        options={sprintOptions}
        value={selectedSprint}
        onChange={setSelectedSprint}
        placeholder="Select Sprint"
        disabled={!selectedProject || sprintOptions.length === 0}
      />
    </div>
  );
};
