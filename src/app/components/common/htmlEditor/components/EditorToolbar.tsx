'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Undo2,
  Redo2,
  Smile,
  ImageIcon,
  ChevronDown,
} from 'lucide-react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  $getSelection,
  $isRangeSelection,
  UNDO_COMMAND,
  REDO_COMMAND,
  $createTextNode,
  $getRoot,
  $createParagraphNode,
} from 'lexical';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $createLinkNode } from '@lexical/link';
import { ToolbarButton, ToolbarDivider } from './ToolbarButton';
import { TextColorPicker } from './TextColorPicker';
import { INSERT_IMAGE_COMMAND } from '../nodes/ImageNode';

interface EditorToolbarProps {
  onImageUpload?: (file: File) => Promise<string>;
}

export function EditorToolbar({ onImageUpload }: EditorToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const { resolvedTheme } = useTheme();
  const emojiTheme = resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCodeToolbar, setShowCodeToolbar] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const anyPopupOpen = showColorPicker || showCodeToolbar || showEmojiPicker || showLinkPopup;
    if (!anyPopupOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
        setShowCodeToolbar(false);
        setShowEmojiPicker(false);
        setShowLinkPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker, showCodeToolbar, showEmojiPicker, showLinkPopup]);

  const handleInsertLink = () => {
    const url = linkUrl.trim();
    if (!url) return;

    const finalUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

    editor.update(() => {
      const root = $getRoot();

      // Ensure the root has at least one paragraph
      if (root.getChildrenSize() === 0) {
        const paragraph = $createParagraphNode();
        root.append(paragraph);
        paragraph.select();
      }

      let selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        const lastChild = root.getLastChild();
        if (lastChild) {
          lastChild.selectEnd();
          selection = $getSelection();
        }
      }
      if (!$isRangeSelection(selection)) {
        return;
      }

      const selectedText = selection.getTextContent();
      const displayText = linkText.trim() || selectedText || finalUrl;

      // Create the link node
      const link = $createLinkNode(finalUrl, {
        target: '_blank',
        rel: 'noopener noreferrer',
      });
      link.append($createTextNode(displayText));

      selection.insertNodes([link]);

      if (!selectedText) {
        selection.insertNodes([$createTextNode(' ')]);
      }
    });

    setLinkUrl('');
    setLinkText('');
    setShowLinkPopup(false);
  };

  useEffect(() => {
    const removeListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
          }
        });
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    return removeListener;
  }, [editor]);

  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }
      selection.insertText(emojiData.emoji);
    });
    setShowEmojiPicker(false);
  };

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file later

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file.');
      return;
    }

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setImageError(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }

    if (!onImageUpload) {
      setImageError('Image upload is not configured.');
      return;
    }

    setImageError(null);
    setIsUploadingImage(true);

    try {
      const url = await onImageUpload(file);

      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        src: url,
        altText: file.name,
      });
    } catch {
      setImageError('Image upload failed, please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div
      ref={toolbarRef}
      className="relative z-20 flex min-h-12 items-center gap-1 overflow-visible border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
    >
      <ToolbarButton title="Text style" onClick={() => {}}>
        <span className="text-sm font-medium">T</span>
        <ChevronDown size={12} className="ml-0.5" />
      </ToolbarButton>

      <ToolbarButton title="Bold" active={isBold} onClick={() => formatText('bold')}>
        <Bold size={16} />
      </ToolbarButton>

      <ToolbarButton title="Italic" active={isItalic} onClick={() => formatText('italic')}>
        <Italic size={16} />
      </ToolbarButton>

      <ToolbarButton title="Underline" active={isUnderline} onClick={() => formatText('underline')}>
        <Underline size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        title="Bullet list"
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
      >
        <List size={17} />
      </ToolbarButton>

      <ToolbarButton
        title="Numbered list"
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
      >
        <ListOrdered size={17} />
      </ToolbarButton>

      <ToolbarDivider />

      <div className="relative">
        <ToolbarButton
          title="Text color"
          active={showColorPicker}
          onClick={() => {
            setShowColorPicker((previous) => !previous);
            setShowCodeToolbar(false);
          }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded border border-gray-300 dark:border-slate-500 text-xs font-semibold">
            A
          </span>
        </ToolbarButton>

        <TextColorPicker
          editor={editor}
          open={showColorPicker}
          onClose={() => setShowColorPicker(false)}
        />
      </div>

      {/* IMAGE */}
      <div className="relative">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFileChange}
        />
        <ToolbarButton
          title="Image"
          disabled={isUploadingImage}
          onClick={() => {
            setImageError(null);
            imageInputRef.current?.click();
          }}
        >
          {isUploadingImage ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          ) : (
            <ImageIcon size={16} />
          )}
        </ToolbarButton>

        {imageError && (
          <div className="absolute left-1/2 top-full z-[100] mt-2 w-[220px] -translate-x-1/2 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400 shadow-lg">
            {imageError}
          </div>
        )}
      </div>

      {/* EMOJI */}
      <div className="relative">
        <ToolbarButton
          title="Emoji"
          active={showEmojiPicker}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          <Smile size={16} />
        </ToolbarButton>

        {showEmojiPicker && (
          <div className="absolute left-1/2 top-full z-[300] mt-2 -translate-x-1/2">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={emojiTheme}
              width={350}
              height={450}
              searchDisabled={false}
              skinTonesDisabled={false}
              previewConfig={{ showPreview: true }}
            />
          </div>
        )}
      </div>

      {/* LINK */}
      <div className="relative">
        <ToolbarButton
          title="Link"
          active={showLinkPopup}
          onClick={() => {
            // When opening the popup, capture any selected text
            if (!showLinkPopup) {
              editor.getEditorState().read(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  const selectedText = selection.getTextContent();
                  if (selectedText) {
                    setLinkText(selectedText);
                  }
                }
              });
            }
            setShowLinkPopup((previous) => !previous);
            setShowColorPicker(false);
            setShowCodeToolbar(false);
          }}
        >
          <Link2 size={16} />
        </ToolbarButton>

        {showLinkPopup && (
          <div className="absolute left-1/2 top-full z-[300] mt-2 w-[320px] -translate-x-1/2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-xl">
            <div className="mb-3">
              <label className="mb-1.5 block text-sm text-gray-600 dark:text-slate-300">
                Paste or search for link
              </label>
              <input
                autoFocus
                type="text"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleInsertLink();
                  }
                  if (event.key === 'Escape') {
                    setShowLinkPopup(false);
                  }
                }}
                placeholder=""
                className="h-10 w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 text-sm text-gray-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="mb-3">
              <label className="mb-1.5 block text-sm text-gray-600 dark:text-slate-300">
                Display text (optional)
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(event) => setLinkText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleInsertLink();
                  }
                  if (event.key === 'Escape') {
                    setShowLinkPopup(false);
                  }
                }}
                className="h-10 w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 text-sm text-gray-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setLinkUrl('');
                  setLinkText('');
                  setShowLinkPopup(false);
                }}
                className="rounded-md px-3 py-1.5 text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!linkUrl.trim()}
                onClick={handleInsertLink}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Insert
              </button>
            </div>
          </div>
        )}
      </div>

      <ToolbarButton title="Undo" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
        <Undo2 size={16} />
      </ToolbarButton>

      <ToolbarButton title="Redo" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
        <Redo2 size={16} />
      </ToolbarButton>

      <div className="flex-1" />
    </div>
  );
}
