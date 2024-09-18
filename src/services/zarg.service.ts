import type { CurlApi } from '../common/api';
import type {
	QuestsResponse,
	VerifyQuestReq,
	VerifyQuestResponse,
} from '../common/types/zargates/quests';

export class ZarGatesService {
	protected api: CurlApi;
	constructor(api: CurlApi) {
		this.api = api;
	}

	async getQuests(token: string): Promise<QuestsResponse> {
		const response = await this.api.get<QuestsResponse>('/quests', {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		console.log('quests got');
		return response;
	}

	async verifyQuest(token: string, questId: string): Promise<VerifyQuestResponse> {
		const questForVerify: VerifyQuestReq = {
			daily_quest_id: questId,
		};
		const response = await this.api.post<VerifyQuestResponse>('/quests/verify', {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(questForVerify),
		});

		return response;
	}
}
