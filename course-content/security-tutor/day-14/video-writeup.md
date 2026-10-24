# Day 14 — Cross-Site Scripting: Making the Victim's Own Browser Betray Them — Video Script

**Estimated length:** ~11 minutes (~1500 words)

## Hook

I navigated to a URL that looked completely ordinary and got a real JavaScript alert box popping up in my own browser — not because anything was broken, but because the server took my input and printed it straight back into the page as code. That's Cross-Site Scripting, and today I built it, exploited it twice, and fixed it for real.

## Intro

This is Day 14 of my cybersecurity training log. Yesterday was SQL injection — tricking a database into running attacker-controlled code. Today is the same family of bug, aimed at a different target: the browser itself.

## Teaching segment: what XSS actually is

Cross-Site Scripting tricks the victim's own browser into running attacker-controlled JavaScript, inside the trusted context of the real site. That's what makes it dangerous — the script doesn't run as some anonymous outsider, it inherits whatever the logged-in victim's browser already has access to: cookies, active sessions, the ability to make requests as that user.

[SCREEN: diagram — attacker payload runs inside the victim's own authenticated browser session]

There are three flavors. Reflected XSS rides in on the request itself, usually a URL parameter, and the server echoes it straight back unescaped. Stored XSS gets saved server-side — a comment, a profile field — and fires on every single visitor who loads that page afterward. DOM-based XSS lives entirely in client-side JavaScript writing untrusted data into the page without the server even being involved in that round-trip — I'm only naming that one today, it's parked for a future session.

## Teaching segment: reflected vs. stored, the real difference

The practical difference is blast radius and delivery. Reflected XSS needs the attacker to get one specific victim to trigger one specific crafted request — usually by clicking a link. That makes it a one-to-one, social-engineering-dependent attack; the hook matters as much as the payload. Stored XSS needs none of that. Submit the payload once, and it attacks every future visitor automatically, via a perfectly ordinary URL — one-to-many, unbounded, for as long as it stays stored.

## Teaching segment: building and exploiting the lab [REAL LAB]

Real, hands-on lab, deliberately run without Docker this time — just a Python virtual environment and a Flask dev server at `/yml/install/security-learn/xss-lab/`. No filesystem or database isolation needed for this vulnerability class, so a bare local server was the right call.

[SCREEN: app.py — the /search and /guestbook routes using the |safe filter]

Two vulnerable routes. `/search` takes a `q` parameter and renders it back using Jinja2's `|safe` filter — which explicitly tells Flask "skip your normal auto-escaping, render this as raw HTML." `/guestbook` does the same thing with a submitted `name` field, appending it to a list of comments and rendering every entry unescaped too.

The reflected exploit: visiting `/search?q=<script>alert('XSS')</script>` — a real alert popup fired. The stored exploit: submitting that same payload as a guestbook entry fired the alert immediately, and then fired again on every subsequent page load — including from a completely fresh incognito window with zero prior cookies or session state. That incognito check is what makes stored XSS's persistence real rather than theoretical: the payload now lives in the server's own data, not in anyone's individual browsing history.

[SCREEN: incognito window loading the guestbook, alert firing with no prior session]

## Teaching segment: the fix and its real limits

The fix: remove `|safe` from both templates, let Flask's default auto-escaping do its job — converting `<` and `>` into `&lt;` and `&gt;` before they ever reach the browser's HTML parser. After restarting and re-running both exploits, the script tag printed as harmless literal text — no execution, in both the reflected and stored case.

One boundary worth knowing: escaping assumes you want plain text output. A feature that legitimately needs *some* HTML — bold or italic in a comment box — can't just escape everything, since that breaks the formatting too. That needs a real HTML sanitizer library that allow-lists specific safe tags, not either extreme.

## Mistake/correction moment

I was asked directly: is escaping "the same fix" as yesterday's parameterized queries? My gut answer blurred them together, but they're genuinely different mechanisms sharing the same goal. Parameterized queries keep the data completely separate from the query structure — it's never parsed as SQL at all, out-of-band separation. HTML escaping still embeds the data directly in the document, but transforms the dangerous characters so the parser can't read them as markup — in-band encoding. Same goal, different mechanism, and knowing which one you're relying on tells you exactly what it does and doesn't cover.

That connects to `HttpOnly`, from Day 7's cookie fundamentals: it tells the browser to exclude a cookie from anything JavaScript can read, so `document.cookie` won't include it — even on a page where XSS is proven to fire. The browser still sends that cookie automatically on requests, exactly as before. `HttpOnly` doesn't stop XSS from happening — it only removes session-cookie theft as one specific payoff of a bug that's still fully there.

## Recap + quiz

Three things to hold onto: XSS is SQL injection's sibling, aimed at the browser instead of the database. Reflected is one-to-one and delivery-dependent; stored is one-to-many and needs no trickery after the first submission. And `HttpOnly` limits the damage from XSS, it doesn't fix the underlying hole.

Pause and think about this one: if `document.cookie` comes back empty even on a page where you've proven `alert(document.cookie)` fires, what server-side setting most likely explains that?

## Outro / CTA

Operational takeaway: escaping and parameterized queries both stop untrusted data from being treated as code, but through different mechanisms — in-band encoding versus out-of-band separation — and knowing which one is protecting you tells you exactly what it does and doesn't cover. Follow along for Day 15, drop your answer to today's quiz question in the comments.

## On-screen text / b-roll suggestions

- Lower-third: "Reflected = one click, one victim. Stored = submit once, attack everyone."
- Captured browser: real alert() popup firing from both the reflected URL and the stored guestbook entry
- Captured incognito window reproducing the stored XSS with zero prior session
- Code block: before/after diff of the `|safe` filter removal
- Simple diagram: in-band encoding (escaping) vs. out-of-band separation (parameterized queries)
