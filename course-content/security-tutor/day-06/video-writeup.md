# Day 06 — Linux Fundamentals Part 3: cron privilege escalation — Video Script

**Estimated length:** ~12 minutes (~1650 words)

## Hook

What if I told you that one of the most common ways attackers get root access on a Linux system doesn't involve any exploit at all — no buffer overflow, no zero-day, nothing clever. Just a scheduled job and a file permission mistake. Today I worked through exactly how that attack chain works, start to finish, and once you see it, you'll start checking for it everywhere.

## Intro

This is Day 6 of my cybersecurity training, and it's the final day of the Linux fundamentals phase before I move into HTTP and the web. Today's topic is cron — Linux's task scheduler — and specifically how a misconfigured cron setup turns into a real privilege escalation path. By the end of this video, you'll understand cron syntax, you'll be able to read a schedule correctly, and you'll understand exactly how this specific attack works.

## Teaching segment: reading cron syntax

A cron entry has five time fields, followed by the command to run: minute, hour, day of month, month, and day of week, in that order. Once you know the order, you can read almost any schedule. A trickier one I worked through was `0 0 1 * *`, which reads as minute zero, hour zero, day-of-month one, any month, any day of week — in plain terms, that's "run once, at midnight, on the first day of every month."

[SCREEN: a crontab line with each of the five fields labeled and the monthly example broken down]

## Teaching segment: the cron privilege escalation chain

This is the core lesson, and I worked through the full logic of it hands-on. Say there's a cron job configured to run as root — which is extremely common, since cron jobs that handle backups, cleanup, or system maintenance often need root-level access to do their job. Now say the script that cron job actually executes has permissions that let any user on the system write to it. Those two facts combined are the entire vulnerability: any user can open that script and add whatever command they want. The next time cron fires that job on schedule, it runs the script as root — including the attacker's injected command — with full root privilege, no questions asked.

[SCREEN: diagram — world-writable script + root-owned cron entry → attacker edits script → cron fires → arbitrary code runs as root]

What makes this so important to understand is that there's no exploit in the traditional sense here. Nothing is being "hacked" in the Hollywood sense. It's a permission misconfiguration being automatically and faithfully executed by a scheduler that has no concept of "should I trust what's in this file." The same mechanism, cron reliably running things on a schedule, that makes it useful for system administration is exactly what makes this misconfiguration so dangerous. And the same mechanism is also a common way attackers maintain persistence after a compromise — planting a cron job that quietly re-establishes their access even if the original foothold gets cleaned up.

## Teaching segment: package verification — apt/yum vs manual installs

I also covered the difference between installing software through `apt` or `yum` versus using `dpkg -i` directly or manually dropping a downloaded binary onto the system. Package managers like `apt` and `yum` verify a GPG signature on each package against a set of trusted repository keys before installing anything — that's a cryptographic guarantee the package actually came from where it claims to and hasn't been tampered with. Installing a `.deb` file directly with `dpkg -i`, or just downloading and running a binary, skips that verification entirely by default. That's not automatically malicious, but it does mean you're trusting the source yourself instead of having that trust verified for you.

## Teaching segment: log sources and brute-force detection

Finally, I covered where to actually look when something's gone wrong. `/var/log/auth.log` — or `/var/log/secure` on some distributions — records authentication events: logins, sudo usage, SSH connections. `/var/log/syslog`, or `/var/log/messages`, records general system activity more broadly. And there's a specific pattern worth recognizing in auth logs: a string of repeated failed login attempts from the same IP address, followed by a success, is the textbook signature of a brute-force attack succeeding. That pattern is exactly what feeds real alerting rules and tools like fail2ban, which automatically block an IP after too many failures.

[SCREEN: example auth.log lines showing repeated "Failed password" entries followed by "Accepted password" from the same IP]

## Mistake/correction moment

I didn't get this wrong today — I actually worked out the entire cron privilege escalation chain myself, unprompted, before it was fully explained. But I want to flag a mistake that's extremely common for people newer to this: assuming "root-owned" automatically means "safe." A cron job being owned by root only tells you who it runs as — it tells you nothing about whether the script it executes is actually protected from being modified by someone else. Ownership of the schedule entry and permissions on the actual script file are two completely separate things, and conflating them is exactly how this vulnerability gets missed.

## Recap + quiz

Three takeaways. One: cron syntax is five time fields plus a command, and reading it correctly means working through minute, hour, day-of-month, month, and day-of-week in that exact order. Two: a root-owned cron job executing a world-writable script is a direct, no-exploit-required path to root access, because anyone who can edit that script gets their code run as root on the next scheduled execution. Three: package managers verify GPG signatures against trusted keys, while manual installs skip that verification — and `/var/log/auth.log` plus a repeated-failure-then-success pattern is your go-to signal for a successful brute-force attempt.

Quiz: First, what two separate conditions both have to be true for the cron privilege escalation to actually work? Second, what does a package manager's GPG signature check actually protect you from that a manual install doesn't? Third, what specific log pattern indicates a brute-force login attempt that succeeded, and where would you look for it?

## Outro / CTA

The operational takeaway from today: never assume a root-owned scheduled task is automatically safe — check the permissions on everything that task actually touches, because the ownership of the schedule and the protection of the script are two different questions. That closes out the Linux fundamentals phase of this series. Next up is HTTP, including a real hands-on lab proving exactly why TLS matters with an actual packet capture. Follow along, and tell me in the comments if you've ever actually found a world-writable cron script in the wild.

## On-screen text / b-roll suggestions

- Crontab field breakdown graphic: minute / hour / day-of-month / month / day-of-week
- Attack chain diagram: world-writable script → root cron job → attacker edits → root-level execution
- Side-by-side: "apt install (GPG verified)" vs "dpkg -i / manual binary (unverified)"
- Auth.log excerpt with repeated failures highlighted in red and the final success highlighted in green
- End-card with recap bullets and quiz questions
