'use client';

import { ArrowRight, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { WpButton } from '@/src/app/components/common/button';
import type { WorkflowStatus } from '../data';

export interface WorkflowTransition {
    id: string;
    fromStatusId: string;
    toStatusId: string;
}

interface WorkflowTransitionsProps {
    statuses: WorkflowStatus[];
    transitions: WorkflowTransition[];
    onAddTransition: (
        fromStatusId: string,
        toStatusId: string
    ) => void;
    onDeleteTransition: (transitionId: string) => void;
}

const WorkflowTransitions = ({
    statuses,
    transitions,
    onAddTransition,
    onDeleteTransition,
}: WorkflowTransitionsProps) => {
    const [showForm, setShowForm] = useState(false);

    const [fromStatusId, setFromStatusId] = useState(
        statuses[0]?.id ?? ''
    );

    const [toStatusId, setToStatusId] = useState(
        statuses[1]?.id ?? ''
    );

    const [error, setError] = useState('');

    const getStatus = (id: string) =>
        statuses.find((status) => status.id === id);

    const handleOpenForm = () => {
        setError('');

        if (statuses.length < 2) return;

        setFromStatusId(statuses[0].id);
        setToStatusId(statuses[1].id);
        setShowForm(true);
    };

    const handleCancel = () => {
        setError('');
        setShowForm(false);
    };

    const handleCreate = () => {
        if (!fromStatusId || !toStatusId) {
            setError('Please select both statuses.');
            return;
        }

        if (fromStatusId === toStatusId) {
            setError('From and To status cannot be the same.');
            return;
        }

        const alreadyExists = transitions.some(
            (transition) =>
                transition.fromStatusId === fromStatusId &&
                transition.toStatusId === toStatusId
        );

        if (alreadyExists) {
            setError('This transition already exists.');
            return;
        }

        onAddTransition(fromStatusId, toStatusId);

        setShowForm(false);
        setError('');
    };

    return (
        <div className="flex h-full flex-col">
            {/* Transition list */}
            <div className="flex-1 overflow-y-auto p-3">
                {transitions.length === 0 ? (
                    <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">
                        <div className="mb-2 text-[13px] font-medium text-gray-700">
                            No transitions yet
                        </div>

                        <div className="text-[11px] leading-5 text-gray-400">
                            Create a transition to define how work can
                            move between statuses.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {transitions.map((transition) => {
                            const fromStatus = getStatus(
                                transition.fromStatusId
                            );

                            const toStatus = getStatus(
                                transition.toStatusId
                            );

                            if (!fromStatus || !toStatus) return null;

                            return (
                                <div
                                    key={transition.id}
                                    className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-2.5 py-2.5"
                                >
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{
                                                backgroundColor: fromStatus.color,
                                            }}
                                        />

                                        <span className="max-w-[75px] truncate text-[11px] font-medium text-gray-700">
                                            {fromStatus.name}
                                        </span>

                                        <ArrowRight
                                            size={13}
                                            className="shrink-0 text-gray-400"
                                        />

                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{
                                                backgroundColor: toStatus.color,
                                            }}
                                        />

                                        <span className="max-w-[75px] truncate text-[11px] font-medium text-gray-700">
                                            {toStatus.name}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onDeleteTransition(transition.id)
                                        }
                                        className="ml-2 shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                        aria-label="Delete transition"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add transition form */}
            {showForm && (
                <div className="shrink-0 border-t border-gray-200 bg-gray-50 p-3">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-gray-800">
                            Add transition
                        </span>

                        <button
                            type="button"
                            onClick={handleCancel}
                            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                            aria-label="Close"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* From */}
                    <div className="mb-2.5">
                        <label className="mb-1 block text-[10px] font-medium text-gray-500">
                            From status
                        </label>

                        <select
                            value={fromStatusId}
                            onChange={(event) =>
                                setFromStatusId(event.target.value)
                            }
                            className="h-[34px] w-full rounded-md border border-gray-200 bg-white px-2 text-[12px] text-gray-700 outline-none focus:border-blue-400"
                        >
                            {statuses.map((status) => (
                                <option
                                    key={status.id}
                                    value={status.id}
                                >
                                    {status.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* To */}
                    <div className="mb-2.5">
                        <label className="mb-1 block text-[10px] font-medium text-gray-500">
                            To status
                        </label>

                        <select
                            value={toStatusId}
                            onChange={(event) =>
                                setToStatusId(event.target.value)
                            }
                            className="h-[34px] w-full rounded-md border border-gray-200 bg-white px-2 text-[12px] text-gray-700 outline-none focus:border-blue-400"
                        >
                            {statuses.map((status) => (
                                <option
                                    key={status.id}
                                    value={status.id}
                                >
                                    {status.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="mb-2.5 text-[10px] text-red-500">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <WpButton
                            type="button"
                            size="sm"
                            onClick={handleCreate}
                            className="flex-1"
                        >
                            Add transition
                        </WpButton>

                        <WpButton
                            type="button"
                            size="sm"
                            onClick={handleCancel}
                            className="border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </WpButton>
                    </div>
                </div>
            )}

            {/* Add transition button */}
            {!showForm && (
                <div className="shrink-0 border-t border-gray-200 p-3">
                    <WpButton
                        type="button"
                        size="sm"
                        onClick={handleOpenForm}
                        disabled={statuses.length < 2}
                        className="w-full"
                    >
                        <Plus size={15} />
                        Add transition
                    </WpButton>
                </div>
            )}
        </div>
    );
};

export default WorkflowTransitions;