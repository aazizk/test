# Day 17 — Session Hijacking via Session Fixation — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

Picture this: an attacker opens a brand-new browser — no cookies, no saved passwords, nothing — types in one URL, and is instantly logged in as "alice." No password guessing. No stolen cookie. No malware on her machine. He never touched her traffic. And the craziest part? He set this trap *before* she ever logged in, and all he had to do afterward was check back and see if it had sprung. That's session fixation, and today we're going to build the exact vulnerable app that makes this possible, break it live, and then fix it.

## Intro

This is Day 17 of my cybersecurity training series, working toward CEH-level knowledge from the ground up. If you've been following along, you already know how cookies and sessions work from our HTTP fundamentals day, and you've seen CSRF exploit those same cookies back in Day 15. Today we're covering a different, sneakier member of the same family: session hijacking, specifically the session fixation variant. By the end of this video you'll understand exactly how an attacker can hijack a login without ever stealing a password or a cookie — and the one-line fix that kills the whole attack.

## Teaching segment: What is a session, really?

Let's start with the basics, because this whole attack hinges on understanding what a "session" actually is under the hood. When you log into a website, the server doesn't ask for your password again on every single click you make. Instead, right after you log in, the server hands your browser a session ID — think of it as a temporary ticket, usually stored in a cookie. Every time your browser makes a request after that, it automatically attaches that cookie. The server looks up that ID in its own internal session store and says, "oh, this ID belongs to Alice, she's logged in, let her through."

Here's the critical insight: that session ID is a bearer token. Whoever holds it, the server treats as that person. No password check happens again. It's like a wristband at a concert — security doesn't ask for your ID at the merch table, they just check for the wristband.

[SCREEN: simple diagram — browser icon, arrow labeled "session_id=abc123" going to server icon, server icon with a lookup table showing "abc123 → alice, logged_in: true"]

## Teaching segment: Two ways to hijack a session

Session hijacking, broadly, means an attacker gets hold of a *valid* session ID belonging to someone else and uses it to impersonate them. There are a couple of ways to get there. The first is the one most people picture: interception or theft — sniffing unencrypted traffic, or stealing the cookie through an XSS vulnerability, which is exactly the kind of bug we exploited back on Day 14 when we read `document.cookie` through a script injection.

But today's variant is different, and honestly more interesting conceptually: session fixation. Instead of *stealing* a session ID that already belongs to the victim, the attacker *plants* a session ID of their own choosing on the victim *before* the victim ever logs in. If the server is sloppy enough to keep using whatever session ID the client already had the moment that client authenticates, then the attacker's pre-chosen ID becomes a fully authenticated session — and the attacker was holding onto that same ID the entire time, just waiting.

I like to describe the distinction this way: classic hijacking is stealing something already in motion. Fixation is setting a trap and waiting to see if it springs.

## Teaching segment: Building and exploiting the lab

[SCREEN: terminal, Flask app code]

So I built this for real — a small Flask application with two specific vulnerabilities stacked on top of each other. First, the app would accept a session ID directly from a URL query parameter, something like `?sessionid=ATTACKER123`, and just trust it as valid. Second — and this is the real bug — when a user logged in, the app never issued them a fresh session ID. It just flipped a flag on whatever session was already active to "logged in."

Here's how the attack played out, step by step, for real, not simulated. First, playing the attacker, I visited the app with `?sessionid=ATTACKER123` in the URL. That instantly created a brand-new, unauthenticated session on the server under that exact ID — I could confirm this by hitting a debug endpoint I'd built into the app that dumps the server's internal session store.

[SCREEN: curl output showing `"ATTACKER123": {"logged_in": false, "user": null}`]

Then, still in that same browser tab — which now had the attacker's chosen cookie sitting in it — I played the victim and logged in with a username, "alice," and a password. Checked the debug endpoint again.

[SCREEN: curl output showing `"ATTACKER123": {"logged_in": true, "user": "alice"}`]

