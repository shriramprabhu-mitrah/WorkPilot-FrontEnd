import { AlertCircle } from 'lucide-react';
import { colors } from '@/src/styles/colors';

interface StoryErrorStateProps {
  displayKey: string;
  isNotFound: boolean;
  errorMessage: string;
  errorCode?: string;
  onClose: () => void;
  onRetry: () => void;
}

export const StoryErrorState = ({
  displayKey,
  isNotFound,
  errorMessage,
  errorCode,
  onClose,
  onRetry,
}: StoryErrorStateProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/40 dark:bg-slate-900">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center justify-center mb-5 text-red-600 dark:text-red-400 shadow-sm">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">
        {isNotFound ? 'User Story Not Found' : 'Failed to Load User Story'}
      </h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mb-4 leading-relaxed">
        {isNotFound ? (
          <>
            User story with key{' '}
            <span className="font-semibold text-gray-800 dark:text-slate-200">
              &quot;{displayKey}&quot;
            </span>{' '}
            was not found in this project. It may have been deleted, moved, or the URL might be
            invalid.
          </>
        ) : (
          errorMessage
        )}
      </p>
      {isNotFound && errorCode && (
        <div className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {errorCode}
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm"
          style={{ backgroundColor: colors.primary }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default StoryErrorState;
