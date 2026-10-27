import Image from 'next/image';
import { Plus } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';

export const AccessRestricted = ({ what }: { what: string }) => (
  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
    <Image
      src="/images/kanban method-pana.svg"
      alt="Access Restricted"
      width={112}
      height={112}
      className="h-28 w-28 opacity-60 mb-2"
    />
    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Access Restricted</h3>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
      You do not have permission to view {what}.
    </p>
  </div>
);

interface EmptyProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({ message, actionLabel, onAction, className = 'py-10' }: EmptyProps) => (
  <div className={`flex flex-col items-center justify-center px-4 ${className}`}>
    <svg
      className="w-8 h-8 text-gray-300 dark:text-slate-600 mb-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
    <p className="text-sm text-gray-500 dark:text-slate-200 text-center">{message}</p>
    {actionLabel && onAction && (
      <div className="mt-3">
        <WpButton
          size="sm"
          variant="secondary"
          leftIcon={<Plus size={14} />}
          onClick={onAction}
          className="text-xs"
        >
          {actionLabel}
        </WpButton>
      </div>
    )}
  </div>
);
