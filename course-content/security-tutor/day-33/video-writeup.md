# Day 33 — Writing a Real Detection Rule (And Watching It Cry Wolf) — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

[SCREEN: terminal output showing `ALERT: WizAccess-Role ... burst: [...]` repeated three times]

I just ran a detection rule against a real AWS account's real CloudTrail logs. It fired three times. Three alerts. And every single one of them was completely harmless. Not one real threat in the batch. If you've ever wondered why security teams drown in false positives, I just recreated the exact problem from scratch, on purpose, in about twenty minutes — and today I'm going to show you exactly why it happened, and exactly what you do about it.

## Intro

This is Day 33 of my cybersecurity training series, and we're deep into Phase 7 — Detection. If you've been following along, yesterday we found a real suspicious-looking cluster of API calls in a live AWS account and learned how to triage it. Today we go one level deeper: we actually build the rule that would have caught that cluster automatically — and in doing so, we run straight into the single biggest practical problem in detection engineering: a rule that's technically correct but practically useless because it can't tell "weird" from "dangerous." By the end of this video you'll understand how real detection rules are structured, why the exact same rule design choice can either catch an attacker or silently miss one, and you'll see the real code that proves it.

## Teaching segment: what a detection rule actually is

Strip away the buzzwords, and a detection rule is just three things: a **condition** — the pattern that counts as suspicious — a **scope** — what time window you're grouping events within — and a **threshold** — how many matching events before it actually fires an alert.

[SCREEN: simple diagram — three boxes labeled Condition, Scope, Threshold]

That's it. Everything else is tuning. And the tuning is where almost all the real engineering work happens, because picking these three things wrong in either direction breaks the rule in a different way.

## Teaching segment: tumbling windows vs. sliding windows

The "scope" piece — the time window — has a design choice that's easy to get wrong on your first attempt, and I got it wrong too before thinking it through out loud.

A **tumbling window** has a fixed start and a fixed length — say, five minutes. The problem: if your attack happens to straddle the boundary, two calls land just inside one window and the third lands one second after it closes, your rule sees two separate, unremarkable groups instead of one obvious burst. It misses the pattern purely because of bad timing.

A **sliding window** doesn't have a fixed start — it opens on the first suspicious event and keeps extending as long as new matching events keep showing up close together. That means a slower, more careful attacker — someone pacing their calls out to avoid looking like an obvious burst — still gets caught, because the window just keeps stretching to follow them.

[SCREEN: simple timeline diagram showing three events, one being split across a tumbling window boundary, vs. the same three events caught in one sliding window]

For today's example we used a tumbling window, anchored fresh each time rather than at one fixed global start — simpler to build, and good enough for catching a genuine fast burst. But know that sliding windows exist for a reason: they catch the patient attacker, not just the noisy one.

## Teaching segment: building the real rule

[SCREEN: terminal / code editor showing the Python script]

Here's where this stopped being theoretical. I pulled up a real file of twenty genuine CloudTrail events from a live AWS account — the same data from yesterday's episode — and we built an actual working detection rule against it, one function at a time.

First function: **parse each event.** Here's the gotcha that trips up a lot of people the first time they touch CloudTrail data — the field called `CloudTrailEvent` isn't a nested object, it's a *string* that itself contains a whole separate block of JSON. You have to parse it twice: once for the outer event, once again for that inner string. Miss that step and your code just throws errors trying to read fields that don't exist at the top level.

Second function: **group the events.** We grouped every event by a pair — the identity that made the call, and the IP address it came from. Why the pair, and not identity alone? Because an attacker who steals a legitimate identity's credentials will often use them from a brand-new location. If you only track identity, you lose that signal completely.

Third function: **find the bursts.** This is the actual tumbling-window logic — walk through the sorted events, open a window, pull in everything close enough in time, then jump forward past everything you just grouped so you don't double-count. [SCREEN: code for the `find_bursts` function, highlighting the line `i = j`] That one line — jumping the pointer forward instead of just incrementing it by one — is the difference between clean, non-overlapping windows and a messy rule that fires multiple overlapping alerts for the same burst.

