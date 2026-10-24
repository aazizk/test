# Day 18 — Session Hijacking via XSS: Stealing a Cookie Instead of Stealing a Password — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

[SCREEN: terminal showing the attacker collector's log line]

Here's a line I watched scroll across my screen a few minutes into today's lab: `GET /steal?c=session_id=330c79bc050105142d6410058cd5f95b`. That's it. That one line meant I now had full, working access to someone else's logged-in account — not their password, not their email, nothing they typed. Just a string their browser handed over automatically, without them ever knowing it happened. And the proof that it actually worked? One `curl` command, from a completely different terminal that had never touched a browser, a cookie, or a login form in its life — and it came back saying "Welcome, alice!"

## Intro

This is Day 18 of my hands-on cybersecurity course, working toward CEH-level knowledge one real lab at a time — no theory-only slides, everything gets built and broken on my own machine first. If you watched Day 17, you saw session fixation: planting a session ID in advance and waiting for a victim to log into it. Today is the mirror image of that — classic session hijacking, where instead of planting anything, I steal a session that's already alive, using a vulnerability you've actually seen before in this series: XSS. By the end of this video you'll understand exactly how a stored XSS bug turns into a full account takeover, and why the fix isn't "stop the XSS" — it's a completely separate, narrower cookie setting.

## Teaching segment: what a session hijack actually needs

Quick refresher on the mechanics, because it matters for what's coming. When you log into a site, the server doesn't re-check your password on every click — it hands your browser a session ID, usually sitting inside a cookie, and your browser auto-attaches that cookie to every future request. The server looks up that ID and treats you as whoever it belongs to. No further questions asked. That means the session ID is functionally your login — whoever holds it, the server trusts.

There are two fundamentally different ways an attacker gets their hands on one. Fixation, which I covered last time, means the attacker already controls the ID before the victim ever logs in. Today's variant — classic hijacking — means the victim already has a real, valid session running, and the attacker steals the ID out of that live session. The tool for that theft, today, is cross-site scripting.

## Teaching segment: reintroducing the XSS hole, on purpose

[SCREEN: app.py diff — the guestbook template with `{{ c|safe }}`]

I went back to the exact same vulnerable app from Day 14 — a small Flask app with a guestbook page. Back then, I fixed its stored-XSS bug by removing a template filter called `|safe`, which tells Flask to skip its normal automatic escaping and just render raw HTML. For today's lab, I deliberately put that vulnerability back, and I added something Day 14's app didn't have: an actual login system, issuing a real session cookie — and I set that cookie with `httponly=False`, meaning JavaScript is explicitly allowed to read it. Two realistic vulnerabilities, stacked, which honestly isn't rare — a lot of real breaches come from exactly this kind of combination, not one dramatic bug.

## Teaching segment: building the theft payload

[SCREEN: the injected guestbook comment, then the browser rendering it]

Here's the payload I submitted into the guestbook as my "name": an image tag pointing at a URL that doesn't exist, with an `onerror` handler attached. Browsers are very good at silently failing to load broken images — but that `onerror` event still fires, and it'll run whatever JavaScript you put in it. That's a classic way to sneak script execution past a filter that only thinks to block literal `<script>` tags. Inside that handler, I called `fetch()`, pointed at a second little server I'd stood up on port 8000, and appended `document.cookie` — the browser's actual, current cookie value — onto the URL as a query parameter.

Because this is stored XSS, I only had to submit that payload once. It sits in the guestbook's in-memory comment list, and it fires again for every single visitor who loads that page afterward — not just me.

## Teaching segment: watching the theft happen

[SCREEN: the collector terminal receiving the GET request]

On the other side, I had Python's built-in `http.server` running — nothing fancy, it's not even built to receive stolen data, I was just abusing the fact that it logs every request's full URL straight to the terminal. The moment I, playing the victim, loaded the guestbook page while logged in, that terminal lit up with a request carrying my real session cookie, in plain text, in the query string. My browser did exactly what browsers always do — attached the cookie automatically and ran the page's JavaScript — and that combination is precisely what made the theft possible.

## Teaching segment: proving the hijack is real, not theoretical

[SCREEN: the curl command and its output]

This is the part I think matters most, and it's the part that turns "huh, interesting" into "oh no." I opened a third terminal — one that had never opened a browser, never logged in, never touched a cookie — and ran one `curl` command, manually setting the stolen session ID as a cookie header, pointed at the app. The response: "Welcome, alice!" No password. No login form. No second factor. Just a copied string. That's the entire attack, end to end — reconnaissance wasn't needed, brute force wasn't needed, all it took was one unescaped piece of text rendered back into a page.

## Mistake/correction moment

I want to flag a mix-up I made myself in the review questions, because I think it's a genuinely common one. I answered a question about `SameSite=Strict` by saying it would have blocked today's attack, reasoning that it stops cross-site scripts from running. That's wrong, and it's worth being precise about why: `SameSite` controls one narrow thing — whether a browser attaches a cookie to a request that's crossing from one site to another. It has nothing to do with where JavaScript is allowed to execute, and nothing to do with whether `document.cookie` can be read. My payload ran on the bank's own page, same site as the cookie — so `SameSite` was never even in play. The thing that actually stopped the theft, once I applied it, was a completely different setting: `HttpOnly`. Two cookie attributes, two unrelated jobs — mixing them up is an easy trap, and I fell straight into it before correcting myself.

## Recap + quiz

Three things to hold onto from today. First: a live session cookie is just as valuable to an attacker as a password, and in some ways more dangerous, because stealing it skips authentication entirely. Second: `HttpOnly` blocks JavaScript from reading a cookie, but it does not stop the browser from sending that cookie automatically on real requests, and it does nothing for cross-site request forgery — it's a narrow fix for a narrow problem. Third: fixing the symptom isn't the same as fixing the cause — after I applied `HttpOnly`, the stolen cookie came back empty, but the underlying stored-XSS hole in the guestbook was still sitting there, still fully exploitable for other kinds of damage.

Here are today's three review questions — pause the video and think through your own answer before I give mine. One: what's the structural difference between what I did today and session fixation from Day 17, in terms of what the attacker needs to obtain? Two: does `HttpOnly` stop a browser from sending a cookie on a normal request, like a `fetch()` call with credentials included? Three: would `SameSite=Strict` have prevented today's specific attack — cookie theft via a stored XSS payload on the same site as the cookie?

[The answers: one, hijacking steals an ID from a session that already exists, while fixation plants an ID in advance and waits for the victim to authenticate into it. Two, no — `HttpOnly` only blocks JavaScript's read access to the cookie value, the browser still attaches it automatically regardless. Three, no — `SameSite` governs cross-site request behavior, not same-site script execution or `document.cookie` access, so it wouldn't touch this specific attack at all.]

## Outro / CTA

If there's one line to take away from today, it's this: cookie-protection attributes are narrow, single-purpose tools, not general-purpose session security — real defense needs several of them layered together, `HttpOnly` plus `SameSite` plus session rotation plus anomaly detection, not any one of them alone. If you've been following this series, you've now seen the full session-attack trio — CSRF, SSRF, and both flavors of session hijacking — all built, exploited, and fixed by hand. Follow along for Day 19, where I'm planning to build a dedicated `SameSite` lab to settle today's mix-up for good with a real CSRF scenario where it's actually the deciding factor. And drop a comment with your own answer to question three before you scroll past the end card — I got it wrong the first time, so don't feel bad if you do too.

## On-screen text / b-roll suggestions

- Lower-third on the hook: "Stolen session cookie → instant account takeover, zero password"
- Split-screen diagram: victim's browser (cookie theft via XSS) vs. attacker's `curl` terminal (reusing the stolen cookie)
- On-screen label when introducing the payload: "`<img onerror=...>` — script execution without a `<script>` tag"
- Caption during the collector terminal demo: "http.server is just logging requests — not built for this, but good enough to prove the point"
- Side-by-side comparison card for the mistake moment: "HttpOnly → blocks JS reading the cookie" vs. "SameSite → blocks the cookie being sent cross-site" — two different jobs
- End-card teaser graphic: "Next: SameSite cookie lab — finally proving when it actually matters"
