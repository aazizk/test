# Day 13 — SQL Injection: a real login bypass, built and exploited by hand

## LinkedIn

I just logged into an admin account without knowing its password. On infrastructure I built myself, to learn exactly how this attack works.

Today's cybersecurity training session started Phase 4 (Web Security / OWASP Top 10) with SQL injection — and instead of just reading about it, I built a real vulnerable Flask + SQLite login app in an isolated Docker container and exploited it myself.

The core bug: the app built SQL queries by directly pasting user input into the query string. That meant a username field could carry its own SQL logic. With the payload `' OR '1'='1' --`, I could log in as any user. With `admin' --`, I could target a specific account and pull its secret data — using a completely different account's password.

The best part of the session wasn't the exploit, though — it was a mistake. I initially proposed a payload without a SQL comment marker, and caught myself (with help) on operator precedence: AND binds tighter than OR in SQL, so my first version wouldn't actually have worked against a two-condition WHERE clause. That one detail is exactly the kind of thing that separates "I memorized a payload" from "I understand why it works."

Then came the fix: parameterized queries, which separate SQL structure from user data at the database driver level, so no input — no matter what it contains — can be interpreted as code.

Exploit, then fix, then re-verify it's actually closed. That's the whole point of hands-on security training.

#CyberSecurity #CEH #SQLInjection #InfoSec #LearningInPublic #AppSec

## Twitter/X

Today I SQL-injected my way into an admin account I had zero credentials for.

Payload: admin' --

It comments out the password check entirely. No password needed.

Built the vulnerable app myself, exploited it, then fixed it with parameterized queries and re-verified. 🔓

#CEH #InfoSec
