export interface SyncInterludeResponse {
	interludeUser: InterludeUser;
}

export interface InterludeUser {
	id: string;
	totalDiamonds: number;
	balanceDiamonds: number;
	earnPassivePerSec: number;
	earnPassivePerHour: number;
	lastPassiveEarn: number;
	lastSyncUpdate: number;
	exchangeId: string;
	upgrades: Upgrades;
	tasks: { [key: string]: TaskSyncInterlude };
	referralsCount: number;
	skin: Skin;
	achievements: Achievement[];
	withdraw: Withdraw;
	memories: Memories;
	miniGame: MiniGame;
	promos: Promo[];
	airdropTasks: AirdropTasks;
}

export interface Achievement {
	id: string;
	unlockedAt: Date;
	isNew: boolean;
	isClaimed: boolean;
}

export interface AirdropTasks {
	airdrop_connect_ton_wallet: AirdropConnectTonWallet;
	subscribe_telegram_channel: TaskSyncInterlude;
}

export interface AirdropConnectTonWallet {
	id: string;
	walletAddress: string;
	completedAt: Date;
}

export interface TaskSyncInterlude {
	id: string;
	completedAt: Date;
}

export interface Memories {
	totalCoins: number;
	diffDays: number;
	upgradesTotal: number;
}

export interface MiniGame {
	Candles: Candles;
	Tiles: Tiles;
}

export interface Candles {
	lastStartAt: Date;
	lastClaimAt: Date;
}

export interface Tiles {
	lastStartAt: Date;
	lastClaimAt: Date;
	pointsAlreadyClaimed: number;
}

export interface Promo {
	promoId: string;
	receiveKeysTotal: number;
	receiveKeysToday: number;
	receiveKeysLastTime: Date;
	rewardsTotal: number;
	rewardsToday: number;
	rewardsLastTime: Date;
}

export interface Skin {
	selectedSkinId: string;
	available: Available[];
}

export interface Available {
	skinId: string;
	buyAt: Date;
}

export interface Upgrades {
	int_year_strategy: IntYearStrategy;
}

export interface IntYearStrategy {
	id: string;
	level: number;
	lastUpgradeAt: number;
}

export interface Withdraw {
	state: number;
	unavailable: unknown[];
	info: Info;
	selected: string;
}

export interface Info {
	TelegramWallet: TelegramWallet;
}

export interface TelegramWallet {
	uid: string;
	updatedAt: Date;
}
