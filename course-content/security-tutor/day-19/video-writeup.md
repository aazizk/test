# Day 19 — SameSite Cookies, CSRF Token Delivery, and Origin vs. Site — Video Script

**Estimated length:** ~12 minutes (~1650 words)

## Hook

Here's a weird one: I built a lab specifically to prove that a cookie marked `SameSite=Strict` — the strictest possible cookie protection a browser offers — gets sent on a forged cross-site attack anyway. Not a bug in the browser. Not a bug in my code. The site definition itself has a blind spot, and once you see it, you'll never trust a quick localhost test the same way again.

## Intro

This is Day 19 of my cybersecurity training log, working toward CEH-level knowledge from scratch. Today picked up right where Day 18 left off — I'd just fixed a cookie-theft attack with `HttpOnly`, but mixed up `HttpOnly` with a completely different cookie attribute, `SameSite`, during the review questions. Today we built a real lab specifically to pull those two apart for good, and along the way uncovered a genuinely sneaky local-testing gotcha that fooled me for a solid five minutes.

## Teaching segment: what SameSite actually governs

Quick recap of cookies: a cookie is just a name/value pair the server tells your browser to store, and the browser automatically re-attaches it on future requests to that server — no user action needed. That auto-attach behavior is exactly what makes CSRF (cross-site request forgery) possible: an attacker's page can trigger a request to the real site, and your browser helpfully tapes your session cookie onto it.

`SameSite` is the attribute designed to stop that. It has three values. `None` always attaches the cookie, even cross-site — the old, risky default. `Lax` attaches it on top-level navigation, like clicking a link, but blocks it on cross-site POSTs, background fetches, and image loads. `Strict` is zero tolerance — it won't attach the cookie to any cross-site-triggered request, period, not even a plain link click.

[SCREEN: table showing None / Lax / Strict and what each allows]

Here's the distinction that tripped me up last session: `SameSite` controls whether the cookie gets *sent* on a request. It has nothing to do with whether JavaScript can *read* the cookie value — that's `HttpOnly`'s job entirely, a completely separate attribute solving a completely separate problem.

## Teaching segment: building the test lab [REAL LAB]

To actually see this in action, I extended an existing CSRF lab from a few weeks back — a Flask "bank" app (`bank.py`) and an "evil" attacker page (`evil.py`), both local processes. I added three parallel cookies on login: `session` (no explicit SameSite, relying on browser default), `session_lax`, and `session_strict`. Then a new endpoint, `/csrf-test`, that does zero CSRF-token checking — pure cookie auth — specifically so SameSite was the only variable in play.

[SCREEN: bank.py login route setting three cookies with different samesite values]

On the attacker side, I built two attack vectors: an auto-submitting form that fires a cross-site POST the instant the page loads, and a plain clickable link that triggers a cross-site GET — simulating "victim clicks a malicious link in a phishing email."

Before running anything, I predicted the outcome: both POST and GET should fail against `Strict`. Against `Lax`, the POST should fail but the GET link click should succeed, because Lax specifically carves out top-level navigation for safe methods like GET.

## Teaching segment: the confusing first result

Here's where it got interesting. I ran the attack — both apps on `127.0.0.1`, just different ports, `5000` for the bank and `5001` for evil. The result: *all three cookies arrived*, including `session_strict`. That should be impossible. Strict is supposed to block everything, no exceptions.

[SCREEN: JSON response showing all three cookies with values]

Turns out the bug wasn't in the code — it was in my test setup. `SameSite`'s definition of "site" is scheme plus *registrable domain*. Notice what's missing: port. Same-origin policy — the rule governing what JavaScript can read across pages — cares about scheme, host, *and* port. But SameSite's "site" concept deliberately ignores port. So `127.0.0.1:5000` and `127.0.0.1:5001`, despite being different origins, are the exact same site to the browser's cookie policy. The attack wasn't cross-site at all — it never had a chance to be blocked, because there was nothing for the policy to block.

