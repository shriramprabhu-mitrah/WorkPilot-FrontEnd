'use client';

import type { EditorState, LexicalEditor } from 'lexical';
import { useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { $generateHtmlFromNodes } from '@lexical/html';
import { initialConfig } from './config/editorConfig';
import { EditorToolbar } from './components/EditorToolbar';
import { EditorPlaceholder } from './components/EditorPlaceholder';
import { HtmlPastePlugin } from './plugins/HtmlPastePlugin';
import { ImagesPlugin } from './plugins/ImagesPlugin';
import { LinkClickPlugin } from './plugins/LinkClickPlugin';
import { InitialValuePlugin } from './plugins/InitialValuePlugin';
import { DragDropPastePlugin } from './plugins/DragDropPastePlugin';
import type { WpRichTextEditorProps } from './types';

export type { WpRichTextEditorProps, InsertImagePayload } from './types';
export { INSERT_IMAGE_COMMAND } from './nodes/ImageNode';

export default function WpRichTextEditor({
  value = '',
  onChange,
  placeholder = 'Words not enough? Type : to add emoji. 😍',
  minHeight = '150px',
  disabled = false,
  className = '',
  onImageUpload,
}: WpRichTextEditorProps) {
  const [isPasteDropUploading, setIsPasteDropUploading] = useState(false);

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
        <EditorToolbar
            onImageUpload={onImageUpload}
            isUploadingImage={isPasteDropUploading}
            onUploadingChange={setIsPasteDropUploading}
          />
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
          <DragDropPastePlugin
              onImageUpload={onImageUpload}
              onUploadingChange={setIsPasteDropUploading}
            />

          <InitialValuePlugin value={value} />
          <OnChangePlugin onChange={handleChange} />
        </div>
      </LexicalComposer>
    </div>
  );
}
