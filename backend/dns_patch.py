import socket
import urllib.request
import json
import logging

logger = logging.getLogger("dns_patch")

# Cache resolved IPs to avoid spamming the DNS server
_dns_cache = {}

# Keep reference to the original getaddrinfo
_original_getaddrinfo = socket.getaddrinfo

def is_ip_address(host: str) -> bool:
    """Check if host is an IPv4 or IPv6 address to avoid DNS recursion."""
    if not host:
        return False
    # IPv4 check
    parts = host.split('.')
    if len(parts) == 4:
        try:
            return all(0 <= int(p) <= 255 for p in parts if p.isdigit())
        except ValueError:
            return False
    # IPv6 check
    if ':' in host:
        return True
    return False

def resolve_doh(hostname: str):
    """Resolve hostname using DNS-over-HTTPS (DoH) via 8.8.8.8 or 1.1.1.1."""
    if is_ip_address(hostname):
        return [hostname]
        
    # Check cache first
    if hostname in _dns_cache:
        return _dns_cache[hostname]

    # Google DoH
    try:
        url = f"https://8.8.8.8/resolve?name={hostname}&type=A"
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=3.0, context=urllib.request.ssl._create_unverified_context()) as response:
            data = json.loads(response.read().decode())
            ips = [ans["data"] for ans in data.get("Answer", []) if ans.get("type") == 1]
            if ips:
                _dns_cache[hostname] = ips
                logger.info(f"Resolved {hostname} to {ips} via Google DoH")
                return ips
    except Exception as e:
        logger.warning(f"Google DoH failed for {hostname}: {e}")

    # Cloudflare DoH
    try:
        url = f"https://1.1.1.1/dns-query?name={hostname}&type=A"
        req = urllib.request.Request(url, headers={"Accept": "application/dns-json"})
        with urllib.request.urlopen(req, timeout=3.0, context=urllib.request.ssl._create_unverified_context()) as response:
            data = json.loads(response.read().decode())
            ips = [ans["data"] for ans in data.get("Answer", []) if ans.get("type") == 1]
            if ips:
                _dns_cache[hostname] = ips
                logger.info(f"Resolved {hostname} to {ips} via Cloudflare DoH")
                return ips
    except Exception as e:
        logger.warning(f"Cloudflare DoH failed for {hostname}: {e}")

    return []

def patched_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    # Ensure host is decoded to string for matching and resolution
    host_str = host.decode('utf-8', errors='ignore') if isinstance(host, bytes) else host

    # Only intercept external domains that are not IP addresses and not localhost
    if host_str and host_str not in ("localhost", "127.0.0.1", "::1", "0.0.0.0") and not is_ip_address(host_str):
        # Attempt to resolve via DoH
        ips = resolve_doh(host_str)
        if ips:
            # Reconstruct address info records
            res = []
            socktype = type or socket.SOCK_STREAM
            protocol = proto or socket.IPPROTO_TCP
            for ip in ips:
                res.append((socket.AF_INET, socktype, protocol, "", (ip, port)))
            return res

    # Fallback to standard OS DNS lookup
    return _original_getaddrinfo(host, port, family, type, proto, flags)

def apply_dns_patch():
    """Apply monkeypatch to socket.getaddrinfo."""
    socket.getaddrinfo = patched_getaddrinfo
    logger.info("Applied DNS-over-HTTPS monkeypatch to socket.getaddrinfo")
    
    # Pre-resolve and cache common external hostnames to prevent concurrent bottlenecks
    try:
        resolve_doh("api.fireworks.ai")
    except Exception as e:
        logger.warning(f"Failed to pre-resolve api.fireworks.ai: {e}")
