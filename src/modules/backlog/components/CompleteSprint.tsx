'use client';

import { X } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { TrackrLogoSvg } from '@/src/assets/svgs';
import { colors } from '@/src/styles/colors';
interface CompleteSprintModalProps {
  sprint: {
    id: string;
    name: string;
  };
  completedUserStories: number;
  inProgressUserStories: number;
  onClose: () => void;
  onComplete: () => void;
  isCompleting?: boolean;
}
const CompleteSprintModal = ({
  sprint,
  completedUserStories,
  inProgressUserStories,
  onClose,
  onComplete,
  isCompleting = false,
}: CompleteSprintModalProps) => {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 dark:bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex h-[165px] items-center justify-center overflow-hidden bg-[#155DFC] dark:bg-blue-100">
          <div className="absolute -left-10 top-0 h-20 w-[120%] rotate-[-5deg] rounded-[50%] bg-[#3B7CFF]/40" />
          <div className="absolute -left-10 top-14 h-20 w-[120%] rotate-[4deg] rounded-[50%] bg-[#0F4ED8]/30" />

          <div className="relative z-10 flex h-15 w-15 items-center justify-center text-white">
            <TrackrLogoSvg />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isCompleting}
            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-black/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-6 pt-7">
          <h2 className="mb-8 text-2xl font-semibold text-gray-900 dark:text-slate-100">
            Complete {sprint.name}
          </h2>

          <p className="mb-5 text-base text-gray-700 dark:text-slate-300">
            This sprint contains <strong>{completedUserStories} completed user stories</strong> and{' '}
            <strong>{inProgressUserStories} user stories in progress.</strong>
          </p>

          <ul className="mb-2 space-y-4 pl-6 text-base text-gray-700 dark:text-slate-300">
            <li className="list-disc">
              Completed user stories include everything in the last column on the board, Done.
            </li>

            <li className="list-disc">
              In-progress user stories include stories that are not yet completed.
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-200 px-8 py-4 dark:border-slate-700">
          <WpButton
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isCompleting}
          >
            Cancel
          </WpButton>

          <WpButton
            type="button"
            variant="primary"
            size="md"
            onClick={onComplete}
            disabled={isCompleting}
          >
            {isCompleting ? 'Completing...' : 'Complete sprint'}
          </WpButton>
        </div>
      </div>
    </div>
  );
};

export default CompleteSprintModal;
