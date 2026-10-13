import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { BoardQueryParams, BoardStory } from '@/src/types/board';
import { apiService, PaginatedApiResponse } from '../axios';

class BoardService {
  async getBoard(
    projectId: string,
    params?: BoardQueryParams
  ): Promise<PaginatedApiResponse<BoardStory[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.page_size) searchParams.append('page_size', String(params.page_size));
    if (params?.tasks_per_status !== undefined)
      searchParams.append('tasks_per_status', String(params.tasks_per_status));
    if (params?.sprint_id) searchParams.append('sprint_id', params.sprint_id);
    if (params?.status_id) searchParams.append('status_id', params.status_id);
    if (params?.task_status_id) searchParams.append('task_status_id', params.task_status_id);
    if (params?.user_story_id) {
      searchParams.append('user_story_id', params.user_story_id);
    }
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.task_assignee_id) searchParams.append('task_assignee_id', params.task_assignee_id);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.storyless_tasks !== undefined)
      searchParams.append('storyless_tasks', String(params.storyless_tasks));

    const query = searchParams.toString();
    const endpoint = ApiEndpoints.Board.getBoard.withNamedParams({ projectId });
    const url = `${endpoint.url}${query ? `?${query}` : ''}`;
    return apiService.getPaginated<BoardStory[]>(url);
  }
}

export const boardService = new BoardService();
