import { BoardStory, BoardStatusColumn } from '@/src/types/board';
import { BoardPageData } from './types';

export const STORYLESS_ID = 'direct-sprint-tasks';

export const isStorylessId = (id?: string | null) => id === STORYLESS_ID || id === 'no-story';

export type ColumnPatch = (col: BoardStatusColumn, storyId: string) => BoardStatusColumn;

type StorylessResponse = { type?: string; statuses?: BoardStatusColumn[] };

export const isStorylessItem = (item: unknown): boolean =>
  !!item && typeof item === 'object' && (item as StorylessResponse).type === 'storyless';

const storyIdOf = (item: BoardStory | BoardStatusColumn): string =>
  isStorylessItem(item) ? STORYLESS_ID : ((item as BoardStory).id ?? STORYLESS_ID);

export const getStorylessColumns = (data: unknown): BoardStatusColumn[] => {
  const items: unknown[] = Array.isArray(data) ? data : data ? [data] : [];
  const byStatus = new Map<string, BoardStatusColumn>();

  const add = (col: BoardStatusColumn) => {
    const existing = byStatus.get(col.status_id);
    if (!existing) {
      byStatus.set(col.status_id, { ...col, tasks: [...(col.tasks ?? [])] });
      return;
    }
    const seen = new Set(existing.tasks.map((t) => t.key ?? t.id));
    (col.tasks ?? []).forEach((t) => {
      if (!seen.has(t.key ?? t.id)) existing.tasks.push(t);
    });
    existing.meta = col.meta ?? existing.meta;
  };

  items.forEach((item) => {
    const maybe = item as StorylessResponse & Partial<BoardStatusColumn>;
    if (Array.isArray(maybe?.statuses)) {
      maybe.statuses.forEach(add); // new shape
    } else if (maybe && 'status_id' in maybe) {
      add(maybe as BoardStatusColumn); // old shape: flat column
    }
  });

  return Array.from(byStatus.values());
};

export const patchPageData = (data: BoardPageData, patch: ColumnPatch): BoardPageData => {
  const patchItem = (item: BoardStory | BoardStatusColumn): BoardStory | BoardStatusColumn => {
    if ('statuses' in item && Array.isArray(item.statuses)) {
      const storyId = storyIdOf(item);
      return {
        ...item,
        statuses: item.statuses.map((col) => patch(col, storyId)),
      } as BoardStory;
    }
    if ('status_id' in item) {
      return patch(item as BoardStatusColumn, STORYLESS_ID);
    }
    return item;
  };

  if (Array.isArray(data)) {
    return (data as Array<BoardStory | BoardStatusColumn>).map(patchItem) as BoardPageData;
  }
  return patchItem(data) as BoardPageData;
};

export const columnsOf = (
  data: BoardPageData
): Array<{ col: BoardStatusColumn; storyId: string }> => {
  const items = (Array.isArray(data) ? data : [data]) as Array<BoardStory | BoardStatusColumn>;
  return items.flatMap((item) => {
    if ('statuses' in item && Array.isArray(item.statuses)) {
      const storyId = storyIdOf(item);
      return item.statuses.map((col) => ({ col, storyId }));
    }
    if ('status_id' in item) {
      return [{ col: item as BoardStatusColumn, storyId: STORYLESS_ID }];
    }
    return [];
  });
};
