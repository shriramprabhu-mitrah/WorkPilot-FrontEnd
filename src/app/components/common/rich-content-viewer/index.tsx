import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
interface RichContentViewerProps {
  content: string;
  className?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canDownload?: boolean;
  onEditImage?: (imgSrc: string, attachmentId: string) => void;
  onDeleteImage?: (attachmentId: string) => void;
  onDownloadImage?: (attachmentId: string) => void;
}

export const RichContentViewer: React.FC<RichContentViewerProps> = ({
  content,
  className = '',
  canEdit = false,
  canDownload = false,
  onEditImage,
  onDownloadImage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<{
    src: string;
    attachmentId: string | null;
  } | null>(null);

  const extractAttachmentId = (img: HTMLImageElement): string | null => {
    const dataAttachmentId = img.getAttribute('data-attachment-id');
    if (dataAttachmentId) {
      return dataAttachmentId;
    }

    const imgSrc = img.src;
    try {
      const url = new URL(imgSrc);
      const attachmentIdFromQuery = url.searchParams.get('attachment_id');
      if (attachmentIdFromQuery) {
        return attachmentIdFromQuery;
      }
    } catch {}

    const match = imgSrc.match(/\/attachments\/([^/?]+)/);

    if (!match) return null;

    const fullFilename = match[1];

    const lastDotIndex = fullFilename.lastIndexOf('.');
    const filenameWithoutExt =
      lastDotIndex !== -1 ? fullFilename.substring(0, lastDotIndex) : fullFilename;

    const uuidMatch = filenameWithoutExt.match(
      /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
    );

    if (uuidMatch) {
      const attachmentId = uuidMatch[1];
      return attachmentId;
    }

    return filenameWithoutExt;
  };
  const openImagePreview = (img: HTMLImageElement) => {
    setSelectedPreviewImage({
      src: img.src,
      attachmentId: extractAttachmentId(img),
    });
  };
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
  
    root.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  
    const btn = 'p-1 text-white hover:text-blue-400 hover:bg-white/10 rounded transition-colors cursor-pointer';
    const svg = (p: string) =>
      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  
    root.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
      if (img.parentElement?.classList.contains('img-overlay-wrapper')) return;
  
      const wrapper = document.createElement('div');
      wrapper.className = 'img-overlay-wrapper relative inline-block group/img my-2 max-w-full';
      img.parentNode?.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      img.style.cursor = 'pointer';
  
      const overlay = document.createElement('div');
      overlay.className =
        'absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/60 p-1 rounded-md shadow-md z-10';
      overlay.innerHTML =
        `<button type="button" data-action="preview" title="Preview Image" class="${btn}">${svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>')}</button>` +
        (canDownload
          ? `<button type="button" data-action="download" title="Download Image" class="${btn}">${svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>')}</button>`
          : '') +
        (canEdit
          ? `<button type="button" data-action="edit" title="Edit / Replace Image" class="${btn}">${svg('<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>')}</button>`
          : '');
      wrapper.appendChild(overlay);
    });
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
  
    const href = target.closest('a')?.getAttribute('href');
    if (href) {
      e.preventDefault();
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
  
    const img = target.closest('.img-overlay-wrapper')?.querySelector('img');
    if (!img) return;
    e.preventDefault();
  
    const action = target.closest<HTMLElement>('[data-action]')?.dataset.action ?? 'preview';
    const attachmentId = extractAttachmentId(img);
  
    if (action === 'download') {
      if (attachmentId) onDownloadImage?.(attachmentId);
    } else if (action === 'edit') {
      if (attachmentId) onEditImage?.(img.src, attachmentId);
    } else {
      openImagePreview(img);
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        className={`rich-content-viewer [&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:underline [&_a]:cursor-pointer hover:[&_a]:text-blue-700 hover:[&_a]:dark:text-blue-300 ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Optional full-screen lightbox / preview */}
      {selectedPreviewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedPreviewImage.src}
              alt="Preview"
              width={1200}
              height={800}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />

            {canDownload && selectedPreviewImage.attachmentId && (
              <button
                type="button"
                title="Download Image"
                className="absolute top-2 right-2 p-2 text-white hover:text-green-400 hover:bg-white/10 rounded-md transition-colors cursor-pointer bg-black/60 backdrop-blur-xs"
                onClick={() => {
                  onDownloadImage?.(selectedPreviewImage.attachmentId!);
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
