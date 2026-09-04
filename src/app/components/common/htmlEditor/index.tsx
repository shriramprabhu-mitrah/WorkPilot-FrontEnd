'use client';

import React, { useEffect, useRef, useState } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useTheme } from 'next-themes';
import {
  $getRoot,
  $getSelection,
  $getNodeByKey,
  $insertNodes,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_EDITOR,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  createCommand,
  DecoratorNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorState,
  type LexicalCommand,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
  PASTE_COMMAND,
  $createTextNode,
} from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from '@lexical/list';
import { LinkNode, AutoLinkNode, $createLinkNode } from '@lexical/link';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { $patchStyleText } from '@lexical/selection';
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
  Image as ImageIcon,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';

interface WpRichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
  className?: string;
  /** Called when the user picks an image file. Must resolve to the uploaded image's public URL. */
  onImageUpload?: (file: File) => Promise<string>;
}

export interface InsertImagePayload {
  src: string;
  altText: string;
  attachmentId?: string;
}

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand('INSERT_IMAGE_COMMAND');

type SerializedImageNode = Spread<
  { src: string; altText: string; attachmentId?: string; type: 'image'; version: 1 },
  SerializedLexicalNode
>;

function convertImageElement(domNode: HTMLElement): DOMConversionOutput | null {
  if (domNode instanceof HTMLImageElement) {
    const { src, alt } = domNode;
    const attachmentId = domNode.getAttribute('data-attachment-id') || undefined;
    const node = $createImageNode({ src, altText: alt || '', attachmentId });
    return { node };
  }
  return null;
}

function ImageComponent({
  src,
  altText,
  nodeKey,
}: {
  src: string;
  altText: string;
  nodeKey: NodeKey;
}) {
  const [editor] = useLexicalComposerContext();
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleRemove = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);

      if (node) {
        node.remove();
      }
    });
  };

  return (
    <span
      className="relative my-2 inline-block max-w-full align-top"
      contentEditable={false}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!loaded && !hasError && (
        <div className="flex min-h-[120px] min-w-[200px] items-center justify-center rounded-md border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 dark:border-slate-600 border-t-gray-600 dark:border-t-slate-300" />
            Loading image...
          </div>
        </div>
      )}

      {hasError ? (
        <div className="flex min-h-[100px] min-w-[220px] flex-col items-center justify-center rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center">
          <ImageIcon size={24} className="mb-2 text-red-400" />

          <p className="text-sm font-medium text-red-600">Unable to load image</p>

          <p className="mt-1 max-w-[280px] break-all text-xs text-red-500">{src}</p>
        </div>
      ) : (
        <img
          src={src}
          alt={altText}
          draggable={false}
          onLoad={() => {
            setLoaded(true);
            setHasError(false);
          }}
          onError={() => {
            setLoaded(false);
            setHasError(true);
          }}
          className={`max-w-full rounded-md border border-gray-200 dark:border-slate-700 ${loaded ? 'block' : 'hidden'}`}
          style={{
            maxHeight: 320,
            width: 'auto',
            height: 'auto',
          }}
        />
      )}

      {hovered && (
        <button
          type="button"
          title="Remove image"
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleRemove}
          className="
            absolute right-1.5 top-1.5
            flex h-6 w-6 items-center justify-center
            rounded-full bg-black/60 text-white
            transition-colors hover:bg-black/80
          "
        >
          <X size={14} />
        </button>
      )}
    </span>
  );
}

function HtmlPastePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const html = event.clipboardData?.getData('text/html');
        if (!html) {
          return false;
        }
        event.preventDefault();
        editor.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(html, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes(nodes);
          }
        });

        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}

export class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  __altText: string;
  __attachmentId?: string;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__attachmentId, node.__key);
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText, attachmentId } = serializedNode;
    return $createImageNode({ src, altText, attachmentId });
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.__src,
      altText: this.__altText,
      attachmentId: this.__attachmentId,
      type: 'image',
      version: 1,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    if (this.__attachmentId) {
      element.setAttribute('data-attachment-id', this.__attachmentId);
    }
    return { element };
  }

  constructor(src: string, altText: string, attachmentId?: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__attachmentId = attachmentId;
  }

  createDOM(): HTMLElement {
    return document.createElement('span');
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.ReactNode {
    return <ImageComponent src={this.__src} altText={this.__altText} nodeKey={this.getKey()} />;
  }
}

