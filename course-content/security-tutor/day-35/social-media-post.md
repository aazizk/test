# Day 35 — OAuth/OIDC: finally fixing a mistake I kept making

## LinkedIn

I got the same security quiz question wrong twice. Weeks apart. So today I stopped moving forward and actually fixed it.

The question: in an OAuth/OIDC login flow, which token does what — the ID token or the access token? Both times I had it backwards.

Instead of re-reading the definition a third time, we walked through a concrete scenario: an app called "TripPlanner" signing you in with Google. Google issues two tokens for two completely different audiences — an ID token the app reads once to learn who you are, and an access token the app hands to Google's Calendar API every time it needs your data. One-line test that would've saved me twice: "which API would reject this token?" — that question only makes sense for an access token.

Then it got interesting. I asked: if an attacker steals the ID token, can they see my calendar? No, I reasoned — they don't have the access token. But then I pushed further: if the access token lives on the app's own server, and the app calls the API on my behalf, couldn't a hijacked login session get the same result anyway, just by riding the app's own session instead of stealing the access token directly? Turns out: yes. Separating tokens by audience stops direct attacker-to-API calls — it does nothing to stop session hijacking at the app layer. Two different problems.

That same instinct ("what does this defense specifically not cover") led to finding a real limit in PKCE too — a mechanism designed to protect authorization codes from theft, which turns out not to help at all if an attacker captures both halves of the secret it relies on.

Takeaway: don't ask "is this secure," ask "what exactly does this control stop, and what's just outside its boundary." That one question is doing most of the real work in security reasoning.

#CyberSecurity #OAuth #OIDC #CEH #LearningInPublic #AppSecurity

## Twitter/X

Got the same OAuth quiz question wrong twice: ID token vs access token, which does what. Today I stopped and actually fixed it — and ended up finding a real gap in PKCE along the way (hint: it doesn't survive an attacker stealing both halves of its secret). 🔐

#OAuth #CyberSecurity #CEH
