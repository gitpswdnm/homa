import 'dotenv/config';
import { HamService } from './services/ham.service';
import { ProfitController } from './controllers/profit.controller';
import { SpendAllMoney } from './pipes/hamst.pipe';
import { CurlApi } from './common/api';
import { ZarGatesService } from './services/zarg.service';
import { ZarGatesPipe } from './pipes/zargates.pipe';
import { TelegramService } from './services/telegram.service';

const hamsterTokens = process.env.HAMSTER_TOKENS?.split(',') || [''];
const zargTokens = process.env.ZARG_TOKENS?.split(',') || [''];
const HC_URL = process.env.HC_URL || '';
const ZARG_URL = process.env.ZARG_URL || '';

const telegramToken = process.env.TELEGRAM_BOT_TOKEN ?? '';
const allowedIds = process.env.TELEGRAM_USER_IDS?.split(',') ?? [''];
const assemblyKey = process.env.ASSAMBLY_AI_KEY ?? '';
const telegramDownloadUrl = process.env.TELEGRAM_DOWNLOAD_URL ?? '';

const hamCurl = new CurlApi(HC_URL);
const zargCurl = new CurlApi(ZARG_URL);
const hamService = new HamService(hamCurl);
const zargService = new ZarGatesService(zargCurl);
const profit = new ProfitController();
const hamsterPipe = new SpendAllMoney(hamService, profit);
const zargPipe = new ZarGatesPipe(zargService);

const botService = new TelegramService({
	token: telegramToken,
	allowedUserIds: allowedIds,
	assemblyAIKey: assemblyKey,
	fileBaseUrl: telegramDownloadUrl,
});

const start = async (): Promise<void> => {
	try {
		zargTokens.forEach(async (token) => {
			await zargPipe.claimAllQuests(token);
		});
		hamsterTokens.forEach(async (token) => {
			await hamsterPipe.startPipe(token, true, true);
		});
		botService.start();
	} catch (e) {
		console.log(e);
	}
};

start();
