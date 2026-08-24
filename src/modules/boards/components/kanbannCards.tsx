'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanTask } from '@/src/types/board';
import { colors } from '@/src/styles/colors';
import { KanbanCardContent } from './kanbannCardContent';
import { TaskDetailDrawer } from '@/src/app/components/common/task-detail';

export const KanbanCard = ({ task }: { task: KanbanTask }) => {
  const [showModal, setShowModal] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'card', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    willChange: 'transform',
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          borderColor: colors.dragPlaceholderBorder,
          backgroundColor: colors.dragPlaceholderBg,
        }}
        className="rounded-xl border-2 border-dashed h-[120px]"
      />
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setShowModal(true)}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer select-none touch-none"
      >
        <KanbanCardContent task={task} />
      </div>

      {showModal && <TaskDetailDrawer task={task} onClose={() => setShowModal(false)} />}
    </>
  );
};
