interface Extradata3 {
	en: Url;
	ru: Url;
}
interface Url {
	url: string;
}
interface Extradata2 {
	answers: Answer[];
	question: string;
}
interface AnswerString {
	answer: string;
}
interface Answer {
	'1': AnswerString;
	'2': AnswerString;
	'3': AnswerString;
}
interface Extradatum {
	score: number;
	reward: number;
	is_completed: boolean;
}
interface Quest {
	id: string;
	name: string;
	description?: unknown;
	type: string;
	status: 'completed' | 'not_completed';
	position: number;
	batch: number;
	reward: number;
	reward_type: string;
	extra_data: Extradatum[] | Extradata2 | Extradata3;
}
export interface QuestsResponse {
	status: boolean;
	message: string;
	quests: Quest[];
}

export interface VerifyQuestResponse {
	status: boolean;
	message: string;
}

export interface VerifyQuestReq {
	daily_quest_id: string;
}
