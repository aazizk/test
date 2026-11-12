# Day 29 — Cloud Misconfigurations: Security Groups & Exposed Secrets

## LinkedIn

Today's cybersecurity session gave me a number I didn't expect to question so hard: 8,101.

That's how many security groups came back when I audited a real AWS account for one specific risk — inbound rules open to the entire internet (0.0.0.0/0) on sensitive ports like SSH (22) and RDP (3389). My filter came back with zero matches. Across all 8,101.

Zero is a great result. It's also exactly the kind of result you should be suspicious of. So instead of celebrating, I cross-checked the finding with a completely different method — a dumb literal text search instead of a logic-based filter — to rule out a silent tooling bug before trusting the "all clear." Both methods agreed. That's the difference between a real clean audit and a false negative wearing a clean audit's clothes.

The other half of today was exposed secrets — specifically, why "I moved the API key to an environment variable instead of hardcoding it" is not the same as "it's secure now." An env var is still plaintext-readable by anyone with config access to that resource, often a bigger group than the people who had repo access in the first place. The real fix (a proper secrets manager) isn't about hiding the secret better — it's fine-grained access control, an audit trail of every retrieval, and automatic rotation.

That last point led to a genuinely good question I asked myself mid-session: if a secret rotates automatically, how does the actual downstream database find out its password changed? Turns out it's a coordinated four-step process where the rotation tool actually logs into the target system and changes the credential there too — not just in storage.

Takeaway for today: a scan that comes back "all clear" deserves a second, independent check before you trust it — a silent bug and a genuinely secure system look identical from one tool's output alone.

#CyberSecurity #CloudSecurity #AWS #CEH #LearningInPublic #InfoSec

## Twitter/X

Ran a real audit on a live AWS account today: 8,101 security groups checked for public SSH/RDP exposure.

Result: 0.

Didn't trust it. Cross-verified with a totally different method (grep vs jq) before believing it. Both agreed — genuinely clean.

Lesson: verify clean scans twice. 🔍

#CloudSecurity #AWS
