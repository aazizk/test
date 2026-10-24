# Day 19 — SameSite Cookies, CSRF Token Delivery, and Origin vs. Site

## LinkedIn

Day 19 of my cybersecurity training: I built a lab to prove `SameSite=Strict` blocks forged cross-site requests — and my first test result said it didn't. Every cookie arrived anyway, including the "unbreakable" Strict one.

Turns out the bug wasn't in the cookie policy. It was in my test setup.

I had the attacker page and the real app both running on `127.0.0.1`, just different ports (5000 vs 5001). But `SameSite`'s definition of "site" is scheme + registrable domain — port doesn't count at all. So two apps on the same IP with different ports are, to the browser's cookie policy, the exact same site. The attack was never actually cross-site, so there was nothing to block.

Once I swapped one app over to `localhost` (a genuinely different host), the real result showed up: a forged POST got blocked across the board — even for a plain, unattributed cookie, because modern browsers default to `Lax` behavior automatically. A forged link click, though, still got through for `Lax` and the default cookie, and only `Strict` blocked it. That's the real-world asymmetry: `Lax` protects against background forgery but deliberately allows a user clicking a normal link to work.

Closed the session by tampering with a real CSRF token with a raw curl request (no token field) against our own lab's protected endpoint — got a clean `403 Forbidden` back, confirming the server-side check is actually enforced, not just decorative code.

Biggest lesson of the day: "site" and "origin" are not the same boundary. Origin = scheme + host + port. Site = scheme + registrable domain, full stop — port is invisible to it. Local testing on the same host with different ports will silently lie to you.

Hands-on, real Flask lab the whole way through — no simulated output today.

#cybersecurity #appsec #csrf #websecurity #learninginpublic #CEH

## Twitter/X

Built a lab to prove SameSite=Strict blocks CSRF. First run: it didn't block anything. 😳

Turns out "site" ≠ "origin" — SameSite ignores port entirely. Two apps on 127.0.0.1 with different ports = same site to the browser, zero protection to test.

Swapped to localhost, got the real result. Day 19/CEH journey.

#appsec #CSRF
