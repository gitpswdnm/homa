import type { User, Transcription } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

interface UserDto {
	username: string;
	telegramId: number;
}

interface TranscriptionDto {
	text: string;
	userId: number;
}

export class PrismaService {
	private client: PrismaClient;
	constructor() {
		this.client = new PrismaClient();
		this.client.$connect();
	}
	async addUser(dto: UserDto): Promise<User> {
		return await this.client.user.create({ data: dto });
	}

	async findUserById(id: number): Promise<User | null> {
		return await this.client.user.findUnique({ where: { id } });
	}
	async findUserByTelegramId(telegramId: number): Promise<User | null> {
		return await this.client.user.findUnique({ where: { telegramId } });
	}
	async addTranscription(dto: TranscriptionDto): Promise<Transcription> {
		return await this.client.transcription.create({ data: dto });
	}
	async getAllTranscriptionsByUserId(userId: number): Promise<Transcription[]> {
		return await this.client.transcription.findMany({ where: { userId } });
	}
}
