# Day 23 — Password Spraying: How Attackers Beat Lockout Policies

## LinkedIn

I compromised 2 out of 10 employee accounts in under a second — against a system with lockout protection already in place.

Day 23 of my security training (CEH-track, hands-on): password spraying.

Two sessions ago I built a Flask login app with exponential backoff — guess a password wrong a few times on one account, and the system makes you wait longer each time. Solid defense against brute force.

Today I attacked it differently. Instead of many passwords against one account, I tried 3 common passwords across 10 different usernames. Each account only ever saw ONE failed attempt — never enough to trigger the lockout. Two accounts (which happened to reuse a common password, just like real breach data shows people actually do) fell instantly.

Then I measured it precisely: the defended accounts cost the attack an extra 24 seconds of delay (predicted) vs. 26.69 seconds (measured) — math checked out. But that friction landed on the wrong accounts. The ones that mattered were never touched.

The fix: stop keying the defense by username, and key it by source IP instead. Same exponential backoff code, one line changed — and a 30-request attack that took under a second now takes an estimated 5-6 minutes. Real tradeoff I had to reason through: this breaks down behind corporate NATs where many employees share one IP, and a well-funded attacker just routes around it with a pool of IPs.

Built and ran all of this in isolated Docker containers — real exploit, real fix, real re-verification, not just theory.

Takeaway: a rate-limiting defense is only as good as what it counts. Always ask what the attacker controls before deciding what to throttle by.

#CyberSecurity #CEH #InfoSec #AppSec #PasswordSecurity #LearningInPublic

## Twitter/X

Built a login system with exponential backoff lockout. Then beat it in <1 second — not by brute-forcing, but by spraying 3 common passwords across 10 accounts instead.

2/10 compromised instantly. The defense never even noticed.

Real Docker lab, Day 23 of my security training 🔐

#CEH #InfoSec
