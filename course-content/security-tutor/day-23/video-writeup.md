# Day 23 — Password Spraying: How Attackers Beat Lockout Policies — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

Picture a company with a strict login policy: get your password wrong twice on your account, and the system makes you wait. Three wrong guesses? Now you're waiting sixteen seconds before you can even try again. Looks airtight, right? I just ran an attack against exactly that kind of defense — ten employee accounts, a weak-password defense already in place — and compromised two of them in under one second. Zero delay. Zero lockout. The defense never even noticed. Today I'll show you exactly why, and exactly how to fix it.

[SCREEN: terminal showing the undefended spray run output, scrolling fast, ending on "Spray complete. 2 account(s) compromised" in under a second]

## Intro

If you're following this series, you know we're deep into Identity and Access Management — the part of security that governs who gets in and how attackers try to break that. Two sessions ago we built a brute-force defense: guess one account's password over and over, and the system makes you wait longer each time. Today's topic is the attack that completely sidesteps that defense — password spraying — and the real fix for it. By the end of this video you'll understand not just what spraying is, but *why* a seemingly solid rate-limiting defense can be structurally blind to it, and what it actually takes to close that gap.

## Teaching segment: brute-force vs. spraying — the key insight

Here's the mental model that matters most today. A brute-force attack picks one username and hammers it with password after password. A defense that counts failed attempts *per username* catches that beautifully — by the fifth wrong guess, the account is slowed to a crawl.

Password spraying flips the axis entirely. Instead of many passwords against one account, you try just one or two extremely common passwords — things like "Summer2024!" or "Password123!" — against *hundreds or thousands* of different usernames. Each individual account only ever sees one failed attempt. From the system's point of view, that's indistinguishable from an ordinary person fat-fingering their password once. No account ever crosses the failure threshold that would trigger a lockout or delay.

[SCREEN: simple diagram — brute force shown as one arrow hitting one box repeatedly; spraying shown as one arrow fanning out to ten boxes, one hit each]

## Teaching segment: building and exploiting the undefended target

To make this concrete, I built a small Flask web app simulating a company's login system — ten employee accounts. Most of them picked strong, unique, random passwords. But two of them — let's call them Bob and Erin — did what real employees actually do: they reused a common password, "Summer2024!". This is deliberately realistic. Breach data consistently shows that in any sufficiently large organization, somebody reuses a top-20 common password.

The app had the exact same defense from our last session: a counter that tracks failed login attempts *per username*, and makes you wait exponentially longer — one second, then two, then four, doubling up to a sixteen-second cap — after repeated failures on that one account.

[SCREEN: code excerpt — `failed_attempts.get(username, 0)` highlighted]

Then I wrote the spray script: three common passwords, tried in turn, each one swept across all ten usernames before moving to the next password. I ran it inside an isolated Docker container, talking only to the target container on a private network — no real systems involved, fully contained.

The result: on the very first password, "Summer2024!", the script hit Bob and Erin's accounts and logged in successfully — instantly, before the defense's failure counter had accumulated anything at all for either of them. Two compromised accounts in under a second, against a system that, two sessions ago, successfully resisted a dictionary attack by making it take over thirty seconds. Same defense code. Completely different attack shape. Completely different outcome.

[SCREEN: terminal output line "bob:Summer2024! -> 200 LOGIN OK" highlighted]

## Teaching segment: measuring the defense's blind spot precisely

I didn't just want to show that it worked — I wanted to quantify exactly how blind the defense was. For the eight accounts that never got compromised across all three password rounds, I worked out the math by hand before running it: each of those accounts fails once per round, so by round two they've accumulated one prior failure, triggering a one-second delay; by round three, two prior failures, a two-second delay. Across eight affected accounts, that's twenty-four seconds of total "friction" the defense managed to impose — on a thirty-request attack that still crushed two accounts and was done, start to finish, in under thirty seconds.

I reset the lab and timed the real run: twenty-six point six nine seconds. The math held almost exactly, with the extra couple of seconds just being ordinary network overhead. The defense wasn't completely asleep — it did impose some cost — but it imposed that cost on the *wrong* accounts. The ones it should have stopped, it never touched.

[SCREEN: terminal `time` output, "real 0m26.690s" highlighted next to the predicted 24s]

## Teaching segment: the real fix — keying the defense by source, not by target

