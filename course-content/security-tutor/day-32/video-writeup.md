# Day 32 — SIEM Pipeline, Real Correlation, and Alert Triage — Video Script

**Estimated length:** ~11 minutes (~1500 words)

## Hook

Here's a real cluster of three API calls I pulled straight out of my own AWS account today: `GetAccountPasswordPolicy`, `ListAccountAliases`, `GetAccountProperties` — all three, from the same IP, within the same second. That pattern could be a legitimate security scanner doing its job, or it could be an attacker who just stole a credential, checking out what they've got access to. Same calls. Same shape. And today I'm going to show you the one thing that actually tells them apart — because it isn't the API calls themselves.

## Intro

If you're following this series, Day 31 introduced CloudTrail and the idea that one log line is never proof of an attack. Today, Day 32, we go one level deeper into Phase 7 — Detection: how a SIEM actually turns raw logs into something a human can act on, and what real alert triage looks like once a correlation rule actually fires. By the end of this video you'll understand the four-stage SIEM pipeline, why normalization has to come before correlation, and the single differentiator that separates a legitimate security scan from genuine attacker reconnaissance.

## Teaching segment: the SIEM pipeline

A SIEM — Security Information and Event Management system — does four distinct jobs, always in this order:

[SCREEN: show the four-stage pipeline — Collection → Normalization → Correlation → Alerting]

First, collection: pulling logs from every source — CloudTrail, OS auth logs, firewall logs, application logs — into one central place. Second, normalization: different sources describe the same fact differently. One system calls a field `sourceIPAddress`, another calls it `remote_addr`, another calls it `src_ip`. The SIEM rewrites all of these into one common schema. Third, correlation: applying rules across that now-consistent data to spot patterns — the same identity doing something unusual across multiple events. Fourth, alerting: when a correlation rule matches, a human analyst gets notified — the SIEM doesn't hand down a verdict, it hands over a case to investigate.

The step people most often skip over mentally is normalization, and it's actually the reason correlation works at all. Here's the test I worked through myself: if a SIEM never normalized `sourceIPAddress`, `remote_addr`, and `src_ip` into one field, and you wrote a rule to flag "same IP across CloudTrail, auth logs, and firewall logs within five minutes" — what breaks?

My first instinct was that the system would get confused about which field was actually the IP. That's not quite it. Each source's own schema is perfectly fine on its own — the real problem is specific to cross-source correlation. A rule comparing literal field names will simply never match `sourceIPAddress` against `remote_addr`, even when the actual IP value is identical in both. The attack pattern is sitting right there in the data. The correlation engine just silently misses it, because it's comparing the wrong things. That's a false negative hiding inside a perfectly functioning system — nothing crashes, nothing errors, it just quietly never fires.

## Teaching segment: real correlation exercise against live AWS data

This is where today's lesson turned into a real exercise, not a hypothetical. I pulled 20 genuine events from my own account.

[SCREEN: show the command]

```
aws cloudtrail lookup-events \
  --profile icd \
  --lookup-attributes AttributeKey=EventSource,AttributeValue=iam.amazonaws.com \
  --max-results 20
```

Then extracted the fields that matter for correlation with a real `jq` one-liner pulling event time, event name, source IP, and identity out of every event.

[SCREEN: show the jq command and the real output table]

What came back was genuinely messy, real-world data — not a curated textbook example. There was routine infrastructure automation: Karpenter autoscaler roles checking instance profiles, an EKS service role doing its normal thing. There was a real human logging in through the organization's ADFS federation. And there were two different security-tooling accounts doing their jobs: an `algosec` compliance-tool role, and — the one that mattered most — a `WizAccess-Role` identity that fired three calls in the same second: `GetAccountPasswordPolicy`, `ListAccountAliases`, `GetAccountProperties`.

I found that cluster in the raw data without being told exactly where to look — that's the whole point of the exercise. A naive correlation rule watching for "multiple API calls, same identity, same IP, tight time window" would flag exactly this pattern.

