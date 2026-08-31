'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { FolderX } from 'lucide-react';
import { ProjectSelectionPopover } from '../project-selection-popover';
import { useGetProjectsWithSprints } from '@/src/modules/project/hooks/useProject';

interface ProjectNotFoundProps {
  slug?: string;
}

export const ProjectNotFound = ({ slug }: ProjectNotFoundProps) => {
  const params = useParams();
  const currentSlug = slug || (params?.projectSlug as string) || '';
  const { projectsWithSprints } = useGetProjectsWithSprints();
  const [showPopover, setShowPopover] = useState(true);

  const hasProjects = projectsWithSprints && projectsWithSprints.length > 0;

  return (
    <>
      <ProjectSelectionPopover
        show={showPopover}
        onDismiss={() => setShowPopover(false)}
        variant={hasProjects ? 'select' : 'create'}
      />

      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        {/* Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 flex items-center justify-center mb-5 text-red-600 dark:text-red-400 shadow-sm">
          <FolderX size={32} />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Project Not Found
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md">
          {currentSlug ? (
            <>
              The project with slug or ID{' '}
              <span className="font-semibold text-gray-800 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">
                &quot;{currentSlug}&quot;
              </span>{' '}
              could not be found or you do not have permission to view it.
            </>
          ) : (
            'The requested project could not be found.'
          )}
        </p>
      </div>
    </>
  );
};

export default ProjectNotFound;