export function $createImageNode({ src, altText, attachmentId }: InsertImagePayload): ImageNode {
  return new ImageNode(src, altText, attachmentId);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}

function ImagesPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagesPlugin: ImageNode not registered on editor');
    }

    return editor.registerCommand<InsertImagePayload>(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const imageNode = $createImageNode(payload);
        $insertNodes([imageNode]);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}

/* -------------------------------------------------------------------------- */

const theme = {
  paragraph: 'mb-1',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: 'underline line-through',
  },
  link: 'cursor-pointer text-blue-600 underline',
  list: {
    ul: 'ml-6 list-disc',
    ol: 'ml-6 list-decimal',
    listitem: 'ml-1',
  },
  heading: {
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-bold',
    h3: 'text-lg font-semibold',
  },
  quote: 'border-l-4 border-gray-300 pl-4 italic text-gray-600',
};

const initialConfig = {
  namespace: 'WpRichTextEditor',
  theme,
  onError(error: Error) {},
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, ImageNode],
};

interface ToolbarButtonProps {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}

function ToolbarButton({
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

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-gray-200 dark:bg-slate-600" />;
}

function TextColorPicker({
  editor,
  open,
  onClose,
}: {
  editor: LexicalEditor;
  open: boolean;
  onClose: () => void;
}) {
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
    <div
      className="
        absolute left-1/2 top-full z-[100]
        mt-2 w-[225px]
        -translate-x-1/2
        rounded-xl border border-gray-200 dark:border-slate-700
        bg-white dark:bg-slate-800 p-3
        shadow-xl
      "
    >
      <div className="mb-3 text-sm font-semibold text-gray-700 dark:text-slate-200">Text color</div>

      <div className="grid grid-cols-7 gap-2">
        {colors.map((color, index) => (
          <button
            key={`${color}-${index}`}
            type="button"
            title={color}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyColor(color)}
            className="
              relative flex h-6 w-6
              items-center justify-center
              rounded-md border border-gray-200 dark:border-slate-600
              transition-transform
              hover:scale-110
            "
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
        className="
          mt-3 flex h-9 w-full
          items-center justify-center
          rounded-md border border-gray-200 dark:border-slate-600
          text-sm font-medium
          text-gray-700 dark:text-slate-200
          transition-colors
          hover:bg-gray-50 dark:hover:bg-slate-700
        "
      >
        Remove color
      </button>
    </div>
  );
}

function InitialValuePlugin({ value }: { value?: string }) {
  const [editor] = useLexicalComposerContext();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    if (!value) {
      initialized.current = true;
      return;
    }
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(value, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      if (nodes.length > 0) {
        root.select();
        $insertNodes(nodes);
      }
    });

    initialized.current = true;
  }, [editor, value]);

  return null;
}

function LinkClickPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const rootElement = editor.getRootElement();

    if (!rootElement) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');

      if (!link) return;

      const href = link.href;

      if (!href) return;

      event.preventDefault();
      event.stopPropagation();

      window.open(href, '_blank', 'noopener,noreferrer');
    };

    rootElement.addEventListener('click', handleClick, true);

    return () => {
      rootElement.removeEventListener('click', handleClick, true);
    };
  }, [editor]);

  return null;
}