That's a real, practical trap: testing CSRF or cookie-attribute behavior locally with two different ports on the same host will silently give you false results. You need genuinely different hostnames — I swapped the evil app over to `localhost` while keeping the bank app on `127.0.0.1`, and reran the exact same test.

## Teaching segment: the real result

This time, the POST attack came back with all three cookies as `null` — blocked, across the board, including the plain default cookie. That's actually expected too: modern browsers silently default unattributed cookies to `Lax` behavior, and Lax blocks cross-site POSTs regardless.

[SCREEN: JSON showing all null for POST]

Then the GET link-click test: `session` and `session_lax` came through with their real value, `session_strict` came back `null`.

[SCREEN: JSON showing session and session_lax populated, session_strict null]

That's the textbook asymmetry, finally proven for real: `Strict` blocks everything, no exceptions, even a plain link click. `Lax` — and the browser's own unattributed default — specifically allows a top-level GET navigation through, because blocking that would break normal things like following a link from your email into a site you're already logged into.

## Teaching segment: CSRF token delivery, revisited

With SameSite nailed down, I asked for a refresher on how a CSRF token actually reaches the browser in the first place — the defense this exact lab was originally built around. The answer: the server generates a random, unguessable token and embeds it directly in the HTML of a page the legitimate user requests — a hidden form field, nothing fancier. The attacker's page can *trigger* a request to the real site (that's the whole CSRF problem), but it can't *read the response* of a cross-origin request — same-origin policy blocks that outright. So the attacker has no way to ever get a valid token into their forged request.

To prove the check was real and not just decorative code sitting there unused, I stripped the token out of a request entirely with a raw curl command — cookie included, token field omitted — and sent it straight to the real `/change-email` endpoint.

[SCREEN: curl command and the 403 response]

Got back `403 Forbidden: invalid or missing CSRF token`, immediately. Confirmed: the server genuinely checks this on every request, it's not just there for show.

## Mistake/correction moment

My review-question answers needed two real corrections today. First, I described `HttpOnly` as stopping JavaScript from running or reading the page — way too broad. It actually does one narrow thing: it hides that *specific* cookie's value from `document.cookie`. JavaScript keeps running completely normally otherwise; if a page has three cookies and only one is `HttpOnly`, the other two are still fully readable by any script on the page.

Second, when asked whether a `Lax` cookie survives a forged auto-POST versus a clicked link, my first answer talked about old browsers not enforcing SameSite at all — true, but not what was actually asked. Once redirected back to our own test data, I got it right immediately: POST blocked, link click allowed.

## Recap + quiz

Three things to hold onto: `SameSite` controls whether a cookie is *sent*, `HttpOnly` controls whether a cookie is *readable* by JavaScript — two different jobs, don't conflate them. "Site" (scheme + registrable domain) is a broader category than "origin" (scheme + host + port) — every origin belongs to exactly one site, but a site can contain many origins, which is exactly why two different ports on `127.0.0.1` fooled the test. And a CSRF token works because the attacker can trigger a request but can never read the response that would give them a valid token.

Pause here and answer this one yourself: if a cookie had `SameSite=Strict` set, would you still need a CSRF token on that endpoint? Why or why not? Think about browser compliance, and about what counts as "the same site."

## Outro / CTA

Operational takeaway for today: never trust a `SameSite`/CSRF test run locally on the same host with just different ports — use genuinely different hostnames, because port is invisible to the site boundary that governs cookie attachment. If you're working through your own security fundamentals, follow along for Day 20 — drop your answer to today's quiz question in the comments first.

## On-screen text / b-roll suggestions

- Lower-third: "SameSite ≠ HttpOnly — different jobs"
- On-screen table: Origin (scheme+host+port) vs. Site (scheme+registrable domain)
- Captured terminal/browser output: the three cookie JSON responses (false-negative test, correct POST test, correct GET test)
- Captured curl command + 403 response for the CSRF token tamper test
- Simple diagram: attacker page → forged request → browser auto-attaches cookie → server checks token → rejected
