import type { Context } from 'grammy';
import { Bot, GrammyError, HttpError } from 'grammy';
import { AssemblyAIService } from './assemblyai.service';
import { PrismaController } from '../controllers/prisma.contoller';

export interface ITelegramOptions {
	token: string;
	allowedUserIds: string[];
	assemblyAIKey: string;
	fileBaseUrl: string;
}

export class TelegramService {
	protected bot: Bot;
	protected options: ITelegramOptions;
	aiClient: AssemblyAIService;
	prisma: PrismaController;
	constructor(options: ITelegramOptions) {
		this.bot = new Bot(options.token);
		this.options = options;
		this.aiClient = new AssemblyAIService(options.assemblyAIKey);
		this.prisma = new PrismaController();
	}

	protected async isAuth(ctx: Context): Promise<boolean> {
		return Boolean(
			ctx.from &&
				(this.options.allowedUserIds.includes(String(ctx.from?.id)) ||
					(await this.prisma.checkAuth(ctx.from.id))),
		);
	}

	protected async commands(): Promise<void> {
		this.bot.api.setMyCommands([
			{
				command: 'start',
				description: 'Start bot',
			},
			{
				command: 'register',
				description: 'Register at bot',
			},
		]);

		this.bot.command('start', async (ctx) => {
			const text = (await this.isAuth(ctx))
				? 'Hello! Welcome back!'
				: "Hello! You're not registered at the bot! If you have the code use command register!";
			const response = await ctx.reply(text, {
				reply_parameters: { message_id: ctx.msgId },
			});
		});

		this.bot.command('register', async (ctx) => {
			const text = (await this.isAuth(ctx))
				? 'You are already registered!'
				: 'Send me the code for registration.';
			const response = await ctx.reply(text, {
				reply_parameters: { message_id: ctx.msgId },
			});
		});
	}

	protected async auth(): Promise<void> {
		this.bot.use(async (ctx, next) => {
			if (await this.isAuth(ctx)) {
				await next();
			} else {
				console.log(`Unauthorize user with id ${ctx.from?.id} send the message!`);
				await ctx.reply('You have no right to use this bot!');
			}
		});
	}

	protected async receive(): Promise<void> {
		this.bot.command('start', async (ctx) => {
			await ctx.reply('Hello!');
		});

		this.bot.command('id', async (ctx) => {
			await ctx.reply(String(ctx.from?.id));
			console.log(ctx.from?.id);
		});

		this.bot.on(['message:voice', 'message:audio'], async (ctx) => {
			const { file_path } = await ctx.getFile();
			await ctx.reply('Voice to text started!');
			if (ctx.from.id !== Number(this.options.allowedUserIds[0])) {
				await this.bot.api.sendMessage(
					this.options.allowedUserIds[0],
					`${ctx.from.username}: ${ctx.from.first_name ?? ''} ${ctx.from.last_name ?? ''} use speech to text!`,
				);
			}

			const text = await this.aiClient.convert(
				`${this.options.fileBaseUrl}${this.options.token}/${file_path}`,
			);
			// console.log(text);
			await ctx.reply(text, {
				reply_parameters: { message_id: ctx.msgId },
			});
		});
	}

	protected errorHandler(): void {
		this.bot.catch((err) => {
			const ctx = err.ctx;
			console.error(`Error while handling update ${ctx.update.update_id}:`);
			const e = err.error;
			if (e instanceof GrammyError) {
				console.error('Error in request:', e.description);
			} else if (e instanceof HttpError) {
				console.error('Could not contact Telegram:', e);
			} else {
				console.error('Unknown error:', e);
			}
		});
	}

	async start(): Promise<void> {
		await this.commands();
		await this.auth();
		await this.receive();
		this.errorHandler();
		this.bot.start();
		console.log('Bot Started');
	}
}
