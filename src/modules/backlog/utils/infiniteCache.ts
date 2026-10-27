import { InfiniteData } from '@tanstack/react-query';
import { PaginatedApiResponse } from '@/src/services/axios';
import { TaskResponse } from '@/src/types/task';
import { UserStoryResponse } from '@/src/types/userstories';

export type InfiniteTaskData = InfiniteData<PaginatedApiResponse<TaskResponse[]>>;
export type InfiniteStoryData = InfiniteData<PaginatedApiResponse<UserStoryResponse[]>>;
export type ListCache<T> = PaginatedApiResponse<T[]> | { data: T[] };
type Keyed = { id?: string; key?: string };

export const isStory = (s: Keyed, id: string) => s.id === id || s.key === id;

const shiftMeta = <M extends { total_items?: number; totalItems?: number }>(
  meta: M,
  delta: number
): M => {
  const current = meta.total_items ?? meta.totalItems ?? (delta < 0 ? 1 : 0);
  const total = Math.max(0, current + delta);
  return { ...meta, total_items: total, totalItems: total };
};

export function removeFromInfiniteCache<T extends Keyed>(
  old: InfiniteData<PaginatedApiResponse<T[]>> | undefined,
  itemId: string
): InfiniteData<PaginatedApiResponse<T[]>> | undefined {
  if (!old?.pages?.length) return old;
  const pages = old.pages.map((page) => {
    const data = page.data ?? [];
    const filtered = data.filter((i) => i.id !== itemId && i.key !== itemId);
    if (filtered.length === data.length) return page;
    return { ...page, data: filtered, ...(page.meta ? { meta: shiftMeta(page.meta, -1) } : {}) };
  });
  return { ...old, pages };
}

export function addToInfiniteCache<T extends Keyed>(
  old: InfiniteData<PaginatedApiResponse<T[]>> | undefined,
  item: T
): InfiniteData<PaginatedApiResponse<T[]>> {
  if (!old?.pages?.length) {
    return {
      pages: [
        {
          data: [item],
          meta: {
            page: 1,
            page_size: 5,
            total_items: 1,
            totalItems: 1,
            total_pages: 1,
            totalPages: 1,
            has_next: false,
            has_previous: false,
          },
          message: 'Success',
          status: 200,
        },
      ],
      pageParams: [1],
    };
  }
  const clean = removeFromInfiniteCache(old, item.id || item.key || '') || old;
  const [first, ...rest] = clean.pages;
  const firstPage = {
    ...first,
    data: [item, ...(first.data ?? [])],
    ...(first.meta ? { meta: shiftMeta(first.meta, 1) } : {}),
  };
  return { ...clean, pages: [firstPage, ...rest] };
}

/** Map every story of every page of an infinite sprint-stories cache */
export const mapInfiniteStories = (
  old: InfiniteStoryData | undefined,
  fn: (s: UserStoryResponse) => UserStoryResponse
): InfiniteStoryData | undefined =>
  old?.pages?.length
    ? { ...old, pages: old.pages.map((p) => ({ ...p, data: (p.data ?? []).map(fn) })) }
    : old;

const sameTask = (t: TaskResponse, task: TaskResponse, rawId?: string) =>
  t.id === task.id || (!!task.key && t.key === task.key) || (!!rawId && t.id === rawId);

/** Add (or replace) a task inside a story and keep total_tasks in sync */
export const addTaskToStory = (
  story: UserStoryResponse,
  task: TaskResponse,
  rawId?: string
): UserStoryResponse => {
  const tasks = story.tasks ?? [];
  const exists = tasks.some((t) => sameTask(t, task, rawId));
  const prevTotal = story.total_tasks ?? tasks.length;
  return {
    ...story,
    tasks: exists ? tasks.map((t) => (sameTask(t, task, rawId) ? task : t)) : [...tasks, task],
    total_tasks: exists ? prevTotal : prevTotal + 1,
  };
};

export const removeTaskFromStory = (story: UserStoryResponse, ids: string[]): UserStoryResponse => {
  const hit = (v?: string) => !!v && ids.includes(v);
  const tasks = story.tasks ?? [];
  const filtered = tasks.filter((t) => !hit(t.id) && !hit(t.key));
  if (filtered.length === tasks.length) return story;
  return { ...story, tasks: filtered, total_tasks: Math.max(0, (story.total_tasks ?? 0) - 1) };
};
