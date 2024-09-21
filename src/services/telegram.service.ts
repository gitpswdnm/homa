import type { Context, FilterQuery, NextFunction } from 'grammy';
import { Bot, GrammyError, HttpError, InlineKeyboard } from 'grammy';
import { AssemblyAIService } from './assemblyai.service';
import { PrismaController } from '../controllers/prisma.contoller';
import type { MaybeArray, StringWithCommandSuggestions } from 'grammy/out/context';

export interface ITelegramOptions {
	token: string;
	allowedUserIds: string[];
	assemblyAIKey: string;
	fileBaseUrl: string;
}

export class TelegramService {
	private bot: Bot;
	private options: ITelegramOptions;
	private aiClient: AssemblyAIService;
	private prisma: PrismaController;
	constructor(options: ITelegramOptions) {
		this.bot = new Bot(options.token);
		this.options = options;
		this.aiClient = new AssemblyAIService(options.assemblyAIKey);
		this.prisma = new PrismaController();
	}

	async isAuth(ctx: Context): Promise<boolean> {
		return Boolean(
			ctx.from &&
				(this.options.allowedUserIds.includes(String(ctx.from?.id)) ||
					(await this.prisma.checkAuth(ctx.from.id))),
		);
	}

	async sendVoiceToText(userId: number, filePath: string): Promise<string> {
		const text = await this.aiClient.convert(
			`${this.options.fileBaseUrl}${this.options.token}/${filePath}`,
		);
		return text;
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
				: "Hello! You're not registered at the bot! Use command register!";
			const response = await ctx.reply(text, {
				reply_parameters: { message_id: ctx.msgId },
			});
		});

		this.bot.command('register', async (ctx) => {
			if (!ctx.from) {
				return;
			}
			const isRequested = await this.prisma.addAuthRequest(ctx.from?.id);
			if (!isRequested) {
				await ctx.reply(
					'You have already sent a registration request! You must wait at least 24 hours before sending it again!😡',
					{
						reply_parameters: { message_id: ctx.msgId },
					},
				);
				return;
			}
			const isAuth = await this.isAuth(ctx);
			const text = isAuth
				? 'You are already registered!'
				: 'Your registration request has been sent to the admin! You will receive the response here. Wait please 🙂';
			const response = await ctx.reply(text, {
				reply_parameters: { message_id: ctx.msgId },
			});
			if (!isAuth) {
				const inlineKeyboard = new InlineKeyboard()
					.text('Approve', 'approve-button')
					.text('Reject', 'reject-button');
				const fromString = JSON.stringify(ctx.from);
				const text = `${ctx.from.id} user want to register to bot.\n${fromString}`;
				await this.bot.api.sendMessage(this.options.allowedUserIds[0], text, {
					reply_markup: inlineKeyboard,
				});
			}
		});

		this.bot.callbackQuery(['approve-button', 'reject-button'], async (ctx) => {
			await ctx.answerCallbackQuery();
			if (ctx.callbackQuery.data === 'approve-button') {
				// console.dir(ctx.callbackQuery, { depth: null });
				const { id } = JSON.parse(
					ctx.callbackQuery.message?.text?.split('\n')[1] as string,
				);
				if (Number.isFinite(id)) {
					await this.prisma.register(id);
					this.bot.api.sendMessage(
						id,
						'You have been registered in the service. Now you can send audio files for transcription into text! Enjoy using the service!🙂',
					);
				}
			}
		});
	}

	protected async auth(): Promise<void> {
		this.bot.use(async (ctx, next) => {
			if (await this.isAuth(ctx)) {
				await next();
			} else {
				await ctx.reply('You have no right to use this bot! Use /register command!');
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
			if (!file_path) {
				return;
			}
			await ctx.reply('Voice to text started!');
			if (ctx.from.id !== Number(this.options.allowedUserIds[0])) {
				await this.bot.api.sendMessage(
					this.options.allowedUserIds[0],
					`${ctx.from.username}: ${ctx.from.first_name ?? ''} ${ctx.from.last_name ?? ''} use speech to text!`,
				);
			}

			const text = await this.sendVoiceToText(ctx.from.id, file_path);

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