If counting failures per username doesn't work, what does? The answer is to change what the defense tracks. Instead of asking "has *this account* failed too many times," ask "has *this source* failed too many times" — tracking failed attempts by the IP address the requests are coming from.

I rebuilt the app with exactly one structural change: the failure counter is now keyed by the requester's IP address instead of the username. Running the exact same thirty-request spray against this version, nearly every single request after the first now sees a prior failure on record — because they're all coming from the same attacker. The delays stack up fast, and here's the interesting part: the exponential formula is capped at sixteen seconds per request in this lab, so it's not infinite growth, but once the failure count climbs past that cap — which happens within the first ten or so requests — almost every remaining request costs the full sixteen-second maximum. The full spray run, instead of finishing in under a second, would take somewhere in the neighborhood of five to six minutes. That's an attack that's gone from trivial to practically unusable.

[SCREEN: code diff — `failed_attempts[username]` crossed out, `failed_attempts_by_ip[request.remote_addr]` written in]

It's worth being honest about this fix's limits too. In a real company network behind a shared NAT, many legitimate employees can share one outward-facing IP address — so a pure per-IP defense risks punishing a whole office for one person's typo. And a well-resourced attacker can route a spray through thousands of different IP addresses — a botnet, rented proxies, cloud instances spun up in bulk — specifically to stay under any single IP's threshold. That's exactly why real production systems layer multiple signals together: IP, account, device fingerprint, and the overall failure rate across the whole login system, not just one axis.

## Mistake/correction moment

I'll be upfront about a mistake I made myself while writing the attack script: my first version of it was hardcoded to look for the wrong container name — a leftover from the previous day's lab — so the very first run just failed outright with a DNS resolution error. It's a good reminder that even a "simple" one-line change like swapping a target hostname is exactly the kind of thing that breaks silently if you don't double check it. When I was estimating the impact of the new IP-based defense, I also initially guessed the delay could balloon to something like two to the eighteenth power in seconds — forgetting that the code had an explicit sixteen-second cap built in. The lesson there: whenever you're reasoning about exponential growth in a real system, always ask "is there a ceiling coded in here?" before extrapolating the raw math outward — uncapped exponential growth in a real system usually means someone forgot to add a sanity limit, and most well-built systems have one.

[SCREEN: terminal error message "socket.gaierror: Temporary failure in name resolution"]

## Recap + quiz

Three things to take away from today. One: a rate-limiting defense is only as good as what it counts — counting by username stops brute-force but is completely blind to spraying. Two: the fix is to count by something the attacker can't spread thin, like source IP, but that fix has its own real-world tradeoffs around shared networks and attacker IP pools. Three: capped exponential backoff can turn a sub-second attack into a multi-minute one, which is a massive practical win even without being a perfect, unbreakable defense.

Now, pause the video and work through these three questions yourself before I move on. First: why does an attacker's choice between brute-forcing and spraying determine which defense — per-username or per-IP — actually catches them? Second: if a company has solid per-IP throttling in place, what's the most obvious way a well-resourced attacker tries to get around it? And third: if that sixteen-second cap didn't exist at all, and an account's failure counter reached forty, how would that compare in practice to the system just outright rejecting further attempts?

[SCREEN: the three questions displayed as on-screen text, one at a time, with a pause between each]

## Outro / CTA

Here's the one-line rule to carry with you: before you trust any rate-limiting or throttling defense, always ask what the attacker controls and what they don't — because whatever they control, they can spread thin to slip past a counter keyed on the wrong thing. If you want to see where this series goes next — multi-factor authentication, single sign-on, and the tradeoffs baked into each — follow along, and drop your answer to question two in the comments: how would you route around per-IP throttling if you were the attacker? I'll see you in the next one.

## On-screen text / b-roll suggestions

- Lower-third on open: "Day 23 — Password Spraying vs. Brute Force"
- Split-screen diagram: brute force (one arrow, many hits, one target) vs. spraying (one arrow, one hit each, many targets)
- Terminal recording: the undefended spray run, sped up slightly, ending on the "2 account(s) compromised" line
- Code highlight overlay: `failed_attempts.get(username, 0)` vs. `failed_attempts_by_ip.get(source_ip, 0)` side by side
- Lower-third stat callout: "26.69s actual vs. 24s predicted — math confirmed"
- Caption during mistake segment: "Real bug, real fix — this happens to everyone"
- End-card: subscribe/follow prompt + "Next: MFA & SSO"
