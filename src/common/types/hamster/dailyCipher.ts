import type { ClickerUser } from './sync';

interface DailyCipher {
	cipher: string;
	bonusCoins: number;
	isClaimed: boolean;
	remainSeconds: number;
}

export interface DailyCipherResponse {
	clickerUser: ClickerUser;
	dailyCipher: DailyCipher;
}
