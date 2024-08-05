import type { ClickerUser } from './sync';

interface RewardsByDay {
	days: number;
	rewardCoins: number;
}
interface LinksWithLocale {
	locale: string;
	link: string;
}
export interface Task {
	id: string;
	rewardCoins: number;
	periodicity: string;
	linksWithLocales?: LinksWithLocale[];
	isCompleted: boolean;
	completedAt?: string;
	link?: string;
	channelId?: number;
	rewardsByDays?: RewardsByDay[];
	days?: number;
	remainSeconds?: number;
}
export interface TasksList {
	tasks: Task[];
}

export interface CheckTask {
	clickerUser: ClickerUser;
	task: Task;
}
