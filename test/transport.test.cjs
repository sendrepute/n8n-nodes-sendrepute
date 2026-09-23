'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const { after, before, test } = require('node:test');

const {
	classify,
	SendReputeTransportError,
} = require('../dist/nodes/SendRepute/transport.js');

let origin;
let server;
let requests;

before(async () => {
	requests = [];
	server = http.createServer((request, response) => {
		const chunks = [];
		request.on('data', (chunk) => chunks.push(chunk));
		request.on('end', () => {
			requests.push({
				url: request.url,
				headers: request.headers,
				body: Buffer.concat(chunks).toString('utf8'),
			});
			if (request.url === '/redirect') {
				response.writeHead(302, { location: 'http://127.0.0.1:1/stolen' });
				response.end();
				return;
			}
			response.setHeader('content-type', 'application/json');
			response.end(
				JSON.stringify({
					requestId: 'offline-request',
					model: 'thor',
					result: {
						label: 'inbox',
						spamProbability: 0.12,
						confidence: 'high',
						reasons: [],
						flaggedTerms: [],
						analyzedFields: ['sender', 'subject', 'body'],
						modelVersion: 'offline-test',
						analyzedAt: '2026-01-01T00:00:00.000Z',
					},
					billing: { chargedMillicents: 0, replayed: true },
				}),
			);
		});
	});
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
	origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
	await new Promise((resolve, reject) =>
		server.close((error) => (error ? reject(error) : resolve())),
	);
});

test('sends only the API contract fields and validates a response', async () => {
	let requestedUrl;
	const localFetch = (url, init) => {
		requestedUrl = String(url);
		return fetch(`${origin}/classify`, init);
	};
	const result = await classify(
		'offline-secret',
		{ sender: 'Example', subject: 'Hello', body: 'Safe body' },
		{ fetch: localFetch },
	);
	assert.equal(result.result.spamProbability, 0.12);
	assert.equal(requestedUrl, 'https://www.sendrepute.com/api/v1/classify');
	assert.equal(requests.at(-1).url, '/classify');
	assert.deepEqual(JSON.parse(requests.at(-1).body), {
		sender: 'Example',
		subject: 'Hello',
		body: 'Safe body',
	});
	assert.equal(requests.at(-1).headers.authorization, 'Bearer offline-secret');
	assert.ok(!requests.at(-1).body.includes('offline-secret'));
});

test('refuses redirects without forwarding the credential', async () => {
	let calls = 0;
	const redirectingFetch = async (url, init) => {
		calls += 1;
		assert.equal(String(url), 'https://www.sendrepute.com/api/v1/classify');
		return fetch(`${origin}/redirect`, init);
	};
	await assert.rejects(
		classify(
			'redirect-secret',
			{ sender: 'Example', subject: 'Hello', body: 'Body' },
			{ fetch: redirectingFetch },
		),
		(error) =>
			error instanceof SendReputeTransportError &&
			error.code === 'REDIRECT_REFUSED' &&
			!error.message.includes('redirect-secret'),
	);
	assert.equal(calls, 1);
});

test('rejects invalid scores and malformed response arrays', async () => {
	const invalidFetch = async () =>
		new Response(
			JSON.stringify({
				requestId: 'x',
				model: 'thor',
				result: {
					label: 'spam',
					spamProbability: 1.1,
					confidence: 'high',
					reasons: [],
					flaggedTerms: [],
					analyzedFields: [],
					modelVersion: 'test',
					analyzedAt: 'now',
				},
				billing: { chargedMillicents: 1, replayed: false },
			}),
			{ status: 200 },
		);
	await assert.rejects(
		classify('secret', { sender: 'A', subject: 'B', body: 'C' }, {
			fetch: invalidFetch,
		}),
		(error) => error.code === 'INVALID_RESPONSE' && error.category === 'service',
	);

	const invalidArrayFetch = async () =>
		new Response(
			JSON.stringify({
				requestId: 'x',
				model: 'thor',
				result: {
					label: 'inbox',
					spamProbability: 0.1,
					confidence: 'high',
					reasons: [{ signal: 'x', detail: 'y', weight: 'not-a-number' }],
					flaggedTerms: [42],
					analyzedFields: ['body'],
					modelVersion: 'test',
					analyzedAt: 'now',
				},
				billing: { chargedMillicents: 1, replayed: false },
			}),
			{ status: 200 },
		);
	await assert.rejects(
		classify('secret', { sender: 'A', subject: 'B', body: 'C' }, {
			fetch: invalidArrayFetch,
		}),
		(error) => error.code === 'INVALID_RESPONSE',
	);
});

test('maps non-JSON authentication, balance, and rate limits separately from spam', async () => {
	for (const [status, category] of [
		[401, 'authentication'],
		[402, 'balance'],
		[429, 'rate_limit'],
	]) {
		const rejectingFetch = async () =>
			new Response('<html>not json</html>', {
				status,
			});
		await assert.rejects(
			classify('secret', { sender: 'A', subject: 'B', body: 'C' }, {
				fetch: rejectingFetch,
			}),
			(error) =>
				error.category === category &&
				error.code === `HTTP_${status}` &&
				!error.message.includes('not json'),
		);
	}
});