# Day 07 — HTTP Fundamentals: proving with a packet capture that "private" doesn't mean "protected"

## LinkedIn

I ran the same login request twice today — once over plain HTTP, once over TLS — and captured both with tcpdump.

On the plaintext capture, `cat`-ing the packet dump showed this in clear text:
`username=alice&password=SuperSecret123`

On the TLS capture (self-signed cert via `openssl s_server`), grepping for that same password returned nothing. Not obfuscated — completely absent.

That's Day 7 of my cybersecurity training, closing out the networking/foundations phase with HTTP. Real hands-on lab, not slides:

→ Built a real HTTP request/response from scratch against nginx with `curl -v` — method, path, headers, the blank line separating headers from body, all of it.
→ Watched `Content-Length` and `Content-Type` actually do their job, live.
→ Built a tiny Python server to prove exactly how cookies/sessions work: server sends `Set-Cookie`, browser stores it, browser sends it back on the next request. Then saw why `HttpOnly` matters (JavaScript literally cannot read that cookie).

I also made a mistake worth sharing: I conflated a `403 Forbidden` with "wrong password." It's not. `403` means the resource exists but you're blocked. `404` means it's not there at all. That distinction is exactly how attackers map out hidden endpoints — which is where I'm headed next in recon.

The TLS vs. plaintext capture was the moment this stopped being theoretical for me.

#CyberSecurity #LearningInPublic #Networking #InfoSec #TLS #HTTP

## Twitter/X

Ran the exact same login over HTTP vs TLS and captured both with tcpdump.

Plaintext: `cat` shows `password=SuperSecret123` in clear.
TLS: grep for that password → nothing.

That's the whole argument for HTTPS, empirically proven. Day 7 of #CyberSecurity training. 🔒
