import { useState } from 'react';
import { Check, Pipette } from 'lucide-react';
import { $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical';
import { $patchStyleText } from '@lexical/selection';

interface TextColorPickerProps {
  editor: LexicalEditor;
  open: boolean;
  onClose: () => void;
}

export function TextColorPicker({ editor, open, onClose }: TextColorPickerProps) {
  const [customColor, setCustomColor] = useState('#2563eb');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

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
    setShowCustomPicker(false);
  };

  const removeColor = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $patchStyleText(selection, { color: null });
    });
    onClose();
    setShowCustomPicker(false);
  };

  const applyCustomColor = () => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(customColor)) return;

    applyColor(customColor);
  };

  return (
    <div className="absolute left-1/2 top-full z-[100] mt-2 w-[240px] -translate-x-1/2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">Text color</span>
        <button
          type="button"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          title="Custom color"
        >
          <Pipette size={13} />
          Custom
        </button>
      </div>

      {/* Custom Color Picker */}
      {showCustomPicker && (
        <div className="mb-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/50 p-2.5">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="h-9 w-10 cursor-pointer rounded-md border-0 bg-transparent"
              title="Choose custom color"
            />

            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                let value = e.target.value;
                if (!value.startsWith('#')) {
                  value = `#${value}`;
                }
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  setCustomColor(value);
                }
              }}
              className="min-w-0 flex-1 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-sm font-medium text-gray-700 dark:text-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="#2563eb"
            />

            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={applyCustomColor}
              disabled={!/^#[0-9A-Fa-f]{6}$/.test(customColor)}
              className="rounded-md bg-blue-600 p-1.5 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Apply custom color"
            >
              <Check size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* Preset Colors Grid */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {colors.map((color, index) => (
          <button
            key={`${color}-${index}`}
            type="button"
            title={color}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyColor(color)}
            className="relative flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 dark:border-slate-600 transition-all hover:scale-110 hover:ring-2 hover:ring-blue-400 dark:hover:ring-blue-500"
            style={{ backgroundColor: color }}
          >
            {index === 0 && <Check size={14} className="text-white drop-shadow-sm" />}
          </button>
        ))}
      </div>

      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={removeColor}
        className="flex h-9 w-full items-center justify-center rounded-md border border-gray-200 dark:border-slate-600 text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
      >
        Remove color
      </button>
    </div>
  );
}
