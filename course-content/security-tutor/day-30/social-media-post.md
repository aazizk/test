# Day 30 — IAM Privilege Escalation: PassRole + CreateFunction

## LinkedIn

Today I proved, against a real AWS account, that two "harmless" permissions can add up to reading a secret you were never granted access to.

The setup: a hypothetical low-privilege user with exactly two permissions — iam:PassRole and lambda:CreateFunction. Neither one grants direct access to anything sensitive on its own.

I found a real role in the account (kafka-tls-testing-role) with narrowly-scoped access to one specific KMS key and one specific secret — not wildcarded, genuinely well-configured. Using AWS's policy simulator (zero real resources touched, pure policy evaluation), I ran three tests:

1. Can this user read the secret directly? Denied.
2. Can this user pass the role to a service? Allowed.
3. Can this user create a Lambda function? Allowed.

Put 2 and 3 together and the "denied" in step 1 doesn't matter anymore — create a function, hand it the role, let the function read the secret using permissions the user never had directly. No admin access needed. No wildcard policy needed. Just two individually reasonable permissions sitting next to each other.

The best part of today was a question I asked myself before even starting the exercise: does PassRole alone let a service assume any role you point it at? No — a role's trust policy is a completely separate gate that has to independently allow that service. Both gates have to be open for this to work.

Takeaway: never audit iam:PassRole in isolation. Always check what it's sitting next to.

#CyberSecurity #CloudSecurity #AWS #IAM #CEH #LearningInPublic

## Twitter/X

Gave a hypothetical AWS user exactly 2 permissions: PassRole + CreateFunction. No admin. No direct secret access.

Result: still read a KMS-protected secret, by passing a real role to a Lambda function.

Neither permission is dangerous alone. Together? Full escalation. 🔓

#AWS #IAM
