# Day 05 — Linux Fundamentals Part 2: passwd, shadow, and process privilege — Video Script

**Estimated length:** ~11 minutes (~1500 words)

## Hook

Why does Linux keep your username in one file that literally anyone on the system can read, but your password hash in a completely different file that almost nobody can? That's not an accident, and it's not redundant — it's a deliberate security design decision, and today I learned exactly why it exists.

## Intro

This is Day 5 of my cybersecurity training, continuing the Linux fundamentals phase from Day 4's permissions lesson. Today goes one level deeper — into how Linux actually manages users, groups, and process privilege. By the end of this video, you'll understand the passwd-versus-shadow split, how user IDs signal what kind of account you're looking at, and why the user a process runs as matters just as much as the code that process is running.

## Teaching segment: /etc/passwd structure

Every user account on a Linux system has an entry in `/etc/passwd`, and that entry follows a fixed structure: username, a placeholder where the password used to live, the user ID, the group ID, a comment field, the home directory, and the login shell. That file is world-readable by design — lots of normal system operations need to look up basic account information, like mapping a UID to a username, and that has to work for every user on the box, not just root.

[SCREEN: a real /etc/passwd line broken into its seven colon-separated fields]

## Teaching segment: UID ranges

The user ID field tells you a lot on its own, once you know the convention. UID 0 is always root, no exceptions. UIDs below 1000 are typically reserved for system and service accounts — things like the accounts that run background daemons, not real people. UIDs 1000 and above are generally real human user accounts. That range alone is often the fastest way to scan a system and separate "accounts that exist to run services" from "accounts that exist for a person to log in."

## Teaching segment: the nologin shell

Then there's the shell field, and specifically the `nologin` shell. A service account doesn't need to log in interactively — it just needs to exist so a process can run as it. Setting its shell to `nologin` means that if someone tries to actually log in as that account, the system refuses, without having to delete the account or disable it entirely. It's a clean way to say "this account exists for a purpose, but that purpose isn't interactive login."

## Teaching segment: /etc/shadow — why passwords live somewhere else

This is the core of today's lesson. Password hashes used to live directly in `/etc/passwd`, but since that file is world-readable, that meant any user on the system — or any process running as any user — could read every password hash on the box and take them somewhere else to crack offline. The fix was to split the file in two: `/etc/passwd` keeps all the metadata that legitimately needs to be world-readable, and `/etc/shadow` holds the actual password hashes, locked down with permissions that only allow privileged access.

[SCREEN: side-by-side comparison — /etc/passwd permissions (world-readable) vs /etc/shadow permissions (root-only)]

This is a pattern that shows up constantly in security: separate what needs to be visible from what needs to be protected, and put each in a place with permissions that match.

## Teaching segment: groups and process privilege

I also covered `/etc/group`, and the distinction between a primary group — the one group every user is assigned by default — and supplementary groups, additional groups a user can belong to for extra access without changing their primary identity. And then I connected that to something that matters a lot in security: every running process runs as a specific user, and inherits exactly that user's privilege boundary, no more and no less. Looking at the USER column in `ps aux` output tells you exactly what privilege level a given process is actually operating at — which matters enormously if that process ever gets compromised, because whatever it can legitimately do, an attacker who hijacks it can also do.

[SCREEN: ps aux output with the USER column highlighted across several processes]

## Mistake/correction moment

I didn't have a wrong answer today — everything, including a permission-reasoning exercise applying `rwxr--r--`-style logic to a specific "other" user, landed correctly on the first try. If there's a correction worth making here, it's less about a mistake and more about a habit to build: don't just check "does this user have access," check "what is this user's actual group membership and UID range," because that context is what tells you whether access that technically works is also access that should exist.

## Recap + quiz

Three takeaways. One: `/etc/passwd` is world-readable metadata, `/etc/shadow` is the locked-down file that actually holds password hashes — and that split exists specifically to prevent offline hash cracking from an account that only had read access. Two: UID ranges tell you a lot at a glance — 0 is root, under 1000 is typically system accounts, 1000-plus is typically human accounts — and `nologin` blocks interactive login without deleting an account. Three: every process runs as a specific user and inherits exactly that user's privilege boundary, which is exactly why the USER column in `ps aux` matters for security, not just system administration.

Quiz: First, why can't password hashes just stay in `/etc/passwd` if the system still enforces permissions correctly elsewhere? Second, what's the practical difference between a primary group and a supplementary group? Third, if you see a process in `ps aux` running as UID 0, what does that immediately tell you about what that process can do if it's compromised?

## Outro / CTA

Operational takeaway from today: whatever user a process runs as defines the absolute ceiling of what an attacker gains if that process is exploited — so knowing exactly what user is running what is one of the highest-value habits in security. Next up is Day 6, the final Linux day, covering cron jobs and how a misconfigured one becomes a real privilege escalation path. Follow along, and leave your quiz answers in the comments.

## On-screen text / b-roll suggestions

- Diagram: /etc/passwd line split into its seven fields with labels
- Side-by-side permission comparison: /etc/passwd (world-readable) vs /etc/shadow (root-only)
- UID range chart: 0 = root, 1-999 = system, 1000+ = human, with icons
- ps aux screenshot with the USER column circled across multiple rows
- End-card with recap bullets and quiz questions
