# Day 28 — AWS IAM: Users, Roles, and Policy Evaluation Logic — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

I just ran one AWS command against a real IAM policy — not a diagram, not a slide — and it told me, in plain JSON, that if this policy were attached to a compromised server, the attacker could delete every S3 bucket, create a brand-new admin user, and terminate every EC2 instance in the account. One policy. Three ways to burn the place down. And the scariest part? That policy is only four lines long, and I see policies that look almost exactly like it in real production accounts all the time.

[SCREEN: terminal showing the `Action: "*", Resource: "*"` JSON policy]

## Intro

This is Day 28 of my cybersecurity training series, and we're deep into Phase 6: Cloud Security. If you're following along toward a CEH-level understanding of security, or you just manage any AWS account at work, today's topic is one of the highest-leverage things you can learn: how AWS actually decides whether to let a request through. By the end of this video, you'll understand IAM users versus roles, what a policy actually is, and the exact evaluation logic AWS uses — and we're going to prove all of it against a real AWS account, live.

## Teaching segment: Users vs. Roles

Let's start with identity. In AWS, there are two main ways something — a person or a piece of software — gets an identity: an IAM **user**, or an IAM **role**.

A user is what you'd expect: a persistent identity, usually for a human, with long-lived credentials — a password, maybe access keys. Those keys don't expire on their own. If they leak — get committed to a public GitHub repo, say, which happens constantly — they're valid until someone manually notices and revokes them.

A role is different. It's a temporary identity that something assumes — a user, an EC2 instance, a Lambda function, even another AWS account — and when it's assumed, AWS hands back short-lived credentials, usually good for about an hour. No long-lived secret sits on the role itself.

This difference matters enormously for security. A compromised role's credentials have a built-in expiration clock working against the attacker. A compromised user's long-lived keys don't — they're valid until someone finds them and kills them, which could be days, weeks, or never.

## Teaching segment: Policies and least privilege

Now, what controls what a user or role can actually *do*? That's a **policy** — a JSON document with a few key parts. Here's a minimal one:

[SCREEN: JSON policy with Effect, Action, Resource highlighted]

```
{
  "Effect": "Allow",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::my-bucket/*"
}
```

`Effect` is Allow or Deny. `Action` is the specific API call being permitted — here, just reading an object from S3. `Resource` scopes it down to one specific bucket, not every bucket in existence.

That scoping is the whole idea behind **least privilege**: grant exactly what's needed, and nothing more. The opposite — the dangerous version — is `Action: "*"`, `Resource: "*"`. That's not "read one bucket." That's "do literally anything to literally everything." And that's exactly the policy I ran through the simulator in the hook.

## Teaching segment: Policy evaluation logic

Here's the part that actually matters most, because it's what AWS uses to make every single access decision, and it trips people up constantly.

Rule one: the default is **implicit deny**. If nothing says you can do something, you can't.

Rule two: an explicit **Allow** somewhere — in your user's policy, a role's policy, a resource-level policy — opens that door.

Rule three, and this is the one to really remember: an explicit **Deny**, from anywhere, always wins. It doesn't matter how many Allows you stack on top of it. One Deny beats all of them.

This gets even more interesting at the organization level with something called a Service Control Policy, or SCP. An SCP can sit above individual AWS accounts and say "nobody in this account can ever do X" — and it overrides even a full-access Allow underneath it. But here's the subtlety: an SCP by itself never *grants* anything. It only sets a ceiling. You still need an actual IAM policy Allow underneath it, or the answer is still no.

[SCREEN: simple diagram — Implicit Deny → Explicit Allow needed → Explicit Deny always wins, SCP as a ceiling layer on top]

## Teaching segment: Proving it live with simulate-custom-policy

Theory's nice, but I wanted to actually see this decided by AWS, not just describe it. So I used a real, genuinely safe AWS CLI command: `aws iam simulate-custom-policy`. It takes a policy document and a list of actions, and tells you Allowed or Denied — without ever creating or touching a real IAM user, role, or resource. It's pure evaluation.

