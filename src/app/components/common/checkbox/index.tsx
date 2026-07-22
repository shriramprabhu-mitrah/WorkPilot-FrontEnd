import React from "react";

interface WpCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  error?: string;
}

export const WpCheckbox = ({ label, error, id, className = "", ...props }: WpCheckboxProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="flex items-start gap-2 cursor-pointer select-none text-sm text-[var(--color-gray-600)]"
      >
        <input
          id={id}
          type="checkbox"
          className={[
            "mt-0.5 w-4 h-4 rounded border-[var(--color-gray-300)] accent-[var(--color-primary-focus)] cursor-pointer",
            props.disabled ? "cursor-not-allowed opacity-50" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {label && <span>{label}</span>}
      </label>
      {error && <p className="text-xs text-[var(--color-error)] ml-6">{error}</p>}
    </div>
  );
};
