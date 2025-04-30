import 'dotenv/config';
import { CurlApi } from './common/api';
import { ProfitInterludeController } from './controllers/profit.interlude.controller';
import { SpendAllInterludeMoney } from './pipes/hamst.interlude.pipe';
import { ZarGatesPipe } from './pipes/zargates.pipe';
import { HamInterludeService } from './services/ham.interlude.service';
import { TelegramService } from './services/telegram.service';
import { ZarGatesService } from './services/zarg.service';
import { UaTelegramService } from './services/telegua.service';

// const hamsterTokens = process.env.HAMSTER_TOKENS?.split(',') ?? [''];
const hamsterInterludeTokens = process.env.HAMSTER_INTERLUDE_TOKENS?.split(',') ?? [
	'',
];
const zargTokens = process.env.ZARG_TOKENS?.split(',') ?? [''];
// const HC_URL = process.env.HC_URL ?? '';
const HC_INTER_URL = process.env.HC_INTER_URL ?? '';
const ZARG_URL = process.env.ZARG_URL ?? '';

const telegramToken = process.env.TELEGRAM_BOT_TOKEN ?? '';
const allowedIds = process.env.TELEGRAM_USER_IDS?.split(',') ?? [''];
const assemblyKey = process.env.ASSAMBLY_AI_KEY ?? '';
const telegramDownloadUrl = process.env.TELEGRAM_DOWNLOAD_URL ?? '';

const uaTelegramToken = process.env.UA_BOT_API_KEY ?? '';
const admID = process.env.TELEGRAM_ADMIN_CHAT ?? '';

// const hamCurl = new CurlApi(HC_URL);
const hamInterCurl = new CurlApi(HC_INTER_URL);
const zargCurl = new CurlApi(ZARG_URL);
// const hamService = new HamService(hamCurl);
const hamInterService = new HamInterludeService(hamInterCurl);
const zargService = new ZarGatesService(zargCurl);
// const profit = new ProfitController();
const profitInter = new ProfitInterludeController();
// const hamsterPipe = new SpendAllMoney(hamService, profit);
const hamsterInterludePipe = new SpendAllInterludeMoney(hamInterService, profitInter);
const zargPipe = new ZarGatesPipe(zargService);

const botService = new TelegramService({
	token: telegramToken,
	allowedUserIds: allowedIds,
	assemblyAIKey: assemblyKey,
	fileBaseUrl: telegramDownloadUrl,
});

const uaBot = new UaTelegramService({
	token: uaTelegramToken,
	adminId: admID,
});

const start = async (): Promise<void> => {
	try {
		// zargTokens.forEach(async (token) => {
		// 	await zargPipe.claimAllQuests(token);
		// });
		// hamsterInterludeTokens.forEach(async (token) => {
		// 	await hamsterInterludePipe.startPipe(token, true, false);
		// });
		botService.start();
		uaBot.start();
	} catch (e) {
		console.log(e);
	}
};

start();
