import { KanbanTask } from "@/src/types/board";
import { KanbanCardContent } from "./KanbanCardContent";

export const KanbanCardPreview = ({ task }: { task: KanbanTask }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-xl">
      <KanbanCardContent task={task} />
    </div>
  );
};
