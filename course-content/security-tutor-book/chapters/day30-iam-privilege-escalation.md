---
day: 30
title: "Chapter 30: IAM Privilege Escalation — PassRole and CreateFunction"
course_phase: "Phase 6 — Cloud Security"
status: draft, good source fidelity
source: "day-30/video-writeup.md + progress.md"
has_diagram: true
---

# Chapter 30: IAM Privilege Escalation — PassRole and CreateFunction

## Learning objectives

By the end of this chapter, you will be able to:
- Explain why `iam:PassRole` is only dangerous in combination with a permission that creates something which assumes a role, not on its own
- Distinguish a role's permissions policy from its trust policy, and explain why both must independently permit an action for an escalation chain to succeed
- Use `aws iam simulate-custom-policy` to prove a privilege-escalation path against a real policy and role without creating any actual resource
- Recognize when a simulator's `implicitDeny` result reflects a genuine security boundary versus a resource-type mismatch in how a test policy was written

## The concept

Chapter 28 built the foundation of how AWS evaluates IAM policies: implicit deny by default, explicit allow required, explicit deny always wins. Chapter 29 covered misconfigurations that show up at the infrastructure layer — open ports, careless secrets handling. This chapter combines both threads into something more subtle than either: a privilege escalation chain built entirely from individually reasonable permissions.

The permission at the center of it is `iam:PassRole`. On its own, it sounds almost unremarkable — it lets a user hand a role off to an AWS service, saying in effect, "when this resource runs, let it use this role." It does not let the user assume the role themselves, and it does not grant any of the role's own permissions to the user directly. The danger appears only when `PassRole` is paired with a second permission: the ability to create something that *uses* a role to run. The classic pairing is `lambda:CreateFunction`. A user holding both permissions can create a new Lambda function, pass it a role far more privileged than anything they have direct access to, and write code inside that function which exercises the role's permissions on their behalf. The user never touched an admin permission directly — they borrowed one, through a resource they were only ever authorized to deploy.

Before testing this against a real account, a genuinely important clarifying question is worth settling first: does `PassRole` alone let a service assume *any* role a user points it at? The answer is no, and the reason matters. A role is governed by two entirely separate documents. The **permissions policy** defines what the role is allowed to *do* once assumed. The **trust policy** (formally, the assume-role policy document) defines *who or what* is allowed to assume the role in the first place — it lists trusted principals, such as `"Principal": {"Service": "lambda.amazonaws.com"}`. `PassRole` does not override or bypass the trust policy. If a role's trust policy does not already name the target service as a trusted principal, a function can be created and the role attached to it, but the moment that function tries to actually run, AWS refuses the assume-role request — the trust relationship simply isn't there. The real precondition for this entire attack, then, is that the target role's trust policy *already* permits the service being used. This is realistic rather than theoretical precisely because any role built for Lambda or EC2 to use legitimately will already have exactly this trust relationship in place.

![Diagram: a low-privilege user with only PassRole and CreateFunction creates a Lambda function, passes it a privileged role whose trust policy already permits Lambda, and the function assumes the role to reach KMS and Secrets Manager permissions the user never held directly](images/day30-passrole-escalation-chain.svg)

## Hands-on lab recap — REAL LAB

This exercise ran entirely through policy simulation against the learner's actual shared AWS account (524234064850, profile `icd`) — the same account used throughout Chapters 27 through 29 — with zero real resources created, modified, or needing cleanup.

The first step was locating a genuinely real target: a query against `aws iam list-roles`, filtered for any role whose trust policy names `lambda.amazonaws.com` as a trusted principal, returned a long list of candidates. One was selected for the exercise: `kafka-tls-testing-role-l6yt6b49`. Inspecting its attached and inline policies revealed two standard AWS-managed policies for basic Lambda execution and VPC access — unremarkable on their own — alongside two inline policies worth real attention: `kms-access` and `secret-access-policy`. Pulling the actual JSON for both showed the role was narrowly and correctly scoped: `kms:Decrypt` and `kms:GenerateDataKey` limited to one specific KMS key, and `secretsmanager:GetSecretValue` limited to one specific secret, `kafka-tls-test-secret-JwBzTU`. Neither statement used a wildcard resource. This turned out to be the best possible example for the lesson, because it demonstrates that correct, narrow scoping on a role does not by itself prevent an escalation path — it only limits what's reachable if the path is used.

