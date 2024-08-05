import type { ZarGatesService } from '../services/zarg.service';

export class ZarGatesPipe {
	protected service: ZarGatesService;
	constructor(service: ZarGatesService) {
		this.service = service;
	}

	async claimAllQuests(token: string): Promise<void> {
		console.log('start claim quests ZarGates');
		const { quests } = await this.service.getQuests(token);
		quests.forEach(async (quest) => {
			if (
				quest.type === 'quiz' ||
				quest.type === 'zargates_scores' ||
				quest.type === 'amikin_quest' ||
				quest.status === 'completed'
			) {
				return;
			}
			const response = await this.service.verifyQuest(token, quest.id);
			console.log(response.message);
		});
	}
}
