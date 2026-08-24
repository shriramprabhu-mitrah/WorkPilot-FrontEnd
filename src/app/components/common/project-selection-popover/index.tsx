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
        className={`fixed inset-0 z-40 bg-black/20 dark:bg-black/50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onDismiss}
      />

      {/* Popover */}
      <div
        className={`fixed z-50 w-[320px] transform rounded-xl border border-gray-200 bg-white shadow-2xl transition-all duration-300 dark:border-gray-800 dark:bg-gray-100 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          left: '88px',
          top: '50px',
        }}
      >
        {/* Arrow */}
        <div className="absolute -left-4 top-8">
          <div className="relative">
            <ArrowLeft
              size={32}
              className="animate-pulse drop-shadow-lg"
              style={{ color: colors.primary }}
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 p-4 dark:border-gray-800 dark:bg-gray-100">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
              {isCreateVariant ? 'Create Your First Project' : 'Select a Project & Sprint'}
            </h3>

            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              {isCreateVariant
                ? 'Get started by creating a new project'
                : 'Get started by choosing your workspace'}
            </p>
          </div>

          <button
            onClick={onDismiss}
            className="ml-2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-slate-400 dark:hover:bg-gray-800 dark:hover:text-slate-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isCreateVariant ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Plus size={16} />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    No projects yet
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                    You need to create a project to get started with your workspace
                  </p>
                </div>
              </div>

              <div
                className="mt-4 rounded-lg border p-3 dark:bg-gray-900"
                style={{
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                }}
              >
                <p className="text-xs text-gray-700 dark:text-slate-300">
                  <span className="font-semibold text-gray-900 dark:text-slate-100">Note:</span>{' '}
                  Projects help you organize your work, manage sprints, and track tasks efficiently
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  1
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    Click on the project selector
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                    Look for the workspace selector on the left sidebar
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  2
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    Choose your project
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                    Select from your available projects
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  3
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    Select a sprint
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                    Pick a specific sprint or view all sprints
                  </p>
                </div>
              </div>

              <div
                className="mt-4 rounded-lg border p-3 dark:bg-gray-900"
                style={{
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                }}
              >
                <p className="text-xs text-gray-700 dark:text-slate-300">
                  <span className="font-semibold text-gray-900 dark:text-slate-100">Tip:</span> You
                  can change your selection anytime by clicking the project selector again
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 dark:border-gray-800">
          {isCreateVariant ? (
            <button
              onClick={handleCreateProject}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              <Plus size={16} />
              Create Project
            </button>
          ) : (
            <button
              onClick={onDismiss}
              className="w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
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
