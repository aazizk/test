# Day 31 — Phase 6 Wrap-Up + Phase 7 (Detection) Begins

## LinkedIn

`"eventName": "SimulateCustomPolicy"`, `"sourceIPAddress": "147.161.161.27"`, `"mfaAuthenticated": "false"`.

That's not a textbook log sample — that's a real CloudTrail event I pulled from my own AWS account today, two days after I actually ran the command. Day 31 of my cybersecurity course closed out Phase 6 (Cloud Security) and opened Phase 7 (Detection), and the two connected in a way I didn't expect.

First, the wrap-up: I had to find the single idea tying together everything we'd covered — public S3 buckets, open security groups, exposed secrets, and IAM privilege-escalation chains. My first answer was "least privilege," but that doesn't explain an open security group — nobody's permissions are over-granted there. The real principle: nothing is open, granted, or reachable by default. Identity, network, data, and delegation all get the same treatment — minimal necessary access, actively enforced, not assumed.

Then Phase 7 kicked off with a real hands-on exercise: I queried my actual AWS account's CloudTrail history and pulled back the genuine log entries from an exercise I'd run two sessions ago. Reading the real JSON taught me more than any example could — fields like `userIdentity`, `sourceIPAddress`, and even a redacted `requestParameters` block (AWS hides simulated policy content for security reasons) are exactly what a detection rule would look at.

The big insight: CloudTrail logs every API call regardless of intent, but a single event proves almost nothing. A `PassRole` call by itself is routine. `PassRole` followed seconds later by `CreateFunction`, from the same identity and IP? That sequence is the real signal — which is exactly why SIEMs correlate events instead of alerting on any single one.

Hands-on, against my own real account, no simulation today.

#CyberSecurity #CloudSecurity #AWS #CEH #Detection #LearningInPublic

## Twitter/X

Pulled a real CloudTrail event from my own AWS account today: `mfaAuthenticated: false`, redacted request params, the works. Lesson: one log line proves nothing — it's PassRole + CreateFunction in sequence, same identity/IP, that's the real signal. Day 31 of my security course. 🔍

#AWS #CyberSecurity #CEH
