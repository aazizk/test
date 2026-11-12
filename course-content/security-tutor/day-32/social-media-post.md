# Day 32 — SIEM Pipeline, Real Correlation, and Alert Triage

## LinkedIn

Three real API calls from my own AWS account today: `GetAccountPasswordPolicy`, `ListAccountAliases`, `GetAccountProperties`. Same IP. Same second. Could be a security scanner doing its job. Could be an attacker who just stole a credential, checking what they've got.

Day 32 of my cybersecurity course went deep into how detection actually works. First, the SIEM pipeline: collection, normalization, correlation, alerting — in that order. The part I underestimated was normalization: if two log sources call the same field `sourceIPAddress` and `remote_addr`, a correlation rule comparing literal field names will silently fail to match them, even when the IP value is identical. That's a real attack going undetected, not from confusion, but from a quiet structural gap.

Then the hands-on part got real: I pulled 20 genuine IAM-related events from my own live AWS account and found an actual correlation cluster in the messy, unscripted data — three calls, same identity, same second, from a role named `WizAccess-Role`.

My first instinct was to flag it because "checking password policy sounds sensitive." Wrong lens. `WizAccess-Role` is a known cloud security scanning tool doing exactly what it's supposed to do. But here's the real lesson: those exact same calls are also textbook attacker reconnaissance. The API calls themselves don't tell you anything — the only real differentiator is whether the identity performing them is known, expected, and behaving within its normal baseline.

Check who before you judge how sensitive the action sounds. That's today's rule, and it applies well beyond cloud security logs.

#CyberSecurity #CloudSecurity #AWS #SIEM #DetectionEngineering #CEH #LearningInPublic

## Twitter/X

Pulled real CloudTrail data from my own AWS account and found a cluster: 3 identical API calls, same IP, same second. Turned out to be a legit security scanner — but the SAME calls are also textbook attacker recon. Lesson: check WHO, not just WHAT. Day 32 of my security course. 🔍

#AWS #CyberSecurity #CEH
