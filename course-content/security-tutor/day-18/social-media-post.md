# Day 18 — Session Hijacking via XSS: Stealing a Live Cookie Instead of a Password

## LinkedIn

`GET /steal?c=session_id=330c79bc050105142d6410058cd5f95b`

That's the log line from a tiny "attacker" server I stood up today, right after an `<img onerror=...>` payload fired `document.cookie` to it. One `curl` command later, from a terminal that had never opened a browser or touched a login form, I was in — "Welcome, alice!" No password. No brute force. Just a copied string.

Day 18 of my hands-on security course picked up where Day 14's XSS lab and Day 17's session hijacking left off, and tied them together: a stored cross-site scripting bug isn't just an "alert box" problem — it's a direct path to stealing a fully authenticated session. I reintroduced the old XSS hole on purpose, added a real login system issuing a session cookie, and proved the full chain: inject once, steal silently, reuse elsewhere.

The fix was `HttpOnly` on the cookie — one setting that stops JavaScript from reading the cookie's value, while the browser still sends it normally on real requests. I re-ran the exact same exploit afterward and the stolen value came back empty. But I made a point of not overselling that fix: the underlying XSS hole was still sitting there, fully exploitable for other kinds of damage. Fixing the symptom isn't fixing the cause.

I also tripped on a review question, mixing up `HttpOnly` and `SameSite` — two cookie attributes that sound related but do completely different jobs (one blocks JS reads, the other blocks cross-site request behavior). Caught it, corrected it, moving on with a sharper mental model than I had an hour ago.

Cookie security isn't one switch — it's several narrow controls that only work layered together.

#CyberSecurity #CEH #AppSec #XSS #SessionHijacking #LearningInPublic

## Twitter/X

Stole a live login session today with nothing but an `<img onerror=...>` tag and `document.cookie`. 🍪

One `curl --cookie` command later, from a terminal with zero prior access: "Welcome, alice!"

Fix was `HttpOnly` — but it didn't fix the XSS, just blocked this one payoff.

#AppSec #CEH
