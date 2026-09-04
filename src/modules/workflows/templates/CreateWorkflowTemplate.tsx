'use client';

import { useState } from 'react';
import { WorkflowHeader } from '../components/WorkflowHeader';
import { workflowStatuses } from '../data';
import { WorkflowStatus } from '../data';
import WorkflowTransitions, {
  type WorkflowTransition,
} from '../components/WorkflowTransitions';
import WorkflowStatuses from '../components/WorkflowStatuses';
import { arrayMove } from '@dnd-kit/sortable';
import WorkflowCanvas from '../components/WorkflowCanvas';

interface WorkflowNodePosition {
  x: number;
  y: number;
}
export const CreateWorkflowTemplate = () => {
  const [workflowName, setWorkflowName] = useState(
    'Software Development'
  );
  const [activeTab, setActiveTab] = useState<'statuses' | 'transitions'>(
    'statuses'
  );
  const [nodePositions, setNodePositions] = useState<
    Record<string, WorkflowNodePosition>
  >({
    todo: {
      x: 80,
      y: 80,
    },
    'in-progress': {
      x: 330,
      y: 80,
    },
    'in-review': {
      x: 580,
      y: 80,
    },
    testing: {
      x: 330,
      y: 260,
    },
    done: {
      x: 580,
      y: 260,
    },
    blocked: {
      x: 830,
      y: 260,
    },
  });
  const handleMoveStatus = (
    statusId: string,
    x: number,
    y: number
  ) => {
    setNodePositions((current) => ({
      ...current,
      [statusId]: {
        x,
        y,
      },
    }));
  };
  const [transitions, setTransitions] = useState<WorkflowTransition[]>([]);
  const [statuses, setStatuses] = useState(workflowStatuses);

  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(
    workflowStatuses[0]?.id ?? null
  );
  const handleUpdateStatus = (
    statusId: string,
    updates: Partial<WorkflowStatus>
  ) => {
    setStatuses((current) =>
      current.map((status) =>
        status.id === statusId
          ? { ...status, ...updates }
          : status
      )
    );
  };
  const handleAddStatus = (name: string) => {
    const newStatus: WorkflowStatus = {
      id: `status-${Date.now()}`,
      name,
      category: 'In Progress',
      color: '#64748B',
    };

    setStatuses((current) => [
      ...current,
      newStatus,
    ]);

    setNodePositions((current) => ({
      ...current,
      [newStatus.id]: {
        x: 80,
        y: 440,
      },
    }));

    setSelectedStatusId(newStatus.id);
  };
  const handleAddTransition = (
    fromStatusId: string,
    toStatusId: string
  ) => {
    const alreadyExists = transitions.some(
      (transition) =>
        transition.fromStatusId === fromStatusId &&
        transition.toStatusId === toStatusId
    );

    if (alreadyExists) return;

    setTransitions((current) => [
      ...current,
      {
        id: `transition-${Date.now()}`,
        fromStatusId,
        toStatusId,
      },
    ]);
  };

  const handleDeleteTransition = (transitionId: string) => {
    setTransitions((current) =>
      current.filter(
        (transition) => transition.id !== transitionId
      )
    );
  };

  const handleDeleteStatus = (
    statusId: string
  ) => {
    if (statuses.length <= 1) {
      return;
    }

    setStatuses((current) =>
      current.filter(
        (status) => status.id !== statusId
      )
    );

    setTransitions((current) =>
      current.filter(
        (transition) =>
          transition.fromStatusId !== statusId &&
          transition.toStatusId !== statusId
      )
    );

    setNodePositions((current) => {
      const updated = { ...current };

      delete updated[statusId];

      return updated;
    });

    if (selectedStatusId === statusId) {
      const remainingStatus = statuses.find(
        (status) => status.id !== statusId
      );

      setSelectedStatusId(
        remainingStatus?.id ?? null
      );
    }
  };
  const handleReorderStatuses = (
    activeId: string,
    overId: string
  ) => {
    setStatuses((current) => {
      const oldIndex = current.findIndex(
        (status) => status.id === activeId
      );

      const newIndex = current.findIndex(
        (status) => status.id === overId
      );

      if (
        oldIndex === -1 ||
        newIndex === -1 ||
        oldIndex === newIndex
      ) {
        return current;
      }

      return arrayMove(
        current,
        oldIndex,
        newIndex
      );
    });
  };
  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <WorkflowHeader
        workflowName={workflowName}
        onWorkflowNameChange={setWorkflowName}
        onDiscard={() => { }}
        onSave={() => { }}
      />

      <div className="flex min-h-0 flex-1">
        {/* Canvas */}
        <main className="min-w-0 flex-1 p-5">
          <WorkflowCanvas
            statuses={statuses}
            transitions={transitions}
            nodePositions={nodePositions}
            selectedStatusId={selectedStatusId}
            onSelectStatus={setSelectedStatusId}
            onMoveStatus={handleMoveStatus}
          />
        </main>

        {/* Right panel */}
        <aside className="w-[280px] shrink-0 border-l border-gray-200">
          <div className="flex h-full flex-col">
            {/* Tabs */}
            <div className="flex h-[48px] shrink-0 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('statuses')}
                className={`relative flex-1 text-[13px] font-medium ${activeTab === 'statuses'
                  ? 'text-blue-600'
                  : 'text-gray-500'
                  }`}
              >
                Statuses ({statuses.length})

                {activeTab === 'statuses' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('transitions')}
                className={`relative flex-1 text-[13px] font-medium ${activeTab === 'transitions'
                  ? 'text-blue-600'
                  : 'text-gray-500'
                  }`}
              >
                Transitions ({transitions.length})

                {activeTab === 'transitions' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600" />
                )}
              </button>
            </div>

            {/* Tab content */}
            <div className="min-h-0 flex-1">
              {activeTab === 'statuses' ? (
                <WorkflowStatuses
                  statuses={statuses}
                  selectedStatusId={selectedStatusId}
                  onSelectStatus={setSelectedStatusId}
                  onAddStatus={handleAddStatus}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteStatus={handleDeleteStatus}
                  onReorder={handleReorderStatuses}
                />
              ) : (
                <WorkflowTransitions
                  statuses={statuses}
                  transitions={transitions}
                  onAddTransition={handleAddTransition}
                  onDeleteTransition={handleDeleteTransition}
                />
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
export default CreateWorkflowTemplate