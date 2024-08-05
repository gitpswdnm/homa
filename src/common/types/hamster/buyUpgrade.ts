import type { SyncResponse } from './sync';
import type { UpgradesResponse } from './upgrades';

export type BuyUpgradeResponse = SyncResponse & Omit<UpgradesResponse, 'sections'>;
