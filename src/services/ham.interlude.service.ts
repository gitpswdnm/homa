import type { CurlApi } from '../common/api';
import type { SyncInterludeResponse } from '../common/types/hamsterInterlude/sync';
import type { UpgradesInterludeResponse } from '../common/types/hamsterInterlude/upgrades';
import type { BuyUpgradeInterludeResponse } from '../common/types/hamsterInterlude/buyUpgrade';
import type {
	CheckInterludeTaskResponse,
	TasksInterludeListResponse,
} from '../common/types/hamsterInterlude/tasksList';
import type {
	DataForInterludeBuySkin,
	DataForInterludeBuyUpgrade,
} from '../common/types/hamsterInterlude/simple';
import type { GetSkinResponseInterlude } from '../common/types/hamsterInterlude/skins';

export class HamInterludeService {
	protected api: CurlApi;
	constructor(api: CurlApi) {
		this.api = api;
	}
	async sync(token: string): Promise<SyncInterludeResponse> {
		const response = await this.api.post<SyncInterludeResponse>('/sync', {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		// console.dir(response, { depth: null });
		return response;
	}

	async upgrades(token: string): Promise<UpgradesInterludeResponse> {
		const response = await this.api.post<UpgradesInterludeResponse>(
			`/upgrades-for-buy`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			},
		);
		// console.dir(response, { depth: null });
		return response;
	}

	async buyUpgrade(
		token: string,
		upgradeId: string,
	): Promise<BuyUpgradeInterludeResponse> {
		const dataForUpgrade: DataForInterludeBuyUpgrade = {
			timestamp: new Date().getTime(),
			upgradeId,
		};
		const response = await this.api.post<BuyUpgradeInterludeResponse>('/buy-upgrade', {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(dataForUpgrade),
		});
		// console.dir(response.upgradesForBuy, { depth: null });
		return response;
	}

	async getListTasks(token: string): Promise<TasksInterludeListResponse> {
		return this.api.post<TasksInterludeListResponse>('/list-tasks', {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
	}

	async checkTask(token: string, taskId: string): Promise<CheckInterludeTaskResponse> {
		return this.api.post<CheckInterludeTaskResponse>('/check-task', {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ taskId }),
		});
	}

	async getSkins(token: string): Promise<GetSkinResponseInterlude> {
		return this.api.post<GetSkinResponseInterlude>('/get-skin', {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
	}

	async buySkin(token: string, skinId: string): Promise<SyncInterludeResponse> {
		const dataForUpgrade: DataForInterludeBuySkin = {
			timestamp: new Date().getTime(),
			skinId,
		};
		const response = await this.api.post<SyncInterludeResponse>('/buy-skin', {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(dataForUpgrade),
		});
		// console.dir(response.upgradesForBuy, { depth: null });
		return response;
	}

	// async claimDailyCipher(token: string, cipher: string): Promise<DailyCipherResponse> {
	// 	return this.api.post<DailyCipherResponse>('/claim-daily-cipher', {
	// 		headers: {
	// 			Authorization: `Bearer ${token}`,
	// 			'Content-Type': 'application/json',
	// 		},
	// 		body: JSON.stringify({ cipher }),
	// 	});
	// }
}
