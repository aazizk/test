# Day 35 — OAuth/OIDC: Fixing a Recurring Mistake, for Real This Time — Video Script

**Estimated length:** ~10 minutes (~1500 words)

## Hook

Here's a confession: in this course, I got the same question wrong twice. Not once — twice, weeks apart, on a real checkpoint quiz. The question was simple on paper: "which OAuth/OIDC token does what?" And both times, I swapped them — called the one-time identity token a full-access pass, and called the reusable access token a one-time thing. Backwards, both times. So today wasn't a new lesson. It was a "let's actually fix this instead of papering over it" session. And by the end, I ended up finding a real gap in a security mechanism that even the lesson plan hadn't planned to cover. Let's go through exactly how that happened.

[SCREEN: title card — "Day 35: OAuth/OIDC — Fixing What Kept Breaking"]

## Intro

If you're following this security course from the start, you know the drill — one real concept a day, hands-on where possible, toward CEH-level knowledge. Today's a bit different: no new syllabus topic, no lab, no AWS console. Today is what happens when a concept keeps slipping through the cracks on quizzes, and instead of getting another light "did you remember it this time" check, we stopped and did it properly. If you've ever mixed up ID tokens and access tokens in an OAuth/OIDC flow — and almost everyone has at some point — this one's for you.

## Teaching segment: the TripPlanner scenario

Instead of starting with definitions again, which is exactly what didn't stick the first two times, we built one concrete story. Imagine an app called TripPlanner. You hit "Sign in with Google." Google logs you in, confirms who you are, and sends two completely different tokens back to TripPlanner — issued for two completely different audiences.

[SCREEN: simple diagram — Google → two tokens → TripPlanner]

The **ID token** is addressed to TripPlanner itself. It's a signed proof that says "this is really jane@gmail.com, verified at this exact time." TripPlanner reads it exactly once, at login, to figure out who just showed up. After that, it's done — it has zero power to make anything happen. It's a receipt, not a key.

The **access token** is addressed somewhere completely different — to Google's Calendar API. TripPlanner never even looks inside this one. It just holds onto it and hands it to the Calendar API every time it wants to fetch your schedule. It's reusable, at least until it expires, and it's a capability, not proof of identity.

Here's the one-line test that would have caught my mistake both times: ask "which API would reject this token?" That question only makes sense for an access token. It doesn't even apply to an ID token, because nothing outside your own app ever looks at it.

## Teaching segment: the twist nobody planned for

So I asked the obvious follow-up: if an attacker steals just the ID token, what can they do? Log in as the user, sure. Read the calendar — no, right? That's what the access token is for, and the attacker doesn't have it.

[SCREEN: "What if the app already has the access token... and the attacker just steals the session?"]

And then came a question that genuinely caught me off guard: if the access token lives on TripPlanner's own server, and the app itself is the one calling Google's Calendar API on the user's behalf — then what stops an attacker who's hijacked the *login session* from just clicking "show my calendar" inside the app and getting the data anyway? TripPlanner doesn't know a different human is driving the session. It just does its normal job: pulls the access token it already has, calls the API, shows the results to whoever's logged in.

That's a completely real gap, and it's an important one to understand: separating tokens by audience stops an attacker from calling Google's API *directly*. It does nothing to stop them from riding inside a hijacked app session, where the legitimate app does all the calling for them. Two different problems, two different fixes.

## Teaching segment: where tokens can actually be stolen

That led to the next real question: in a properly built OAuth flow — the Authorization Code Flow, which is the modern standard — the tokens never actually touch the user's browser at all. The browser only ever sees a short-lived, one-time "authorization code." The app's *server* then exchanges that code for both tokens directly with Google, over a private backend channel.

[SCREEN: flow diagram — browser gets code only; server-to-server token exchange]

So if that's true, where's the actual attack surface? It mostly lives in an older, now-discouraged version called the implicit flow, which used to put tokens directly in the browser's URL — leaking through history, logs, referrer headers. It's also in the authorization code itself, which, even though it's short-lived, could theoretically be grabbed by another app on the same device before the real app uses it.

## Teaching segment: nonce vs. PKCE

That's where two defenses came up — and I mixed them up at first, which is worth showing because it's an easy mix-up to make.

**Nonce** protects the ID token from replay. The app generates a random value before redirecting to Google, Google embeds that exact value inside the ID token it issues, and when the token comes back, the app checks the value matches. An old, previously issued token being replayed into a new session gets rejected because its nonce doesn't match this attempt.

**PKCE** protects the authorization code exchange — a different moment entirely. The app generates a secret called a `code_verifier`, sends a hashed version (`code_challenge`) up front, and then has to produce the original secret again when it exchanges the code for tokens. If a different app intercepted just the code, it doesn't have that secret, and Google refuses the exchange.

[SCREEN: side-by-side table — Nonce vs. PKCE, what each checks, who checks it]

## Mistake/correction moment

Here's the best part of the session, and it's a mistake worth sitting with. I asked: what if an attacker captures *both* the code and the code_verifier? The honest answer is: PKCE doesn't help you anymore. It was only ever built to stop a *different app* from using a stolen code without the matching secret — not to survive a full interception of everything. That's what TLS encryption is actually for.

Then, at the very end, I got asked a true/false question: "PKCE guarantees a stolen code can never be used by an attacker." My answer was basically "true, if the attacker doesn't also get the verifier and doesn't win the race" — which sounds reasonable, but it's actually the wrong answer to the question as asked. A defense that only works under conditions isn't a guarantee. The honest answer was false. That's a pattern worth remembering for any security claim you hear: "prevents X" and "guarantees X can never happen" are very different strength statements, and most real controls are the first kind, not the second.

## Recap + quiz

Three things to take away from today:

1. ID token answers "who are you," read once by the app. Access token answers "what are you allowed to do," read repeatedly by the API.
2. Separating tokens by audience stops direct attacker-to-API calls — it does not stop session hijacking at the app layer, which needs its own defenses.
3. Every security control has a specific, narrow thing it defends against. Know exactly what that is, and don't assume it covers more than it does.

Before I move on — pause the video and answer these yourself:
- Who reads the ID token, and who reads the access token?
- What specifically does a nonce protect against, versus what specifically does PKCE protect against?
- True or false: PKCE guarantees a stolen authorization code can never be used by an attacker. Justify your answer.

## Outro / CTA

The operational takeaway from today: when you're evaluating any security control, don't ask "does this make it secure" — ask "what specific attack does this stop, and what's just outside its boundary." That question would have saved me from getting this wrong twice, and it's the single most useful habit in all of security work. If you've ever mixed up these tokens yourself, drop a comment with your answer to the true/false question before you scroll past it. Follow along for the next session, where we're either extending a real detection-rule script or moving into incident response. See you then.

## On-screen text / b-roll suggestions

- Lower-third on open: "Two misses on this question. Let's fix it for real."
- Diagram: Google issuing two tokens with arrows to two different recipients (app vs. API)
- Flow diagram: Authorization Code Flow — browser only sees the code, server does the token exchange
- Side-by-side comparison card: Nonce vs. PKCE — what each checks, who checks it
- On-screen text during the mistake moment: "'Prevents X' ≠ 'Guarantees X can never happen'"
- Closing caption: "What does this control actually stop — and what's just outside it?"
