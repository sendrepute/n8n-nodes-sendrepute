# Security

Report vulnerabilities privately to support@sendrepute.com with the affected
version, impact and a minimal redacted reproduction. Do not publish exploit
details before coordinated disclosure or attach credentials, workflow secrets
or customer messages. No response-time SLA is promised. Version 0.1.x is the
supported source line.

Use n8n credential storage, protect its encryption key, and never put bearer
keys in workflow JSON. Paid consent defaults off. Check the explicit `allowed`
output rather than treating any output as permission to send. Do not retry
paid operations automatically.

## Known development dependency advisories

The pinned development test dependency `n8n-workflow@2.16.0` currently reports
five npm audit findings (four high, one moderate) through its expression runtime,
lodash, form-data and uuid dependencies. It is not bundled into this node's
tarball; the real n8n host supplies its workflow runtime. Use an actively
supported, patched n8n host. Do not run untrusted workflows in the development
fixture environment. Updating the compatibility test baseline requires a
separate dependency upgrade and regression test; no clean-audit claim is made.