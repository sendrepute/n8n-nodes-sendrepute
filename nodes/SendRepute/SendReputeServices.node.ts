import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { SendReputeClient, SendReputeError, type OperationId } from '@sendrepute/node';
import { services } from './services.generated';

type Field = { name: string; location: string; required: boolean; schema: { type?: string; enum?: readonly unknown[]; description?: string } };
type Service = { id: string; title: string; method: string; path: string; fields: readonly Field[] };
const catalog: readonly Service[] = services;
const fields: INodeProperties[] = catalog.flatMap(service => service.fields.map(field => ({
  displayName: field.name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase()),
  name: `${service.id}__${field.location}__${field.name}`,
  type: field.schema.enum ? 'options' : field.schema.type === 'boolean' ? 'boolean' : ['integer', 'number'].includes(field.schema.type ?? '') ? 'number' : ['object', 'array'].includes(field.schema.type ?? '') ? 'json' : 'string',
  default: (field.schema.enum?.[0] as string | undefined) ?? (field.schema.type === 'boolean' ? false : ['integer', 'number'].includes(field.schema.type ?? '') ? 0 : field.schema.type === 'object' ? '{}' : field.schema.type === 'array' ? '[]' : ''),
  required: field.required,
  description: field.schema.description ?? `${field.location} parameter: ${field.name}`,
  displayOptions: { show: { operation: [service.id] } },
  ...(field.schema.enum ? { options: field.schema.enum.map(value => ({ name: String(value), value: value as string })) } : {}),
} as INodeProperties)));

export class SendReputeServices implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'SendRepute Services', name: 'sendReputeServices',
    icon: 'file:sendrepute.svg', group: ['transform'], version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Account, billing, email design and AI services with explicit mutation approval',
    defaults: { name: 'SendRepute Services' },
    inputs: [NodeConnectionTypes.Main], outputs: [NodeConnectionTypes.Main],
    credentials: [{ name: 'sendReputeApi', required: true }],
    properties: [
      { displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true, default: 'customerGetAccount', options: catalog.map(service => ({ name: service.title, value: service.id })) },
      { displayName: 'Authorize This Operation', name: 'authorizeMutation', type: 'boolean', default: false,
        description: 'Whether to authorize this change for every input item, including any displayed price. Enable only after reviewing the relevant quote. No automatic retry is performed.',
        displayOptions: { show: { operation: catalog.filter(s => s.method !== 'GET').map(s => s.id) } } },
      ...fields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const credentials = await this.getCredentials('sendReputeApi');
    if (typeof credentials.apiKey !== 'string') throw new NodeOperationError(this.getNode(), 'Invalid SendRepute credential');
    const client = new SendReputeClient({ apiKey: credentials.apiKey, baseUrl: 'https://www.sendrepute.com/api', maxRetries: 0, timeoutMs: 180_000 });
    const output: INodeExecutionData[] = [];
    for (let index = 0; index < this.getInputData().length; index++) {
      const operation = String(this.getNodeParameter('operation', index));
      const service = catalog.find(s => s.id === operation);
      if (!service) throw new NodeOperationError(this.getNode(), 'Unsupported customer operation');
      if (service.method !== 'GET' && this.getNodeParameter('authorizeMutation', index, false) !== true) {
        throw new NodeOperationError(this.getNode(), 'Explicit operation authorization is required. No request was sent.');
      }
      const input: Record<string, Record<string, unknown>> = {};
      for (const field of service.fields) {
        let value = this.getNodeParameter(`${service.id}__${field.location}__${field.name}`, index);
        if (!field.required && value === '') continue;
        if (['object', 'array'].includes(field.schema.type ?? '') && typeof value === 'string') {
          try { value = JSON.parse(value); } catch { throw new NodeOperationError(this.getNode(), `Invalid JSON in ${field.name}`); }
        }
        (input[field.location] ??= {})[field.name] = value;
      }
      try {
        const result = await client.request(operation as OperationId, input as never);
        output.push({ json: { operation, result: result as unknown as IDataObject }, pairedItem: { item: index } });
      } catch (error) {
        // Never copy untrusted remote text, message content or credentials into workflow errors.
        throw new NodeOperationError(this.getNode(), error instanceof SendReputeError ? `SendRepute request failed (${error.code})` : 'SendRepute request failed', { itemIndex: index });
      }
    }
    return [output];
  }
}
