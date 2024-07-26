import type { SectionEnum, UpgradeForBuy } from '../common/types/upgrades';

interface IProfitData {
	upgradeId: string;
	costPointsPerHour: number;
	isAvailable: boolean;
	isExpired: boolean;
	cooldown?: number;
	price: number;
	profitPerHour: number;
	profitPerHourDelta: number;
	section: SectionEnum;
}

export class ProfitController {
	getProfitData(upgrades: UpgradeForBuy[]): IProfitData[] {
		const profitArr = upgrades.reduce<IProfitData[]>((acc, cur) => {
			const costPointsPerHour = cur.price / cur.profitPerHourDelta || 0;
			if (
				costPointsPerHour > 0 &&
				Number.isFinite(costPointsPerHour) &&
				!cur.isExpired &&
				cur.isAvailable
			) {
				acc.push({
					upgradeId: cur.id,
					costPointsPerHour,
					isAvailable: cur.isAvailable,
					isExpired: cur.isExpired,
					cooldown: cur.cooldownSeconds || 0,
					price: cur.price,
					profitPerHour: cur.profitPerHour,
					profitPerHourDelta: cur.profitPerHourDelta,
					section: cur.section,
				});
			}

			return acc;
		}, []);
		const sorted = profitArr.toSorted(
			(a, b) => a.costPointsPerHour - b.costPointsPerHour,
		);

		return sorted;
	}
}
