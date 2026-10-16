'use client';

import { Plus, FileText, Download, Trash2 } from 'lucide-react';
import { logger } from '@/src/lib/utils/logger';

interface Attachment {
  id: string;
  original_filename: string;
  file_size?: number | null;
}

interface AttachmentsSectionProps {
  attachmentsProps: {
    attachments: Attachment[];
    canEditUserStory: boolean;
    canDeleteUserStory: boolean;
    isUploadingUserStoryAttachment: boolean;
    isLoadingAttachments: boolean;
    isDownloadingAttachment: boolean;
    isDeletingAttachment: boolean;
    handleAttachmentUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    downloadAttachment: {
      mutateAsync: (id: string) => Promise<Blob>;
    };
    deleteAttachmentAsync: (id: string) => Promise<unknown>;
  };
}

export default function AttachmentsSection({ attachmentsProps }: AttachmentsSectionProps) {
  const {
    attachments,
    canEditUserStory,
    canDeleteUserStory,
    isUploadingUserStoryAttachment,
    isLoadingAttachments,
    isDownloadingAttachment,
    isDeletingAttachment,
    handleAttachmentUpload,
    downloadAttachment,
    deleteAttachmentAsync,
  } = attachmentsProps;

  const handleDownload = async (attachment: Attachment) => {
    try {
      const blob = await downloadAttachment.mutateAsync(attachment.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = attachment.original_filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      logger.log('Failed to download attachment', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAttachmentAsync(id);
    } catch {}
  };

  return (
    <div className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">Attachments</p>

        {canEditUserStory && (
          <>
            <label
              htmlFor="user-story-attachment"
              className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                isUploadingUserStoryAttachment ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <Plus size={14} />
              {isUploadingUserStoryAttachment ? 'Uploading...' : 'Add'}
            </label>

            <input
              id="user-story-attachment"
              type="file"
              className="hidden"
              onChange={handleAttachmentUpload}
              disabled={isUploadingUserStoryAttachment}
            />
          </>
        )}
      </div>

      {isLoadingAttachments ? (
        <div className="border border-dashed border-gray-300 dark:border-slate-600 rounded-xl px-4 py-5 text-center">
          <p className="text-sm text-gray-500 dark:text-slate-400">Loading attachments...</p>
        </div>
      ) : attachments.length === 0 ? (
        <div className="border border-dashed border-gray-300 dark:border-slate-600 rounded-xl px-4 py-5 text-center bg-white dark:bg-slate-800">
          <p className="text-sm text-gray-500 dark:text-slate-400">No attachments</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            Add files to this user story
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />

                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-200 truncate">
                    {attachment.original_filename}
                  </p>

                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    {attachment.file_size ? `${Math.round(attachment.file_size / 1024)} KB` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={isDownloadingAttachment}
                  onClick={() => handleDownload(attachment)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                  title="Download"
                >
                  <Download size={15} />
                </button>

                {(canEditUserStory || canDeleteUserStory) && (
                  <button
                    type="button"
                    disabled={isDeletingAttachment}
                    onClick={() => handleDelete(attachment.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
