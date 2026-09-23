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