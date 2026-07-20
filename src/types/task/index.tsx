import { Priority } from "../board";

export type Task = {
    id: string;
    title: string;
    priority: Priority;
    status: string;
    assignee: {
        name: string;
        initials: string;
    };
    points: number;
    dueDate: string;
    sprint: string;
    labels: string[];
};