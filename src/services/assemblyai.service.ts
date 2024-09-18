import type { TranscribeParams } from 'assemblyai';
import { AssemblyAI } from 'assemblyai';
import { LanguageCode } from '../common/types/assemblyAi/types';

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
	): Promise<string> {
		const params: TranscribeParams = {
			audio: fileUrl,
			speaker_labels: true,
			language_code: language,
		};
		const transcript = await this.client.transcripts.transcribe(params);

		if (transcript.status === 'error') {
			console.error(`Transcription failed: ${transcript.error}`);
			return `Voice to text Error: ${transcript.error}`;
		}
		return transcript.text ?? '';
	}
}