[SCREEN: terminal running `aws iam simulate-custom-policy` with the overbroad policy]

I ran the dangerous wildcard policy — `Action: "*"`, `Resource: "*"` — against three actions: deleting an S3 bucket, creating a new IAM user, and terminating EC2 instances. All three came back `allowed`. Real output, real AWS evaluation engine, confirming exactly the blast radius we just talked about — including that "create a new IAM user" one, which is a classic attacker move: plant a backdoor admin account so even if the original hole gets patched, they still have a way back in.

Then I tightened it. New policy: just `s3:GetObject`, scoped to one specific bucket. Before running it, I predicted the outcome — only that one read action would be allowed, everything else implicit-deny. Ran it, and that's exactly what came back: `GetObject` allowed, bucket deletion, IAM user creation, and EC2 termination all `implicitDeny` — with no Deny statement even written. Just the natural result of only granting what was actually needed.

## Mistake/correction moment

This session had a real debugging moment worth sharing, because it's the kind of thing that happens constantly with AWS CLI work. My first attempt at running the simulator used `--policy-input-list file:///tmp/policy.json` — pointing at a file on disk. It failed, every time, with a cryptic `InvalidInput: invalid content` error — even though the JSON in that file was completely valid, which I confirmed with Python's `json.tool`.

[SCREEN: terminal showing the file:// error, then the json.tool validation passing]

The fix turned out to be simple once isolated: pass the policy as an inline JSON string directly on the command line instead of referencing a file. That worked immediately. The lesson here isn't really about IAM — it's a broader debugging lesson: when a tool gives you a vague error, don't assume your data is wrong. Isolate the variables one at a time. Is the JSON itself valid? Yes. Does a simpler version of the same input still fail? Yes. That process of elimination is what told us the problem was in how the file reference was being read, not in the policy itself.

## Recap + quiz

So, three things to lock in from today. One: roles beat long-lived user keys for anything automated, because roles expire and keys don't. Two: a policy is just Effect, Action, and Resource — and least privilege means scoping all three as tightly as the job actually requires. Three: AWS evaluation logic is implicit-deny by default, requires an explicit allow, and an explicit deny anywhere always wins — no exceptions, even across SCPs.

Now, pause the video and think through this: if an identity-based policy grants `s3:*` with an explicit Allow, but a separate resource-based bucket policy has an explicit Deny for that same principal, what's the final decision — and why? I'll give you a second... the answer is Deny. Explicit deny always wins, regardless of which layer it comes from.

## Outro / CTA

Here's today's operational takeaway, and it's one you can use literally today if you touch any AWS account: before you ever attach a policy to anything, run it through the policy simulator against your highest-risk actions first. Catch "this is way too broad" before you grant it — not after someone's dug through CloudTrail logs trying to figure out what an attacker did with it.

If you want to follow the next step in this series, we're moving into cloud misconfigurations beyond IAM basics — things like wide-open security groups and exposed secrets. Subscribe so you don't miss it, and drop your answer to today's quiz question in the comments — I want to see if you got the Deny-always-wins logic right.

## On-screen text / b-roll suggestions

- Lower-third on Hook: "Action: * / Resource: * — one policy, full account compromise"
- Caption during Users vs. Roles: "User = long-lived keys | Role = temporary, auto-expiring credentials"
- On-screen diagram during Policy Evaluation Logic: "Implicit Deny → Explicit Allow → Explicit Deny ALWAYS wins"
- Screen recording: full terminal session of both `simulate-custom-policy` runs (overbroad policy, then least-privilege policy), with EvalDecision fields circled/highlighted
- Caption during Mistake moment: "file:// failed — inline JSON string worked. Isolate variables, don't guess."
- Closing caption: "Simulate before you attach. Every time."
