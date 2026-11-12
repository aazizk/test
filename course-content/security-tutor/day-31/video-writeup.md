# Day 31 — Phase 6 Wrap-Up + Phase 7 (Detection) Begins — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

Here's a real event I pulled straight out of my own AWS account two days after I ran it: `"eventName": "SimulateCustomPolicy"`, `"sourceIPAddress": "147.161.161.27"`, `"mfaAuthenticated": "false"`. That's not a textbook example. That's a genuine CloudTrail log entry from a security exercise I ran myself, sitting in my own account, waiting to be queried. And today I'm going to show you exactly how to pull a log like that, read it like an analyst would, and turn it into the first ingredient of a real detection rule.

## Intro

If you're following this series, you know we've spent the last four sessions inside real AWS cloud security — shared responsibility, IAM policy evaluation, misconfigured security groups, and a full identity-based privilege escalation chain. Today is day 31, and it's a pivot day: we close out Phase 6, Cloud Security, with one unifying idea that ties all four of those lessons together — and then we open the next phase of this whole course, Detection. By the end of this video you'll understand the one principle behind every cloud misconfiguration we've studied, and you'll understand why a single log line is never enough to catch an attacker.

## Teaching segment: the Phase 6 unifying principle

Before moving on, I wanted to pressure-test whether all four of our cloud security lessons — public S3 buckets, open security groups, exposed secrets, and the PassRole-plus-CreateFunction escalation chain — actually share one underlying idea, or whether they're just four unrelated facts to memorize.

My first instinct was "least privilege." That's true, but it has a gap: least privilege explains why you shouldn't hand someone excessive IAM permissions. It doesn't obviously explain why an open security group is dangerous — nobody's permissions are being over-granted there. So we had to go one level deeper.

The real unifying principle is this: nothing is open, granted, or reachable by default. Everything has to be explicitly and narrowly scoped to what's actually needed, and that scope has to be actively enforced — not just assumed. That single idea explains all four lessons at once:

- IAM least privilege enforces it for permissions.
- Service Control Policies, SCPs, enforce it account-wide, even catching a mistake an individual made later.
- Security groups with default-deny and only the required ports open enforce it for network reachability.
- Secrets scoping and rotation enforce it for data access.

[SCREEN: show the five-bullet list — identity, org policy, network, data, delegation — each mapped to its Phase 6 lesson]

And the follow-up question worth asking yourself: which single AWS feature acts as a safety net even when an individual policy is written wrong? The answer is SCPs — because they set a ceiling that no individual policy, however badly written, can ever exceed.

## Teaching segment: log sources

With Phase 6 wrapped, we moved into Phase 7: Detection. And detection starts with one unglamorous but essential idea — log sources.

You can't detect what you can't see, and visibility comes from different layers of logging, each of which only sees part of the picture:

- OS and authentication logs — who logged in, from where, whether privileges changed.
- Application logs — what the app itself did, its own requests and errors.
- Network and firewall logs — what traffic crossed a boundary, and whether it was allowed or blocked.
- Cloud control-plane logs — every API call made against the cloud provider itself. In AWS, that's CloudTrail.

The critical idea here: no single source sees the whole attack. A real intrusion leaves footprints across multiple layers, and that's exactly why a SIEM — a Security Information and Event Management system — exists: to centralize and correlate all of these sources so a human doesn't have to manually cross-reference ten different systems by hand.

## Teaching segment: real CloudTrail hands-on exercise

This is where it got real — literally. Instead of a simulated log example, I went and queried my own actual AWS account for genuine CloudTrail events.

[SCREEN: show the command]

```
aws cloudtrail lookup-events \
  --profile icd \
  --lookup-attributes AttributeKey=EventName,AttributeValue=SimulateCustomPolicy \
  --max-results 10
```

This pulled back three real events — the exact `simulate-custom-policy` calls I made two days earlier during the IAM privilege-escalation lesson. And the JSON that came back was genuinely instructive. A few fields jumped out:

`userIdentity` showed that I wasn't logged in as a static IAM user — I'd assumed a role through my organization's ADFS federation setup. `sourceIPAddress` pinned down exactly where the call came from. `mfaAuthenticated: false` is a field a real detection rule could flag on for sensitive API calls. And interestingly, `requestParameters` came back redacted — AWS itself hides the actual simulated policy content, tagged `HIDDEN_DUE_TO_SECURITY_REASONS`, because a simulated policy document could contain sensitive hypothetical permissions.

