# Day 26 — Real Cron Privilege Escalation: From uid 1000 to Root

## LinkedIn

I logged into a Linux box as a nobody account — uid 1000, zero special rights. About a minute later I had a full root shell and could read `/etc/shadow`.

No exploit code. No memory corruption. Nothing clever. Just one file with the wrong permission bit.

Day 26 of my hands-on cybersecurity training (capstone lab for Phase 5 — Identity and Access Management): I built a real two-container Docker lab — a target running cron as root, and an attacker container with a netcat listener — on a fully isolated network. The target had a classic misconfiguration: a root-owned script, scheduled by cron to run every minute as root, but set to `777` permissions — writable by literally anyone on the box.

As the low-privilege user, I appended a one-line reverse shell payload to that script. Sixty seconds later, cron ran it as root, and I had a live shell on the attacker's listener — `uid=0(root)`, reading password hashes.

Then I fixed it properly: `chmod 644` on the script, and proved — not just claimed — that the exploit no longer worked by trying to replant the payload and getting `Permission denied`.

The best part of the session wasn't the exploit, though. Mid-lab I asked: if that payload is still sitting in the script, won't cron just keep running it and get flagged somewhere? That question led into a real discussion of persistence versus detection noise — a preview of the Detection phase still ahead in this course.

Biggest lesson: the vulnerability was never cron. Cron did exactly what it was told. The vulnerability was that a low-privilege account could rewrite a file root blindly trusted. Always check who can *write* to a file before trusting who's allowed to *run* it.

Phase 5 is now fully done — authentication, authorization, credential attacks, SSO, and now privilege escalation, all taught hands-on. Phase 6, Cloud Security, starts next.

#CyberSecurity #LinuxSecurity #PrivilegeEscalation #InfoSec #CEH #LearningInPublic

## Twitter/X

Logged in as a nobody account (uid 1000). 60 seconds later: full root shell, reading /etc/shadow. 🔓

The exploit wasn't clever — one script had `chmod 777` and cron ran it as root every minute. That's the whole attack.

Fixed it with one `chmod 644`, then proved the fix held.

#InfoSec #Linux #CEH
