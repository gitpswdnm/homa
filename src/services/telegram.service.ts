import type { Context } from 'grammy';
import { Bot, GrammyError, HttpError, InlineKeyboard } from 'grammy';
import { RegistrationResponse } from '../common/constants';
import { PrismaController } from '../controllers/prisma.contoller';
import type { ConvertResponse } from './assemblyai.service';
import { AssemblyAIService } from './assemblyai.service';

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

	async sendVoiceToText(userId: number, filePath: string): Promise<ConvertResponse> {
		const convert = await this.aiClient.convert(
			`${this.options.fileBaseUrl}${this.options.token}/${filePath}`,
		);
		return convert;
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
				: "Hello! You're not registered at the bot! Use command /register!";
			await ctx.reply(text, {
				reply_parameters: { message_id: ctx.msgId },
			});
		});

		this.bot.command('register', async (ctx) => {
			if (!ctx.from) {
				return;
			}
			console.log(ctx.from.id);
			const { isRejected, message, stopped } = await this.prisma.addAuthRequest(
				ctx.from.id,
			);
			if (isRejected || stopped) {
				await ctx.reply(message, {
					reply_parameters: { message_id: ctx.msgId },
				});
				return;
			}

			await ctx.reply(message, {
				reply_parameters: { message_id: ctx.msgId },
			});
			const inlineKeyboard = new InlineKeyboard()
				.text('Approve', 'approve-button')
				.text('Reject', 'reject-button');
			const fromString = JSON.stringify(ctx.from);
			const text = `${ctx.from.id} user want to register to bot.\n${fromString}`;
			await this.bot.api.sendMessage(this.options.allowedUserIds[0], text, {
				reply_markup: inlineKeyboard,
			});
		});

		this.bot.callbackQuery(['approve-button', 'reject-button'], async (ctx) => {
			await ctx.answerCallbackQuery();
			if (ctx.callbackQuery.data === 'approve-button') {
				const { id } = JSON.parse(
					ctx.callbackQuery.message?.text?.split('\n')[1] as string,
				);
				if (Number.isFinite(id)) {
					await this.prisma.register(id);
					await this.bot.api.sendMessage(id, RegistrationResponse.APPROVE_ADMIN);
				}
			}
			if (ctx.callbackQuery.data === 'reject-button') {
				const { id } = JSON.parse(
					ctx.callbackQuery.message?.text?.split('\n')[1] as string,
				);
				if (Number.isFinite(id)) {
					await this.prisma.rejectAuthRequest(id);
					await this.bot.api.sendMessage(id, RegistrationResponse.REJECT_ADMIN);
				}
			}
		});
	}

	protected async sendLongText(ctx: Context, text: string): Promise<void> {
		if (!ctx || !text) {
			return;
		}

		const MAX_LENGTH = 4096;
		const parts = [];
		let currentPart = '';

		const sentences = text.split(/(?<=[.!?])\s+/);

		for (const sentence of sentences) {
			if ((currentPart + sentence).length > MAX_LENGTH) {
				if (currentPart) {
					parts.push(currentPart.trim());
					currentPart = '';
				}
				if (sentence.length > MAX_LENGTH) {
					const words = sentence.split(' ');
					for (const word of words) {
						if ((currentPart + ' ' + word).length > MAX_LENGTH) {
							parts.push(currentPart.trim());
							currentPart = word;
						} else {
							currentPart += (currentPart ? ' ' : '') + word;
						}
					}
				} else {
					currentPart = sentence;
				}
			} else {
				currentPart += (currentPart ? ' ' : '') + sentence;
			}
		}

		if (currentPart) {
			parts.push(currentPart.trim());
		}

		for (const part of parts) {
			await ctx.reply(part);
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
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

		this.bot.on(
			['message:voice', 'message:audio', 'message:document'],
			async (ctx) => {
				if (ctx.message.document) {
					const type = ctx.message.document.mime_type;
					if (!type?.includes('audio') && !type?.includes('wav')) {
						await ctx.reply('Unacceptable format!');
						return;
					}
				}
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

				const { text, isError } = await this.sendVoiceToText(ctx.from.id, file_path);
				if (isError) {
					await this.bot.api.sendMessage(
						this.options.allowedUserIds[0],
						`${ctx.from.username}: ${ctx.from.first_name ?? ''} ${ctx.from.last_name ?? ''}. AssemblyAI error:\n${text}`,
					);
					return;
				}
				if (text.length > 4096) {
					await this.sendLongText(ctx, text);
					return;
				}
				await ctx.reply(text, {
					reply_parameters: { message_id: ctx.msgId },
				});
			},
		);
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
			this.bot.api.sendMessage(this.options.allowedUserIds[0], `Error: ${e}`);
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
