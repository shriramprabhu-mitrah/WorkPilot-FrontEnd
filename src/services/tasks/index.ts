import { ApiEndpoints } from "@/src/lib/constants/api-endpoints";
import { ApiResponse } from "@/src/types/core";
import { TaskPayload, TaskResponse } from "@/src/types/task";
import { apiService } from "../axios";

class SprintService {
    async getTasks(projectId: string): Promise<ApiResponse<TaskResponse[]>> {
        const url = ApiEndpoints.Task.getallTasks.withParams({ projectId });
        return apiService.get<TaskResponse[]>(url);
    }

    async createTask(projectId: string, payload: TaskPayload): Promise<ApiResponse<TaskPayload[]>> {
        const url = ApiEndpoints.Task.createTasks.withParams({ projectId });
        return apiService.post<TaskPayload[]>(url, payload, {
            showSuccessToast: true,
            successMessage: 'Task created successfully',
        });
    }

    async getTaskById(projectId: string, sprintId: string): Promise<ApiResponse<TaskResponse>> {
        const url = ApiEndpoints.Task.createTasks.withParams({ projectId, sprintId });
        return apiService.get<TaskResponse>(url);
    }

}

export const sprintService = new SprintService();
