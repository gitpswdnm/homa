import type { ClickerUser, SyncResponse } from '../common/types/hamster/sync';
import type { UpgradeForBuy } from '../common/types/hamster/upgrades';
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
		try {
			console.log(`Старт скрипта: ${new Date().toLocaleString()}`);
			console.log(`Кол-во денег: ${clickerUserData.balanceCoins}`);
			const isEnoughMoneyForUpgrade = upgradesForBuyData.some(
				(upgrade) => upgrade.price < clickerUserData.balanceCoins,
			);
			if (!isEnoughMoneyForUpgrade) {
				console.log('Денег недостаточно!');
				return;
			}
			const filteredUpgrades = this.controller.getProfitData(upgradesForBuyData);
			const upgradeForBuy = filteredUpgrades.find(
				({ price, isAvailable, cooldown }) =>
					price < clickerUserData.balanceCoins && isAvailable && !cooldown,
			);
			if (!upgradeForBuy) {
				console.log('Нечего покупать!');
				return;
			}
			const { clickerUser, upgradesForBuy } = await this.service.buyUpgrade(
				token,
				upgradeForBuy.upgradeId,
			);
			console.log(`${upgradeForBuy.upgradeId} for ${upgradeForBuy.price} bought!`);
			return await this.spendMoney(token, clickerUser, upgradesForBuy);
		} catch (e) {
			console.log(e);
		}
	}

	protected async claimAllTasks(token: string): Promise<void> {
		try {
			const { tasks } = await this.service.getListTasks(token);
			const claimableTasks = tasks.filter(
				(task) => task.id !== 'invite_friends' && !task.isCompleted,
			);
			if (!claimableTasks.length) {
				console.log('Доступных задач для хомяка нет!');
				return;
			}
			for (const task of claimableTasks) {
				await this.service.checkTask(token, task.id);
			}
		} catch (e) {
			console.log(e);
		}
	}

	protected async startSpending(
		token: string,
		repeat: boolean = false,
	): Promise<void> {
		try {
			const { clickerUser } = await this.service.sync(token);
			const { upgradesForBuy } = await this.service.upgrades(token);
			if (repeat) {
				await this.spendMoney(token, clickerUser, upgradesForBuy);
				setTimeout(async () => {
					await this.startSpending(token, repeat);
				}, 3 * 3600000);
				return;
			}
			return this.spendMoney(token, clickerUser, upgradesForBuy);
		} catch (e) {
			console.log(e);
		}
	}

	protected async claimMoney(token: string, repeat: boolean = false): Promise<void> {
		try {
			if (repeat) {
				const { clickerUser } = await this.service.sync(token);
				console.log(`Старт скрипта: ${new Date().toLocaleString()}`);
				console.log(`денег сейчас: ${clickerUser.balanceCoins}`);
				setTimeout(async () => {
					await this.claimMoney(token, repeat);
				}, 3 * 3600000);
				return;
			}
			const { clickerUser } = await this.service.sync(token);
			console.log(`Старт скрипта: ${new Date().toLocaleString()}`);
			console.log(`денег сейчас: ${clickerUser.balanceCoins}`);
			return;
		} catch (e) {
			console.log(e);
		}
	}

	async startPipe(
		token: string,
		isRepeatSpending?: boolean,
		onlyClaim?: boolean,
	): Promise<void> {
		try {
			await this.claimAllTasks(token);
			if (onlyClaim) {
				await this.claimMoney(token, isRepeatSpending);
			} else {
				await this.startSpending(token, isRepeatSpending);
			}
		} catch (e) {
			console.log(e);
		}
	}
}
