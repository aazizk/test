# Day 25 — AAA Framing and the SAML/OAuth/OIDC Mess — Video Script

**Estimated length:** ~11 minutes (~1650 words)

## Hook

"Sign in with Google." You've clicked that button a hundred times. Here's a question that trips up most people who've actually used it every day: when you click it, is that app logging you in, or is it getting permission to read your stuff? Those sound like the same thing. They are not the same thing, and mixing them up is exactly the mistake I made in this exact session — twice — before it finally clicked.

[SCREEN: title card — "Day 25: AAA + SSO Protocol Mechanics"]

## Intro

This is Day 25 of my cybersecurity training series, still inside Phase 5 — Identity and Access Management. Today was pure concept, no lab, but it's some of the densest material in the whole IAM phase: the formal AAA framework, and the actual mechanical difference between SAML, OAuth, and OIDC — three acronyms everyone throws around interchangeably that are absolutely not interchangeable. By the end of this, you'll know exactly what's happening behind that "Sign in with Google" button, and why it's two separate systems wearing one UI.

## Teaching segment: AAA — the third leg nobody talks about

You've already heard authentication and authorization a hundred times by this point in the series: authentication is proving who you are, authorization is deciding what you're allowed to do. AAA adds a third leg — Accounting — and it's the one that gets skipped most often in real systems.

[SCREEN: three-box diagram — Authentication / Authorization / Accounting]

Accounting means logging and tracking what actually happened: who did what, when, for how long. Think of a VPN connection — the server authenticates you with your password or certificate, authorizes which internal subnets you're allowed to reach, and then accounts for the session: connect time, data transferred, disconnect time. That log trail is what lets you reconstruct events later.

Here's why this matters in practice: each leg fails in a completely different way, and the Accounting failure is the sneaky one. If authentication breaks, someone gets in who shouldn't. If authorization breaks, someone legitimate does something they shouldn't. But if accounting breaks — if you're only logging login attempts and not what happens after — then during an actual incident, you can prove *who connected*, but you have no way to prove *what they did*. You can't even tell the difference between "an authorized user did something malicious" and "an authorized user's session got hijacked and the attacker did it instead." That gap is a direct preview of incident response work, much later in this course.

## Teaching segment: SAML vs. OAuth vs. OIDC

This is where today got genuinely hard, and I want to walk you through my own confusion in real time because I think it's the exact confusion most people carry around.

[SCREEN: three-column header — SAML / OAuth / OIDC]

SAML is the old-school enterprise one — XML-based, built for logging a human into a web app through a trusted identity provider, like Okta. The IdP builds a signed XML document called an assertion: "this user is jane.doe, role is Sales, verified right now," and hands it to the app.

OAuth is a completely different animal, and this is the part that trips everyone up: OAuth isn't actually a login protocol at all. It's a delegation protocol — "let this app touch some of my data on another service, without handing the app my password for that service." The classic example is an app asking for permission to read your Google Calendar.

OIDC — OpenID Connect — is a thin identity layer built on top of OAuth that adds back the piece OAuth is missing: a way to actually prove who the person is, via something called an ID token. This is what "Sign in with Google" really is under the hood.

Here's where I got it wrong the first time. I described the ID token as letting the app "act as you" — which sounds right, but isn't. An access token — OAuth's piece — is a scoped key that lets an app perform specific actions, like reading your calendar, repeatedly, until it expires. An ID token is completely different: it's a one-time, signed statement the app reads exactly once, at the moment of login, that says "Google verified this specific person is sitting at this browser right now." After the app reads it and logs you in, that token is done. It doesn't give the app any ongoing ability to touch your Google account.

[SCREEN: table — ID token (client reads, one-time, identity claim) vs. access token (API reads, reusable, capability)]

The real distinction isn't just "one gets reused and one doesn't" — that's a symptom. The actual difference is audience and purpose. The ID token is meant for the client app itself, to answer "who just logged in." The access token is meant for the resource server — the API — to answer "is this request allowed to touch this data." Two completely different consumers, two completely different jobs.

