'use client';

import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';

import { WpInput } from '@/src/app/components/common/input';
import { WpButton } from '@/src/app/components/common/button';

import {
  useCreateStatus,
  useUpdateStatus,
  useDeleteStatus,
} from '@/src/modules/project/hooks/useLabels';

import { CustomStatus } from '@/src/types/colors';

interface StatusModalProps {
  projectId: string;
  mode: 'add' | 'edit' | 'delete';
  status?: CustomStatus | null;
  statuses: CustomStatus[];
  onClose: () => void;
}

const StatusModal = ({ projectId, mode, status, statuses, onClose }: StatusModalProps) => {
  const isEditMode = mode === 'edit';
  const isDeleteMode = mode === 'delete';

  const [statusName, setStatusName] = useState(status?.name ?? '');
  const [color, setColor] = useState(status?.color ?? '#8A2BE2');
  const [isFinal, setIsFinal] = useState(status?.is_final ?? false);
  const [selectedStatusId, setSelectedStatusId] = useState(status?.id ?? '');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { mutateAsync: createStatus, isPending: isCreating } = useCreateStatus();

  const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdateStatus();

  const { mutateAsync: deleteStatus, isPending: isDeletingStatus } = useDeleteStatus();

  const isPending = isCreating || isUpdating || isDeletingStatus;

  const sortedStatuses = [...statuses];
  const selectedStatus =
    sortedStatuses.find((item) => item.id === selectedStatusId) || sortedStatuses[0];
  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = statuses.find((item) => item.id === event.target.value);

    if (!selected) return;

    setSelectedStatusId(selected.id);
    setStatusName(selected.name);
    setColor(selected.color);
    setIsFinal(selected.is_final ?? false);
  };

  const handleSubmit = async () => {
    if (!statusName.trim()) return;

    try {
      if (isEditMode) {
        if (!selectedStatusId) return;

        await updateStatus({
          projectId,
          statusId: selectedStatusId,
          payload: {
            name: statusName.trim(),
            color,
            is_final: isFinal,
          },
        });
      } else {
        await createStatus({
          projectId,
          payload: {
            name: statusName.trim(),
            color,
            is_final: isFinal,
          },
        });
      }

      onClose();
    } catch {
      // apiService handles error toast
    }
  };

  const handleDeleteStatus = async () => {
    const statusIdToDelete = selectedStatus?.id;

    if (!statusIdToDelete) return;

    try {
      await deleteStatus({
        projectId,
        statusId: statusIdToDelete,
      });

      setShowDeleteConfirm(false);
      onClose();
    } catch {
      // apiService handles error toast
    }
  };
  return (
    <>
      {/* Main Modal */}
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-body)]">
                {isDeleteMode ? 'Delete status' : isEditMode ? 'Edit status' : 'Add status'}
              </h2>

              <p className="mt-2 text-sm text-[var(--color-gray-500)]">
                {isDeleteMode
                  ? 'Select the status you want to delete.'
                  : isEditMode
                    ? 'Update the status details.'
                    : 'A status shows the progression of work.'}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--color-gray-400)] hover:bg-[var(--color-gray-100)]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-5 px-6 py-5">
            {/* Status Dropdown */}
            {(isEditMode || isDeleteMode) && (
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--color-text-body)]">
                  Status
                </label>

                <select
                  value={selectedStatusId || sortedStatuses[0]?.id || ''}
                  onChange={handleStatusChange}
                  className="h-10 w-full rounded-lg border border-[var(--color-gray-300)] bg-white px-3 text-sm text-[var(--color-gray-700)] outline-none focus:border-blue-500"
                >
                  {sortedStatuses.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!isDeleteMode && (
              <>
                {/* Status Name */}
                <WpInput
                  label="Status name"
                  value={statusName}
                  onChange={(event) => setStatusName(event.target.value)}
                  placeholder="Enter status name"
                />

                {/* Color */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-[var(--color-text-body)]">
                    Color
                  </label>

                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(event) => setColor(event.target.value)}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--color-gray-300)] bg-white p-1"
                    />

                    <div className="flex h-10 flex-1 items-center rounded-lg border border-[var(--color-gray-300)] px-3">
                      <span
                        className="mr-2 h-4 w-4 rounded-full"
                        style={{
                          backgroundColor: color,
                        }}
                      />

                      <span className="text-sm text-[var(--color-gray-700)]">{color}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[var(--color-gray-300)] px-3 py-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--color-text-body)]">Final status</p>
                    <p className="text-xs text-[var(--color-gray-500)]">
                      Mark this status as a final status.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={isFinal}
                    onChange={(event) => setIsFinal(event.target.checked)}
                    className="h-4 w-4 cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-[var(--color-gray-200)] px-6 py-4">
            <WpButton type="button" variant="secondary" onClick={onClose} disabled={isPending}>
              Cancel
            </WpButton>

            {isDeleteMode ? (
              <WpButton
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={!selectedStatus?.id || isDeletingStatus}
                className="!bg-red-600 hover:!bg-red-700"
              >
                Delete
              </WpButton>
            ) : (
              <WpButton
                type="button"
                onClick={handleSubmit}
                disabled={!statusName.trim() || isPending || (isEditMode && !selectedStatusId)}
                isLoading={isCreating || isUpdating}
              >
                {isEditMode ? 'Edit' : 'Add'}
              </WpButton>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <Trash2 size={18} className="text-red-600" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Status</h3>

                <p className="text-sm text-gray-500">{selectedStatus?.name}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-gray-600">
              Are you sure you want to delete this status? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <WpButton
                type="button"
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeletingStatus}
              >
                Cancel
              </WpButton>

              <WpButton
                type="button"
                onClick={handleDeleteStatus}
                disabled={isDeletingStatus}
                isLoading={isDeletingStatus}
                className="!bg-red-600 hover:!bg-red-700"
              >
                Delete
              </WpButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatusModal;
