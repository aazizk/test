# Day 09 — Enumeration: why a 403 and a 404 looking identical almost fooled my own scanner

## LinkedIn

Today's cybersecurity lesson gave me a result I had to stare at twice: two completely different HTTP responses, byte-for-byte the same size.

I built a real nginx server in Docker with three paths — one public, one blocked (403), one that doesn't exist (404) — specifically to settle a mistake from a few sessions back where I'd mixed up what those two status codes actually mean.

Then I checked the raw responses with curl. The 403 and the 404 had the *exact same Content-Length*. Same page size, same generic error template, completely different meaning. If you were judging "does this exist" by response size alone, you'd get it wrong every time. The status code line is the only thing you can trust.

Next I ran gobuster — a real directory brute-forcing tool — against the same server with a small wordlist. Out of five paths I fed it, only one showed up in the results: the 403. The other four, all 404s, were silently dropped by gobuster's default filtering. That's the moment the lesson clicked for real: a brute-forcer isn't hunting for "things that exist," it's hunting for "anything that isn't the default negative response." A 403 is actually a *more* interesting signal than a plain 200, because it means something exists and someone cared enough to protect it.

Closed the day with nmap's script engine, which flagged a false positive on my own container (an "open proxy" that very much wasn't one) — a perfect, concrete bridge into next session's topic: vulnerability assessment, and why every automated finding needs manual verification before it's worth anything.

Scanners report candidates, not verdicts.

#CyberSecurity #CEH #Enumeration #InfoSec #LearningInPublic #Docker

## Twitter/X

Spent today's security lesson proving something counterintuitive: a 403 and a 404 response from the same nginx server had IDENTICAL Content-Length. Status code is the only thing you can trust — body size lies. 🔍

Then ran gobuster — it silently dropped every 404 and only surfaced the 403. Scanners hunt for "not the default," not "exists."

#CEH #InfoSec
