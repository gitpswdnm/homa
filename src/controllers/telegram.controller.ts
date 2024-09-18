/* // telegram.controller.ts
import type { Bot, Context } from 'grammy';
import type { ITelegramOptions } from '../services/telegram.service';
import { TelegramService } from '../services/telegram.service';

export class TelegramController {
	protected bot: Bot;
	protected telegramService: TelegramService;

	constructor(options: ITelegramOptions) {
		this.telegramService = new TelegramService(options);
		this.bot = this.telegramService.bot;
	}

	async setupCommands(): Promise<void> {
		this.bot.api.setMyCommands([
			{ command: 'start', description: 'Start bot' },
			{ command: 'register', description: 'Register at bot' },
		]);

		this.bot.command('start', async (ctx: Context) => {
			const isAuth = await this.telegramService.isAuth(ctx.from?.id!);
			const text = isAuth ? 'Hello! Welcome back!' : "Hello! You're not registered!";
			await ctx.reply(text);
		});

		this.bot.command('register', async (ctx: Context) => {
			const isAuth = await this.telegramService.isAuth(ctx.from?.id!);
			const text = isAuth
				? 'You are already registered!'
				: 'Send me the code for registration.';
			await ctx.reply(text);
		});
	}

	async setupMessageHandlers(): Promise<void> {
		this.bot.on(['message:voice', 'message:audio'], async (ctx) => {
			const { file_path } = await ctx.getFile();
			await ctx.reply('Voice to text started!');

			const text = await this.telegramService.sendVoiceToText(
				ctx.from?.id!,
				file_path,
			);
			await ctx.reply(text);
		});
	}

	async setupAuthMiddleware(): Promise<void> {
		this.bot.use(async (ctx, next) => {
			const isAuth = await this.telegramService.isAuth(ctx.from?.id!);
			if (isAuth) {
				await next();
			} else {
				console.log(`Unauthorized user with id ${ctx.from?.id}`);
				await ctx.reply('You have no right to use this bot!');
			}
		});
	}

	async start(): Promise<void> {
		await this.setupCommands();
		await this.setupAuthMiddleware();
		await this.setupMessageHandlers();
		this.telegramService.catchErrors();
		await this.telegramService.startBot();
	}
}
 */
