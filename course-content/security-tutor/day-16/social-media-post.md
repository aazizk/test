# Day 16 — SSRF: Tricking the Server Into Attacking Itself

## LinkedIn

I made a URL preview feature leak fake AWS credentials to myself today — without ever touching the system that held them.

Day 16 of my cybersecurity training (self-paced, CEH-track, hands-on labs only — no slides-only theory): Server-Side Request Forgery (SSRF).

The setup: two Docker containers on an isolated network. One simulates an internal-only service (no published port — genuinely unreachable from my machine, I confirmed it with a failed curl). The other is a simple Flask app with a "paste a URL, we'll preview it" feature.

I couldn't reach the internal service directly. But I could ask the *preview app* to fetch it for me — using Docker's internal DNS to resolve the internal container's name. The server happily fetched it and handed back a JSON blob of "IAM credentials." That's the entire exploit: I never had access, I just convinced something that already had access to act on my behalf.

This is precisely the mechanism behind the 2019 Capital One breach — an SSRF bug reaching AWS's real metadata endpoint (169.254.169.254) and pulling live credentials. I actually ran a real check against my own authorized AWS sandbox mid-session and got a 401 — confirmation that IMDSv2's token-handshake defense was active, the exact fix that closes off this classic attack path.

Fixed it by validating the *resolved IP address* (not just the hostname string) and blocking private/internal ranges. Also learned the harder way that partial code edits are a great way to accidentally delete a line you needed — full-file replacement from now on for short lab apps.

Biggest conceptual takeaway: default-deny (allowlist) beats default-allow (denylist) because you only have to enumerate the good cases, not predict every attacker trick.

Tomorrow: session hijacking.

#CyberSecurity #SSRF #CloudSecurity #AppSec #CEH #LearningInPublic

## Twitter/X

Built a "URL preview" feature today, then broke it with SSRF 🔓

Had zero access to an internal service → asked the vulnerable server to fetch it for me → got back fake AWS creds.

Same bug class as the Capital One breach. Fixed via IP-based allowlisting.

Day 16/CEH track

#SSRF #CyberSecurity
