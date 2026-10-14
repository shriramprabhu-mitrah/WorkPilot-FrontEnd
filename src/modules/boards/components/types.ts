import { TaskResponse } from '@/src/types/task';
import { KanbanTask, BoardStatusColumn, BoardStory } from '@/src/types/board';

export type OptimisticUpdate = {
  statusId: string;
  storyId?: string;
  task?: KanbanTask;
};

export type MapTaskFn = (task: TaskResponse, storyId: string, statusId: string) => KanbanTask;

export type BoardPageData = BoardStory | BoardStory[] | BoardStatusColumn[];

export type BoardInfiniteData = {
  pages: Array<{ data: BoardPageData; [key: string]: unknown }>;
  [key: string]: unknown;
};
