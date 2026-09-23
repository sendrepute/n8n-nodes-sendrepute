import { copyFile, mkdir } from 'node:fs/promises';

const target = new URL('../dist/nodes/SendRepute/', import.meta.url);
await mkdir(target, { recursive: true });
await copyFile(
	new URL('../nodes/SendRepute/sendrepute.svg', import.meta.url),
	new URL('sendrepute.svg', target),
);