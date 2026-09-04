'use client';

import { ArrowLeft } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';

interface WorkflowHeaderProps {
    workflowName: string;
    onWorkflowNameChange: (value: string) => void;
    onDiscard: () => void;
    onSave: () => void;
}

export const WorkflowHeader = ({
    workflowName,
    onWorkflowNameChange,
    onDiscard,
    onSave,
}: WorkflowHeaderProps) => {
    return (
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                    aria-label="Back"
                >
                    <ArrowLeft size={17} />
                </button>

                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Workflows</span>
                    <span className="text-gray-300">›</span>

                    <input
                        value={workflowName}
                        onChange={(e) => onWorkflowNameChange(e.target.value)}
                        className="w-[220px] border-0 bg-transparent px-1 py-1 text-sm font-semibold text-gray-900 outline-none focus:ring-0"
                    />

                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                        DEFAULT
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <WpButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onDiscard}
                >
                    Discard
                </WpButton>

                <WpButton
                    type="button"
                    size="sm"
                    onClick={onSave}
                >
                    Save Workflow
                </WpButton>
            </div>
        </div>
    );
};