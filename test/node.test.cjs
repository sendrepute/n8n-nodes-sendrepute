'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');

const { SendRepute } = require('../dist/nodes/SendRepute/SendRepute.node.js');
const { SendReputeApi } = require('../dist/credentials/SendReputeApi.credentials.js');

function context(parameters, apiKey = 'offline-secret', input = { sourceId: 'one' }) {
	return {
		getInputData: () => [{ json: input }],
		getCredentials: async () => ({ apiKey }),
		getNode: () => ({ name: 'SendRepute', type: 'sendRepute', typeVersion: 1 }),
		getNodeParameter: (name) => parameters[name],
	};
}

test('uses an official password credential field and n8n node schema', () => {
	const credential = new SendReputeApi();
	const key = credential.properties.find((property) => property.name === 'apiKey');
	assert.equal(key.type, 'string');
	assert.equal(key.typeOptions.password, true);

	const node = new SendRepute();
	assert.deepEqual(node.description.inputs, ['main']);
	assert.deepEqual(node.description.outputs, ['main']);
	assert.equal(node.description.credentials[0].name, 'sendReputeApi');
	assert.equal(
		node.description.properties.find((property) => property.name === 'paidConsent').default,
		false,
	);
});

test('example workflow gates the allowed path and leaves false disconnected', () => {
	const workflow = JSON.parse(
		readFileSync(join(__dirname, '..', 'examples', 'classify-email.workflow.json'), 'utf8'),
	);
	const gate = workflow.nodes.find((node) => node.name === 'Continue only when allowed');
	assert.equal(gate.parameters.conditions.conditions[0].leftValue, '={{ $json.sendrepute.allowed }}');
	const [trueBranch, falseBranch] = workflow.connections[gate.name].main;
	assert.equal(trueBranch[0].node, 'Allowed path');
	assert.deepEqual(falseBranch, []);
});

test('disabled consent performs no network request and fails closed', async () => {
	const originalFetch = global.fetch;
	let calls = 0;
	global.fetch = async () => {
		calls += 1;
		throw new Error('must not be called');
	};
	try {
		const node = new SendRepute();
		const [[result]] = await node.execute.call(
			context({
				operation: 'classify',
				paidConsent: false,
				failurePolicy: 'closed',
				decisionMode: 'blocking',
				threshold: 0.8,
			}, 'offline-secret', {
				sourceId: 'one',
				sendrepute: {
					label: 'spam',
					spamProbability: 1,
					recommendation: 'block',
					billing: { chargedMillicents: 999 },
					requestId: 'stale-request',
				},
			}),
		);
		assert.equal(calls, 0);
		assert.equal(result.json.sendrepute.analysisStatus, 'not_run');
		assert.equal(result.json.sendrepute.decision, 'block');
		assert.equal(result.json.sendrepute.allowed, false);
		for (const stale of ['label', 'spamProbability', 'recommendation', 'billing', 'requestId']) {
			assert.equal(result.json.sendrepute[stale], undefined);
		}
		assert.ok(!JSON.stringify(result).includes('offline-secret'));
	} finally {
		global.fetch = originalFetch;
	}
});

test('invalid configuration is not spam and always fails closed', async () => {
	const node = new SendRepute();
	const [[result]] = await node.execute.call(
		context({
			operation: 'classify',
			paidConsent: 'false',
			failurePolicy: 'open',
			sender: '',
			subject: 'Subject',
			body: 'Body',
			threshold: 0.8,
			decisionMode: 'blocking',
		}),
	);
	assert.equal(result.json.sendrepute.analysisStatus, 'failed');
	assert.equal(result.json.sendrepute.failureCategory, 'malformed');
	assert.equal(result.json.sendrepute.errorCode, 'INVALID_CONFIG');
	assert.equal(result.json.sendrepute.decision, 'block');
	assert.equal(result.json.sendrepute.allowed, false);
	assert.equal(result.json.sendrepute.label, undefined);
});

test('namespaced result replaces stale decision data and blocking mode blocks', async () => {
	const originalFetch = global.fetch;
	let requestedUrl;
	global.fetch = async (url) => {
		requestedUrl = String(url);
		return new Response(
			JSON.stringify({
				requestId: 'fresh-request',
				model: 'thor',
				result: {
					label: 'spam',
					spamProbability: 0.9,
					confidence: 'high',
					reasons: [],
					flaggedTerms: [],
					analyzedFields: ['body'],
					modelVersion: 'test',
					analyzedAt: '2026-01-01T00:00:00Z',
				},
				billing: { chargedMillicents: 10, replayed: false },
			}),
			{ status: 200 },
		);
	};
	try {
		const node = new SendRepute();
		const [[result]] = await node.execute.call(
			context(
				{
					operation: 'classify',
					paidConsent: true,
					failurePolicy: 'closed',
					sender: 'Sender',
					subject: 'Subject',
					body: 'Body',
					threshold: 0.8,
					decisionMode: 'blocking',
				},
				'offline-secret',
				{
					sourceId: 'one',
					label: 'stale',
					spamProbability: 0,
					sendrepute: { allowed: true, requestId: 'stale-request' },
				},
			),
		);
		assert.equal(requestedUrl, 'https://www.sendrepute.com/api/v1/classify');
		assert.equal(result.json.sendrepute.allowed, false);
		assert.equal(result.json.sendrepute.decision, 'block');
		assert.equal(result.json.sendrepute.requestId, 'fresh-request');
		assert.equal(result.json.sendrepute.spamProbability, 0.9);
		assert.equal(result.json.label, 'stale');
	} finally {
		global.fetch = originalFetch;
	}
});

test('expression errors are sanitized into fail-closed decisions', async () => {
	const node = new SendRepute();
	const testContext = context({});
	testContext.getNodeParameter = () => {
		throw new Error('expression leaked a private value');
	};
	const [[result]] = await node.execute.call(testContext);
	assert.equal(result.json.sendrepute.errorCode, 'INVALID_CONFIG');
	assert.equal(result.json.sendrepute.allowed, false);
	assert.ok(!JSON.stringify(result).includes('private value'));
});