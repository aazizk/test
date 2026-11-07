# Day 24 — CEH Checkpoint #3: Every Open Question, Closed — Video Script

**Estimated length:** ~9 minutes (~1350 words)

## Hook

Three times — three separate checkpoints — I got the exact same question wrong: what's the difference between a "closed" port and a "filtered" port in nmap. Today, on checkpoint attempt number three, I finally nailed it clean. And it wasn't the only two-week-old mistake that got put to bed in this one session. If you've ever felt like you keep almost-but-not-quite learning the same thing, stick around, because this is what it actually looks like when that cycle breaks.

[SCREEN: title card — "Day 24: CEH Checkpoint #3"]

## Intro

This is Day 24 of my cybersecurity training series, working toward CEH-level knowledge from a standing start. No new material today — this is a pure checkpoint session, a quiz that pulls together everything taught since the last one, plus a running list of things I'd gotten wrong before and needed to prove I'd actually fixed. By the end of this video you'll know exactly what separates "I memorized the answer" from "I understand the mechanism" — because today's session is a case study in both.

## Teaching segment: Identity and Access Management recap

The quiz covered three days of material: authentication versus authorization, privilege escalation, and credential attacks — brute force, credential stuffing, and password spraying.

[SCREEN: simple two-column diagram — "Authentication: who are you" / "Authorization: what can you do"]

First question was straightforward: a web app checks your session cookie to confirm you're logged in, then separately checks if your role is "admin" before showing a delete button. The cookie check is authentication. The role check is authorization. Clean answer, first try — authentication is proving identity, authorization is checking permission, and conflating the two is one of the most common security mistakes in real systems.

Then came privilege escalation — and this one had history. Back on Day 21, I'd correctly described a scenario — a low-privilege user hijacking a root cron job to get a root shell — but labeled it "horizontal" when it's actually "vertical." Vertical means you cross a tier: normal user to admin, admin to root. Horizontal means you stay at the same tier but reach someone else's stuff — think changing a URL parameter from your own user ID to a coworker's and reading their private data.

[SCREEN: table — Vertical (tier change, e.g. cron-to-root) vs Horizontal (same tier, different target, e.g. user_id swap)]

This time, given two fresh scenarios — the cron job again, and a new user_id-swap example — I labeled both correctly without hesitation. That's the real test of whether a slip is a one-off or a pattern: you don't ask the same question again, you ask a *new* question that needs the same underlying concept.

## Teaching segment: Credential attacks, three flavors

Three scenarios, three names to get right: trying thousands of passwords against one username is brute force — or more precisely, if it's a wordlist of likely real passwords rather than every possible combination, it's a dictionary attack specifically. Taking real username-password pairs leaked from one breached site and trying them somewhere else is credential stuffing. And trying a small number of common passwords against hundreds of usernames is password spraying.

[SCREEN: three-row comparison — Brute force/Dictionary vs Credential stuffing vs Password spraying]

The interesting part of this question wasn't naming them — it was explaining *why* spraying specifically gets around a defense that blocks brute-forcing. If a server locks you out after five failed attempts on one username, brute-forcing trips that wall immediately. But spraying never tries more than two or three passwords against any single username — it just spreads the attempts across hundreds of accounts instead. From the server's point of view, no single account ever looks under attack. That's exactly what we built and exploited for real back on Day 23, with an actual Docker lab.

## Mistake/correction moment

Here's the one that mattered most. For the third time across three checkpoints, I got closed-versus-filtered ports wrong in nmap — or close to wrong. I said "if a port was blocked, you'd get a reset," which is backwards. A reset — an RST packet — is what a *closed* port sends you. It means "nobody's listening here, but I'm definitely reachable, no firewall in the way." *Filtered* is the opposite: total silence, no response at all, which usually means a firewall is actively dropping your probe before it even reaches anything.

[SCREEN: table — Closed: SYN sent, RST received, "I'm here, nobody's home." / Filtered: SYN sent, no response, "something ate my packet."]

I caught it, called it a typo in the moment, and honestly — I think it was. But three misses on the same concept earns a permanent asterisk, so the plan going forward is one more light check down the line, not a full re-teach, just to be sure the muscle memory is solid under pressure next time, not just when I'm thinking carefully.

The same session also cleared up two older open items: why clickjacking actually works at the technical level — an invisible, zero-opacity iframe stacked exactly over a decoy button so your real click lands on the hidden page underneath — and the real difference between escaping special characters in a SQL query versus using parameterized queries. Escaping still hands the database one combined string that it has to parse as code, so a missed edge case can still break it. Parameterized queries send the data and the query structure as two separate things, so the database engine never treats your input as code in the first place. That's a structural fix, not just a more careful version of the same fix — and getting that distinction right, unprompted, is exactly the kind of answer that shows real understanding instead of memorized talking points.

## Recap + quiz

Three takeaways from today. One: authentication is "who are you," authorization is "what can you do" — keep those separate in your head always. Two: vertical privilege escalation crosses a tier, horizontal stays at the same tier but hits a different target — and the only way to prove you've really got that distinction is to label a brand-new scenario, not just recite the old one. Three: password spraying beats per-account lockouts by spreading thin across many accounts instead of hammering one.

Here are the three review questions from today — pause the video and think through them before I move on:

First: why does a reset packet from a port actually tell you *more* about network security posture than a timeout does?

Second: why is a parameterized query considered a structural fix for SQL injection rather than just "better escaping"?

Third: if a company using single sign-on gets its identity provider compromised, why is that worse than a password breach on one standalone app?

[SCREEN: three questions, pause-and-think card]

## Outro / CTA

The operational takeaway from today: when you think you've corrected a mistake, don't just re-ask the same question — test it with a brand-new scenario, because that's the only way to tell "I memorized the fix" apart from "I actually get it now." If you've been following this series, you know I've been chasing that nmap mistake for weeks — today it finally died for real. Follow along for Day 25, where we're picking back up with new material: how single sign-on protocols like SAML and OAuth actually work under the hood, and probably a hands-on privilege escalation lab to round out this phase. Drop your answer to the SSO question in the comments — I want to see who gets the blast-radius reasoning right.

## On-screen text / b-roll suggestions

- Lower-third: "Day 24 — CEH Checkpoint #3 (quiz-only, Phase 5 review)"
- Caption overlay during hook: "3rd time's the charm — nmap closed vs. filtered, finally resolved"
- Diagram: Authentication vs. Authorization two-column card
- Diagram: Vertical vs. Horizontal privilege escalation table (reuse from Day 21 deck if available)
- Diagram: Brute force / Dictionary / Credential stuffing / Password spraying comparison row
- Diagram: nmap closed (RST) vs. filtered (silence) table — this is the key visual of the episode, give it the most screen time
- Caption: "4/4 standing watch-items resolved — strongest checkpoint yet"
- End card: subscribe + "Next: SSO protocols (SAML/OAuth) + hands-on privesc lab"
