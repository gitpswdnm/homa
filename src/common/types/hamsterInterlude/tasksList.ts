import type { InterludeUser } from './sync';

export interface TaskInterlude {
	id: string;
	completedAt: Date;
	isCompleted: boolean;
}
export interface TasksInterludeListResponse {
	tasks: TaskInterlude[];
}

export interface CheckInterludeTaskResponse {
	interludeUser: InterludeUser;
	task: TasksInterludeListResponse;
}
