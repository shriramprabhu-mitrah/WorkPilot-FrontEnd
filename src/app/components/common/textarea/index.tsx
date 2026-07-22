import React from "react";

interface WpTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const WpTextarea = ({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: WpTextareaProps) => {
  return (
    <div className="w-full mb-5">
      {label && (
        <label htmlFor={id} className="block text-sm font-bold mb-2 text-[var(--color-text-body)]">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={[
          "w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-all resize-y min-h-[100px]",
          "border-[var(--color-gray-300)] focus:border-[var(--color-primary-focus)] focus:ring-2 focus:ring-[rgba(37,99,235,0.2)]",
          error ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-red-100" : "",
          props.disabled ? "bg-[var(--color-gray-100)] cursor-not-allowed text-[var(--color-gray-400)]" : "bg-white",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-[var(--color-gray-400)]">{hint}</p>}
    </div>
  );
};
