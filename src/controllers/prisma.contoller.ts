import { PrismaService } from '../services/prisma.service';
import type { User, Transcription } from '@prisma/client';

export class PrismaController {
	service: PrismaService;
	constructor() {
		this.service = new PrismaService();
	}
	async register(username: string, telegramId: number): Promise<string> {
		const isUserRegistered = await this.service.findUserByTelegramId(telegramId);
		if (isUserRegistered) {
			return `User with id ${isUserRegistered.telegramId} is already registered`;
		}
		const user = await this.service.addUser({ username, telegramId });
		console.log(`User ${user.id} registered!`);
		return `User ${user.id} registered!`;
	}
	async checkAuth(telegramId: number): Promise<Boolean> {
		const authUser = await this.service.findUserByTelegramId(telegramId);
		return Boolean(authUser);
	}

	async addTranscribe(text: string, userId: number): Promise<string> {
		await this.service.addTranscription({ text, userId });
		return 'Transcription saved!';
	}
}
