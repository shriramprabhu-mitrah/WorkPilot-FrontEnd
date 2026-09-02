import React, { useRef, useState, useEffect } from 'react';

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
  canDelete = false,
  canDownload = false,
  onEditImage,
  onDeleteImage,
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
    } catch (e) { }

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
    if (!containerRef.current) return;

    const images =
      containerRef.current.querySelectorAll<HTMLImageElement>('img');

    images.forEach((img) => {
      if (img.parentElement?.classList.contains('img-overlay-wrapper')) {
        return;
      }

      const wrapper = document.createElement('div');

      wrapper.className =
        'img-overlay-wrapper relative inline-block group/img my-2 max-w-full';

      // Wrap image
      img.parentNode?.insertBefore(wrapper, img);
      wrapper.appendChild(img);

      const attachmentId = extractAttachmentId(img);
      img.style.cursor = 'pointer';

      img.onclick = (e) => {
        e.stopPropagation();
        openImagePreview(img);
      };
      // Create overlay only when existing image actions are available
      if (canEdit || canDelete || canDownload) {
        const overlay = document.createElement('div');

        overlay.className =
          'absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs p-1 rounded-md shadow-md z-10';

        // Preview button
        const previewBtn = document.createElement('button');

        previewBtn.type = 'button';
        previewBtn.title = 'Preview Image';

        previewBtn.className =
          'p-1 text-white hover:text-blue-400 hover:bg-white/10 rounded transition-colors cursor-pointer';

        previewBtn.innerHTML = `
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
`;

        previewBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          openImagePreview(img);
        };

        overlay.appendChild(previewBtn);

        // Download button - EXISTING BEHAVIOR
        if (canDownload && attachmentId) {
          const downloadBtn = document.createElement('button');

          downloadBtn.type = 'button';
          downloadBtn.title = 'Download Image';

          downloadBtn.className =
            'p-1 text-white hover:text-green-400 hover:bg-white/10 rounded transition-colors cursor-pointer';

          downloadBtn.innerHTML = `
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        `;

          downloadBtn.onclick = (e) => {
            e.stopPropagation();
            onDownloadImage?.(attachmentId);
          };

          overlay.appendChild(downloadBtn);
        }

        // Edit button - EXISTING BEHAVIOR
        if (canEdit && attachmentId) {
          const editBtn = document.createElement('button');

          editBtn.type = 'button';
          editBtn.title = 'Edit / Replace Image';

          editBtn.className =
            'p-1 text-white hover:text-blue-400 hover:bg-white/10 rounded transition-colors cursor-pointer';

          editBtn.innerHTML = `
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          </svg>
        `;

          editBtn.onclick = (e) => {
            e.stopPropagation();
            onEditImage?.(img.src, attachmentId);
          };

          overlay.appendChild(editBtn);
        }

        // Delete button
        // if (canDelete && attachmentId) {
        //   const deleteBtn = document.createElement('button');
        //   deleteBtn.type = 'button';
        //   deleteBtn.title = 'Delete Image';
        //   deleteBtn.className =
        //     'p-1 text-white hover:text-red-400 hover:bg-white/10 rounded transition-colors cursor-pointer';
        //   deleteBtn.innerHTML = `
        //     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        //       <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        //     </svg>
        //   `;
        //   deleteBtn.onclick = (e) => {
        //     e.stopPropagation();
        //     onDeleteImage?.(attachmentId);
        //   };
        //   overlay.appendChild(deleteBtn);
        // }
        wrapper.appendChild(overlay);
      }
    });
  }, [
    content,
    canEdit,
    canDelete,
    canDownload,
    onEditImage,
    onDeleteImage,
    onDownloadImage,
    selectedPreviewImage,
  ]);

  return (
    <>
      <div ref={containerRef} className={className} dangerouslySetInnerHTML={{ __html: content }} />

      {/* Optional full-screen lightbox / preview */}
      {selectedPreviewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPreviewImage.src}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
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

