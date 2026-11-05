import type { ToolbarButtonProps } from '../types';

export function ToolbarButton({
  title,
  onClick,
  children,
  active = false,
  disabled = false,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={onClick}
      className={`
        flex h-8 w-8 shrink-0 items-center
        justify-center rounded-md
        transition-colors
        disabled:cursor-not-allowed
        disabled:opacity-40
        ${
          active
            ? 'bg-gray-200 dark:bg-slate-600 text-gray-900 dark:text-slate-100'
            : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100'
        }
      `}
    >
      {children}
    </button>
  );
}

export function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-gray-200 dark:bg-slate-600" />;
}
