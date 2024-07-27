import 'dotenv/config';
import { HamService } from './services/ham.service';
import axios from 'axios';
import { ProfitController } from './controllers/profit.controller';
import { SpendAllMoney } from './pipes/humst.pipe';

const tokens = process.env.TOKENS?.split(',') || [''];

const hamService = new HamService();
const profit = new ProfitController();
const pipe = new SpendAllMoney(hamService, profit);

const start = async (): Promise<void> => {
	try {
		// await hamService.sync(tokens[0]);
		// hamService.auth(tokens[1]);
		// hamService.upgrades(tokens[0]);
		// const { upgradesForBuy } = await hamService.upgrades(tokens[0]);
		// const prof = profit.getProfitData(upgradesForBuy);
		// console.log(prof);
		tokens.forEach(async (token) => {
			await pipe.startSpending(token, true);
		});
	} catch (e) {
		console.log(e);
	}
};

start();

//126_180_400
