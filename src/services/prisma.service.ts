import type { User, Transcription, AuthRequestUser, Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

interface UserDto {
	telegramId: number;
	username?: string;
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
	async getAllUsers(): Promise<User[]> {
		return await this.client.user.findMany();
	}
	async findUserById(id: number): Promise<User | null> {
		return await this.client.user.findUnique({ where: { id } });
	}
	async findUserByTelegramId(telegramId: number): Promise<User | null> {
		return await this.client.user.findUnique({ where: { telegramId } });
	}
	async deleteUserByTelegramId(telegramId: number): Promise<User> {
		return await this.client.user.delete({ where: { telegramId } });
	}
	async deleteUserById(id: number): Promise<User> {
		return await this.client.user.delete({ where: { id } });
	}
	async addTranscription(dto: TranscriptionDto): Promise<Transcription> {
		return await this.client.transcription.create({ data: dto });
	}
	async getAllTranscriptionsByUserId(userId: number): Promise<Transcription[]> {
		return await this.client.transcription.findMany({ where: { userId } });
	}
	async addAuthRequest(telegramId: number): Promise<AuthRequestUser> {
		return await this.client.authRequestUser.create({ data: { telegramId } });
	}
	async findAuthRequest(telegramId: number): Promise<AuthRequestUser | null> {
		return await this.client.authRequestUser.findUnique({ where: { telegramId } });
	}
	async findRejectedAuthRequests(): Promise<AuthRequestUser[]> {
		return await this.client.authRequestUser.findMany({ where: { isRejected: true } });
	}
	async changeRejectAuthRequest(
		telegramId: number,
		isRejected: boolean,
	): Promise<AuthRequestUser> {
		return await this.client.authRequestUser.update({
			where: { telegramId },
			data: { isRejected },
		});
	}
	async deleteAuthRequestByTelegramId(telegramId: number): Promise<AuthRequestUser> {
		return await this.client.authRequestUser.delete({ where: { telegramId } });
	}
	async deleteAuthRequestById(id: number): Promise<AuthRequestUser> {
		return await this.client.authRequestUser.delete({ where: { id } });
	}
	async deleteAllAuthRequests(): Promise<Prisma.BatchPayload> {
		return await this.client.authRequestUser.deleteMany({});
	}
}
