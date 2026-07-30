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

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Translate.toString(transform),
          transition,
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
        style={{ transform: CSS.Translate.toString(transform), transition }}
        {...attributes}
        {...listeners}
        onClick={() => setShowModal(true)}
        className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer select-none"
      >
        <KanbanCardContent task={task} />
      </div>

      {showModal && <TaskDetailDrawer task={task} onClose={() => setShowModal(false)} />}
    </>
  );
};