## Teaching segment: the real triage lesson

So — is that cluster something a security team should investigate? My first instinct was to focus on what the calls actually did: checking the account's password policy sounded sensitive enough to flag. That's a reasonable first instinct, but it's not the right lens.

Here's the deeper lesson: `WizAccess-Role` is the name of a real cloud security posture management tool's scanning role — Wiz is a well-known vendor that continuously checks account configuration for misconfigurations. Those three specific calls — password policy, account aliases, account properties — are exactly what you'd expect a CSPM tool to check as part of a routine scan.

But here's the part that actually matters for detection work: those same three calls are also textbook attacker reconnaissance. If someone compromised a credential, checking the account's security posture and identifying information is close to the first thing they'd do. The CloudTrail event shape for a legitimate scan and a real attacker's recon burst would be structurally identical — same read-only nature, same tight time window, same kind of information gathered.

So what actually tells them apart? Not the API calls. **Identity and provenance.** Is this a known, named, expected service role with an established baseline of this exact behavior — or is it a credential you don't recognize, acting outside its normal pattern? That's why real SIEMs maintain a baseline of known-good identities and their typical behavior. The exact same correlated pattern, from an unexpected identity, is what actually earns a genuine investigation.

[SCREEN: side-by-side comparison — "Legitimate Wiz scan" vs "Attacker recon," same three API calls, only the identity label differs]

## Mistake/correction moment

My first pass at triaging the `WizAccess-Role` cluster led with the content of the calls — "it's checking the password policy, that sounds like something worth investigating" — instead of checking who was making the calls first. It took a pointed nudge toward the role name itself before the real signal clicked. Once it did, I was able to reason the rest out on my own: a legitimate, recognizable vendor role explains the behavior completely. The lesson here generalizes well beyond this one example — when evaluating whether an event is suspicious, check who did it before you judge how sensitive the action sounds. Attackers and legitimate tools often do the exact same things; only the actor differs.

## Recap + quiz

Three takeaways from today. First: a SIEM's job is collection, normalization, correlation, then alerting — in that order, and normalization has to happen before correlation or cross-source rules silently fail. Second: real, unscripted account data genuinely does contain correlation clusters worth examining — finding them in messy real logs is a skill in itself, not just a textbook exercise. Third: identical API calls can be either routine automation or genuine attacker reconnaissance, and the differentiator is identity and provenance, not the action itself.

Pause here and answer these three yourself:

One — name the four stages of a SIEM pipeline, in order, and what each one does.

Two — why does the `WizAccess-Role` cluster prove that alert triage has to be about identity, not just the API calls involved?

Three — an attacker wants to blend in as a trusted identity like `WizAccess-Role`. Between stealing the real role's credentials and creating a similarly-named lookalike role, which is more effective, and why?

## Outro / CTA

Here's today's operational takeaway: the same API calls can be either routine security scanning or active attacker reconnaissance — the signal that tells them apart isn't the action itself, it's whether the identity performing it is a known, expected actor behaving within its normal pattern. If you're working with CloudTrail or any cloud audit log, get in the habit of asking "who" before you ask "how sensitive" — it'll save you from both false alarms and real misses. Follow along for Day 33, where we go into detection engineering basics — actually writing and tuning a detection rule for false positives.

## On-screen text / b-roll suggestions

- Lower-third during the hook: "Real CloudTrail cluster — not a hypothetical"
- Diagram: the four-stage SIEM pipeline (Collection → Normalization → Correlation → Alerting) as a horizontal flow
- Screen recording of the real `jq` extraction and its messy, real output
- Side-by-side callout: "Legitimate Wiz scan" vs. "Attacker recon" — identical calls, different identity label
- On-screen text: "Check WHO before you judge HOW SENSITIVE"
- End-screen quiz card with the three review questions
