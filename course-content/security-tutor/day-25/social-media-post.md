# Day 25 — AAA Framing and the SAML/OAuth/OIDC Mess

## LinkedIn

"Sign in with Google" — you've clicked it a hundred times. Here's the question that trips most people up: is that app logging you in, or getting permission to read your data? Those feel the same. They're not, and I got it wrong twice before it clicked.

Day 25 of my cybersecurity training series went deep into two dense Phase 5 (Identity & Access Management) topics:

→ The formal AAA framework — Authentication, Authorization, and the leg most systems under-invest in, Accounting. Without it, you can prove who logged in during an incident, but not what they actually did.

→ SAML vs. OAuth vs. OIDC. OAuth isn't a login protocol — it's a delegation protocol ("let this app touch my data"). OIDC bolts identity proof onto OAuth. SAML does the same identity job as OIDC, just older and XML-based.

The real "aha" moment: an OIDC ID token and an OAuth access token aren't just "two different tokens" — they're built for two completely different readers. The app reads the ID token once, to answer "who just logged in." The API reads the access token repeatedly, to answer "is this request allowed." Different audience, different lifecycle.

I also asked a question I was sure would get a "no, that's not how it works" — what if I just change my laptop's clock to reuse an expired token? Turns out the answer touches cryptographic signing and server-side clock validation, and led into nonce-based replay protection, which is the actual defense against a stolen token, independent of expiry.

Next up: a hands-on privilege escalation lab, then Phase 6 — Cloud Security.

#CyberSecurity #CEH #LearningInPublic #InfoSec #IAM #OAuth

## Twitter/X

TIL: "Sign in with Google" isn't one protocol, it's two. OAuth grants access to your data. OIDC proves who you are. Mixed those up live on camera today before it clicked — the ID token and access token are built for completely different readers.

#CEH #CyberSecurity
