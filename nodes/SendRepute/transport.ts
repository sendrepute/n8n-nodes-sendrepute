const MAX_RESPONSE_BYTES = 1_048_576;
const TIMEOUT_MS = 20_000;

const SENDREPUTE_CLASSIFY_URL = 'https://www.sendrepute.com/api/v1/classify';

export type FailureCategory =
	| 'malformed'
	| 'transport'
	| 'authentication'
	| 'balance'
	| 'rate_limit'
	| 'service';

export interface ClassificationResponse {
	requestId: string;
	model: string;
	result: {
		label: 'inbox' | 'spam';
		spamProbability: number;
		confidence: 'low' | 'medium' | 'high';
		reasons: Array<{ signal: string; detail: string; weight: number }>;
		flaggedTerms: string[];
		analyzedFields: string[];
		modelVersion: string;
		analyzedAt: string;
		flaggedTermCount?: number;
		contentAudit?: unknown;
	};
	billing: {
		chargedMillicents: number;
		replayed: boolean;
	};
}

export class SendReputeTransportError extends Error {
	constructor(
		public readonly category: FailureCategory,
		public readonly code: string,
		public readonly status?: number,
	) {
		super(`SendRepute classification failed (${category})`);
		this.name = 'SendReputeTransportError';
	}
}

function categoryForStatus(status: number): FailureCategory {
	if (status === 400 || status === 413 || status === 422) return 'malformed';
	if (status === 401 || status === 403) return 'authentication';
	if (status === 402) return 'balance';
	if (status === 429) return 'rate_limit';
	return 'service';
}

async function readBoundedBody(response: Response): Promise<string> {
	const length = Number(response.headers.get('content-length'));
	if (Number.isFinite(length) && length > MAX_RESPONSE_BYTES) {
		throw new SendReputeTransportError('service', 'RESPONSE_TOO_LARGE', response.status);
	}
	if (!response.body) return '';
	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let bytes = 0;
	let body = '';
	for (;;) {
		const { value, done } = await reader.read();
		if (done) break;
		bytes += value.byteLength;
		if (bytes > MAX_RESPONSE_BYTES) {
			await reader.cancel();
			throw new SendReputeTransportError('service', 'RESPONSE_TOO_LARGE', response.status);
		}
		body += decoder.decode(value, { stream: true });
	}
	return body + decoder.decode();
}

function validResponse(value: unknown): value is ClassificationResponse {
	if (!value || typeof value !== 'object') return false;
	const response = value as Partial<ClassificationResponse>;
	const result = response.result;
	const billing = response.billing;
	const validStringArray = (array: unknown, maximumItems: number, maximumLength: number) =>
		Array.isArray(array) &&
		array.length <= maximumItems &&
		array.every(
			(item) => typeof item === 'string' && item.length > 0 && item.length <= maximumLength,
		);
	const validReasons =
		Array.isArray(result?.reasons) &&
		result.reasons.length <= 1_000 &&
		result.reasons.every(
			(reason) =>
				!!reason &&
				typeof reason === 'object' &&
				typeof reason.signal === 'string' &&
				reason.signal.length > 0 &&
				reason.signal.length <= 256 &&
				typeof reason.detail === 'string' &&
				reason.detail.length <= 4_096 &&
				typeof reason.weight === 'number' &&
				Number.isFinite(reason.weight),
		);
	return (
		typeof response.requestId === 'string' &&
		response.requestId.length > 0 &&
		response.requestId.length <= 128 &&
		typeof response.model === 'string' &&
		response.model.length > 0 &&
		response.model.length <= 128 &&
		!!result &&
		(result.label === 'inbox' || result.label === 'spam') &&
		typeof result.spamProbability === 'number' &&
		Number.isFinite(result.spamProbability) &&
		result.spamProbability >= 0 &&
		result.spamProbability <= 1 &&
		(result.confidence === 'low' || result.confidence === 'medium' || result.confidence === 'high') &&
		validReasons &&
		validStringArray(result.flaggedTerms, 10_000, 1_024) &&
		validStringArray(result.analyzedFields, 16, 64) &&
		typeof result.modelVersion === 'string' &&
		result.modelVersion.length > 0 &&
		result.modelVersion.length <= 256 &&
		typeof result.analyzedAt === 'string' &&
		result.analyzedAt.length > 0 &&
		result.analyzedAt.length <= 128 &&
		!!billing &&
		Number.isSafeInteger(billing.chargedMillicents) &&
		billing.chargedMillicents >= 0 &&
		typeof billing.replayed === 'boolean'
	);
}

export async function classify(
	apiKey: string,
	input: { sender: string; subject: string; body: string },
	options: { fetch?: typeof globalThis.fetch } = {},
): Promise<ClassificationResponse> {
	if (!apiKey || apiKey.length > 4096 || /[\r\n]/u.test(apiKey)) {
		throw new SendReputeTransportError('authentication', 'INVALID_CREDENTIAL');
	}
	const fetchImplementation = options.fetch ?? globalThis.fetch;
	if (typeof fetchImplementation !== 'function') {
		throw new SendReputeTransportError('transport', 'FETCH_UNAVAILABLE');
	}
	const signal = AbortSignal.timeout(TIMEOUT_MS);
	let response: Response;
	try {
		response = await fetchImplementation(SENDREPUTE_CLASSIFY_URL, {
			method: 'POST',
			headers: {
				accept: 'application/json',
				authorization: `Bearer ${apiKey}`,
				'content-type': 'application/json',
			},
			body: JSON.stringify(input),
			redirect: 'manual',
			signal,
		});
	} catch {
		throw new SendReputeTransportError('transport', signal.aborted ? 'TIMEOUT' : 'NETWORK_ERROR');
	}
	if (response.status >= 300 && response.status < 400) {
		throw new SendReputeTransportError('transport', 'REDIRECT_REFUSED', response.status);
	}
	let raw: string;
	try {
		raw = await readBoundedBody(response);
	} catch (error) {
		if (error instanceof SendReputeTransportError) throw error;
		throw new SendReputeTransportError(
			'transport',
			signal.aborted ? 'TIMEOUT' : 'RESPONSE_READ_ERROR',
			response.status,
		);
	}
	if (!response.ok) {
		throw new SendReputeTransportError(
			categoryForStatus(response.status),
			`HTTP_${response.status}`,
			response.status,
		);
	}
	let decoded: unknown;
	try {
		decoded = raw ? JSON.parse(raw) : undefined;
	} catch {
		throw new SendReputeTransportError('service', 'INVALID_JSON', response.status);
	}
	if (!validResponse(decoded)) {
		throw new SendReputeTransportError('service', 'INVALID_RESPONSE', response.status);
	}
	return decoded;
}