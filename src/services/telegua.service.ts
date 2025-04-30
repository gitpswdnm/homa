import { Bot, GrammyError, HttpError, InlineKeyboard } from 'grammy';
import { inspect } from 'util';

export interface IUaTelegramOptions {
	token: string;
	adminId: string;
}

export class UaTelegramService {
	private bot: Bot;
	private options: IUaTelegramOptions;
	constructor(options: IUaTelegramOptions) {
		this.bot = new Bot(options.token);
		this.options = options;
	}

	protected async commands(): Promise<void> {
		this.bot.api.setMyCommands([
			{
				command: 'start',
				description: 'Start bot',
			},
		]);
	}

	protected async receive(): Promise<void> {
		this.bot.command('start', async (ctx) => {
			await ctx.reply('Hello!');
		});

		// this.bot.on('message', async (ctx) => {
		// 	console.dir(ctx, { depth: Infinity });

		// 	const inlineKeyboard = new InlineKeyboard().text('Reply', 'reply-button');
		// 	const text = `${ctx.from.id} user want to register to bot.\n${fromString}`;
		// 	await this.bot.api.sendMessage(this.options.adminId, text, {
		// 		reply_markup: inlineKeyboard,
		// 	});
		// 	this.bot.api.sendMessage(
		// 		this.options.adminId,
		// 		`Message from chatId:${ctx.message.chat.id}.\n${ctx.message.text ?? ''} `,
		// 	);
		// });
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
			this.bot.api.sendMessage(this.options.adminId, `Error: ${e}`);
		});
	}

	async start(): Promise<void> {
		await this.commands();
		await this.receive();
		this.errorHandler();
		this.bot.start();
		console.log('Bot UA Started');
	}
}
