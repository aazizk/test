# Day 05 — Linux Fundamentals Part 2: why your password hash and your username live in two different files

## LinkedIn

Why does Linux split user information across two separate files instead of keeping it in one place? Today's lesson on `/etc/passwd` and `/etc/shadow` gave me the actual answer.

`/etc/passwd` is world-readable by design — every user on the system needs to see usernames, UIDs, home directories, and login shells just for normal things to work. But it used to also store password hashes, which meant anyone on the box could grab those hashes and start cracking them offline.

The fix: split it. `/etc/passwd` stays world-readable and keeps the metadata. `/etc/shadow` holds the actual password hashes, and it's locked down so only privileged processes can read it. Same information architecture problem every security system eventually runs into — separate what needs to be visible from what needs to be protected.

Also covered today:
→ UID ranges — root is always 0, system accounts are typically under 1000, real human accounts start at 1000+.
→ The `nologin` shell as a deliberate way to block interactive login for an account without deleting it (common for service accounts).
→ `/etc/group` and the difference between a primary group and supplementary group membership.
→ The fact that every running process runs as a specific user and inherits that user's exact privilege boundary — nothing more.

Everything today was first-try correct, which felt good, but more importantly it's the kind of detail that explains real misconfigurations I'll be hunting for later in this course.

#CyberSecurity #Linux #LearningInPublic #InfoSec #SysAdmin

## Twitter/X

Day 5: why are usernames in `/etc/passwd` (world-readable) but password hashes in `/etc/shadow` (locked down)? Because one needs to be visible system-wide and the other absolutely cannot be. Separation of concerns, security edition. 🔐

#CyberSecurity #Linux
