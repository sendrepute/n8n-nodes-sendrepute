import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const directory = await mkdtemp(join(tmpdir(), 'sendrepute-n8n-pack-'));
try {
	const output = execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', directory], {
		cwd: new URL('..', import.meta.url),
		encoding: 'utf8',
	});
	const [{ filename, files }] = JSON.parse(output);
	const names = files.map((file) => file.path);
	for (const required of [
		'dist/credentials/SendReputeApi.credentials.js',
		'dist/nodes/SendRepute/SendRepute.node.js',
		'dist/nodes/SendRepute/sendrepute.svg',
		'examples/classify-email.workflow.json',
		'README.md',
	]) {
		assert.ok(names.includes(required), `package is missing ${required}`);
	}
	assert.ok(filename.endsWith('.tgz'));
	const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
	assert.equal(packageJson.name, 'n8n-nodes-sendrepute');
	const installDirectory = join(directory, 'install');
	await mkdir(installDirectory);
	execFileSync(
		'npm',
		[
			'install',
			'--ignore-scripts',
			'--omit=peer',
			'--no-audit',
			'--no-fund',
			join(directory, filename),
		],
		{ cwd: installDirectory, stdio: 'pipe' },
	);
	await access(
		join(
			installDirectory,
			'node_modules',
			'n8n-nodes-sendrepute',
			'dist',
			'nodes',
			'SendRepute',
			'SendRepute.node.js',
		),
	);
} finally {
	await rm(directory, { recursive: true, force: true });
}