# Day 33 — Writing a Real Detection Rule (And Watching It Cry Wolf)

## LinkedIn

I built a real detection rule against live AWS CloudTrail data today. It fired 3 alerts.

All 3 were false alarms.

Day 33 of my cybersecurity training (Phase 7 — Detection): writing an actual correlation rule, not just talking about one.

The build, step by step:
→ Parse real CloudTrail events (gotcha: one field is JSON nested inside JSON — you parse it twice)
→ Group events by identity + source IP
→ Detect "bursts": 3+ calls from the same identity/IP within a 5-minute window

Ran it against 20 real events from a live account. It correctly found every burst of rapid API activity in the data. Problem: every single one turned out to be a legitimate automated tool — a cloud security scanner, a compliance bot, AWS's own autoscaler.

100% false-positive rate. And the rule wasn't broken — it did exactly what it was told to do. "Burst of calls" and "malicious burst of calls" are not the same thing, and no amount of clever time-window math closes that gap. You need an allowlist of known-good identities, plus a separate watchlist that can override it if one of those identities is ever compromised.

Here's the part that actually got me: in the closing review, I was asked whether this rule would catch a stolen credential used from a brand-new IP. My first answer was "no" — but the real answer depends on something subtle: whether your allowlist checks identity alone, or identity paired with IP, matching the same key your detection logic already groups by. Get that mismatched, and you silently recreate the exact blind spot the rule was supposed to close.

Lesson for today: your suppression logic has to be exactly as specific as your detection logic.

#CyberSecurity #DetectionEngineering #CloudSecurity #AWS #SIEM #LearningInPublic

## Twitter/X

Built a real detection rule against live AWS CloudTrail data today.

It fired 3 alerts. All 3 were legit automated tools, zero real threats.

The rule wasn't broken — it just proved "weird" ≠ "malicious." That's the whole game in detection engineering.

#InfoSec #CloudSecurity
