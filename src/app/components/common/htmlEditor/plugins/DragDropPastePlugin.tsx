'use client';

import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_LOW, DRAGOVER_COMMAND, DROP_COMMAND, PASTE_COMMAND } from 'lexical';
import { INSERT_IMAGE_COMMAND } from '../nodes/ImageNode';

interface DragDropPastePluginProps {
  onImageUpload?: (file: File) => Promise<string>;
  onUploadingChange?: (isUploading: boolean) => void;
}

export function DragDropPastePlugin({
  onImageUpload,
  onUploadingChange,
}: DragDropPastePluginProps): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadingCountRef = React.useRef(0);

  const beginUpload = () => {
    uploadingCountRef.current += 1;
    if (uploadingCountRef.current === 1) onUploadingChange?.(true);
  };

  const endUpload = () => {
    uploadingCountRef.current = Math.max(0, uploadingCountRef.current - 1);
    if (uploadingCountRef.current === 0) onUploadingChange?.(false);
  };

  useEffect(() => {
    // Handle drag over
    const removeDragOverListener = editor.registerCommand(
      DRAGOVER_COMMAND,
      (event: DragEvent) => {
        event.preventDefault();
        if (event.dataTransfer?.types.includes('Files')) {
          setIsDragging(true);
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    // Handle drop
    const removeDropListener = editor.registerCommand(
      DROP_COMMAND,
      (event: DragEvent) => {
        event.preventDefault();
        setIsDragging(false);
        setUploadError(null);

        const files = Array.from(event.dataTransfer?.files || []);
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
          return false;
        }

        if (!onImageUpload) {
          setUploadError('Image upload is not configured.');
          setTimeout(() => setUploadError(null), 3000);
          return true;
        }

        // Process all image files
        imageFiles.forEach(async (file) => {
          const MAX_SIZE_MB = 5;
          if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setUploadError(`Image "${file.name}" is larger than ${MAX_SIZE_MB}MB.`);
            setTimeout(() => setUploadError(null), 3000);
            return;
          }

          beginUpload();
          try {
            const url = await onImageUpload(file);
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
              src: url,
              altText: file.name,
            });
          } catch {
            setUploadError(`Failed to upload "${file.name}". Please try again.`);
            setTimeout(() => setUploadError(null), 3000);
          } finally {
            endUpload();
          }
        });

        return true;
      },
      COMMAND_PRIORITY_LOW
    );

    // Handle paste
    const removePasteListener = editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItems = items.filter((item) => item.type.startsWith('image/'));

        if (imageItems.length === 0) {
          return false;
        }

        if (!onImageUpload) {
          setUploadError('Image upload is not configured.');
          setTimeout(() => setUploadError(null), 3000);
          return false;
        }

        event.preventDefault();
        setUploadError(null);

        // Process all pasted images
        imageItems.forEach((item) => {
          const file = item.getAsFile();
          if (!file) return;

          const MAX_SIZE_MB = 5;
          if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setUploadError(`Image is larger than ${MAX_SIZE_MB}MB.`);
            setTimeout(() => setUploadError(null), 3000);
            return;
          }

          beginUpload();
          (async () => {
            try {
              const url = await onImageUpload(file);

              editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                src: url,
                altText: file.name || 'Pasted image',
              });
            } catch {
              setUploadError('Failed to upload image. Please try again.');
              setTimeout(() => setUploadError(null), 3000);
            } finally {
              endUpload();
            }
          })();
        });

        return true;
      },
      COMMAND_PRIORITY_LOW
    );

    // Handle drag leave (when dragging out of the editor)
    const handleDragLeave = (event: DragEvent) => {
      const target = event.target as HTMLElement;
      const relatedTarget = event.relatedTarget as HTMLElement;

      // Only set isDragging to false if we're leaving the editor entirely
      if (!relatedTarget || !target.contains(relatedTarget)) {
        setIsDragging(false);
      }
    };

    const editorElement = editor.getRootElement();
    editorElement?.addEventListener('dragleave', handleDragLeave as EventListener);

    return () => {
      removeDragOverListener();
      removeDropListener();
      removePasteListener();
      editorElement?.removeEventListener('dragleave', handleDragLeave as EventListener);
    };
  }, [editor, onImageUpload]);

  return (
    <>
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-500 bg-blue-50/90 dark:bg-blue-900/20">
          <div className="rounded-lg bg-white dark:bg-slate-800 px-6 py-4 shadow-lg">
            <p className="text-center text-sm font-medium text-blue-600 dark:text-blue-400">
              Drop images here to upload
            </p>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/90 px-4 py-2 shadow-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
        </div>
      )}
    </>
  );
}
