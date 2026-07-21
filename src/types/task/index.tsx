import { TaskStatus } from "@/src/app/components/common/task";
import { Priority } from "../board";

export type Task = {
    id: string;
    title: string;
    priority: Priority;
    status: TaskStatus;
    assignee: {
        name: string;
        initials: string;
        color : string
    };
    points: number;
    dueDate: string;
    sprint: string;
    labels: string[];
};