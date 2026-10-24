# Day 15 — CSRF: when the victim's own browser signs the attacker's check

## LinkedIn

I visited a page today that said "Free Prizes! Click to claim!" I didn't click anything. By the time the page finished loading, my test bank account's email had already been changed to attacker@evil.com.

That's Day 15 of my hands-on CEH-track security series: Cross-Site Request Forgery (CSRF).

Unlike SQL injection (Day 13) or XSS (Day 14), CSRF doesn't need to trick anything into running attacker code. It just needs you to be logged in somewhere, and to visit a page the attacker controls. Your browser attaches cookies based on the destination of a request, not the page that triggered it — so a hidden auto-submitting form on a completely unrelated site gets your real session cookie for free.

I built two real Flask apps to prove it: a "bank" app with a cookie-only /change-email endpoint, and an "evil" app that auto-submitted a forged request the instant it loaded. No click needed. Email changed.

Then I tried the same trick against a JSON API using fetch() — and watched it get blocked in the DevTools Network tab by a CORS preflight check. Here's the part that actually tripped me up: the preflight request came back with a 200 status, and I assumed that meant permission was granted. It wasn't. The browser reads specific response headers, not the status code, to decide whether to actually send the real request. Our server never sent the right header, so the attack never reached it.

The fix was a per-session CSRF token embedded in the real form — something the attacker's page can trigger a request toward, but can't read back, thanks to the Same-Origin Policy. Re-verified: forged request now gets a 403, legitimate request still works.

Next up: SSRF, where instead of the browser forging a request, the server does it on the attacker's behalf.

#CyberSecurity #CSRF #WebSecurity #AppSec #CEH #LearningInPublic

## Twitter/X

Loaded a page that said "Free Prizes!" — no click, no password. By the time it finished loading, my test account's email was already attacker@evil.com. That's CSRF. Built it, broke it, fixed it with a real CSRF token. Day 15 of my security series. 🔓 #CSRF #AppSec #CEH
