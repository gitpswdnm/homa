import type { SyncInterludeResponse } from './sync';
import type { UpgradesInterludeResponse } from './upgrades';

export type BuyUpgradeInterludeResponse = SyncInterludeResponse &
	UpgradesInterludeResponse;
