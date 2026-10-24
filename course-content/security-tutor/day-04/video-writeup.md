# Day 04 — Linux Fundamentals Part 1: permissions and the disguised-executable red flag — Video Script

**Estimated length:** ~10 minutes (~1400 words)

## Hook

Here's a question that sounds almost too simple: why would a plain text file ever need permission to execute? It wouldn't — and the moment you see one that can, you should treat that as a warning sign, not a curiosity. That one idea is the single most useful thing I took away from today's Linux lesson, and I want to show you exactly why it matters.

## Intro

This is Day 4 of my hands-on cybersecurity training, and it's the start of a new phase — moving from networking into Linux fundamentals. If you've been following along, Days 1 through 3 covered IP addressing, routing, TCP, and DNS. Today is about the operating system itself: how Linux organizes its files, and how its permission system actually works. By the end of this video, you'll be able to read a Linux permission string and immediately spot when something looks wrong.

## Teaching segment: plaintext vs encrypted protocols

I started with a quick pass on a few protocols I hadn't looked at closely yet: SSH versus Telnet, and SMTP. The pattern across all of them is the same one that showed up with HTTP versus HTTPS — some protocols send everything, including credentials, in plain readable text, and some encrypt it. Telnet and plain SMTP fall into the "plaintext" category; SSH is the encrypted replacement for exactly the kind of remote-access job Telnet used to do. The lesson here isn't new information so much as reinforcement: any time you see a plaintext protocol in a real environment, that's a flag worth noting.

## Teaching segment: the Linux filesystem hierarchy

Then I went through the core layout of a Linux filesystem. `/bin` holds essential command binaries. `/etc` holds system-wide configuration files. `/home` holds individual users' personal directories. `/var` holds variable data — things that change over time, like logs. `/tmp` is temporary storage, usually world-writable and cleared periodically. And `/root` is specifically the home directory for the root user, separate from everyone else's home directory under `/home`.

[SCREEN: simple tree diagram of /, /bin, /etc, /home, /var, /tmp, /root]

Knowing this layout matters because a lot of security work is really just "does this file belong where it is, and does it have the permissions it should have for that location."

## Teaching segment: the rwx permission string

This is the core of today's lesson. Every file and directory on a Linux system has a permission string made up of three groups of three: read, write, and execute, for the owner, the group, and everyone else — often called "other." So a string like `rwxr--r--` breaks down as: the owner can read, write, and execute; the group can only read; and everyone else can only read.

[SCREEN: breaking down rwxr--r-- into three labeled blocks — owner / group / other]

## Teaching segment: octal notation and chmod

That same permission structure can be written as a three-digit number instead of letters, which is what you actually use with the `chmod` command. Read is worth 4, write is worth 2, execute is worth 1, and you add them together per group. So `rwx` becomes 7, `r--` becomes 4, and `rwxr--r--` becomes 744. I worked through `chmod 700`, which grants full access to the owner and nothing at all to anyone else — the correct setting for a sensitive script you don't want any other user touching. And I worked through `chmod 777`, which grants full read, write, and execute to literally everyone on the system.

[SCREEN: octal math — 4+2+1=7 table, then 744 and 700 and 777 broken down]

## Mistake/correction moment

I didn't get anything conceptually wrong today, but there's a mistake worth calling out anyway, because it's one a lot of people make without ever being corrected: treating 777 as a quick fix when a permission error pops up. It "solves" the error, technically — but it solves it by removing all access control from the file entirely. The actual fix is almost always much narrower, like adding one specific user to a group, or using 700 if the file should only ever be touched by its owner. The instinct I built today was connecting 777 directly to real risk: any user, or any process, or any attacker who gets even low-level access to the system can now read, modify, or execute that file.

## Recap + quiz

Three takeaways. One: plaintext protocols like Telnet and plain SMTP expose everything, including credentials, in the clear — SSH is the encrypted alternative for the same job Telnet does. Two: the rwx permission string always breaks down into three groups of three — owner, group, other — and that same structure maps directly onto octal numbers via 4 for read, 2 for write, 1 for execute. Three: an execute bit on a file that has no business being executable, like a .txt file, is a concrete red flag, and 777 permissions turn "it works now" into "anyone can touch this."

Quiz: First, what does `chmod 644` actually grant, broken down by owner, group, and other? Second, why is `chmod 700` the right call for a sensitive script instead of something looser? Third, if you saw a `.txt` file with permissions `rwxrwxrwx`, what two separate problems would you flag about it?

## Outro / CTA

The operational takeaway from today: don't just read permission strings, question them — a file's permissions should always match what that file is actually supposed to do, and the moment they don't, that's worth investigating. Next up, Day 5 goes deeper into Linux users: how `/etc/passwd` and `/etc/shadow` actually work, and why they're split into two separate files in the first place. Follow along, and drop your quiz answers in the comments.

## On-screen text / b-roll suggestions

- Tree diagram of the Linux filesystem hierarchy, highlighting each directory as it's mentioned
- Breakdown graphic: `rwxr--r--` split into three colored blocks labeled owner/group/other
- Octal math table: read=4, write=2, execute=1, with 744/700/777 worked out underneath
- Big red flag icon overlay on a `.txt` file icon with an execute permission highlighted
- End-card with the three recap bullets and quiz questions
