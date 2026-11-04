'use client';

import { Plus, Paperclip, FileText, Download, Trash2 } from 'lucide-react';

interface TaskAttachment {
  id: string;
  original_filename: string;
  file_size: number;
}

interface TaskAttachmentsProps {
  canEditTask: boolean;
  canDeleteTask: boolean;
  attachments:
    | {
        data?: TaskAttachment[];
      }
    | undefined;
  isLoadingAttachments: boolean;
  isFetchingAttachments: boolean;
  isDownloadingAttachment: boolean;
  isDeletingAttachment: boolean;
  onAttachmentUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAttachmentDownload: (id: string, filename: string) => void;
  onAttachmentDelete: (id: string) => void;
  formatFileSize: (size: number) => string;
}

export function TaskAttachments({
  canEditTask,
  canDeleteTask,
  attachments,
  isLoadingAttachments,
  isFetchingAttachments,
  isDownloadingAttachment,
  isDeletingAttachment,
  onAttachmentUpload,
  onAttachmentDownload,
  onAttachmentDelete,
  formatFileSize,
}: TaskAttachmentsProps) {
  return (
    <div className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <p className="text-base font-semibold text-gray-800 dark:text-slate-200">Attachments</p>
        {canEditTask && (
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
            <Plus size={14} />
            Add
            <input type="file" className="hidden" onChange={onAttachmentUpload} />
          </label>
        )}
      </div>
      {isLoadingAttachments || isFetchingAttachments ? (
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-5 text-center bg-white dark:bg-slate-800">
          <p className="text-sm text-gray-400 dark:text-slate-500">Loading attachments...</p>
        </div>
      ) : !attachments?.data?.length ? (
        <div className="border border-dashed border-gray-300 dark:border-slate-600 rounded-xl px-4 py-5 text-center bg-white dark:bg-slate-800">
          <div className="w-9 h-9 mx-auto mb-2 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
            <Paperclip size={16} className="text-gray-400 dark:text-slate-200" />
          </div>

          <p className="text-sm text-gray-500 dark:text-slate-200">No attachments</p>

          <p className="text-xs text-gray-400 dark:text-slate-200 mt-1">Add files to this task</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.data.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5"
            >
              {/* File icon */}
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <FileText size={17} className="text-gray-500 dark:text-slate-400" />
              </div>

              {/* File details */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-gray-700 dark:text-slate-200 truncate"
                  title={attachment.original_filename}
                >
                  {attachment.original_filename}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  {formatFileSize(attachment.file_size)}
                </p>
              </div>

              {/* Download */}
              <button
                type="button"
                onClick={() => onAttachmentDownload(attachment.id, attachment.original_filename)}
                disabled={isDownloadingAttachment}
                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                title="Download"
              >
                <Download size={15} />
              </button>

              {/* Delete */}
              {(canEditTask || canDeleteTask) && (
                <button
                  type="button"
                  onClick={() => onAttachmentDelete(attachment.id)}
                  disabled={isDeletingAttachment}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
