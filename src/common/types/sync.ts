interface AirdropConnectTonWallet {
	id: string;
	walletAddress: string;
	completedAt: Date;
}

interface Task {
	id: string;
	completedAt: Date;
	days?: number;
}

interface AirdropTasks {
	subscribe_telegram_channel: Task;
	airdrop_connect_ton_wallet: AirdropConnectTonWallet;
}

interface IBoost {
	id: string;
	level: number;
	lastUpgradeAt: number;
	snapshotReferralsCount?: number;
}

interface Boosts {
	BoostFullAvailableTaps: IBoost;
	BoostEarnPerTap: IBoost;
	BoostMaxTaps: IBoost;
}

interface Friend {
	isBot: boolean;
	firstName: string;
	lastName: string;
	addedToAttachmentMenu: null;
	id: number;
	isPremium: null;
	canReadAllGroupMessages: null;
	languageCode: string;
	canJoinGroups: null;
	supportsInlineQueries: null;
	photos: unknown[];
	username: string;
	welcomeBonusCoins: number;
}

interface Referral {
	friend: Friend;
}

interface Available {
	skinId: string;
	buyAt: Date;
}

interface Skin {
	available: Available[];
	selectedSkinId: string;
}

interface StreakDays {
	id: string;
	completedAt: Date;
	days: number;
}

export interface ClickerUser {
	id: string;
	totalCoins: number;
	balanceCoins: number;
	level: number;
	availableTaps: number;
	lastSyncUpdate: number;
	exchangeId: string;
	boosts: Boosts;
	upgrades: { [key: string]: IBoost };
	tasks: { [key: string]: Task };
	airdropTasks: AirdropTasks;
	referralsCount: number;
	maxTaps: number;
	earnPerTap: number;
	earnPassivePerSec: number;
	earnPassivePerHour: number;
	lastPassiveEarn: number;
	tapsRecoverPerSec: number;
	referral: Referral;
	claimedUpgradeComboAt: Date;
	claimedCipherAt: Date;
	balanceTickets: number;
	referrerId: string;
	skin: Skin;
	startKeysMiniGameAt: Date;
	totalKeys: number;
	balanceKeys: number;
	claimedKeysMiniGameAt: Date[];
}

export interface SyncResponse {
	clickerUser: ClickerUser;
}
