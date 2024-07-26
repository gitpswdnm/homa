interface DailyCombo {
	upgradeIds: unknown[];
	bonusCoins: number;
	isClaimed: boolean;
	remainSeconds: number;
}

export enum SectionEnum {
	Legal = 'Legal',
	Markets = 'Markets',
	PRTeam = 'PR&Team',
	Specials = 'Specials',
	Web3 = 'Web3',
}

interface SectionElement {
	section: SectionEnum;
	isAvailable: boolean;
}

interface Condition {
	_type: Type;
	upgradeId?: string;
	level?: number;
	moreReferralsCount?: number;
	referralCount?: number;
	link?: string;
	channelId?: number;
	subscribeLink?: string;
	links?: string[];
}

enum Type {
	ByUpgrade = 'ByUpgrade',
	LinkWithoutCheck = 'LinkWithoutCheck',
	LinksToUpgradeLevel = 'LinksToUpgradeLevel',
	MoreReferralsCount = 'MoreReferralsCount',
	ReferralCount = 'ReferralCount',
	SubscribeTelegramChannel = 'SubscribeTelegramChannel',
}

export interface UpgradeForBuy {
	id: string;
	name: string;
	price: number;
	profitPerHour: number;
	condition: Condition | null;
	section: SectionEnum;
	level: number;
	currentProfitPerHour: number;
	profitPerHourDelta: number;
	isAvailable: boolean;
	isExpired: boolean;
	cooldownSeconds?: number;
	totalCooldownSeconds?: number;
	releaseAt?: Date;
	expiresAt?: Date;
	maxLevel?: number;
	welcomeCoins?: number;
}

export interface UpgradesResponse {
	upgradesForBuy: UpgradeForBuy[];
	sections: SectionElement[];
	dailyCombo: DailyCombo;
}
