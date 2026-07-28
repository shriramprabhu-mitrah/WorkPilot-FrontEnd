'use client';

import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn as KanbanColumnType } from '@/src/types/board';
import { KanbanCard } from './KanbanCards';
import { colors } from '@/src/styles/colors';
import { WpButton } from '@/src/app/components/common/button';

interface Props {
  column: KanbanColumnType;
  isOver: boolean;
}

export const KanbanColumn = ({ column, isOver }: Props) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: 'column', columnId: column.id },
  });

  return (
    <div className="flex flex-col w-[85vw] sm:w-[260px] sm:min-w-[260px] flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: column.color }}
          />
          <span className="text-sm font-semibold text-gray-700">{column.label}</span>
          <span className="text-xs text-gray-400 font-medium">{column.tasks.length}</span>
        </div>
        <WpButton variant="ghost" size="sm" className="!p-1">
          <Plus size={16} />
        </WpButton>
      </div>

      {/* Drop zone */}
      <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          style={isOver ? { backgroundColor: colors.dropBg, outlineColor: colors.dropRing } : {}}
          className={`flex flex-col gap-3 flex-1 min-h-[80px] rounded-xl p-1 transition-colors duration-200 ${
            isOver ? 'outline outline-2 outline-offset-[-2px]' : ''
          }`}
        >
          {column.tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