[SCREEN: highlight userIdentity, sourceIPAddress, mfaAuthenticated, and the redacted requestParameters block]

Then came the real test: would a genuine attacker's actual exploitation attempt — not a simulation, the real `PassRole` plus `CreateFunction` combination from Day 30's lesson — show up in CloudTrail the exact same way? Yes. CloudTrail logs the API call itself, regardless of the caller's intent. It doesn't care whether you're a security researcher running a simulation or an attacker actually escalating privileges — it just records that the call happened.

## Teaching segment: event correlation

So if CloudTrail logs everything, why isn't CloudTrail alone a complete detection solution? Because logging and detecting are two different jobs. A log is a record. Detection requires someone — or something — to actually notice a dangerous pattern and act on it.

Here's the concrete version: if you wanted to catch a real PassRole-into-CreateFunction escalation, which specific fields would you build a rule around? The answer is: `eventTime`, `sourceIPAddress`, and `userIdentity` — but not just checking them individually. The real logic is event correlation: look for multiple events sharing the same identity and source IP, within a short time window, where the sequence of event names matches a known-dangerous pattern.

Here's why that matters for accuracy. `PassRole` by itself is often completely legitimate — it's a routine part of deploying infrastructure. If you alerted on every single `PassRole` call, you'd drown your security team in false positives. But `PassRole` followed within seconds by `CreateFunction`, from the same identity, same IP? That specific sequence is a real signal. One event proves almost nothing. A correlated pattern across events is what a SIEM is actually built to catch.

## Mistake/correction moment

My first answer to "what's the single unifying principle behind Phase 6" was just "least privilege." It's not wrong, but it's incomplete — it only explains the identity side of things. The security group case forced a correction: least privilege describes who gets which permissions, but an open security group isn't about permissions being over-granted, it's about network reachability being left wide open by default. The fix was realizing both are instances of the same bigger idea — default-deny, minimal necessary access — just applied to different surfaces. If you find yourself explaining four different security lessons with four different one-off reasons, stop and ask whether there's one deeper principle underneath all of them. There usually is.

## Recap + quiz

Three things to take away from today. First: the Phase 6 principle — nothing is open or granted by default, and that scope has to be actively enforced across identity, network, data, and delegation, not just assumed. Second: no single log source sees a whole attack, which is exactly why centralized, correlated logging through a SIEM matters. Third: a single event is rarely proof of anything — it's the pattern across correlated events that actually signals an attack.

Now pause the video and think through these three questions yourself before I move on:

One — in one sentence, what's the unifying principle behind S3 exposure, open security groups, exposed secrets, and the PassRole escalation chain?

Two — if CloudTrail logs every single API call, why isn't CloudTrail by itself a complete detection solution?

Three — why does a rule correlating PassRole and CreateFunction together produce far fewer false positives than a rule that alerts on any PassRole call alone?

## Outro / CTA

Here's today's operational takeaway: a single log event is almost never proof of an attack by itself — real detection comes from correlating identity, source, and the sequence of actions across multiple events, not from reacting to any one API call in isolation. If you're following this series, drop your answer to question three in the comments — I want to see if you can articulate the false-positive reasoning in your own words. Follow along for Day 32, where we go deeper into SIEM concepts proper and alert triage.

## On-screen text / b-roll suggestions

- Lower-third caption during the hook: "Real CloudTrail event — not a simulation"
- On-screen text during the principle segment: "Default-deny. Minimal necessary access. Actively enforced."
- Screen recording of the actual `aws cloudtrail lookup-events` command and its JSON output
- Callout box highlighting `userIdentity`, `sourceIPAddress`, `mfaAuthenticated`, and the redacted `requestParameters` field
- Simple diagram: five boxes (Identity / Org Policy / Network / Data / Delegation) all pointing to one central label ("Default-deny, minimal necessary access")
- Simple sequence diagram: PassRole → CreateFunction, same identity/IP, within a time window, flagged as correlated
- End-screen quiz card with the three review questions
