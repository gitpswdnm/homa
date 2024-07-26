import type { ClickerUser, SyncResponse } from '../common/types/sync';
import type { UpgradeForBuy } from '../common/types/upgrades';
import type { ProfitController } from '../controllers/profit.controller';
import type { HamService } from '../services/ham.service';

export class SpendAllMoney {
	protected service: HamService;
	protected controller: ProfitController;
	constructor(service: HamService, controller: ProfitController) {
		this.service = service;
		this.controller = controller;
	}
	protected async spendMoney(
		token: string,
		clickerUserData: ClickerUser,
		upgradesForBuyData: UpgradeForBuy[],
	): Promise<void> {
		const isEnoughMoneyForUpgrade = upgradesForBuyData.some(
			(upgrade) => upgrade.price < clickerUserData.balanceCoins,
		);
		if (!isEnoughMoneyForUpgrade) {
			return;
		}
		const filteredUpgrades = this.controller.getProfitData(upgradesForBuyData);
		const upgradeForBuy = filteredUpgrades.find(
			({ price, isAvailable, cooldown }) =>
				price < clickerUserData.balanceCoins && isAvailable && !cooldown,
		);
		if (!upgradeForBuy) {
			return;
		}
		const { clickerUser, upgradesForBuy } = await this.service.buyUpgrade(
			token,
			upgradeForBuy.upgradeId,
		);
		console.dir(`${upgradeForBuy} bought!`, { depth: null });
		return await this.spendMoney(token, clickerUser, upgradesForBuy);
	}

	async startSpending(token: string): Promise<void> {
		const { clickerUser } = await this.service.sync(token);
		const { upgradesForBuy } = await this.service.upgrades(token);
		return this.spendMoney(token, clickerUser, upgradesForBuy);
	}
}
