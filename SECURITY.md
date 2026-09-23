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

## Dependency advisory remediation

The original `n8n-workflow@2.16.0` development baseline reported five npm audit
findings (four high, one moderate): lodash code injection/prototype pollution,
form-data CRLF injection, uuid buffer bounds handling, and the affected parent
packages. The parent dependency was upgraded to the registry's stable release,
`n8n-workflow@2.39.3`, rather than overriding individual transitive packages.
It resolves lodash 4.18.1, form-data 4.0.6 and uuid 11.1.1.

The regenerated lockfile passed `npm audit` with zero findings, the TypeScript
build, all offline tests and the tarball install check. Run `npm ci` followed by
`npm audit` to check current advisories; a clean audit is only a point-in-time
result. No firewall, registry, TLS or integrity checks were disabled to install
the update.

The workflow runtime is not bundled into this node's tarball: the real n8n host
supplies it. The supported peer range is now `>=2.39.3 <3`; update your host
instead of forcing an incompatible installation. Keep the host and its runtime
dependencies patched. Do not run untrusted workflows in development fixtures.