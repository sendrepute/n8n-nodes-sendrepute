import type {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SendReputeApi implements ICredentialType {
	name = 'sendReputeApi';

	displayName = 'SendRepute API';

	documentationUrl = 'https://www.sendrepute.com/integrations';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Server-side customer API key with the classify scope. n8n stores this as a password credential.',
		},
	];
}