# Day 22 — Dictionary Attacks, Exponential Backoff, and the Password Spraying Blind Spot

## LinkedIn

A password with uppercase, lowercase, a number, and a symbol got cracked in 6 guesses. Under 1 second.

Day 22 of my cybersecurity training (CEH-track, Phase 5: Identity & Access Management) was hands-on: I built a real login form in Docker, deliberately set its password to "Summer2024!" — technically "strong" by complexity-rule standards — and ran a real dictionary attack against it from a second container on an isolated network. 5 common passwords failed instantly, the 6th matched. Complexity rules don't stop pattern-based guessing; predictability does.

Then I fixed it with exponential backoff: each failed login for a username doubles the delay before the next response (1s, 2s, 4s... up to 16s). Re-ran the identical attack, timed it — 31.7 seconds instead of instant. Same password, same attacker, orders of magnitude slower. A 10,000-word real dictionary attack goes from feasible to impractical.

But the defense has a blind spot, and finding it was the best part of the session. The backoff tracks failures per *username*. So what happens if an attacker flips the attack around — one password, tried across a thousand different usernames, instead of a thousand passwords against one username? Every account only ever sees a single attempt. Nothing ever crosses its own threshold. That's password spraying, and it walks straight past a per-account defense.

Lesson for anything I build or review going forward: a defense that only watches one account at a time will always miss an attacker who spreads guesses thin across many. Detecting that requires looking at login attempts in aggregate, not account-by-account.

#CyberSecurity #CEH #InfoSec #CredentialAttacks #AppSec #LearningInPublic

## Twitter/X

Cracked my own login form with a 10-word dictionary attack in Docker today. Password had upper/lower/digit/symbol — still fell in 6 guesses, <1s.

Added exponential backoff → same attack now takes 31.7s. 🔐

But it's blind to password spraying. Per-account defenses always are.

#InfoSec #CEH
