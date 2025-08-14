# OpenPLC Security+

**OpenPLC Security+** is a hardened version of the traditional OpenPLC setup with added security layers to protect against common threats.

## Key Features
- **HTTPS Encryption**: All web traffic, including login, is secured using Nginx with self-signed SSL certificates.
- **Firewall Hardening**: Custom `iptables` rules configured to strictly control inbound/outbound traffic and block suspicious activity.
- **Brute-Force Protection**: Blocks repeated login attempts to reduce credential stuffing risks.
- **DDoS Mitigation**: Filters and drops ~99% of malicious packets within hardware capability limits.
- **Hardened Configuration**: Secure-by-default settings to minimize attack surface.

This Framework aims to provide a safer OpenPLC environment without sacrificing usability.

## Firewall Overview
The **OpenPLC Security+ firewall** is implemented with an advanced `iptables` configuration providing:

- **Strict Default-Deny Policy**: All inbound traffic blocked unless explicitly allowed.
- **Loopback & Established Connection Allowlist**: Ensures essential internal communications.
- **Service-Specific Protection**:
  - SSH (22) — limits to 3 concurrent connections per IP.
  - HTTPS (443) — brute-force & flood detection with temporary IP bans.
  - Modbus TCP (502) — 10-connection limit to prevent abuse.
  - VNC (5900) — 5-connection limit to mitigate brute-force attempts.
  - Unencrypted OpenPLC HTTP (8080) — fully blocked to enforce SSL.
- **DDoS Countermeasures**:
  - SYN flood rate limiting.
  - Dropping fragmented and invalid packets.
  - Filtering suspicious TCP flag combinations (e.g., NULL/XMAS scans).
- **Port Whitelisting**: New connections only allowed on required service ports.
- **Persistence**: Firewall rules saved across reboots for continuous protection.

This multi-layered firewall helps block over 99% of malicious packets in testing while ensuring legitimate control and management traffic remains unaffected.

---

## SSL & HTTPS Integration
To secure the OpenPLC web interface, **OpenPLC Security+** uses Nginx with a self-signed SSL certificate, ensuring all logins and data exchanges are encrypted.

### Steps Implemented

1. **Self-Signed Certificate Generation**
   - Created a private key and certificate in `/etc/ssl/private` and `/etc/ssl/certs`.
   - Configured for 365-day validity with RSA 2048-bit encryption.
   - Common Name (CN) set to the server’s IP `IP.XX.XX.XX`.

2. **Nginx Reverse Proxy Configuration**
   - All HTTP (port 80) requests are automatically redirected to HTTPS (port 443).
   - Nginx proxies HTTPS traffic to the local OpenPLC webserver on port 8080.
   - Preserves client IP information using proper `X-Forwarded-*` headers.

3. **Firewall Adjustment**
   - Allowed inbound traffic on ports **443** (HTTPS) and **80** (for redirection).
   - All other unencrypted OpenPLC HTTP traffic (8080) blocked.

4. **Service Auto-Start**
   - Enabled Nginx to start automatically at boot.
   - Created a `systemd` service for OpenPLC to ensure it starts with the system.
   - Both Nginx and OpenPLC services verified for persistent operation.

### Security Benefit
- Prevents credentials from being transmitted in plain text.
- Ensures all user sessions with the PLC web interface are encrypted.
- Blocks direct unencrypted access, enforcing secure-by-default connections.

---

**With the combined SSL setup and advanced firewall rules, OpenPLC Security+ provides end-to-end protection against common attacks — from encrypted access to packet-level filtering.**

## Firewall Script Usage
The firewall configuration is implemented in **`firewallfinal.sh`**.

- **Auto-Run on Boot**: Configured to execute automatically when the system starts.
- **Manual Execution**: If it doesn’t run automatically, you can start it manually with:

```bash
sudo ./firewallfinal.sh
