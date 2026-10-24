# Day 15 — CSRF: When the Victim's Own Browser Signs the Attacker's Check — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

I visited a page today that said "Free Prizes! Click to claim!" I didn't click anything. I didn't type a password. I just loaded the page — and by the time it finished loading, my test bank account's email had already been changed to `attacker@evil.com`. No exploit code ran on the bank's server. No password was touched. The page didn't even need me to click the fake prize button. That's CSRF, and today I built it, ran it for real, and then broke my own attack on purpose to understand exactly why it failed the second time.

## Intro

This is Day 15 of my hands-on CEH-track security series. If you've been following along, Day 13 was SQL injection and Day 14 was Cross-Site Scripting — tricking a server into running bad SQL, then tricking a browser into running bad JavaScript. Today's topic, Cross-Site Request Forgery, is sneakier than both, because it doesn't need to trick anything into running attacker code at all. By the end of this video you'll understand exactly why a cookie-based login can be silently abused by a page you're just *visiting*, and why a JSON API felt safer in my test — and whether that safety was real or just luck.

## Teaching segment: what CSRF actually abuses

Here's the mechanism. When your browser sends a cookie, it decides whether to attach that cookie based on the *destination* of the request — not based on which page or site triggered the request. So if I'm logged into `bank.example.com` right now, with a valid session cookie sitting in my browser, and I then visit some completely unrelated site, `evil.com` — that site can embed a hidden form that auto-submits a request to `bank.example.com`. My browser doesn't ask "hey, does this request actually come from a page the bank trusts?" It just sees "this request is going to bank.example.com" and attaches my real cookie. The bank's server sees what looks like a perfectly legitimate, authenticated request from me.

[SCREEN: diagram of victim browser holding a cookie, loading an unrelated attacker page, attacker page auto-submitting a form to the bank]

Compare that to Day 14's XSS: XSS needs the attacker's *code* to actually run inside the target site's own page. CSRF needs nothing like that — it only needs you to still be logged in, and to visit a page the attacker controls. That's a lower bar for the attacker to clear, which is exactly why it's worth understanding on its own.

## Teaching segment: building and running the real attack

I built two small Flask apps to make this concrete — not a diagram, an actual attack. One, `bank.py`, is the victim: it has a `/change-email` endpoint that trusts the session cookie alone, no questions asked. The other, `evil.py`, is the attacker's page.

[SCREEN: terminal running `python3 bank.py` and `python3 evil.py` on separate ports]

The evil page's HTML was almost insultingly simple: a hidden form targeting the bank's `/change-email` endpoint, pre-filled with `email=attacker@evil.com`, and one line of JavaScript that calls `.submit()` on page load. No click required.

I logged into the bank app first, confirmed my test account showed `victim@example.com`, then visited the evil page. Reloaded the bank's account page.

[SCREEN: browser showing "Current email on file: attacker@evil.com"]

Changed. Just from loading a page. In a real attack, the next step is usually "forgot password," sent straight to the now-attacker-controlled inbox — full account takeover, without the attacker ever needing my actual password.

## Teaching segment: the JSON attack and why it got blocked

I wanted to go further and test something I was curious about myself: would the same trick work against a JSON API instead of a plain form? I added a second attack to the evil page — this time using JavaScript's `fetch()` to send `Content-Type: application/json` with `credentials: 'include'`, explicitly trying to carry the cookie along.

Here's the part that actually surprised me. A plain HTML form physically *cannot* send `Content-Type: application/json` — that's not one of the content types a form element supports. But JavaScript's `fetch()` absolutely can set that header. So I expected this one to maybe work.

[SCREEN: DevTools Network tab with Preserve Log enabled, showing three requests]

It didn't. Watching it happen in the browser's DevTools Network tab, I saw three requests: the form-based attack succeeding with a 200, then an `OPTIONS` request — that's a CORS preflight, the browser essentially asking the bank's server "hey, do you allow evil.com to send you this kind of request?" — which also came back 200. Then the actual `POST` request to the JSON endpoint showed up as a CORS error. Never sent. Blocked by the browser itself, before it ever reached the server with real data.

