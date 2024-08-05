import 'dotenv/config';
import { HamService } from './services/ham.service';
import { ProfitController } from './controllers/profit.controller';
import { SpendAllMoney } from './pipes/hamst.pipe';
import { CurlApi } from './common/api';
import { ZarGatesService } from './services/zarg.service';
import { ZarGatesPipe } from './pipes/zargates.pipe';

const hamsterTokens = process.env.HAMSTER_TOKENS?.split(',') || [''];
const zargTokens = process.env.ZARG_TOKENS?.split(',') || [''];
const HC_URL = process.env.HC_URL || '';
const ZARG_URL = process.env.ZARG_URL || '';

const hamCurl = new CurlApi(HC_URL);
const zargCurl = new CurlApi(ZARG_URL);
const hamService = new HamService(hamCurl);
const zargService = new ZarGatesService(zargCurl);
const profit = new ProfitController();
const hamsterPipe = new SpendAllMoney(hamService, profit);
const zargPipe = new ZarGatesPipe(zargService);

const start = async (): Promise<void> => {
	try {
		// await hamService.sync(tokens[0]);
		// hamService.auth(tokens[1]);
		// hamService.upgrades(tokens[0]);
		// const { upgradesForBuy } = await hamService.upgrades(tokens[0]);
		// const prof = profit.getProfitData(upgradesForBuy);
		// console.log(prof);
		zargTokens.forEach(async (token) => {
			await zargPipe.claimAllQuests(token);
		});
		hamsterTokens.forEach(async (token) => {
			await hamsterPipe.startPipe(token, true);
		});
	} catch (e) {
		console.log(e);
	}
};

start();

//126_180_400
