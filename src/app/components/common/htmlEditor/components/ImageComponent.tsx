'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { X, ImageIcon } from 'lucide-react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import type { ImageComponentProps } from '../types';
import { $isImageNode } from '../nodes/ImageNode';

export function ImageComponent({
  src,
  altText,
  nodeKey,
  width: initialWidth,
  height: initialHeight,
}: ImageComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: initialWidth, height: initialHeight });
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, corner: '' });

  const handleRemove = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) {
        node.remove();
      }
    });
  };

  const updateNodeDimensions = (width: number, height: number) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && $isImageNode(node)) {
        const writable = node.getWritable();
        writable.__width = width;
        writable.__height = height;
      }
    });
  };

  const startResize = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    const currentWidth = dimensions.width || naturalDimensions.width;
    const currentHeight = dimensions.height || naturalDimensions.height;

    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: currentWidth,
      height: currentHeight,
      corner,
    };

    let latestWidth = currentWidth;
    let latestHeight = currentHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const aspectRatio = resizeStartRef.current.width / resizeStartRef.current.height;

      let newWidth = resizeStartRef.current.width;
      let newHeight = resizeStartRef.current.height;

      switch (resizeStartRef.current.corner) {
        case 'se': // bottom-right
          newWidth = Math.max(50, resizeStartRef.current.width + deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'sw': // bottom-left
          newWidth = Math.max(50, resizeStartRef.current.width - deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'ne': // top-right
          newWidth = Math.max(50, resizeStartRef.current.width + deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'nw': // top-left
          newWidth = Math.max(50, resizeStartRef.current.width - deltaX);
          newHeight = newWidth / aspectRatio;
          break;
      }

      latestWidth = Math.round(newWidth);
      latestHeight = Math.round(newHeight);
      setDimensions({ width: latestWidth, height: latestHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      updateNodeDimensions(latestWidth, latestHeight);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const displayWidth = dimensions.width || initialWidth;
  const displayHeight = dimensions.height || initialHeight;

  return (
    <span
      className="relative my-2 inline-block max-w-full align-top"
      contentEditable={false}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => !isResizing && setHovered(false)}
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
        <div className="relative inline-block">
          <Image
            ref={imageRef}
            src={src}
            alt={altText}
            width={naturalDimensions?.width ?? displayWidth ?? 800}
            height={naturalDimensions?.height ?? displayHeight ?? 600}
            draggable={false}
            unoptimized
            loading="eager"
            onLoad={(e) => {
              const img = e.currentTarget;
              setLoaded(true);
              setHasError(false);
              setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            }}
            onError={() => {
              setLoaded(false);
              setHasError(true);
            }}
            className={`max-w-full rounded-md border ${
              hovered || isResizing
                ? 'border-blue-400 dark:border-blue-500 border-2'
                : 'border-gray-200 dark:border-slate-700'
            } ${loaded ? 'block' : 'hidden'}`}
            style={{
              width: displayWidth ? `${displayWidth}px` : 'auto',
              height: displayHeight ? `${displayHeight}px` : 'auto',
              maxHeight: displayWidth || displayHeight ? 'none' : 320,
            }}
          />

          {/* Resize Handles */}
          {(hovered || isResizing) && loaded && (
            <>
              {/* Corner handles */}
              <div
                onMouseDown={(e) => startResize(e, 'nw')}
                className="absolute -left-1.5 -top-1.5 h-3 w-3 cursor-nw-resize rounded-full border-2 border-blue-500 bg-white dark:bg-slate-800"
                style={{ zIndex: 10 }}
              />
              <div
                onMouseDown={(e) => startResize(e, 'ne')}
                className="absolute -right-1.5 -top-1.5 h-3 w-3 cursor-ne-resize rounded-full border-2 border-blue-500 bg-white dark:bg-slate-800"
                style={{ zIndex: 10 }}
              />
              <div
                onMouseDown={(e) => startResize(e, 'sw')}
                className="absolute -bottom-1.5 -left-1.5 h-3 w-3 cursor-sw-resize rounded-full border-2 border-blue-500 bg-white dark:bg-slate-800"
                style={{ zIndex: 10 }}
              />
              <div
                onMouseDown={(e) => startResize(e, 'se')}
                className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-se-resize rounded-full border-2 border-blue-500 bg-white dark:bg-slate-800"
                style={{ zIndex: 10 }}
              />

              {/* Dimension display */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-blue-500 px-2 py-1 text-xs text-white whitespace-nowrap">
                {displayWidth || naturalDimensions.width} ×{' '}
                {displayHeight || naturalDimensions.height}
              </div>
            </>
          )}
        </div>
      )}

      {hovered && !isResizing && (
        <button
          type="button"
          title="Remove image"
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleRemove}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          style={{ zIndex: 11 }}
        >
          <X size={14} />
        </button>
      )}
    </span>
  );
}
