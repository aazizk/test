# Day 06 — Linux Fundamentals Part 3: how a misconfigured cron job becomes root access

## LinkedIn

A world-writable script that runs as root on a schedule is one of the most common privilege escalation paths in real Linux systems — and today I worked through exactly why.

Day 6, the final Linux day of my cybersecurity training, covered cron: the 5-field time syntax plus command, reading schedules correctly (including trickier ones like `0 0 1 * *` for "once a month"), and then the actual attack chain.

Here's the logic, hands-on: if a cron job runs as root, and the script it executes is writable by any user, any user can edit that script to run whatever they want — and the next time cron fires, their code executes with full root privilege. No exploit needed, no vulnerability in any traditional sense. Just a permission mistake meeting a scheduler that doesn't ask questions. I was able to articulate that full chain myself before it was explained to me, which was a good sign the mental model had actually landed.

Also covered: why `apt`/`yum` installs are safer than `dpkg -i` or manually dropped binaries — package managers verify GPG signatures against trusted repository keys, manual installs don't verify anything by default. And log sources: `/var/log/auth.log` for authentication events, `/var/log/syslog` for general system activity, and how a repeated-failure-then-success pattern from the same IP in auth logs is exactly the signal that feeds brute-force alerting and tools like fail2ban.

That closes out the Linux fundamentals phase. HTTP is next.

#CyberSecurity #Linux #PrivilegeEscalation #LearningInPublic #InfoSec

## Twitter/X

Day 6: a world-writable script + a cron job running it as root = instant privilege escalation. No exploit, just a permission mistake meeting a scheduler. Worked through the full attack chain today. 🔓

#CyberSecurity #Linux
