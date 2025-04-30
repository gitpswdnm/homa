import { RegistrationResponse } from '../common/constants';
import { PrismaService } from '../services/prisma.service';

export class PrismaController {
	service: PrismaService;
	constructor() {
		this.service = new PrismaService();
	}
	async register(telegramId: number, username?: string): Promise<void> {
		const isUserRegistered = await this.service.findUserByTelegramId(telegramId);
		if (isUserRegistered) {
			return; /* `User with id ${isUserRegistered.telegramId} is already registered`; */
		}
		const user = await this.service.addUser({ telegramId, username });
		await this.service.deleteAuthRequestByTelegramId(telegramId);
		console.log(`User ${user.telegramId} registered!`);
		return; /* `User ${user.telegramId} registered!`; */
	}
	async checkAuth(telegramId: number): Promise<Boolean> {
		const authUser = await this.service.findUserByTelegramId(telegramId);
		return Boolean(authUser);
	}

	async addTranscribe(text: string, userId: number): Promise<string> {
		await this.service.addTranscription({ text, userId });
		return 'Transcription saved!';
	}

	async repeatRequest(id: number, telegramId: number): Promise<void> {
		await this.service.deleteAuthRequestById(id);
		await this.service.addAuthRequest(telegramId);
	}

	async addAuthRequest(
		telegramId: number,
	): Promise<{ message: string; stopped: boolean; isRejected: boolean }> {
		const isAuth = await this.checkAuth(telegramId);
		if (isAuth) {
			return {
				message: RegistrationResponse.REGISTERED,
				isRejected: false,
				stopped: true,
			};
		}
		const request = await this.service.findAuthRequest(telegramId);
		const now = new Date().getTime();
		const DAY_IN_MS = 24 * 60 * 60 * 1000;
		const WEEK_IN_MS = 7 * DAY_IN_MS;
		if (!request) {
			await this.service.addAuthRequest(telegramId);
			return {
				message: RegistrationResponse.SUCCESS,
				isRejected: false,
				stopped: false,
			};
		}
		if (!request.isRejected) {
			const passedTimeMs = now - request.requestDate.getTime();
			const remainingTimeMs = DAY_IN_MS - passedTimeMs;
			console.log(request.requestDate);
			console.log(request.requestDate.getTime());
			if (passedTimeMs < DAY_IN_MS) {
				const remainingHours = ~~(remainingTimeMs / 3600000);
				const remainingMinutes = ~~((remainingTimeMs % 360000) / 60000);
				const additionalString = `Remaining time is ${remainingHours || remainingMinutes} ${!remainingHours ? 'minute(s).' : 'hour(s).'}`;
				return {
					message: `${RegistrationResponse.FAILURE_DAY}\n${additionalString} `,
					isRejected: false,
					stopped: true,
				};
			}
			await this.repeatRequest(request.id, telegramId);
			return {
				message: RegistrationResponse.SUCCESS_AFTER_DAY,
				isRejected: false,
				stopped: false,
			};
		}
		if (now - request.requestDate.getTime() > WEEK_IN_MS) {
			await this.repeatRequest(request.id, telegramId);
			return {
				message: RegistrationResponse.SUCCESS_AFTER_WEEK,
				isRejected: false,
				stopped: false,
			};
		}
		const remainingDays =
			(WEEK_IN_MS - (now - request.requestDate.getTime())) / DAY_IN_MS;
		const roundedRemainingDays = ~~remainingDays;
		const remainingHours = ~~((remainingDays * 24) % 24);
		const additionalString = `Remaining period is${!roundedRemainingDays ? '' : ` ${roundedRemainingDays} day(s) and`} ${remainingHours} hour(s).`;
		return {
			message: `${RegistrationResponse.REJECT_RESPONSE}\n${additionalString}`,
			isRejected: true,
			stopped: true,
		};
	}

	async rejectAuthRequest(telegramId: number): Promise<void> {
		await this.service.changeRejectAuthRequest(telegramId, true);
	}
}