Three `simulate-custom-policy` calls then proved the chain. First, a hypothetical minimal policy — granting only `iam:PassRole` scoped to this one role, and `lambda:CreateFunction` — was tested directly against `secretsmanager:GetSecretValue` on the target secret. The result came back `implicitDeny`: this user genuinely cannot read the secret on their own. Second, the same policy was tested against `iam:PassRole` on the role itself, which came back `allowed`. Third, the same policy was tested against `lambda:CreateFunction`.

That third test produced a real debugging moment, kept in this chapter honestly rather than smoothed into a clean narrative. The first attempt returned `implicitDeny`, which momentarily looked like the escalation path had failed. It had not — the cause was a mistake in how the test policy itself was constructed, unrelated to the role or the attack's validity. The test policy's `Resource` field had been scoped to the IAM role's ARN, which is the correct resource type for `iam:PassRole`. But `lambda:CreateFunction` acts on a different resource type entirely — a Lambda function ARN — so checking it against the role's ARN simply failed to match that statement's resource scope, independent of what permissions actually existed. Giving `CreateFunction` its own statement, scoped to a function ARN (or a wildcard, which is realistic since the function doesn't exist yet at the moment of creation), resolved it immediately: the corrected test returned `allowed`.

Putting the three results together proves the full chain without ever touching a real resource: a user denied direct access to a KMS-protected secret can still create a Lambda function, pass it a role that is permitted to read that secret, and have the function read it on their behalf — reaching permissions they were never directly granted, through a resource they were only ever authorized to deploy.

A related and instructive mix-up followed the fix. When asked why the first `CreateFunction` test came back `implicitDeny`, the initial answer attributed it to the *role* lacking some relevant permission — conflating what the role itself allows with what the *test policy being evaluated* allows. These are entirely different things in this exercise: the role's own permissions were never under test in that step; only a hypothetical user's policy was. This distinction — knowing precisely what a given simulator call is actually evaluating — is worth being deliberate about, since it's easy to default to "the role must be the problem" when a result looks wrong.

## Review questions

1. Without breaking a team's legitimate ability to deploy Lambda functions using appropriate roles, which single permission would you restrict to close this specific escalation path?
2. In a policy simulation, an action comes back `implicitDeny`. How do you tell whether that reflects a real security boundary versus a resource-type mismatch in how the test itself was written?
3. The target role's KMS and Secrets Manager permissions were scoped to one specific key and one specific secret, not a wildcard. Does that narrow scoping prevent this escalation path, or only limit its impact?

### Answers

1. Restrict `iam:PassRole` — ideally scoped with a condition (such as `iam:PassedToService`) so it only permits passing a specific, pre-approved set of roles rather than any role in the account. `PassRole` is the permission doing the actual "lending" in this chain; restricting `CreateFunction` instead would break the team's ability to deploy functions at all, which is not the goal.
2. Check whether the `Resource` field in the policy statement being tested actually matches the resource type the action in question operates on. `iam:PassRole` acts on a role ARN; `lambda:CreateFunction` acts on a Lambda function ARN. A statement scoped to the wrong resource type will produce `implicitDeny` regardless of what permissions actually exist, because the statement simply never applies to that action-resource pairing — this is a test-construction issue, not evidence the underlying permission doesn't exist.
3. It only limits the impact, not prevent the path. An attacker targeting exactly the key or secret the role is scoped to can still reach it through the `PassRole` + `CreateFunction` chain; narrow scoping shrinks the blast radius of what's reachable through a stolen role, but it does nothing to stop the act of borrowing the role itself. The control that actually prevents this is restricting who can pass the role, not how tightly the role's own permissions are written.

## Operational takeaway

> Never audit `iam:PassRole` in isolation — always check what it sits next to. Neither permission alone looks dangerous, which is exactly what makes the combination easy to miss.

## Today in the broader Security Tutor journey

This chapter completes the misconfiguration-and-escalation arc that Phase 6 has been building toward since Chapter 27: shared responsibility established the boundary of what the customer owns, Chapter 28 covered how AWS evaluates whether an action is actually allowed, Chapter 29 looked at misconfigurations in exposed infrastructure and secrets, and this chapter shows how individually correct permissions can still combine into something no single policy review would catch by reading each line in isolation. The resource-type mismatch worked through here also reinforces a theme that has run through this entire phase: before concluding a result means what it appears to mean — whether that's a suspiciously clean security-group scan in Chapter 29 or a denied simulation result here — check the mechanism producing that result before trusting the conclusion. With Phase 6 now substantially complete, the next sessions turn toward Phase 7 — Detection, a natural progression given how often this course's hands-on labs have already provoked the instinct to ask "would this actually get noticed?"
