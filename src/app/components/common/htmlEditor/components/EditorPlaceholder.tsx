export function EditorPlaceholder({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute left-4 top-4 text-sm text-gray-400 dark:text-slate-100">
      {text}
    </div>
  );
}
