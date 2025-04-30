import type { TranscribeParams } from 'assemblyai';
import { AssemblyAI } from 'assemblyai';
import { LanguageCode } from '../common/types/assemblyAi/types';

export interface ConvertResponse {
	text: string;
	isError: boolean;
}

export class AssemblyAIService {
	private client: AssemblyAI;
	constructor(apiKey: string) {
		this.client = new AssemblyAI({
			apiKey,
		});
	}
	async convert(
		fileUrl: string,
		language: LanguageCode = LanguageCode.Russian,
	): Promise<ConvertResponse> {
		try {
			const params: TranscribeParams = {
				audio: fileUrl,
				speaker_labels: true,
				language_code: language,
			};
			const transcript = await this.client.transcripts.transcribe(params);

			if (transcript.status === 'error') {
				console.error(`Transcription failed: ${transcript.error}`);
				return { text: `Voice to text Error: ${transcript.error}`, isError: true };
			}
			return { text: transcript.text ?? '', isError: false };
		} catch (error) {
			console.error(error);
			return { text: `AssemblyAI error: ${error}`, isError: true };
		}
	}
}
