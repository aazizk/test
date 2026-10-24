---
day: 05
title: "Chapter 5: passwd, shadow, and the User Behind Every Process"
course_phase: "Phase 1 — Foundations: Linux"
status: draft, good source fidelity
source: "day-05/video-writeup.md, day-05/social-media-post.md"
has_diagram: false
---

# Chapter 5: passwd, shadow, and the User Behind Every Process

## Learning objectives

By the end of this chapter, you will be able to:
- Describe the structure of an `/etc/passwd` entry and explain why that file is world-readable.
- Use UID ranges to distinguish system/service accounts from human accounts at a glance.
- Explain why password hashes live in `/etc/shadow` instead of `/etc/passwd`.
- Explain why the user a process runs as defines the ceiling of what an attacker gains if that process is compromised.

## The concept

Why does Linux keep your username in a file anyone can read, but your password hash in a completely different file almost nobody can? That's not an accident or redundancy — it's a deliberate design decision, and this chapter works through exactly why it exists.

Every user account has an entry in `/etc/passwd`, following a fixed structure: username, a placeholder where the password used to live, the user ID (UID), the group ID (GID), a comment field, the home directory, and the login shell. That file is world-readable *by design* — plenty of normal system operations need to look up basic account information, like mapping a UID to a username, and that lookup has to work for every user on the box, not just root.

The UID field alone tells you a lot once you know the convention. UID `0` is always root, no exceptions. UIDs below 1000 are typically reserved for system and service accounts — the accounts that run background daemons, not real people. UIDs 1000 and above are generally real human accounts. That range alone is often the fastest way to scan a system and separate "accounts that exist to run services" from "accounts that exist for a person to log in."

The shell field matters too, specifically the `nologin` shell. A service account doesn't need to log in interactively — it just needs to exist so a process can run as it. Setting its shell to `nologin` means that if someone tries to log in as that account, the system refuses, without having to delete or disable the account entirely. It's a clean way to say "this account exists for a purpose, but that purpose isn't interactive login."

That brings us to the core of this chapter: **why password hashes live in `/etc/shadow`, not `/etc/passwd`**. Password hashes used to live directly in `/etc/passwd`, but since that file is world-readable, any user — or any process running as any user — could read every password hash on the box and take them elsewhere to crack offline. The fix: split the file in two. `/etc/passwd` keeps all the metadata that legitimately needs to be world-readable; `/etc/shadow` holds the actual password hashes, locked down so only privileged access can read it. This is a pattern worth remembering because it recurs constantly in security: separate what needs to be visible from what needs to be protected, and give each the permissions that match.

The last piece ties groups to process privilege. `/etc/group` distinguishes a **primary group** — the one group every user is assigned by default — from **supplementary groups**, additional groups a user can belong to for extra access without changing their primary identity. And every running process runs as a specific user, inheriting exactly that user's privilege boundary, no more and no less. The `USER` column in `ps aux` output tells you exactly what privilege level a given process is actually operating at — which matters enormously if that process is ever compromised, because whatever it can legitimately do, an attacker who hijacks it can also do.

## Hands-on lab recap — SIMULATED

This session worked through example `/etc/passwd` lines, UID ranges, and sample `ps aux` output by reasoning rather than building a live multi-user system. A permission-reasoning exercise applying `rwxr--r--`-style logic to a specific "other" user was also worked through by hand. No container or live system was stood up for this day — Chapter 6 is where this user/privilege model gets weaponized into a real, built privilege-escalation lab.

## Review questions

1. Why can't password hashes just stay in `/etc/passwd` if the system still enforces permissions correctly elsewhere?
2. What's the practical difference between a primary group and a supplementary group?
3. If you see a process in `ps aux` running as UID 0, what does that immediately tell you about what that process can do if it's compromised?

### Answers

1. `/etc/passwd` has to remain world-readable for normal system lookups to work for every user. If password hashes stayed there, any user (or any process running as any user) could read every hash on the box and crack them offline — moving hashes to the root-only-readable `/etc/shadow` removes that exposure without breaking the lookups `/etc/passwd` needs to support.
2. A primary group is the one default group every user belongs to; a supplementary group is an additional group granting extra access without changing the user's primary identity.
3. It means that process is running with full root privileges — if an attacker compromises it, they inherit root's privilege ceiling, which is effectively unrestricted access to the system.

## Operational takeaway

> Whatever user a process runs as defines the absolute ceiling of what an attacker gains if that process is exploited — so knowing exactly what user is running what is one of the highest-value habits in security.

## Today in the broader CEH journey

The second of three Linux fundamentals chapters, this one sets up the exact mechanism Chapter 6 exploits: a root-owned scheduled task is really just "a process running as UID 0," and everything this chapter established about process privilege becomes the reason that misconfiguration is so dangerous.
