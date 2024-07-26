import { $api } from '../common/api';
import type { SyncResponse } from '../common/types/sync';
import type { BuyUpgradeResponse } from '../common/types/buyUpgrade';
import type { UpgradesResponse } from '../common/types/upgrades';
import type { DataForBuyUpgrade } from '../common/types/simple';

export class HamService {
	async sync(token: string): Promise<SyncResponse> {
		const response = await $api.post<SyncResponse>('/sync', {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		// console.dir(response, { depth: null });
		return response;
	}

	async upgrades(token: string): Promise<UpgradesResponse> {
		const response = await $api.post<UpgradesResponse>(`/upgrades-for-buy`, {
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
		const response = await $api.post<BuyUpgradeResponse>('/buy-upgrade', {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(dataForUpgrade),
		});
		// console.dir(response.upgradesForBuy, { depth: null });
		return response;
	}
}
