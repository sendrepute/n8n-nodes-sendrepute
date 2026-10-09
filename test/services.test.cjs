const { test } = require('node:test');
const assert = require('node:assert/strict');
const { SendReputeServices } = require('../dist/nodes/SendRepute/SendReputeServices.node.js');
const { services } = require('../dist/nodes/SendRepute/services.generated.js');
const { operationMetadata: OPERATIONS } = require('@sendrepute/node');

test('every current customer service has an operation and matching SDK route', () => {
  const node = new SendReputeServices();
  const options = node.description.properties.find(p => p.name === 'operation').options;
  assert.equal(options.length, services.length);
  for (const service of services) {
    assert.ok(OPERATIONS[service.id], service.id);
    assert.equal(OPERATIONS[service.id].path, service.path);
    assert.ok(!service.path.includes('/admin/'));
    for (const field of service.fields) {
      assert.ok(node.description.properties.some(p => p.name === `${service.id}__${field.location}__${field.name}`));
    }
  }
});

test('mutations require explicit approval before any network call', async () => {
  let calls = 0;
  const original = global.fetch;
  global.fetch = async () => { calls++; throw new Error('Unexpected network'); };
  try {
    const service = services.find(s => s.method === 'POST');
    await assert.rejects(() => SendReputeServices.prototype.execute.call({
      getCredentials: async () => ({ apiKey: 'fixture-only' }),
      getInputData: () => [{ json: {} }],
      getNode: () => ({ name: 'test', type: 'test', typeVersion: 1, position: [0,0], parameters: {} }),
      getNodeParameter: name => name === 'operation' ? service.id : false,
    }), /authorization is required/);
    assert.equal(calls, 0);
  } finally { global.fetch = original; }
});

test('bodyless quote operations send a JSON object', async () => {
  const service = services.find(s => s.id === 'customerQuoteCampaignInsights');
  assert.ok(service);
  assert.equal(service.fields.length, 0);
  const original = global.fetch;
  let calls = 0;
  global.fetch = async (url, options) => {
    calls++;
    assert.equal(options.body, '{}');
    assert.equal(options.headers['content-type'], 'application/json');
    return new Response('{"price":0}', { status: 200, headers: { 'content-type': 'application/json' } });
  };
  try {
    const result = await SendReputeServices.prototype.execute.call({
      getCredentials: async () => ({ apiKey: 'fixture-only' }),
      getInputData: () => [{ json: {} }],
      getNode: () => ({ name: 'test', type: 'test', typeVersion: 1, position: [0,0], parameters: {} }),
      getNodeParameter: name => name === 'operation' ? service.id : true,
    });
    assert.equal(calls, 1);
    assert.equal(result[0][0].json.result.price, 0);
  } finally { global.fetch = original; }
});
