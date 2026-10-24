# Day 12 — Closing out vulnerability assessment: scoping, credentialed scanning, and report aggregation

## LinkedIn

"We work for the same company" is not authorization to scan a server.

That was the core lesson in today's cybersecurity training session, which wrapped up the vulnerability assessment phase of my CEH-track self-study.

A few things that stuck with me:

Ownership = implicit consent. If you don't own the system, you need explicit written sign-off before scanning it — even internally. I used my own company's practice as the real-world check: our infosec team can't scan a team's infrastructure without notifying that team first, even though tools like CrowdStrike and Splunk are already running continuously under a standing agreement. Same company, different authorization boundary.

We also drew a hard line between credentialed and uncredentialed scanning. A credentialed scan found way more issues than an uncredentialed one on the same host in an earlier lab — but that doesn't mean the uncredentialed scan "failed." It answered a different question: what can an anonymous external attacker actually see? You need both views for a complete risk picture, not one replacing the other.

The best correction of the day: I argued that a missing X-Frame-Options header let an attacker directly read other users' data. Wrong mechanism — that's what IDOR (Insecure Direct Object Reference) does. Missing X-Frame-Options instead enables clickjacking: tricking a logged-in user into unknowingly clicking something real on the actual site, hidden inside an invisible iframe. Different risk entirely — integrity/unauthorized action, not confidentiality.

Vulnerability Assessment is now a closed chapter. Next up: Web Security and the OWASP Top 10.

#CyberSecurity #CEH #InfoSec #LearningInPublic #VulnerabilityManagement #AppSec

## Twitter/X

Day 12 of my cybersecurity self-study: learned why "same company" ≠ "authorized to scan."

Also got corrected on clickjacking — missing X-Frame-Options doesn't leak data like IDOR does, it tricks a logged-in user into clicking something real on the actual site.

Vuln assessment phase: done. Web security next. 🔐

#CEH #InfoSec
