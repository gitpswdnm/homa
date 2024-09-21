import type { InterludeUser } from '../common/types/hamsterInterlude/sync';
import type { UpgradeForBuyInterlude } from '../common/types/hamsterInterlude/upgrades';
import type { ProfitInterludeController } from '../controllers/profit.interlude.controller';
import type { HamInterludeService } from '../services/ham.interlude.service';

export class SpendAllInterludeMoney {
	protected service: HamInterludeService;
	protected controller: ProfitInterludeController;
	constructor(service: HamInterludeService, controller: ProfitInterludeController) {
		this.service = service;
		this.controller = controller;
	}
	protected async spendMoney(
		token: string,
		interludeUserData: InterludeUser,
		upgradesForBuyData: UpgradeForBuyInterlude[],
	): Promise<void> {
		try {
			console.log(`Старт скрипта: ${new Date().toLocaleString()}`);
			console.log(`Кол-во кристалов: ${interludeUserData.balanceDiamonds}`);
			const isEnoughMoneyForUpgrade = upgradesForBuyData.some(
				(upgrade) => upgrade.price < interludeUserData.balanceDiamonds,
			);
			if (!isEnoughMoneyForUpgrade) {
				console.log('кристалов недостаточно!');
				return;
			}
			const filteredUpgrades = this.controller.getProfitData(upgradesForBuyData);
			const upgradeForBuy = filteredUpgrades.find(
				({ price, isAvailable, cooldown }) =>
					price < interludeUserData.balanceDiamonds && isAvailable && !cooldown,
			);
			if (!upgradeForBuy) {
				console.log('Нечего покупать!');
				return;
			}
			const { interludeUser, upgradesForBuy } = await this.service.buyUpgrade(
				token,
				upgradeForBuy.upgradeId,
			);
			console.log(`${upgradeForBuy.upgradeId} for ${upgradeForBuy.price} bought!`);
			return await this.spendMoney(token, interludeUser, upgradesForBuy);
		} catch (e) {
			console.log(e);
		}
	}

	protected async claimAllTasks(token: string): Promise<void> {
		try {
			const { tasks } = await this.service.getListTasks(token);
			const claimableTasks = tasks.filter(
				(task) => !task.id.includes('friend') && !task.isCompleted,
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

	protected async buyAllSkins(token: string): Promise<void> {
		try {
			const { skins } = await this.service.getSkins(token);
			const { interludeUser } = await this.service.sync(token);
			const availableSkinsIds = interludeUser.skin.available.map(
				(skin) => skin.skinId,
			);
			const skinsForBuy = skins.filter(
				(skin) => !availableSkinsIds.includes(skin.id) && skin.isAvailable,
			);
			if (!skinsForBuy.length) {
				console.log('Доступных скинов для покупки нет');
				return;
			}
			skinsForBuy.forEach(async (skin) => {
				await this.service.buySkin(token, skin.id);
			});
		} catch (e) {
			console.log(e);
		}
	}

	protected async startSpending(
		token: string,
		repeat: boolean = false,
		interval: number = 2 * 3600000,
	): Promise<void> {
		try {
			const { interludeUser } = await this.service.sync(token);
			const { upgradesForBuy } = await this.service.upgrades(token);
			if (repeat) {
				await this.spendMoney(token, interludeUser, upgradesForBuy);
				setTimeout(async () => {
					await this.startSpending(token, repeat);
				}, interval);
				return;
			}
			return this.spendMoney(token, interludeUser, upgradesForBuy);
		} catch (e) {
			console.log(e);
		}
	}

	protected async claimMoney(
		token: string,
		repeat: boolean = false,
		interval: number = 2 * 3600000,
	): Promise<void> {
		try {
			if (repeat) {
				const { interludeUser } = await this.service.sync(token);
				console.log(`Старт скрипта: ${new Date().toLocaleString()}`);
				console.log(`Кристалов сейчас: ${interludeUser.balanceDiamonds}`);
				setTimeout(async () => {
					await this.claimMoney(token, repeat);
				}, interval);
				return;
			}
			const { interludeUser } = await this.service.sync(token);
			console.log(`Старт скрипта: ${new Date().toLocaleString()}`);
			console.log(`Кристалов сейчас: ${interludeUser.balanceDiamonds}`);
			return;
		} catch (e) {
			console.log(e);
		}
	}

	async startPipe(
		token: string,
		isRepeatSpending?: boolean,
		onlyClaim?: boolean,
		interval?: number,
	): Promise<void> {
		try {
			await this.claimAllTasks(token);
			// await this.buyAllSkins(token);
			if (onlyClaim) {
				await this.claimMoney(token, isRepeatSpending, interval);
			} else {
				await this.startSpending(token, isRepeatSpending, interval);
			}
		} catch (e) {
			console.log(e);
		}
	}
}
