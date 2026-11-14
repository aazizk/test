# Day 34 — CEH Checkpoint #4: The Strongest Core Showing Yet, and One Stubborn Repeat — Video Script

**Estimated length:** ~10 minutes (~1500 words)

## Hook

Twelve questions. Nine of them covering nine completely different sessions — cloud IAM, detection engineering, privilege escalation, shared responsibility — and every single one landed clean or needed only the lightest touch. That's the best run this checkpoint series has had yet. But buried in the other three questions was the same exact mistake I'd made once before, in the same direction, which is exactly the kind of signal that tells you a "quiz pass" and "actually knowing it" aren't the same thing. Let's go through both halves of that story.

[SCREEN: title card — "Day 34: CEH Checkpoint #4"]

## Intro

This is Day 34 of the security training series, and like Checkpoints 1 through 3 before it, today has no new material — it's a pure quiz, scoped to everything taught since the last checkpoint (nine sessions' worth, from AAA and SSO through the full Detection phase) plus three standing watch-items carried forward from past sessions. By the end of this one you'll see what a genuinely strong checkpoint looks like, and why one clean miss on an old mistake matters more than ten correct answers on new material.

## Teaching segment: the core material held up

The nine core questions spanned an unusually wide range: the Accounting leg of AAA, the root cause of the cron privilege-escalation lab, the cloud shared-responsibility model, how AWS evaluates IAM policies with explicit deny, why an open SSH port is worse than an open HTTP port, the PassRole-plus-CreateFunction escalation chain, the four-stage SIEM pipeline, and the alert-fatigue tradeoff in detection-rule thresholds.

[SCREEN: list of 9 topics, checkmarks appearing one by one]

Every one of these came back correct or needed only a light sharpening, not a real correction. The standout was the SSH-versus-HTTP port-exposure question — a concept that had needed prompting the first two times it came up — answered this time fully unprompted, and cleanly: it's not that an open port is inherently bad, it's whether that port is the intended public access path or an admin-only one, and whether a breach there gets you shell-level access or just app-level access. Three attempts, and the third one finally came out clean without any hint at all.

## Teaching segment: a label that keeps slipping

Not everything was perfect, though. The shared-responsibility question asked who's responsible for S3's underlying infrastructure, and the answer classified S3 as "PaaS" — which is wrong, but wrong in an interesting, specific way. S3 isn't a platform you deploy something onto, the way a real PaaS service like RDS is; it's closer to a fully managed, ready-to-use service with no infrastructure layer exposed to the customer at all — more SaaS-like in spirit, even though AWS doesn't officially categorize it that way. The underlying substance was right both times this has come up — zero infrastructure patching responsibility on the customer side — it's specifically the three-letter label that keeps landing on the wrong one.

[SCREEN: three-column card — IaaS / PaaS / SaaS, with S3 and RDS placed correctly]

## Teaching segment: the recurring one

Here's the one that mattered most. Back in an earlier session, OAuth and OIDC came up, and I described the ID token as something that "lets the app act as you" — conflating it with what the access token actually does. That got corrected in that session. Today, asked the same underlying question again, I got it backwards a second time: called the access token "one-time-use" and the ID token "full access to the service" — the exact same swap, just phrased differently.

[SCREEN: side-by-side — WRONG: "ID token = full access" / RIGHT: "ID token = one-time identity proof, no access power"]

One miss on a concept is normal. Two genuine misses on the exact same concept, weeks apart, means a verbal correction clearly isn't enough — it needs a dedicated session built specifically around it, not another quiz question. That's exactly what got scheduled as the top priority coming out of today.

## Mistake/correction moment

The alert-triage question from the detection material also needed a small nudge — asked what the very first question should be when evaluating a suspicious cluster of API calls, the answer led with checking whether the source IP matched a known pattern, rather than naming identity and provenance directly as the primary signal. IP-matching is a useful corroborating detail, but it's secondary — the real first question is always "do I recognize who's doing this," which is the same lesson from two earlier sessions, now showing up a third time in a slightly different shape. Not escalating it yet, since each occurrence has been a single clean correction on a different specific topic, but it's a pattern worth naming out loud: a tendency to reach for a supporting signal before the primary one.

One of the three watch-item re-checks also deserves a mention, mostly because it resolved itself mid-answer: asked again whether an AWS policy simulator evaluates a real role's actual permissions or just a hypothetical policy document, the first words out sounded like the same mix-up from a previous session — but then came an immediate, unprompted correction: "actually, I meant the right thing, I just phrased it badly." That's a different kind of event than a real conceptual miss, and it's exactly the kind of self-awareness that makes a wording slip easy to downgrade rather than escalate.

## Recap + quiz

Three things worth carrying forward from today. One: the strongest sign a concept has really landed is when it survives a brand-new scenario without any prompting — that's what finally happened with the SSH-versus-HTTP distinction after two earlier attempts needed help. Two: a classification label (like IaaS/PaaS/SaaS) can keep slipping even when the substance underneath it is fully understood — worth treating the label itself as something to drill separately. Three: one miss is noise, two genuine misses on the same concept is signal — that's the threshold for moving from "re-check it next time" to "stop and fix it properly."

Here are today's three review questions — pause and think them through:

First: what's the real distinguishing test for whether a security group's open port is actually dangerous, versus just open?

Second: why is "PaaS" the wrong label for a storage service like S3, even though it's clearly not something the customer manages at the OS level?

Third: between an ID token and an access token, which one would an API ever actually reject — and why does that question not even make sense for the other one?

[SCREEN: three questions, pause-and-think card]

## Outro / CTA

The operational takeaway from today: track not just whether you got something right, but whether this is the first time, the second time, or the third time you've been asked it — the pattern across attempts tells you more than any single answer does. If you've ever mixed up which OAuth token does what, stick around — the very next session is a deep, dedicated fix for exactly that, and it's worth watching before you make the same mistake twice yourself. Follow along for what's next: either extending a real detection-rule script with working code, or moving into incident response.

## On-screen text / b-roll suggestions

- Lower-third: "Day 34 — CEH Checkpoint #4 (quiz-only, 9 sessions of material)"
- Caption overlay during hook: "9/9 core questions clean or lightly sharpened — strongest run yet"
- Diagram: 9-topic checklist with checkmarks
- Diagram: IaaS / PaaS / SaaS three-column card with S3 and RDS placed correctly
- Diagram: WRONG vs. RIGHT card for the ID-token/access-token swap — this is the key visual, give it the most screen time
- Caption: "2nd genuine miss on the same concept = escalate, don't re-check"
- End card: subscribe + "Next: the OAuth/OIDC fix, for real this time"
