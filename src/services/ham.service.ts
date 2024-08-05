import type { CurlApi } from '../common/api';
import type { SyncResponse } from '../common/types/hamster/sync';
import type { BuyUpgradeResponse } from '../common/types/hamster/buyUpgrade';
import type { UpgradesResponse } from '../common/types/hamster/upgrades';
import type { DataForBuyUpgrade } from '../common/types/hamster/simple';
import type { CheckTask, TasksList } from '../common/types/hamster/tasksList';

export class HamService {
	protected api: CurlApi;
	constructor(api: CurlApi) {
		this.api = api;
	}
	async sync(token: string): Promise<SyncResponse> {
		const response = await this.api.post<SyncResponse>('/sync', {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		// console.dir(response, { depth: null });
		return response;
	}

	async upgrades(token: string): Promise<UpgradesResponse> {
		const response = await this.api.post<UpgradesResponse>(`/upgrades-for-buy`, {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		// console.dir(response, { depth: null });
		return response;
	}

	async buyUpgrade(token: string, upgradeId: string): Promise<BuyUpgradeResponse> {
		const dataForUpgrade: DataForBuyUpgrade = {
			timestamp: new Date().getTime(),
			upgradeId,
		};
		const response = await this.api.post<BuyUpgradeResponse>('/buy-upgrade', {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(dataForUpgrade),
		});
		// console.dir(response.upgradesForBuy, { depth: null });
		return response;
	}

	async getListTasks(token: string): Promise<TasksList> {
		return this.api.post<TasksList>('/list-tasks', {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
	}

	async checkTask(token: string, taskId: string): Promise<CheckTask> {
		return this.api.post<CheckTask>('/check-task', {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ taskId }),
		});
	}
}
