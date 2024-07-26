import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

export const HC_URL = process.env.HC_URL || '';

type CurlApiReqType = Pick<RequestInit, 'body' | 'headers'>;

class CurlApi {
	private baseUrl: string;
	constructor(baseUrl: string = '') {
		this.baseUrl = baseUrl;
	}

	async post<T>(url?: string, config?: CurlApiReqType): Promise<T> {
		let body;
		let headers;
		if (config) {
			body = config.body;
			headers = config.headers;
		}
		let bodyString = '';
		if (body) {
			bodyString = `-d '${body}' `;
		}
		console.log(bodyString);
		let headersString = '';
		if (headers) {
			const entries = Object.entries(headers);
			entries.forEach((entry) => {
				headersString += `-H "${entry[0]}: ${entry[1]}" `;
			});
		}
		const { stdout } = await execAsync(
			`curl -X POST ${this.baseUrl}${url} ${headersString}${bodyString}`,
		);

		return JSON.parse(stdout) as T;
	}

	async get<T>(url?: string, config?: Omit<CurlApiReqType, 'body'>): Promise<T> {
		let headers;
		if (config) {
			headers = config.headers;
		}
		let headersString = '';
		if (headers) {
			const entries = Object.entries(headers);
			entries.forEach((entry) => {
				headersString += `-H "${entry[0]}: ${entry[1]}" `;
			});
		}
		const { stdout } = await execAsync(
			`curl -X GET ${this.baseUrl}${url} ${headersString}`,
		);

		return JSON.parse(stdout) as T;
	}
}

export const $api = new CurlApi(HC_URL);
