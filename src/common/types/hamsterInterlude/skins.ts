export interface SkinResponse {
	id: string;
	isAvailable: boolean;
	isExpired: boolean;
	isFeatured: boolean;
	remainSecondsBeforeExpired: number;
}

export interface GetSkinResponseInterlude {
	skins: SkinResponse[];
}
