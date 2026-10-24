# Day 17 — Session Hijacking via Session Fixation

## LinkedIn

Today I hijacked a login without ever seeing a password or stealing a cookie.

Day 17 of my cybersecurity training (CEH-track, built day by day) covered session hijacking — specifically a variant called session fixation. The core idea: when you log into a site, the server hands your browser a session ID in a cookie. From that point on, whoever holds that ID is treated as you. No further password check.

Classic hijacking steals that ID after the fact (sniffing traffic, or reading it via an XSS bug, which I exploited back on Day 14). Fixation is sneakier: the attacker plants a session ID of their choosing on the victim *before* login, then just waits. If the app doesn't issue a fresh ID the moment someone authenticates, the attacker's pre-planted ID becomes a live, logged-in session.

I built this for real — a small Flask app with two stacked bugs: it trusted a session ID passed in via a URL parameter, and it never rotated the session ID at login. I planted a known ID, logged in as "alice" in that same browser, then opened a completely separate, cookie-less browser and used that same ID to log straight in as her. Zero credential theft, zero interception.

Fixed it two ways: only ever read the session ID from the server-issued cookie, and mint a brand-new ID the moment login happens. Reran the whole attack — blocked, legitimate login still worked.

The lesson that generalizes well beyond this one bug: never trust an identifier the client could have chosen before you knew who they were.

#CyberSecurity #CEH #AppSec #SessionHijacking #LearningInPublic #Flask

## Twitter/X

Hijacked a login today with zero stolen passwords, zero stolen cookies.

Just planted a known session ID *before* the victim logged in, then waited. App never rotated the ID at login → instant access as "alice" from a totally separate browser.

Fixed it. Day 17 of my CEH track. 🔐

#AppSec #CEH #InfoSec
