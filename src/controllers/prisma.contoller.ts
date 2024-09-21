import { PrismaService } from '../services/prisma.service';

export class PrismaController {
	service: PrismaService;
	constructor() {
		this.service = new PrismaService();
	}
	async register(telegramId: number, username?: string): Promise<string> {
		const isUserRegistered = await this.service.findUserByTelegramId(telegramId);
		if (isUserRegistered) {
			return `User with id ${isUserRegistered.telegramId} is already registered`;
		}
		const user = await this.service.addUser({ telegramId, username });
		await this.service.deleteAuthRequestByTelegramId(telegramId);
		console.log(`User ${user.telegramId} registered!`);
		return `User ${user.telegramId} registered!`;
	}
	async checkAuth(telegramId: number): Promise<Boolean> {
		const authUser = await this.service.findUserByTelegramId(telegramId);
		return Boolean(authUser);
	}

	async addTranscribe(text: string, userId: number): Promise<string> {
		await this.service.addTranscription({ text, userId });
		return 'Transcription saved!';
	}

	async addAuthRequest(telegramId: number): Promise<boolean> {
		const isRequested = await this.service.findAuthRequest(telegramId);
		if (isRequested) {
			const now = new Date().getTime();
			if (isRequested.requestDate.getTime() + 24 * 3600 * 1000 < now) {
				await this.service.deleteAuthRequestById(isRequested.id);
				await this.service.addAuthRequest(telegramId);
				return true;
			}
			return false;
		}
		await this.service.addAuthRequest(telegramId);
		return true;
	}
}
