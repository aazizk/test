---
day: 12
title: "Chapter 12: Scoping, Authorization, and Turning Scan Output Into a Report"
course_phase: "Phase 3 — Vulnerability Assessment"
status: draft, good source fidelity
source: "day-12/video-writeup.md, day-12/social-media-post.md"
has_diagram: false
---

# Chapter 12: Scoping, Authorization, and Turning Scan Output Into a Report

## Learning objectives

By the end of this chapter, you will be able to:
- Explain why "my company owns this server" is not the same as "I'm authorized to scan it."
- List the three things a scoping/authorization document needs before a scan begins.
- Explain the difference between authorization and containment.
- Explain why credentialed and uncredentialed scans answer different questions rather than one replacing the other.
- Correctly distinguish clickjacking (an integrity problem) from IDOR (a confidentiality problem).

## The concept

This chapter closes out Phase 3 with a question that trips up people inside security teams, not just outsiders: if your company owns a server, and you work in security at that company, are you automatically allowed to scan it? The answer is no, and the reasoning changes how you think about authorization entirely: **authorization comes from ownership and explicit consent, not from being employed by the same entity that technically owns the hardware.** Even within one company, a security team typically can't scan another team's infrastructure without notifying that team first and getting sign-off — true even when passive monitoring tools are already running continuously, because that access was explicitly authorized and scoped in advance. Same company, different authorization boundary.

A proper **scoping document** formalizes exactly that boundary for a one-off engagement, and needs three things: the exact **targets** in scope (specific IP ranges or hostnames, not "the whole network"), the allowed **techniques** (passive observation only, active scanning, or full exploitation attempts), and a **time window**, often with an emergency contact in case something breaks. Skipping this isn't a compliance formality — scanning a system without authorization, even one owned by your own company, can trigger security alerts, cause outages on fragile systems, and, for systems you don't own at all, can be a literal crime under laws like the Computer Fraud and Abuse Act.

A subtlety worth separating cleanly: **authorization** and **containment** are two different questions. Authorization asks "do I have the right to test this target?" Containment asks "if something goes wrong, how far does the damage spread?" A home lab built on isolated Docker containers has both — ownership, plus network isolation as a cushion. A real pentest engagement typically only has the first: a signed contract granting the right to test a live production system, but no isolation cushioning the blast radius if something goes sideways.

The second concept of the chapter builds directly on Chapter 11's real IDOR lab. Running an unauthenticated scan against that same vulnerable app found only two trivial header issues and completely missed the IDOR bug. That's the practical difference between **uncredentialed** scanning (no login — exactly what a random, anonymous internet attacker would see) and **credentialed** scanning (handed valid login credentials, so it can check patch levels through local package data, authenticated endpoints, and internal configuration an anonymous attacker couldn't reach). A credentialed scan finding fifty issues where an uncredentialed scan on the same host finds five doesn't mean the uncredentialed scan did a bad job — it did exactly its job, reporting what's visible with zero access. The two scan types answer two different threat models — external attacker versus full internal visibility — and a mature security program runs both, since relying on just one creates a false sense of security about the gap you can't see.

The last piece: what happens after a scan finishes. Raw scanner output — hundreds of lines of banner grabs and CVE IDs — isn't useful to anyone who has to act on it. It gets turned into a report through **de-duplication** (one real vulnerability can trigger multiple overlapping scanner signatures), **severity ranking** using CVSS scores, **false-positive triage** (confirming or dismissing findings with real evidence), **remediation guidance** (not just naming the bug, but explaining the fix), and **business context** (a critical score on an internet-facing production server is a very different priority than the same score on an isolated internal test box).

The mistake worth flagging from this chapter is a genuinely easy trap: from an earlier lab, two issues were found on a test server — a missing `X-Frame-Options` header, and a minor `ETag`/inode-disclosure issue (both from Chapter 10). `X-Frame-Options` was correctly ranked as the higher-severity finding — but the stated reason was wrong: it was explained as letting an attacker "directly read other users' confidential data," which actually describes IDOR, not what a missing `X-Frame-Options` header does. What it actually enables is **clickjacking**: embedding a site inside an invisible iframe, then tricking a logged-in user into clicking what looks like an innocent button while actually clicking a real button on the real site underneath — think "delete my account," hidden under something that looks like "claim your prize." The distinction matters precisely: IDOR is a **confidentiality** problem (an attacker directly reading data they shouldn't see); clickjacking is an **integrity** problem (tricking a legitimate user's own session into performing an unintended action). Same severity ranking, completely different mechanism — and mixing those up is exactly the kind of thing that costs precision on something like the CEH exam, where exact terminology matters.

## Hands-on lab recap — SIMULATED

This session had no new lab of its own — it was a methodology and discussion day that directly reused and reasoned about Chapter 11's real IDOR lab and Chapter 10's real nikto findings rather than building new infrastructure. The scoping/authorization reasoning, the credentialed-vs-uncredentialed comparison, and the clickjacking-vs-IDOR correction were all worked through as review and synthesis of labs already run for real in prior chapters.

## Review questions

1. Your company's DevOps team owns a payments API server. You're on the security team and want to scan it. What's the minimum thing you need before doing that, and why doesn't "we work for the same company" satisfy it?
2. A credentialed scan finds way more issues than an uncredentialed scan on the same server. Does that mean credentialed scanning should always replace uncredentialed scanning going forward?
3. What three things are typically required in a scoping and authorization document before a scan begins?

### Answers

1. Explicit authorization/sign-off from the system's owner (the DevOps team), typically formalized in a scoping document — shared employment doesn't grant consent; only the actual owner's explicit authorization does.
2. No — the two scan types answer different threat models (external anonymous attacker vs. full internal visibility). A mature program runs both, since each one alone leaves a blind spot the other covers.
3. The exact targets in scope, the allowed techniques, and a time window (often with an emergency contact).

## Operational takeaway

> Authorization is about who owns the system and who explicitly granted consent, not about who happens to work at the same company — get a real scope document before scanning anything you don't personally own, even internally.

## Today in the broader CEH journey

This chapter closes Phase 3 — Vulnerability Assessment entirely: scoring, scanner mechanics, false positives, false negatives, and now scoping and reporting are all covered. Chapter 13 opens Phase 4 — Web Security and the OWASP Top 10, starting with a direct callback to the IDOR bug from Chapter 11, now given its formal industry name.
