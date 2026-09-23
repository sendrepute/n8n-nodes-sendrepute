import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import {
	classify,
	SendReputeTransportError,
	type FailureCategory,
} from './transport';

type FailurePolicy = 'open' | 'closed';
class ConfigurationError extends Error {}
class InputError extends Error {}

function boundedString(value: unknown, field: string, maximum: number): string {
	if (typeof value !== 'string' || value.length === 0 || value.length > maximum) {
		throw new InputError(`${field} must contain between 1 and ${maximum} characters`);
	}
	return value;
}

function failureDecision(
	policy: FailurePolicy,
	category: FailureCategory,
	code: string,
): IDataObject {
	return {
		analysisStatus: 'failed',
		decision: policy === 'closed' ? 'block' : 'allow',
		allowed: policy === 'open',
		failurePolicy: policy,
		failureCategory: category,
		errorCode: code,
		advisory: 'No spam determination was made. Review this failure before sending.',
		deliverabilityGuarantee: false,
	};
}

function resultJson(input: IDataObject, decision: IDataObject): IDataObject {
	return {
		...input,
		sendrepute: decision,
	};
}

export class SendRepute implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SendRepute',
		name: 'sendRepute',
		icon: 'file:sendrepute.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Classify sender, subject, and body before an email is sent',
		defaults: { name: 'SendRepute' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'sendReputeApi', required: true }],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [{ name: 'Classify Email', value: 'classify', action: 'Classify an email' }],
				default: 'classify',
			},
			{
				displayName: 'Paid Analysis Consent',
				name: 'paidConsent',
				type: 'boolean',
				default: false,
				required: true,
				description:
					'Whether to authorize a potentially paid API classification for every input item. Exact repeats may be replayed by the API, but this node makes no assumption that they are free.',
			},
			{
				displayName: 'Sender',
				name: 'sender',
				type: 'string',
				default: '',
				required: true,
				description: 'Display name only (maximum 320 characters). Do not provide a recipient.',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				required: true,
				typeOptions: { rows: 2 },
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				typeOptions: { rows: 8 },
				default: '',
				required: true,
				description: 'Plain text or HTML email body. Attachments are not accepted.',
			},
			{
				displayName: 'Decision Mode',
				name: 'decisionMode',
				type: 'options',
				options: [
					{
						name: 'Advisory',
						value: 'advisory',
						description: 'Always allow downstream processing while reporting the recommendation',
					},
					{
						name: 'Blocking',
						value: 'blocking',
						description: 'Block when the spam probability meets the configured threshold',
					},
				],
				default: 'advisory',
			},
			{
				displayName: 'Spam Probability Threshold',
				name: 'threshold',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 3 },
				default: 0.8,
				description: 'Used for recommendation and blocking decisions (0 to 1 inclusive)',
			},
			{
				displayName: 'Failure Policy',
				name: 'failurePolicy',
				type: 'options',
				options: [
					{
						name: 'Fail Closed (Block)',
						value: 'closed',
						description: 'Return a block decision when classification cannot be completed',
					},
					{
						name: 'Fail Open (Allow)',
						value: 'open',
						description: 'Allow downstream processing but clearly report the analysis failure',
					},
				],
				default: 'closed',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const output: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('sendReputeApi');
		const apiKey = credentials.apiKey;
		if (typeof apiKey !== 'string') {
			throw new NodeOperationError(this.getNode(), 'SendRepute API credential is invalid');
		}

		for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
			let failurePolicy: FailurePolicy = 'closed';
			try {
				const parameter = (name: string): unknown => {
					try {
						return this.getNodeParameter(name, itemIndex);
					} catch {
						throw new ConfigurationError();
					}
				};
				const operation = parameter('operation');
				if (operation !== 'classify') throw new ConfigurationError();
				const configuredFailurePolicy = parameter('failurePolicy');
				if (configuredFailurePolicy !== 'open' && configuredFailurePolicy !== 'closed') {
					throw new ConfigurationError();
				}
				failurePolicy = configuredFailurePolicy;
				const paidConsent = parameter('paidConsent');
				if (paidConsent !== true && paidConsent !== false) throw new ConfigurationError();
				const decisionMode = parameter('decisionMode');
				if (decisionMode !== 'advisory' && decisionMode !== 'blocking') {
					throw new ConfigurationError();
				}
				const threshold = parameter('threshold');
				if (typeof threshold !== 'number' || !Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
					throw new ConfigurationError();
				}
				if (paidConsent === false) {
					output.push({
						json: resultJson(items[itemIndex].json, {
							analysisStatus: 'not_run',
						decision: failurePolicy === 'closed' ? 'block' : 'allow',
						allowed: failurePolicy === 'open',
						failurePolicy,
						failureCategory: 'consent_required',
						advisory:
							'Paid analysis consent is disabled. No request was sent and no spam determination was made.',
						deliverabilityGuarantee: false,
						}),
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				const sender = boundedString(parameter('sender'), 'sender', 320);
				const subject = boundedString(parameter('subject'), 'subject', 998);
				const body = boundedString(parameter('body'), 'body', 524_288);
				const response = await classify(apiKey, { sender, subject, body });
				const recommendation =
					response.result.spamProbability >= threshold ? 'block' : 'allow';
				const decision =
					decisionMode === 'blocking' && recommendation === 'block' ? 'block' : 'allow';
				output.push({
					json: resultJson(items[itemIndex].json, {
						analysisStatus: 'completed',
						decision,
						allowed: decision === 'allow',
						recommendation,
						decisionMode,
						threshold,
						label: response.result.label,
						spamProbability: response.result.spamProbability,
						confidence: response.result.confidence,
						reasons: response.result.reasons,
						flaggedTerms: response.result.flaggedTerms,
						analyzedFields: response.result.analyzedFields,
						model: response.model,
						modelVersion: response.result.modelVersion,
						analyzedAt: response.result.analyzedAt,
						requestId: response.requestId,
						billing: response.billing,
						advisory:
							'Classification is a pre-send safety signal and does not guarantee inbox placement or deliverability.',
						deliverabilityGuarantee: false,
					}),
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				const invalidConfiguration = error instanceof ConfigurationError;
				const invalidInput = error instanceof InputError;
				const known = error instanceof SendReputeTransportError;
				const category: FailureCategory = known ? error.category : 'malformed';
				const code = known
					? error.code
					: invalidConfiguration
						? 'INVALID_CONFIG'
						: invalidInput
							? 'INVALID_INPUT'
							: 'UNKNOWN_FAILURE';
				const effectivePolicy: FailurePolicy =
					invalidConfiguration || (!known && !invalidInput) ? 'closed' : failurePolicy;
				output.push({
					json: resultJson(
						items[itemIndex].json,
						failureDecision(effectivePolicy, category, code),
					),
					pairedItem: { item: itemIndex },
				});
			}
		}
		return [output];
	}
}