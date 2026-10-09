import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const spec = JSON.parse(readFileSync(new URL('../../../artifacts/api-server/src/customer-api-openapi.json', import.meta.url), 'utf8'));
const resolve = value => value?.$ref ? resolve(value.$ref.slice(2).split('/').reduce((v, k) => v[k], spec)) : value;
const services = [];
for (const [path, item] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(item)) {
    if (!operation.operationId || operation.deprecated) continue;
    const fields = (operation.parameters ?? []).map(resolve).map(p => ({
      name: p.name, location: p.in, required: !!p.required, schema: resolve(p.schema),
    }));
    const body = resolve(operation.requestBody?.content?.['application/json']?.schema);
    if (body) for (const [name, schema] of Object.entries(body.properties ?? {})) {
      const resolved = resolve(schema);
      fields.push({ name, location: 'body', required: (body.required ?? []).includes(name), schema: resolved?.oneOf || resolved?.anyOf || resolved?.allOf ? { ...resolved, type: 'object' } : resolved });
    }
    services.push({ id: operation.operationId, title: operation.summary || operation.operationId, method: method.toUpperCase(), path, fields });
  }
}
services.sort((a,b) => a.title.localeCompare(b.title));
const content = `// Generated from the customer-only OpenAPI contract. Never edit manually.\nexport const services = ${JSON.stringify(services, null, 2)} as const;\n`;
const output = fileURLToPath(new URL('../nodes/SendRepute/services.generated.ts', import.meta.url));
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== content) throw new Error('Customer service catalog is stale');
} else writeFileSync(output, content);
