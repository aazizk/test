# Day 04 — Linux Fundamentals Part 1: a .txt file with the execute bit set is a red flag

## LinkedIn

A text file should never need to be executable. Today that one sentence became a real security instinct instead of just a fact I memorized.

Day 4 of my cybersecurity training moved into Linux fundamentals. I covered:

→ SSH vs Telnet, and SMTP — the recurring theme being plaintext vs encrypted protocols, and why that distinction matters every time credentials cross a network.
→ The core Linux filesystem layout: /bin, /etc, /home, /var, /tmp, /root — and what actually belongs in each one.
→ The rwx permission string, broken down properly: owner, group, other, each with their own read/write/execute bits.
→ Octal notation — chmod 644, 700, 777 — and what each number actually grants.

The moment that stuck with me most: a data file, like a .txt, having its execute bit set is inherently suspicious. Text files don't need to run as programs — if one can, that's a signal someone disguised something they want executed as something that looks harmless.

Same logic applies to permission 777: if every user on the system can write to and execute a file, that file is now a target for anyone who gets even limited access. That's the kind of misconfiguration real attackers actively hunt for.

Small detail, real instinct. That's the goal of this whole program.

#CyberSecurity #Linux #LearningInPublic #InfoSec #FileSystem

## Twitter/X

Day 4: Linux permissions. Biggest takeaway — a .txt file with the execute bit set is a red flag. Text files don't need to run. If one can, something's probably disguised. 🚩

#CyberSecurity #Linux