Here's the lesson I want to flag clearly, because I got genuinely confused by it at first: that `OPTIONS` preflight returning 200 does *not* mean permission was granted. The browser isn't reading the status code to decide whether to proceed — it's reading specific *headers* in that response. Our bank server never added an `Access-Control-Allow-Origin` header, so even though the server technically answered the preflight question, it never said "yes," and the browser refused to send the real request.

## Mistake/correction moment

When I got asked to explain why the JSON attack failed, in my own words, I said it was blocked "because a different site was trying to use a method that is allowed to the same origin site only." That's directionally right but too broad — it makes it sound like JSON requests are just inherently locked to same-origin callers as a blanket rule. The actual mechanism is narrower and more interesting: it's specifically the CORS preflight check, and it depends entirely on whether the server's response includes the right headers. If that same bank server had a careless, overly permissive CORS configuration — say, allowing any origin — this exact same attack would have sailed right through. The protection isn't baked into JSON itself; it's baked into a specific browser mechanism that a misconfigured server can accidentally disable.

I also completely missed a follow-up question: why couldn't the attacker's page just read the CSRF token off the bank's real form and copy it into a forged request? My honest answer was basically a guess about file paths and random token generation — wrong track entirely. The real answer: even though an attacker's JavaScript can often *trigger* a cross-origin request, the Same-Origin Policy separately blocks that same JavaScript from *reading the response body* of that request. Sending and reading are two different permissions. An attacker's page can make something happen on the bank's server, but it generally can't see what comes back — which is exactly why a secret value embedded in a page only the real authenticated browser can read is an actual defense, not just a speed bump.

## Recap + quiz

Three takeaways from today: cookies are attached based on destination, not origin, which is the entire premise of CSRF. CORS preflight blocks a specific kind of cross-origin request, but only if the server actually declines to permit it via headers — a 200 status alone proves nothing. And sending a request cross-origin is a different permission from reading its response — CSRF tokens work specifically because that second permission stays closed.

Here's today's quiz, pause if you want to answer before I do:
1. Why does the attacker's browser successfully attach the victim's real cookie to a forged request?
2. Was the JSON attack blocked because JSON is inherently same-origin-only, or for a more specific reason?
3. Why can't the attacker's page just read the CSRF token off the bank's real form?

Answers: cookies are scoped to destination, not origin. The JSON attack was blocked by CORS preflight specifically — a server with permissive CORS headers would have let it through. And the attacker's page can trigger a request but can't read the response body of a cross-origin request, thanks to the Same-Origin Policy — a separate protection from the preflight mechanism.

## Outro / CTA

My operational takeaway for today: any state-changing endpoint that trusts a cookie alone to answer "is this really you?" is forgeable by any page the victim merely visits — pair cookie-based auth with a real CSRF token, or a strict SameSite cookie policy, on every request that changes state. If you've hit a CORS preflight error in your own work and wondered what it actually meant, drop a comment — I'd genuinely missed the "200 doesn't mean permission" detail until I watched it happen in the Network tab myself. Follow along for Day 16, where we flip this whole scenario around: instead of your browser making a forged request, SSRF tricks the *server* into making a request on the attacker's behalf.

## On-screen text / b-roll suggestions

- Lower-third: "CSRF — the victim's browser does the attacking, not the attacker's code"
- Screen recording: evil page loading, account email changing in real time
- DevTools Network tab screenshot: the three requests (form POST 200, OPTIONS preflight 200, blocked POST/CORS error) highlighted
- On-screen text overlay during the preflight explanation: "200 on the preflight ≠ permission granted — the browser checks headers, not status"
- Split-screen diagram: "send a request" vs "read a response" as two separate locks
- Caption during mistake moment: "Close, but too broad — not all JSON requests are blocked, only unauthorized cross-origin ones"