Look at that. The exact same session ID the attacker planted is now fully authenticated as Alice. And here's the kill shot: I opened a completely separate browser — private window, zero cookies carried over, nothing — and navigated to that same URL with `?sessionid=ATTACKER123`. 

[SCREEN: browser window showing "Welcome, alice!"]

Logged in. Instantly. As Alice. In a browser that had never seen her password, never touched her traffic, never run any malicious script. That's the entire attack.

## Teaching segment: The fix

The fix here actually maps to both bugs individually, and either one alone would have stopped this specific attack. First: never trust a session ID that arrives via a URL parameter — only ever read it from the cookie the server itself issued. Second, and more fundamentally important as a general principle: always mint a brand-new session ID at the exact moment of authentication, and throw away whatever ID was active before. This is called session ID rotation, and it should happen on login, and ideally on logout too.

I made both fixes in the actual code, restarted the server, and reran the entire attack chain from scratch.

[SCREEN: terminal showing the exploit now fails — the separate browser shows the login page, not "Welcome, alice"]

Attack blocked. Legitimate login still worked perfectly. That's the pattern we want: fix verified, nothing broken.

## Mistake/correction moment

When I walked through my own reasoning for the first review question, I said the *browser* was reading the session ID from the URL parameter. That's actually backwards — browsers don't interpret cookies or sessions at all, they just store and resend whatever bytes the server tells them to. It was the *server's* code reading `request.args` that created the vulnerability. It's a small slip, but it matters, because precisely separating "what the client does" from "what the server does" is exactly the skill you need when comparing attacks like CSRF and SSRF later — who actually sends the malicious request is often the whole ballgame in those comparisons.

## Recap + quiz

Three things to hold onto from today. One: a session ID is a bearer token — whoever has it, the server trusts, no further password check. Two: fixation means the attacker plants a known ID *before* login, rather than stealing one after. Three: rotating the session ID at the moment of login closes this hole completely.

Now, pause the video and think through these before I move on. First: what are the two separate vulnerabilities in today's lab, and would fixing just one of them have been enough? Second: what's the fundamental difference between what an attacker needs to obtain in session fixation versus classic cookie-theft hijacking? Third: besides login, name one other point in an app's lifecycle where rotating the session ID is also good practice, and explain why.

Got your answers? The two vulnerabilities were trusting a URL-supplied session ID, and never rotating the ID at login — and yes, fixing either one alone would have stopped this specific attack, though in the real world you'd want both as defense in depth. The fundamental difference is that fixation requires no theft at all — the attacker already has the ID because they chose it, they just have to wait. And the other key rotation point is logout — rotating there invalidates the ID so nobody can reuse a leftover cookie after the legitimate user is done.

## Outro / CTA

Here's your one-line takeaway to carry forward: never trust a session identifier the client could have chosen or supplied before authentication — always mint a fresh one the moment privilege changes. If you want to follow the rest of this series, the next sessions are going to dig further into web app attacks and start moving into identity and access management. Drop a comment with your answer to the quiz before you scroll past the description, and I'll see you in the next one.

## On-screen text / b-roll suggestions

- Lower third on intro: "Day 17 — Security Fundamentals to CEH: Session Hijacking & Fixation"
- Caption overlay during the "bearer token" explanation: "Whoever holds the session ID = treated as that user"
- Split-screen during the exploit walkthrough: left side = attacker's browser/terminal, right side = "victim's" browser, to visually reinforce two separate contexts
- On-screen text when the debug endpoint output is shown: "logged_in: true, user: alice — and the attacker never saw her password"
- Freeze-frame + zoom on the final private-window "Welcome, alice!" screenshot — this is the money shot of the video
- Caption during the fix segment: "Fix #1: cookie-only session reads · Fix #2: rotate session ID at login"
- End-card text: "Next up: more Web App Security — OWASP Top 10 continued"
