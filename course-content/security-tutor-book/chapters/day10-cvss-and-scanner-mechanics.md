---
day: 10
title: "Chapter 10: CVSS Scoring, Scanner Mechanics, and Why Patched Banners Lie"
course_phase: "Phase 3 — Vulnerability Assessment"
status: draft, good source fidelity
source: "day-10/video-writeup.md, day-10/social-media-post.md"
has_diagram: false
---

# Chapter 10: CVSS Scoring, Scanner Mechanics, and Why Patched Banners Lie

## Learning objectives

By the end of this chapter, you will be able to:
- Classify a vulnerability as a missing patch, a misconfiguration, or a design flaw, and explain why the fix differs for each.
- Read a CVSS vector string by counting attacker barriers, not just memorizing letters.
- Explain mechanically how scanners like nikto, Nessus, and OpenVAS actually find things.
- Triage a real scanner finding into "reportable" versus "informational noise."

## The concept

This chapter opens Phase 3 with an idea that reframes everything that follows: "vulnerability" isn't one category of thing — there are three, and they need three different fixes.

A **missing patch** is the easy case: a known, published vulnerability with a vendor-shipped fix already available, just not yet applied. Find the version, check it against a CVE database, update. A **misconfiguration** is different — the software is fully up to date with no known bugs, but it's set up insecurely: directory listing left on, default credentials never changed, debug mode exposed to the internet. This is what most of Phase 2's recon and enumeration work was actually surfacing — not bugs, bad setup. A **design flaw** is the trickiest: the software works exactly as it was built to work, and the design itself is the problem — a password-reset flow that accidentally confirms whether an email exists, a predictable session token by design. There's no patch for this; it needs a redesign. Mixing these three up in a report wastes everyone's time, because "fixing it" means something entirely different in each case: an update, a settings change, or a redesign conversation with engineering.

Every vulnerability gets scored 0–10 with **CVSS**, the Common Vulnerability Scoring System, built from a vector string that looks intimidating at first — something like `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`. The way to actually read it: `AV` is attack vector (`N` = network, attacker can be anywhere); `AC` is attack complexity (`L` = low, easy to pull off); `PR` is privileges required (`N` = none, no account needed first); `UI` is user interaction (`N` = none, no victim has to click anything); `C`/`I`/`A` are confidentiality, integrity, and availability impact. The mental model that makes this click: every field that reads "none" or "low" is a barrier the attacker *doesn't* have to clear — network instead of local, no privileges instead of needing an account, no user interaction instead of needing a click. Fewer barriers plus high impact across the board isn't a medium finding — that's Critical. That's the shape of something like Log4Shell, which scored a perfect 10.

So where do scanner findings actually come from? Tools like nikto, Nessus, and OpenVAS aren't intelligent in the way people assume. They do three mechanical things: fingerprint a server's version banner and check it against a database of known CVEs for that version; probe a long list of commonly dangerous paths — admin panels, exposed `.git` folders, default config files — and see what responds; and check headers/configuration against known-good baselines. None of that involves the tool understanding your application's logic. It's pattern matching against a signature list, and that single fact explains almost every false positive a scanner produces.

Running nikto against a real, isolated nginx container demonstrates this directly, producing two findings. First, the server leaks inode numbers through its `ETag` header — normally just a caching identifier, but nginx's default format happens to bake in a file's inode number and exact size. The instinctive reaction, "this could let someone traverse the filesystem," is wrong: an inode number is just an internal serial number, and knowing it doesn't grant access to anything you couldn't already request over HTTP. The real, much smaller risk is that in a clustered setup, differing inode-based ETags across backend servers can fingerprint which server answered a request — real, but minor, an informational note rather than a headline finding. Second, the anti-clickjacking `X-Frame-Options` header is missing — a genuinely different story, since that header exists specifically to stop clickjacking (an attacker embedding your site in an invisible iframe, overlaying a decoy button, and tricking a logged-in user into clicking something on your real site without realizing it). That's a real, demonstrable attack with a direct fix, and it belongs in the report.

Adding the header and re-scanning makes the clickjacking warning disappear — but the scanner now reports the header as merely "uncommon," not as "good." It never understood *why* the fix mattered; it just has a rule for "missing" and a separate generic rule for "present but unrecognized." The tool doesn't know; the analyst verifying it does.

## Hands-on lab recap — REAL LAB

This was a real lab: a plain nginx container on an isolated Docker network, bound only to localhost, scanned for real with nikto. The two findings above — ETag inode disclosure and missing `X-Frame-Options` — came from real scanner output against real server configuration, not illustrative examples. The `X-Frame-Options` fix was applied for real (`add_header X-Frame-Options SAMEORIGIN always;`), nginx was reloaded for real, and the scan was re-run for real, confirming the clickjacking warning cleared while the scanner's description of the now-present header shifted to "uncommon" rather than any explicit approval.

Two mistakes are worth flagging honestly from this session. First, on a CVSS-ranking drill, the "easiest to exploit, worst impact" vector was initially ranked as *lowest* severity — a result of reading the letters without connecting them to "how many barriers does the attacker face." Reframing around barrier-counting fixed every subsequent ranking. Second, on verifying a Heartbleed-class vulnerability, the first instinct was to check whether port 80 was open — but Heartbleed is a TLS bug, living on HTTPS, not plain HTTP. The actual fix is to test real behavior directly (a tool like `testssl.sh` or nmap's `ssl-heartbleed` script) rather than trusting a version banner, since distributions often backport a patch while leaving the version string unchanged — meaning the banner alone can't prove the fix either way.

## Review questions

1. A scanner flags an outdated OpenSSL version vulnerable to Heartbleed — what's the one thing you have to check before reporting that as real?
2. Rank these three CVSS vectors by severity: `AV:N/PR:N/UI:N`, `AV:L/PR:H/UI:R`, `AV:N/PR:L/UI:N`.
3. What's the actual difference in how you'd fix a missing-patch vulnerability versus a misconfiguration?

### Answers

1. Whether the vulnerability is actually still present in real behavior — version banners can be stale even after a vendor backports a fix, so you need to test the real TLS behavior directly (e.g. `testssl.sh`, nmap's `ssl-heartbleed` script) rather than trusting the reported version string alone.
2. `AV:N/PR:N/UI:N` is most severe (network-reachable, no privileges, no user interaction — the fewest barriers); `AV:N/PR:L/UI:N` is next (network-reachable but requires some privileges); `AV:L/PR:H/UI:R` is least severe (requires local access, high privileges, and user interaction — the most barriers).
3. A missing-patch fix is an update/version bump. A misconfiguration fix is a settings change to how the already-current software is deployed — no update required, just reconfiguration.

## Operational takeaway

> A scanner's output is a lead, not a verdict — always verify the actual behavior before you act on it or report it.

## Today in the broader CEH journey

This chapter opens Phase 3 — Vulnerability Assessment, converting Phase 2's "candidates, not verdicts" discipline into a formal scoring and triage framework. Chapter 11 covers the mirror-image problem — false negatives, where a clean scan hides something real — using the same real-lab-and-fix pattern established here.
