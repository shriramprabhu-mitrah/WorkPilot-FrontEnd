'use client';

import { useEffect, useState } from 'react';
import { X, ArrowLeft, Plus } from 'lucide-react';
import { colors } from '@/src/styles/colors';
import { useParams, useRouter } from 'next/navigation';

interface ProjectSelectionPopoverProps {
  show: boolean;
  onDismiss: () => void;
  variant: 'select' | 'create';
}

export const ProjectSelectionPopover = ({
  show,
  onDismiss,
  variant,
}: ProjectSelectionPopoverProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  useEffect(() => {
    if (show) {
      // Small delay to allow the component to mount before animating
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(false);
    }
  }, [show]);

  if (!show) return null;

  const handleCreateProject = () => {
    onDismiss();
    router.push(`/${orgSlug}/projects?openCreate=true`);
  };

  const isCreateVariant = variant === 'create';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onDismiss}
      />

      {/* Popover */}
      <div
        className={`fixed z-50 w-[320px] bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-300 transform ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          left: '88px',
          top: '50px',
        }}
      >
        {/* Arrow pointing to sidebar */}
        <div className="absolute -left-4 top-8">
          <div className="relative">
            <ArrowLeft
              size={32}
              className="drop-shadow-lg animate-pulse"
              style={{ color: colors.primary }}
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-100">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">
              {isCreateVariant ? 'Create Your First Project' : 'Select a Project & Sprint'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isCreateVariant
                ? 'Get started by creating a new project'
                : 'Get started by choosing your workspace'}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="ml-2 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isCreateVariant ? (
            // Create Project Content
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Plus size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">No projects yet</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    You need to create a project to get started with your workspace
                  </p>
                </div>
              </div>

              <div
                className="mt-4 p-3 rounded-lg border"
                style={{ backgroundColor: colors.primaryLight, borderColor: colors.primary }}
              >
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">Note:</span> Projects help you organize your work,
                  manage sprints, and track tasks efficiently
                </p>
              </div>
            </div>
          ) : (
            // Select Project Content
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor: colors.primary }}
                >
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Click on the project selector</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Look for the workspace selector on the left sidebar
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor: colors.primary }}
                >
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Choose your project</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select from your available projects
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor: colors.primary }}
                >
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Select a sprint</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pick a specific sprint or view all sprints
                  </p>
                </div>
              </div>

              <div
                className="mt-4 p-3 rounded-lg border"
                style={{ backgroundColor: colors.primaryLight, borderColor: colors.primary }}
              >
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">Tip:</span> You can change your selection anytime
                  by clicking the project selector again
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          {isCreateVariant ? (
            <button
              onClick={handleCreateProject}
              className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: colors.primary }}
            >
              <Plus size={16} />
              Create Project
            </button>
          ) : (
            <button
              onClick={onDismiss}
              className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              Got it!
            </button>
          )}
        </div>
      </div>
    </>
  );
};