Once that clicked, adding SAML into the same comparison got easy: SAML's assertion does the exact same conceptual job as OIDC's ID token — prove identity, consumed once — it's just older, XML-based, and has no built-in equivalent to OAuth's access token, because SAML was never designed for delegated API access, only for browser-based login.

[SCREEN: side-by-side flow — SAML: browser redirected to Okta, signed XML assertion POSTed back to Salesforce / OIDC: browser redirected to Google, ID token plus optional access token returned]

## Mistake/correction moment

The "acts as you" phrasing was the headline mistake of the day, and it took two full correction passes to actually land — which is honestly rare for this series. The first explanation I gave wasn't enough; I got pushed back on with a genuinely sharp question: "doesn't a verified identity claim just mean it is me?" That's a fair challenge, and it forced a cleaner answer: yes, the ID token does mean "it's you" — but only as a one-time proof for establishing a login session in that one app's own system, not as a reusable key to act on your behalf anywhere else.

And then came a question I wasn't expecting, which turned into one of the best moments of the session: "what if I just change my laptop's date and time — would that let me reuse an expired token?" No. The expiry timestamp inside a JWT is part of what's cryptographically signed — tamper with it, and the signature breaks, and the token gets rejected outright. And even if you didn't touch the timestamp, the server validating the token checks *its own clock*, not yours — your laptop's date has zero influence over what time Google's servers think it is. The actual defense against someone replaying a stolen token is a separate mechanism called a nonce — a random, one-time value generated before login starts and embedded in the token, so a replayed old token carries the wrong value and gets flagged immediately, completely independent of whether it's technically still within its expiry window.

## Recap + quiz

Three takeaways. One: AAA has three legs, and the one most systems under-invest in is Accounting — without it, an incident investigation hits a wall. Two: SAML, OAuth, and OIDC solve three different problems — SAML and OIDC both prove identity, OAuth grants delegated access, and OIDC is literally OAuth plus an identity layer bolted on top. Three: an ID token and an access token are built for two different readers — the client app reads the ID token once, the API reads the access token repeatedly — and that difference in audience is the real reason they behave so differently.

Here are today's three review questions — pause and work through them before I give the answers:

First: a SIEM logs every login attempt but nothing about what users did afterward. Which AAA leg is missing, and why does that specifically hurt incident response?

Second: a mobile app needs to log a user in *and* read their calendar. Would you reach for SAML, or OIDC plus OAuth — and why?

Third: an attacker captures a valid OIDC ID token in transit and tries replaying it a minute later, well before it expires. What mechanism should catch that, and why doesn't the expiry timestamp alone catch it?

[SCREEN: three questions, pause-and-think card]

## Outro / CTA

The operational takeaway from today: don't assume a token's expiry timestamp alone protects you from replay — replay protection, usually a nonce, is a completely separate mechanism that has to be checked independently of whether the token has technically expired yet. If this video made the SAML-versus-OAuth-versus-OIDC mess click for you the way it finally clicked for me today, that's the whole point of showing the confusion instead of hiding it. Follow along for the next session, where this course heads toward a hands-on privilege-escalation lab — revisiting the cron exploit from much earlier in the series — as the capstone before we move into Phase 6: Cloud Security. Drop a comment with your answer to the replay-attack question; I want to see who nails the nonce explanation.

## On-screen text / b-roll suggestions

- Lower-third: "Day 25 — AAA Framing + SSO Protocol Mechanics (Phase 5, conceptual)"
- Caption overlay during hook: "OAuth ≠ login. OIDC = login. Most people don't know the difference."
- Diagram: Authentication / Authorization / Accounting three-box card
- Diagram: SAML vs. OAuth vs. OIDC three-column comparison table
- Diagram: ID token (client, one-time, identity) vs. access token (API, reusable, capability)
- Diagram: side-by-side flow — SAML (Okta→Salesforce) vs. OIDC (Sign in with Google)
- Caption: "Changing your clock doesn't forge a token — signatures and server-side clocks stop that"
- Caption: "Nonces, not expiry, stop replay attacks"
- End card: subscribe + "Next: hands-on privilege escalation lab, then Phase 6 — Cloud Security"
