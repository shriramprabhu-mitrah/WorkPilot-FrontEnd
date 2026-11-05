import { Check } from 'lucide-react';
import { $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical';
import { $patchStyleText } from '@lexical/selection';

interface TextColorPickerProps {
  editor: LexicalEditor;
  open: boolean;
  onClose: () => void;
}

export function TextColorPicker({ editor, open, onClose }: TextColorPickerProps) {
  if (!open) {
    return null;
  }

  const colors = [
    '#242629',
    '#2563eb',
    '#28758c',
    '#247552',
    '#e66a00',
    '#b8322a',
    '#8142a3',
    '#8b9098',
    '#3979e6',
    '#289bc0',
    '#22a36b',
    '#ffad00',
    '#d7372f',
    '#aa4fce',
    '#ffffff',
    '#c5d9f5',
    '#b9e0ec',
    '#b8e8d1',
    '#f2e68b',
    '#f8c9c5',
    '#e4cdf0',
  ];

  const applyColor = (color: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $patchStyleText(selection, { color });
    });
    onClose();
  };

  const removeColor = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $patchStyleText(selection, { color: null });
    });
    onClose();
  };

  return (
    <div className="absolute left-1/2 top-full z-[100] mt-2 w-[225px]-translate-x-1/2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-xl">
      <div className="mb-3 text-sm font-semibold text-gray-700 dark:text-slate-200">Text color</div>

      <div className="grid grid-cols-7 gap-2">
        {colors.map((color, index) => (
          <button
            key={`${color}-${index}`}
            type="button"
            title={color}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyColor(color)}
            className="relative flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 dark:border-slate-600 transition-transform hover:scale-110"
            style={{ backgroundColor: color }}
          >
            {index === 0 && <Check size={14} className="text-white" />}
          </button>
        ))}
      </div>

      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={removeColor}
        className="mt-3 flex h-9 w-full items-center justify-center rounded-md border border-gray-200 dark:border-slate-600 text-sm font-medium text-gray-700 dark:text-slate-200 
        transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
      >
        Remove color
      </button>
    </div>
  );
}
