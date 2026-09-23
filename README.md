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
`n8n-workflow` 2.39.3 types and runtime, runs offline HTTP transport and node tests, checks
tarball contents, and installs that tarball into an isolated temporary npm
project. TypeScript's `skipLibCheck` is enabled because the
published n8n type bundle references optional packages that are not required by
this node; this package's own source remains strict-checked.

Tests make no paid API calls and send no email. Their HTTP server is bound to
loopback only.

The tested dependency is pinned to the registry's `stable` release, 2.39.3,
rather than its older `latest` alias (2.16.0) or beta (2.41.0). The peer range
is `>=2.39.3 <3`; use a patched self-hosted n8n release that supplies a compatible
workflow runtime. Do not force-install into an older incompatible host.
Run `npm audit` after `npm ci` to check current advisory data. The upgraded
lockfile passed a full audit with zero reported vulnerabilities when tested;
this is a point-in-time result, not a guarantee against future advisories.

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

## Complete node parameter reference

The node type is `n8n-nodes-sendrepute.sendRepute`, version 1. It has one main
input and one main output. It processes input items sequentially, preserving
item pairing. Configure these properties in the node editor:

| Property | Values / default | Behavior |
| --- | --- | --- |
| `operation` | `classify` only | Classify Email; no other API operations are implemented. |
| `paidConsent` | Boolean, `false` | Explicit permission for a potentially paid request for each valid input item. |
| `sender` | Required string, 1–320 JavaScript string units | Sender display name, not an address or recipient list. |
| `subject` | Required string, 1–998 JavaScript string units | Rendered message subject. |
| `body` | Required string, 1–524,288 JavaScript string units | Plain text or HTML; render templates before this node. |
| `decisionMode` | `advisory` (default), `blocking` | Advisory allows successful analysis; blocking follows the recommendation. |
| `threshold` | Finite number 0–1, default `0.8` | Recommend block when `spamProbability >= threshold`. |
| `failurePolicy` | `closed` (default), `open` | Block or allow when a known analysis/input failure occurs. Invalid configuration and unexpected internal errors always fail closed. |

Credential type `sendReputeApi` has one required password field: `apiKey`.
Credential lookup failure or a non-string key stops node execution before the
item loop. Empty, oversized or newline-containing string credentials are
reported as per-item authentication failures when paid analysis is attempted.

For an upstream item containing `sender`, `subject` and `body`, use expressions
`={{ $json.sender }}`, `={{ $json.subject }}`, and `={{ $json.body }}`. The included
manual-trigger workflow does not generate message fields: add an Edit Fields
node or your actual source before classification. Keep consent off until the
input and billing policy have been reviewed.

## Output and failure reference

The node copies input JSON, **replacing** any existing `sendrepute` object:

- Successful analysis: `analysisStatus: "completed"`, `decision` (`allow` or
  `block`), Boolean `allowed`, `recommendation`, `decisionMode`, `threshold`,
  `label` (`inbox` or `spam`), `spamProbability`, `confidence` (`low`, `medium`,
  `high`), `reasons` (objects with `signal`, `detail`, finite `weight`),
  `flaggedTerms`, `analyzedFields`, `model`, `modelVersion`, `analyzedAt`,
  `requestId`, and `billing` (`chargedMillicents`, `replayed`).
- Known failure: `analysisStatus: "failed"`, `decision`, `allowed`,
  `failurePolicy`, `failureCategory`, and sanitized `errorCode`. No stale
  classification score or label is retained.
- Disabled consent: `analysisStatus: "not_run"`, `decision`, `allowed`,
  `failurePolicy`, `failureCategory: "consent_required"`. There is no
  `errorCode`, classification or billing result. The selected failure policy
  determines `allowed`; no request is made.
- Every outcome includes an `advisory` string and
  `deliverabilityGuarantee: false`.

HTTP 400/413/422 map to `malformed`, 401/403 to `authentication`, 402 to
`balance`, 429 to `rate_limit`, and other unsuccessful responses to `service`,
with `HTTP_<status>` codes. Redirects and network/timeouts map to `transport`.
Examples of transport codes are `REDIRECT_REFUSED`, `NETWORK_ERROR`, `TIMEOUT`,
`FETCH_UNAVAILABLE`, and `RESPONSE_READ_ERROR`. Oversized, non-JSON or invalid
successful responses use `RESPONSE_TOO_LARGE`, `INVALID_JSON`, or
`INVALID_RESPONSE`. Invalid credential strings use `INVALID_CREDENTIAL`.
Node-side validation uses `INVALID_CONFIG`, `INVALID_INPUT`, or
`UNKNOWN_FAILURE`; these are not spam determinations.

Downstream send nodes must be behind an IF check of
`{{ $json.sendrepute.allowed }}` equal to Boolean `true`. Connect the false
branch to explicit review/defer handling. This node does not send or queue mail.
Input JSON remains available downstream and may contain sensitive data; configure
n8n execution-data retention and access controls accordingly.

For contributors, `SendRepute.execute` is the n8n execution entry point and
`SendReputeApi` describes credentials. The internal transport helper
`classify(apiKey, { sender, subject, body }, { fetch? })` returns a validated
`ClassificationResponse` or throws `SendReputeTransportError` with `category`,
`code`, and optional HTTP `status`. Its optional fetch injection exists for
offline testing, not for a workflow-configurable URL or authentication bypass.
Consent and policy enforcement belong to the node; the helper alone does not
enforce them and is not a standalone public SDK API.

## Support and security

Use GitHub issues for reproducible, non-sensitive bugs. Account support and
private vulnerability reports: support@sendrepute.com. Never include API keys,
customer messages or unredacted workflow data. See [SECURITY.md](SECURITY.md).
MIT licensed; see LICENSE.