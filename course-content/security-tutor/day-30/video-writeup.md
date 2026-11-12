# Day 30 — IAM Privilege Escalation: PassRole + CreateFunction — Video Script

**Estimated length:** ~10 minutes (~1450 words)

## Hook

A user in a real AWS account has exactly two permissions. Not admin. Not Secrets Manager. Not KMS. Just two: the ability to pass an IAM role to a service, and the ability to create a Lambda function. I'm going to show you, with a real role from a real account, how those two permissions alone let that user read a secret they were never, ever granted access to.

[SCREEN: terminal showing the final simulate-custom-policy output — secretsmanager:GetSecretValue → implicitDeny, iam:PassRole → allowed, lambda:CreateFunction → allowed]

## Intro

Day 30 of this cybersecurity series, still in Phase 6, Cloud Security. If you've been following along, we've covered the shared responsibility model, how AWS evaluates IAM policies, security groups, and secrets management. Today is where those pieces combine into something genuinely dangerous: a privilege escalation chain that doesn't require any single broken permission — just two reasonable-looking ones sitting next to each other.

## Teaching segment: what makes PassRole dangerous

Let's start with the permission at the center of this: `iam:PassRole`. On its own, it sounds almost boring — it just lets a user hand a role off to an AWS service. "When this Lambda function runs, let it use this role." That's it. It doesn't let the user assume the role themselves, and it doesn't directly grant any of the role's permissions to the user.

The danger shows up the moment you combine it with a second permission: the ability to *create* something that uses roles. The classic pairing is `lambda:CreateFunction`. If a user has both, here's what becomes possible: they create a new Lambda function, they pass that function a role that's far more privileged than anything they themselves have access to, and then they write a few lines of code inside that function that use the role's permissions to do whatever that role is allowed to do. The user never touched an admin permission. They borrowed one, through a function they were only ever supposed to deploy.

[SCREEN: simple diagram — low-privilege user, arrow labeled "PassRole" to a Lambda function, arrow labeled "assumes" from Lambda to a privileged role, arrow labeled "now has access to" pointing at KMS and Secrets Manager]

Before diving into the exercise, a genuinely important question came up in this session that's worth pausing on: does `PassRole` alone let a Lambda assume any role you point it at? The answer is no — and this is the part people miss. A role has two separate controls. There's the permissions policy, which says what the role can *do*. And there's a completely separate document called the trust policy, which says who or what is allowed to *assume* the role in the first place. `PassRole` doesn't override the trust policy. If a role's trust policy doesn't already list the Lambda service as a trusted principal, the function can be created, the role can be attached to it, but when that function actually tries to run, AWS will refuse to let it assume the role. The trust relationship simply doesn't exist. So the real precondition for this whole attack is: the target role's trust policy already allows the service you're trying to hand it to. That's usually true for any role that was built to actually be used by Lambda or EC2 for a legitimate purpose — which is exactly why this attack is realistic in the real world, not just theoretical.

## Teaching segment: proving it against a real role

Here's where this stopped being theoretical and became a real exercise against a real AWS account. The first step was finding an actual role in the account whose trust policy allows Lambda to assume it.

[SCREEN: `aws iam list-roles --query "Roles[?AssumeRolePolicyDocument.Statement[?Principal.Service=='lambda.amazonaws.com']].RoleName"`]

That returned a long list of real roles. One was picked for the exercise: `kafka-tls-testing-role-l6yt6b49`. Next step, look at what that role can actually do — because that tells you how big a prize it would be. It had two standard AWS-managed policies for basic Lambda logging and VPC access, nothing special there. But it also had two inline policies with names worth investigating: `kms-access` and `secret-access-policy`.

[SCREEN: the actual policy documents — kms:Decrypt and kms:GenerateDataKey scoped to one specific KMS key, secretsmanager:GetSecretValue scoped to one specific secret]

Pulling the actual JSON showed something genuinely interesting: this role was correctly, narrowly scoped. One specific KMS key. One specific secret, named `kafka-tls-test-secret-JwBzTU`. Not a wildcard in sight. That's actually the best possible teaching example, because it proves the point that even a well-scoped role becomes a target if the wrong party can borrow it.

