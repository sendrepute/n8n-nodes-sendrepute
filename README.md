# n8n-nodes-sendrepute

An n8n community node for the paid SendRepute customer classification API. It
accepts only `sender`, `subject`, and `body`; it has no recipient or attachment
input.

> **Publication status:** this package is not published to npm or the n8n
> community registry. The instructions below install a locally built tarball in
> a self-hosted n8n instance. They do not make it available to n8n Cloud.

## Security and decision model

- Paid-analysis consent is explicit and defaults to **off**. With consent off,
  no request is made.
- The credential uses n8n's password-field credential schema and is sent only
  as a bearer header. The node never includes it in output or errors.
- Requests go only to the fixed `https://www.sendrepute.com/api/v1/classify`
  endpoint, use verified platform TLS, have a 20-second timeout, reject
  redirects, and cap response bodies at 1 MiB.
- The node performs exactly one request per consenting input item. It does not
  retry paid analysis. The service may return a cached receipt for an exact
  repeat, but callers must not assume a request is free.
- A score must be a finite number from 0 through 1. Invalid JSON, malformed
  results, network failures, authentication/authorization failures, insufficient
  balance, and rate limiting are failures—not spam classifications.
- **Advisory** mode always allows a successfully analyzed item and emits a
  separate `recommendation`. **Blocking** mode blocks when the probability is
  at or above the threshold.
- **Fail closed** returns `decision: "block"` when analysis cannot run. **Fail
  open** returns `decision: "allow"` plus `analysisStatus: "failed"` and a
  failure category. Consumers must check `allowed`; merely receiving output is
  not an allow decision.

Classification is a pre-send content safety signal. It does **not** guarantee
inbox placement, email delivery, or compliance.

## Build and test reproducibly

Requirements: Node.js 20.19 or newer and npm. From this directory:

```sh
git clone https://github.com/sendrepute/n8n-nodes-sendrepute.git
cd n8n-nodes-sendrepute
npm ci
npm run pack:check
npm pack --ignore-scripts
```

`npm ci` uses this package's committed `package-lock.json`; it does not modify
the repository root lockfile. `pack:check` compiles against the real published
`n8n-workflow` 2.16.0 types, runs offline HTTP transport and node tests, checks
tarball contents, and installs that tarball into an isolated temporary npm
project. TypeScript's `skipLibCheck` is enabled because the
published n8n type bundle references optional packages that are not required by
this node; this package's own source remains strict-checked.

Tests make no paid API calls and send no email. Their HTTP server is bound to
loopback only.

## Install on self-hosted n8n

1. Build the tarball using the commands above.
2. On the n8n host, create the custom-node directory if necessary:
   `mkdir -p ~/.n8n/nodes`.
3. In that directory, run
   `npm install /absolute/path/to/n8n-nodes-sendrepute-0.1.0.tgz`.
4. Restart the self-hosted n8n process and confirm **SendRepute** appears in the
   node picker.
5. Create a **SendRepute API** credential containing a server-side customer API
   key with the `classify` scope. Do not put the key in workflow JSON,
   expressions, environment output, or logs.

Because the package is unpublished, n8n's **Settings → Community nodes** npm
name installation and n8n Cloud community-node installation are not supported.

## Workflow use

Import `examples/classify-email.workflow.json`. It intentionally contains no
credential reference or secret and keeps paid consent disabled. Attach a
credential, review the inputs, threshold, decision mode, and failure policy,
then deliberately enable paid consent.

On completion the node preserves the input JSON and replaces the complete
`sendrepute` namespace with an explicit `analysisStatus`, `decision`, `allowed`,
`recommendation`, validated result fields, a billing receipt, and the advisory
disclaimer. On failure it replaces that namespace with a result that omits
classification labels/scores and contains only a sanitized `failureCategory`
and `errorCode`. This prevents stale decision fields from a previous run from
being mistaken for the current result. The example routes the result through an
IF node and leaves the false output unconnected, so only
`sendrepute.allowed === true` continues.

Supported hosted route: `POST /api/v1/classify` (the customer contract's
`/v1/classify` behind the hosted `/api` prefix), with sender (1–320
characters), subject (1–998), and body (1–524,288). Model selection is
intentionally left to the account preference. Recipients, attachments,
rewrites, sending, arbitrary origins, custom headers, and automatic retries are
not supported.

## Support and security

Use GitHub issues for reproducible, non-sensitive bugs. Account support and
private vulnerability reports: support@sendrepute.com. Never include API keys,
customer messages or unredacted workflow data. See [SECURITY.md](SECURITY.md).
MIT licensed; see LICENSE.