## Teaching segment: the result — and the real lesson

We ran the finished rule: five-minute window, three-or-more events required to fire. Against twenty real events, it fired on three different identity-and-IP pairs.

[SCREEN: terminal output listing the three alerts]

All three turned out to be completely legitimate automated tools — a cloud security scanner, a compliance-auditing tool, and AWS's own autoscaler service doing routine lookups. Zero actual attackers. A hundred percent false-positive rate, on real data, from a rule that was technically working exactly as designed.

And that's the actual point of today's lesson: the rule wasn't broken. It correctly found every burst of rapid API calls in the data — that's a true positive at the *pattern* level. The problem is that "burst of calls" and "malicious burst of calls" are not the same thing, and no amount of clever time-window math fixes that gap. The fix has to be a different kind of logic entirely: a list of known, trusted identities the rule should quietly ignore — and, just as importantly, a separate watchlist of identities that should never be ignored even if they're normally trusted, in case their credentials ever get stolen.

## Mistake/correction moment

I want to walk through a mistake that's actually more interesting than it sounds. In the closing review, I was asked: if an attacker steals the credentials for that same trusted autoscaler role and starts using them from a brand-new IP address, would today's rule catch it?

My first answer was: no, because the allowlist suppresses known roles, and the watchlist is still empty. That's true — but only under one specific design choice I hadn't actually pinned down: is the allowlist keyed on the identity alone, or on the identity paired with its IP, the same way the detection rule itself groups events?

If the allowlist only checks identity, then yes — a stolen credential sails right through, forever, because the rule never notices the IP changed. But if the allowlist is scoped to identity-plus-IP, exactly like the detection logic already is, then a brand-new IP for that identity never matches anything on the allowlist, and the rule fires normally.

[SCREEN: text overlay — "Allowlist granularity must match your detection rule's own grouping key"]

That's the real lesson: your suppression logic has to be exactly as specific as your detection logic, or you quietly reopen the exact gap the rule was built to close.

## Recap + quiz

Three things to take away from today. One: a detection rule is just condition, scope, and threshold — tuning is the real engineering work. Two: tumbling windows are simple but can split an attack across a boundary; sliding windows follow a slower attacker instead. Three: a rule correctly firing on a benign pattern isn't a bug — it's a tuning problem, solved with allowlists, not smarter time math.

Before I move on — pause the video and think through this yourself: if your allowlist suppresses alerts by identity alone, and an attacker steals a trusted role's credentials but uses them from the exact same IP address that role always uses, would your rule catch that? Think about what signal is left to catch it on, if both the identity and the IP look completely normal. Drop your answer in the comments — I'll go through it in a future episode.

## Outro / CTA

Here's the line to remember: your allowlist has to be scoped exactly as tightly as your detection rule's own logic, or you silently rebuild the blind spot you were trying to close. If this helped make detection rules click for you, follow along for the next episode, where we'll either extend this exact script with a smarter sequence-based rule, or sit a full checkpoint quiz covering everything from the last several sessions. See you then.

## On-screen text / b-roll suggestions

- Lower-third captions for key terms as they're introduced: "Condition / Scope / Threshold", "Tumbling Window", "Sliding Window", "True Positive (pattern) vs. False Positive (threat)"
- Screen recording: terminal running `python3 siem-alert.py` with real output scrolling
- Code editor screen capture of the three functions (`parse_event`, `group_events`, `find_bursts`) with the `i = j` line highlighted/circled
- Simple animated timeline diagram contrasting a split tumbling window vs. a continuous sliding window
- Text card: "3 alerts fired. 0 real threats. 100% false positives." as a punchy mid-video stat callout
- Closing text overlay: "Your allowlist must match your rule's grouping key"