Now, the proof. Using the same AWS policy simulator from a previous session — a tool that evaluates a policy document against real actions without ever touching a real resource — three tests were run. First: does a hypothetical low-privilege policy, one that only has PassRole and CreateFunction and nothing else, allow reading that secret directly?

[SCREEN: `simulate-custom-policy` call, result: EvalDecision "implicitDeny"]

No. Flat denied. That user cannot read the secret on their own. Second test: does that same minimal policy allow passing this specific role?

[SCREEN: result: "allowed"]

Yes. And third: does it allow creating a Lambda function?

[SCREEN: result: "allowed" — after fixing a resource-type mismatch, explained in the next section]

Also yes. Put it together: that user can create a function, hand it this role, and have the function itself call `secretsmanager:GetSecretValue` and `kms:Decrypt` using permissions the user never had directly. The secret that was flatly denied a moment earlier is now fully readable — borrowed through a role via a function the user was only ever supposed to deploy. All three of these tests were pure policy simulation. No Lambda was actually created. No resource in the account was touched.

## Mistake/correction moment

The first attempt at testing `lambda:CreateFunction` actually came back `implicitDeny`, and for a second that looked like the attack had failed. It hadn't. The real cause was a mistake in how the test policy itself was written, not anything about the role or the actual permissions. The test policy's `Resource` field had been scoped to the IAM role's ARN — correct for `iam:PassRole`, which operates on a role. But `lambda:CreateFunction` acts on a completely different resource type, a Lambda function ARN, not a role ARN. So when the simulator checked `CreateFunction` against the role's ARN, it simply didn't match that statement's resource scope at all — nothing about the attack itself, purely a type mismatch in the test. Giving `CreateFunction` its own statement, scoped to a wildcard or an actual function ARN, fixed it immediately and the real `allowed` result came through.

This produced a related mix-up worth calling out honestly: after the fix, it was easy to misattribute that first deny to "the role doesn't have a createfunction verb" — mixing up what the *role* allows with what the *test policy being evaluated* allows. Those are two completely different things in this exercise. The role's own permissions were never being tested in that step at all; only the hypothetical attacker's policy was.

## Recap + quiz

Three takeaways: `PassRole` is dangerous specifically in combination with anything that lets you create a resource that assumes a role, not on its own. A role's trust policy and `PassRole` are two separate, both-required gates — missing either one breaks the chain. And a role being narrowly scoped doesn't make it immune to this kind of escalation; it only limits how much damage is possible if someone successfully borrows it.

Pause here and think about these three questions before I give you my own answers: if you wanted to close this specific escalation path without breaking your team's ability to legitimately deploy Lambda functions with other roles, which single permission would you restrict? Second, in a policy simulation, if an action comes back denied, how do you tell whether that's a real security block or just a resource-type mismatch in how you wrote the test? And third, does scoping a role's permissions narrowly, to one key and one secret, actually prevent this kind of privilege escalation, or only limit its impact?

## Outro / CTA

Operational takeaway for today: never audit `iam:PassRole` in isolation — always look at it together with whatever "create a thing that assumes a role" permission sits next to it, because neither one looks dangerous by itself, and that's exactly the point. If you want to see how this plays into detection — how you'd actually notice someone doing this in a real account — that's likely where this series heads next. Follow along, and drop your answer to the resource-type-mismatch question in the comments.

## On-screen text / b-roll suggestions

- Lower third: "Day 30 — Cloud Security: IAM Privilege Escalation"
- Diagram: low-privilege user → PassRole → Lambda function → assumes role → KMS + Secrets Manager access
- Screen recording: `aws iam list-roles` filtering for Lambda-trusted roles
- Screen recording: the real inline policy JSON for `kms-access` and `secret-access-policy`
- Screen recording: the three `simulate-custom-policy` calls and their results, side by side
- On-screen text: "Trust policy + PassRole = two separate gates, both required"
- On-screen text: "implicitDeny doesn't always mean 'no access' — check resource types first"
- Closing caption: "Audit PassRole together with CreateFunction/RunInstances, never alone"
