type ErrorMessageProps = {
  message?: string;
};

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="h-4">
      {message && <div className="text-left text-xs text-red-500">{message}</div>}
    </div>
  );
};

export const inputErrorClass =
  '!border-[var(--color-error)] !ring-0 focus:!border-[var(--color-error)] focus:!ring-0';