function EditorToolbar({ onImageUpload }: { onImageUpload?: (file: File) => Promise<string> }) {
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
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const link = $createLinkNode(finalUrl, {
        target: '_blank',
        rel: 'noopener noreferrer',
      });
      link.append($createTextNode(linkText.trim() || finalUrl));
      selection.insertNodes([link]);
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
    } catch (err) {
      setImageError('Image upload failed, please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div
      ref={toolbarRef}
      className="
        relative z-20
        flex min-h-12
        items-center gap-1
        overflow-visible
        border-b border-gray-200 dark:border-slate-700
        bg-white dark:bg-slate-800
        px-3 py-2
      "
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
          <span
            className="
            flex h-5 w-5
            items-center justify-center
            rounded border border-gray-300 dark:border-slate-500
            text-xs font-semibold
          "
          >
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
          <div
            className="
              absolute left-1/2 top-full z-[100]
              mt-2 w-[220px]
              -translate-x-1/2
              rounded-md border border-red-200 dark:border-red-800
              bg-red-50 dark:bg-red-900/20 px-3 py-2
              text-xs text-red-600 dark:text-red-400
              shadow-lg
            "
          >
            {imageError}
          </div>
        )}
      </div>

      <div className="relative">
        <ToolbarButton
          title="Emoji"
          active={showEmojiPicker}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          <Smile size={16} />
        </ToolbarButton>

        {showEmojiPicker && (
          <div
            className="
        absolute
        left-1/2
        top-full
        z-[300]
        mt-2
        -translate-x-1/2
      "
          >
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

      <div className="relative">
        <ToolbarButton
          title="Link"
          active={showLinkPopup}
          onClick={() => {
            setShowLinkPopup((previous) => !previous);
            setShowColorPicker(false);
            setShowCodeToolbar(false);
          }}
        >
          <Link2 size={16} />
        </ToolbarButton>
        {showLinkPopup && (
          <div
            className="
        absolute
        left-1/2
        top-full
        z-[300]
        mt-2
        w-[320px]
        -translate-x-1/2
        rounded-lg
        border border-gray-200 dark:border-slate-700
        bg-white dark:bg-slate-800
        p-3
        shadow-xl
      "
          >
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
                className="
            h-10
            w-full
            rounded-md
            border border-gray-300 dark:border-slate-600
            bg-white dark:bg-slate-700
            px-3
            text-sm text-gray-900 dark:text-slate-100
            outline-none
            focus:border-blue-500
            focus:ring-1
            focus:ring-blue-500
          "
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
                className="
            h-10
            w-full
            rounded-md
            border border-gray-300 dark:border-slate-600
            bg-white dark:bg-slate-700
            px-3
            text-sm text-gray-900 dark:text-slate-100
            outline-none
            focus:border-blue-500
            focus:ring-1
            focus:ring-blue-500
          "
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
                className="
            rounded-md
            px-3
            py-1.5
            text-sm
            text-gray-600 dark:text-slate-300
            hover:bg-gray-100 dark:hover:bg-slate-700
          "
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!linkUrl.trim()}
                onClick={handleInsertLink}
                className="
            rounded-md
            bg-blue-600
            px-3
            py-1.5
            text-sm
            font-medium
            text-white
            disabled:cursor-not-allowed
            disabled:opacity-50
            hover:bg-blue-700
          "
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

function EditorPlaceholder({ text }: { text: string }) {
  return (
    <div
      className="
        pointer-events-none
        absolute left-4 top-4
        text-sm text-gray-400 dark:text-slate-100
      "
    >
      {text}
    </div>
  );
}

export default function WpRichTextEditor({
  value = '',
  onChange,
  placeholder = 'Words not enough? Type : to add emoji. 😍',
  minHeight = '150px',
  disabled = false,
  className = '',
  onImageUpload,
}: WpRichTextEditorProps) {
  const handleChange = (editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor);
      const decodedHtml = html
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');

      onChange?.(decodedHtml);
    });
  };

  return (
    <div
      className={`
        relative overflow-visible
        rounded-lg border border-gray-300 dark:border-slate-600
        bg-white dark:bg-slate-800
        transition-colors
        ${
          disabled
            ? 'pointer-events-none bg-gray-50 dark:bg-slate-700 opacity-60'
            : 'focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'
        }
        ${className}
      `}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <EditorToolbar onImageUpload={onImageUpload} />
        <div className="relative z-10">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-label="Rich text editor"
                className="
                  w-full overflow-auto
                  px-4 py-3
                  text-sm text-gray-800 dark:text-slate-100
                  outline-none
                  [&_a]:text-blue-600 dark:[&_a]:text-blue-400
                  [&_a]:underline
                  [&_ol]:ml-6
                  [&_ol]:list-decimal
                  [&_ul]:ml-6
                  [&_ul]:list-disc
                  [&_p]:mb-1
                  [&_pre]:my-2
                  [&_pre]:overflow-x-auto
                  [&_pre]:rounded-md
                  [&_pre]:bg-gray-100 dark:[&_pre]:bg-slate-700
                  [&_pre]:p-4
                  [&_pre]:font-mono
                  [&_pre]:text-sm
                "
                style={{ minHeight }}
              />
            }
            placeholder={<EditorPlaceholder text={placeholder} />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <HtmlPastePlugin />
          <ListPlugin />
          <LinkPlugin />
          <ImagesPlugin />
          <LinkClickPlugin />

          <InitialValuePlugin value={value} />
          <OnChangePlugin onChange={handleChange} />
        </div>
      </LexicalComposer>
    </div>
  );
}
