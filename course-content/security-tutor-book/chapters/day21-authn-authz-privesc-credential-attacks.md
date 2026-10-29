---
day: 21
title: "Chapter 21: Who You Are vs. What You Can Do — Opening Identity and Access Management"
course_phase: "Phase 5 — Identity and Access Management"
status: draft, good source fidelity
source: "day-21/video-writeup.md + day-21/social-media-post.md + progress.md"
has_diagram: false
---

# Chapter 21: Who You Are vs. What You Can Do — Opening Identity and Access Management

## Learning objectives

By the end of this chapter, you will be able to:
- Distinguish an authentication failure from an authorization failure given a concrete scenario
- Classify a privilege escalation as vertical or horizontal by asking whether the privilege tier changed
- Name and differentiate four credential-attack techniques: brute force, dictionary attacks, credential stuffing, and password spraying
- Explain the core security tradeoff that Single Sign-On introduces alongside its convenience

## The concept

Twenty days into this course, I had already built and broken plenty of access-control bugs — Broken Access Control, IDOR, session fixation, cookie theft. What I hadn't done yet was name the two ideas sitting underneath nearly all of them. Day 21 opened Phase 5, Identity and Access Management, with exactly that: the vocabulary that makes every access-control bug classifiable in seconds instead of guessed at.

The starting question was deliberately uncomfortable: a web app lets any logged-in user hit `/admin/delete-user?id=5`, and the server's only check is whether there's a valid session cookie — nothing about whether that session belongs to an admin. Is that an authentication problem or an authorization problem?

**Authentication** answers "who are you?" It's the mechanism that proves identity — a password, a certificate, a fingerprint, a one-time code. **Authorization** answers a different question entirely: "what are you allowed to do?" It operates after identity is already settled, deciding which resources and actions a given identity may touch. The two systems are independent, and that independence is the whole point: you can be completely, correctly authenticated — a real session, a real login, no impersonation involved — and still be unauthorized to perform a given action. In the admin-delete-user scenario, the server did its authentication job perfectly. It knew exactly who was asking. It simply never asked the second question. That's an authorization failure.

This reframes a lot of earlier ground. IDOR — changing `user_id=123` to `user_id=124` and reading someone else's data — isn't a login bypass. You're still logged in as yourself the whole time. It's a missing authorization check, same category of bug as the admin-delete-user example, just a read instead of a delete. A simple ordering trick helps keep the two straight: AuthN before AuthZ, both alphabetically (N before Z) and logically — you must establish identity before you can evaluate permission.

Privilege escalation is what happens when an authorization failure gets actively exploited, and it comes in two distinct shapes that CEH material is careful to separate. **Vertical privilege escalation** is a tier change — low privilege climbing to high privilege, regular user to administrator or root. The cron-job exploit from Chapter 6 is the clean example: a misconfigured job running as root executed an attacker-controlled command, and that command inherited root's privileges even though the attacker started as an ordinary user. **Horizontal privilege escalation** keeps the tier fixed but changes the target — same privilege level, different account. A predictable, sequential password-reset token is the textbook case: guess the next token in the sequence, and you take over another regular user's account without ever climbing a tier. IDOR, again, turns out to be a horizontal privilege escalation once you look at it through this lens.

The test that resolves the label every time: did the *tier* change, or did the *target* change? Tier change, vertical. Same tier, different target, horizontal.

The last new territory of the day was credential attacks — techniques aimed squarely at the authentication layer. **Brute force** tries every possible combination against one account, pure exhaustive search. **Dictionary attacks** narrow that search to a curated list of likely passwords, exploiting the fact that human-chosen passwords cluster around predictable patterns. **Credential stuffing** is a different animal: it reuses real username/password pairs leaked from one breach against an entirely unrelated service, betting purely on the very common habit of reusing passwords across sites — it isn't guessing anything, it's exploiting memory and convenience. **Password spraying** inverts brute force's shape: instead of many passwords against one account, it's one common password against many accounts, specifically to stay under the per-account failed-login threshold that triggers lockouts — spreading the attempts wide instead of piling them deep keeps every individual account's failure count low enough to avoid tripping the alarm.

Rounding out the day, Multi-Factor Authentication (MFA) and Single Sign-On (SSO) got a brief but important treatment. MFA requires two or more of: something you know, something you have, something you are — and it defeats credential stuffing and brute force outright, since a correct password alone is no longer sufficient. SSO trades convenience for concentration of risk: one authentication event unlocks many downstream services, which means one compromised SSO credential becomes a skeleton key across everything connected to it. That tradeoff is exactly why MFA matters even more at the SSO layer than anywhere else — it's protecting the blast radius of every app behind it at once, not just one login.

## Hands-on lab recap — SIMULATED

This was a pure concept session: no Docker lab, no local exercise, no commands run. **SIMULATED** in the sense that the course's own labeling convention uses it for days with no infrastructure built — everything here was verbal/conceptual, covering authentication vs. authorization, vertical vs. horizontal privilege escalation, the four credential-attack patterns, and the MFA/SSO tradeoff through scenario-based reasoning rather than a built system. `progress.md` flags the next session as the natural point to go hands-on with a real credential-attack lab (brute force or password spraying against a throwaway login form), which this chapter's closing paragraph sets up as a forward reference.

## Review questions

1. A session cookie proves a request came from a logged-in user, but the server never checks whether that user owns the resource being requested. Is the resulting vulnerability a failure of authentication, authorization, or both?
2. Name the two types of privilege escalation and give a one-line example of each.
3. Why does password spraying tend to evade the account-lockout defenses that stop brute force?

### Answers

1. Authorization. The server correctly establishes who the user is (authentication works fine) but never evaluates whether that specific user is permitted to access the specific resource being requested — the missing check is squarely in the authorization layer.
2. Vertical privilege escalation is a tier change — for example, a misconfigured cron job running as root that lets an attacker's injected command execute with root privileges, lifting them from a regular user to root. Horizontal privilege escalation keeps the tier the same but changes the target — for example, guessing another user's predictable password-reset token to take over their account while remaining at the same regular-user privilege level.
3. Brute force concentrates many password guesses against a single account, which trips that account's failed-login lockout threshold quickly. Password spraying spreads a single, commonly used password across many different accounts instead, so each individual account only sees one attempt — never enough to cross its own lockout threshold — even though the attacker is making thousands of attempts across the system as a whole.

## Operational takeaway

> When classifying a privilege escalation, ask "did the tier change, or did the target change?" — tier change is vertical, same tier with a different target is horizontal, and that one question resolves the label every time.

## Today in the broader Security Tutor journey

This chapter opens Phase 5 — Identity and Access Management — and functions as the connective tissue for everything Phase 4 already taught. Broken Access Control, IDOR, session fixation, and cookie theft were all, in hindsight, authorization failures and horizontal privilege escalations wearing the specific costumes of their respective vulnerability classes; Chapter 6's cron-job lab was vertical privilege escalation long before that term was formally introduced here. Having now named the underlying categories, the next sessions push Phase 5 toward the hands-on: a real credential-attack lab against a throwaway login form, a revisit of the Day 6 cron-privesc lab to re-anchor vertical privilege escalation with real infrastructure again, and eventually the formal AAA (Authentication, Authorization, Accounting) framing plus a look at how SSO protocols like SAML and OAuth/OIDC actually implement the trust relationship described here only conceptually.
