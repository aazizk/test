---
day: 09
title: "Chapter 9: Enumeration — Why Scanners Report Candidates, Not Verdicts"
course_phase: "Phase 2 — Reconnaissance Methodology"
status: draft, good source fidelity
source: "day-09/video-writeup.md, day-09/social-media-post.md"
has_diagram: false
---

# Chapter 9: Enumeration — Why Scanners Report Candidates, Not Verdicts

## Learning objectives

By the end of this chapter, you will be able to:
- Explain why status codes, not response size, are the reliable signal for "exists but blocked" versus "genuinely not there."
- Explain gobuster's default filtering behavior and why a `403` can be a more interesting finding than a `404`.
- Treat automated scanner output (including nmap's script engine) as candidates requiring manual confirmation, not verdicts.

## The concept

Enumeration is the step between finding a door and learning what's behind it. Recon (Chapter 8) tells you a port is open; enumeration tells you the details — versions, hidden paths, misconfigurations. This chapter finally nails down a mistake from Chapter 7: what `403` and `404` actually mean, this time proven against a real server with three deliberately different paths — one public, one that exists but is explicitly blocked (`403 Forbidden`), and the rest simply absent (`404 Not Found`).

Checking all three paths with `curl -I` initially looks unremarkable: `200`, `403`, `404`, as expected. But a closer look at the actual header values reveals the real lesson — the `403` response and the `404` response can have an **identical `Content-Length`**, because the server serves the same generic default error page for both. Same template, same byte count, completely different real-world meaning. If you judged "does this path exist" purely by response size, you would be unable to tell a protected resource apart from one that simply isn't there. The only reliable signal is the **status code line itself** — everything else about those two responses can be made to look identical on purpose, and often is, specifically to resist this kind of probing.

That insight maps directly onto a real attacker technique: **directory brute-forcing**. A tool like gobuster takes a wordlist of candidate path names and fires a request at the server for each one, logging what comes back. Running it against a small custom wordlist — including a path that's genuinely blocked (`403`) and several that don't exist (`404`) — produces a surprising result: only the blocked path shows up in the output at all. The nonexistent paths aren't even reported as "not found" — they're simply absent from the results. The reason is sitting in gobuster's own startup banner: by default, it treats `404` responses as noise and drops them entirely. It isn't hunting for "paths that exist" in some absolute sense — it's hunting for "anything that isn't the default negative response." That reframes the whole exercise: a `403` is actually a *more* interesting finding to an attacker than it might first appear, because it confirms something is there and that somebody specifically cared enough to lock it. People tend to name the things worth protecting after something sensitive — exactly where an attacker's attention goes first.

Rounding out enumeration, nmap's script engine (`-sC` combined with version detection) against the same server produces three results worth unpacking. `http-server-header` just confirms the version banner already seen. `http-title` extracts the page's `<title>` tag, genuinely useful since titles often leak an application's name (something like "WordPress Login" or "Jenkins Dashboard") — a blank result here is accurate, if unremarkable, when a test page has no `<title>` tag at all. The interesting one is `http-open-proxy`, flagged as "Proxy might be redirecting requests" — a **false positive**, since the server has no proxy configuration at all capable of acting that way. Nmap hedges its own language with "might be," which is the tool itself signaling it isn't confident.

The discipline this chapter is really building: automated tools — gobuster, nmap scripts, vulnerability scanners generally — surface *candidates*. They do not hand you *verdicts*. Before treating a flagged open-proxy result as real, the correct move is to go test it manually: actually try to use the server as a proxy to reach some other URL and see if it works. Every flagged result needs a human to go confirm it before it's worth acting on, let alone putting in a report — not a minor caveat, but the entire discipline Phase 3 is built around.

## Hands-on lab recap — REAL LAB

This was a real lab: a small nginx server in an isolated Docker container with three deliberately configured paths (public, explicitly `deny all`-blocked, and simply absent). Real `curl -I` requests confirmed the identical `Content-Length` between the `403` and `404` responses. A real `gobuster` scan, run against a small custom wordlist, demonstrated the tool's default 404-filtering behavior directly in its own output. A real `nmap -sC -sV` scan against the same server produced the three script-engine findings discussed above, including the confirmed false positive.

## Review questions

1. Why did gobuster report the `403` result but silently drop all the `404` results — what's the general principle behind why scanners treat those two codes so differently?
2. If two different paths return identical response body size, what's the one thing you should check instead to tell them apart?
3. nmap flagged a false positive in this lab's own server — what's the operational lesson for how you should treat any automated scanner output before you act on it?

### Answers

1. Gobuster (and many similar tools) default to treating `404` as the expected "nothing here" response and filter it out as noise, reporting only responses that differ from that baseline — such as a `403`, which confirms something exists and is deliberately protected.
2. The status code itself — it's the one part of the response that can't be made to look identical on purpose the way body size and generic error templates can.
3. Treat every automated finding as a candidate requiring manual verification, never as a confirmed fact — go test the actual behavior yourself before reporting or acting on it.

## Operational takeaway

> Automated tools report candidates, not verdicts — treat every flagged result as a question, not an answer, until you've confirmed it yourself.

## Today in the broader CEH journey

This chapter closes Phase 2 — Reconnaissance Methodology entirely: recon, scanning, and enumeration are now complete. Its closing lesson — that scanners surface candidates, not verdicts — is the exact discipline Phase 3 (Chapter 10 onward) is built around, starting with how vulnerability severity actually gets scored and why a scanner's "clean" report can still hide something real.
