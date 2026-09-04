'use client';

import type { WorkflowStatus } from '../data';
import type { WorkflowTransition } from './WorkflowTransitions';

interface WorkflowNodePosition {
    x: number;
    y: number;
}

interface WorkflowCanvasProps {
    statuses: WorkflowStatus[];
    transitions: WorkflowTransition[];
    nodePositions: Record<string, WorkflowNodePosition>;
    selectedStatusId: string | null;
    onSelectStatus: (statusId: string) => void;
    onMoveStatus: (
        statusId: string,
        x: number,
        y: number
    ) => void;
}

const NODE_WIDTH = 190;
const NODE_HEIGHT = 84;

const getFallbackPosition = (index: number) => {
    const columns = 3;
    const column = index % columns;
    const row = Math.floor(index / columns);

    return {
        x: 80 + column * 250,
        y: 80 + row * 180,
    };
};

const WorkflowCanvas = ({
    statuses,
    transitions,
    nodePositions,
    selectedStatusId,
    onSelectStatus,
    onMoveStatus,
}: WorkflowCanvasProps) => {
    const getPosition = (
        statusId: string,
        index: number
    ) => {
        return (
            nodePositions[statusId] ??
            getFallbackPosition(index)
        );
    };

    const handleMouseDown = (
        event: React.MouseEvent<HTMLButtonElement>,
        statusId: string,
        index: number
    ) => {
        /*
         * Only start dragging with the left mouse button.
         */
        if (event.button !== 0) {
            return;
        }

        event.preventDefault();

        const currentPosition = getPosition(
            statusId,
            index
        );

        const startMouseX = event.clientX;
        const startMouseY = event.clientY;

        const startX = currentPosition.x;
        const startY = currentPosition.y;

        const handleMouseMove = (
            moveEvent: MouseEvent
        ) => {
            const deltaX =
                moveEvent.clientX - startMouseX;

            const deltaY =
                moveEvent.clientY - startMouseY;

            const nextX = Math.max(
                20,
                startX + deltaX
            );

            const nextY = Math.max(
                20,
                startY + deltaY
            );

            onMoveStatus(
                statusId,
                nextX,
                nextY
            );
        };

        const handleMouseUp = () => {
            document.removeEventListener(
                'mousemove',
                handleMouseMove
            );

            document.removeEventListener(
                'mouseup',
                handleMouseUp
            );
        };

        document.addEventListener(
            'mousemove',
            handleMouseMove
        );

        document.addEventListener(
            'mouseup',
            handleMouseUp
        );
    };

    return (
        <div className="relative h-full min-h-[600px] overflow-auto rounded-xl border border-gray-200 bg-[#F8FAFC]">
            {/* Grid */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    minWidth: 1200,
                    minHeight: 800,
                }}
            />

            <div
                className="relative min-h-[800px] min-w-[1200px]"
            >
                {/* Transition arrows */}
                <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    style={{
                        minWidth: 1200,
                        minHeight: 800,
                        overflow: 'visible',
                    }}
                >
                    <defs>
                        <marker
                            id="workflow-arrow"
                            markerWidth="8"
                            markerHeight="8"
                            refX="7"
                            refY="4"
                            orient="auto"
                        >
                            <path
                                d="M0,0 L8,4 L0,8 Z"
                                fill="#94A3B8"
                            />
                        </marker>
                    </defs>

                    {transitions.map(
                        (transition) => {
                            const fromIndex =
                                statuses.findIndex(
                                    (status) =>
                                        status.id ===
                                        transition.fromStatusId
                                );

                            const toIndex =
                                statuses.findIndex(
                                    (status) =>
                                        status.id ===
                                        transition.toStatusId
                                );

                            if (
                                fromIndex === -1 ||
                                toIndex === -1
                            ) {
                                return null;
                            }

                            const from = getPosition(
                                transition.fromStatusId,
                                fromIndex
                            );

                            const to = getPosition(
                                transition.toStatusId,
                                toIndex
                            );

                            /*
                             * Start from the right-center
                             * of the source node.
                             */
                            const fromX =
                                from.x + NODE_WIDTH;

                            const fromY =
                                from.y +
                                NODE_HEIGHT / 2;

                            /*
                             * End at the left-center
                             * of the destination node.
                             */
                            const toX = to.x;

                            const toY =
                                to.y +
                                NODE_HEIGHT / 2;

                            return (
                                <line
                                    key={transition.id}
                                    x1={fromX}
                                    y1={fromY}
                                    x2={toX}
                                    y2={toY}
                                    stroke="#94A3B8"
                                    strokeWidth="1.5"
                                    markerEnd="url(#workflow-arrow)"
                                />
                            );
                        }
                    )}
                </svg>

                {/* Status nodes */}
                {statuses.map(
                    (status, index) => {
                        const position =
                            getPosition(
                                status.id,
                                index
                            );

                        const isSelected =
                            selectedStatusId ===
                            status.id;

                        return (
                            <button
                                key={status.id}
                                type="button"
                                onClick={() =>
                                    onSelectStatus(
                                        status.id
                                    )
                                }
                                onMouseDown={(event) =>
                                    handleMouseDown(
                                        event,
                                        status.id,
                                        index
                                    )
                                }
                                className={`absolute z-10 w-[190px] select-none rounded-lg border bg-white p-4 text-left shadow-sm transition-shadow ${isSelected
                                    ? 'border-blue-500 ring-2 ring-blue-100'
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                    }`}
                                style={{
                                    left: position.x,
                                    top: position.y,
                                    cursor: 'grab',
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="h-3 w-3 shrink-0 rounded-full"
                                        style={{
                                            backgroundColor:
                                                status.color,
                                        }}
                                    />

                                    <span className="truncate text-sm font-semibold text-gray-900">
                                        {status.name}
                                    </span>
                                </div>

                                <div className="mt-2 text-xs text-gray-500">
                                    {status.category}
                                </div>
                            </button>
                        );
                    }
                )}
            </div>
        </div>
    );
};

export default WorkflowCanvas;