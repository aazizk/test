# Day 10 — Vulnerability Assessment: CVSS Scoring, Scanner Mechanics, and Why "Patched" Banners Lie

## LinkedIn

Ran `nikto` against my own nginx container today and learned something that changes how I'll read every vuln scan from now on: the scanner doesn't understand your app. It's pattern-matching.

Day 10 of my cybersecurity training opened Phase 3 — Vulnerability Assessment. Three things stuck with me:

**Vulnerabilities aren't one thing.** They split into missing patches (vendor already fixed it, just update), misconfigurations (software's fine, setup isn't), and design flaws (works exactly as built, but the design itself is the problem — no patch fixes that one).

**CVSS scoring finally clicked.** A vector string like AV:N/PR:N/UI:N/C:H/I:H/A:H looks cryptic until you read it as "how many barriers does the attacker still face." Remote access, no privileges needed, no victim interaction, full impact — every removed barrier stacks toward Critical. I actually inverted the ranking on my first attempt, reading the letters without connecting them to that logic. Once I reframed it that way, it clicked immediately.

**The real lab made it concrete.** I spun up nginx in an isolated Docker container and ran nikto against it for real. It flagged two things: an ETag header leaking filesystem inode numbers, and a missing X-Frame-Options header. I had to actually triage them — is this worth reporting, or noise? The ETag issue turned out to be minor info disclosure (not the directory-traversal risk I initially guessed). The missing header was real: it's what prevents clickjacking, where an attacker hides your site in an invisible iframe and tricks you into clicking something you didn't mean to. Added the header, reloaded nginx, re-scanned, confirmed it was gone.

The bigger lesson underneath all of it: a scanner finding is a lead, not a verdict. Distros often patch vulnerabilities while leaving the version banner unchanged ("backporting") — so trusting the banner alone produces false positives. You verify the actual behavior, every time.

Phase 3 continues tomorrow with false negatives — the flip side of today's lesson.

#CyberSecurity #InfoSec #CVSS #VulnerabilityAssessment #LearningInPublic #CEH

## Twitter/X

Ran `nikto` against my own nginx container today 🔍

It flagged a missing X-Frame-Options header (real — enables clickjacking) and an ETag inode leak (minor noise).

Big lesson: a scanner finding is a lead, not a verdict. Always verify the actual behavior, not the banner.

#InfoSec #CVSS
