# Day 28 — AWS IAM: Users vs. Roles and Policy Evaluation Logic

## LinkedIn

Ran one AWS command today that proved, in real output, exactly why "Action: *, Resource: *" is one of the most dangerous things you can attach to anything.

Day 28 of my cybersecurity training (Phase 6: Cloud Security) covered AWS IAM — users vs. roles, policy structure, and the actual logic AWS uses to decide Allow or Deny:

→ Implicit deny by default
→ Explicit Allow required to open access
→ Explicit Deny always wins, no exceptions — even across org-level Service Control Policies

Instead of just learning this conceptually, I tested it live with `aws iam simulate-custom-policy` — a genuinely safe AWS tool that evaluates a policy document without ever touching a real resource. I ran an overly broad wildcard policy against three risky actions (delete an S3 bucket, create a new IAM user, terminate EC2 instances). All three came back "allowed" — real proof of full-account blast radius from one bad policy. Then I tightened it to least privilege (one bucket, one read action), predicted the outcome, and confirmed it exactly: only that one action allowed, everything else implicit-denied.

The honest moment: my first attempt at this failed with a cryptic error referencing a policy file, even though the JSON was valid. Had to isolate the problem step by step (validate the JSON, try a simpler policy, then try inline input instead of a file reference) before finding the actual cause. A good reminder that debugging unfamiliar tool errors is its own skill, separate from the security concept being tested.

Takeaway: before attaching any IAM policy, run it through the simulator against your highest-risk actions first. Catch "this is too broad" before you grant it, not after an incident.

#CyberSecurity #AWS #CloudSecurity #IAM #LearningInPublic #CEH

## Twitter/X

Ran a real AWS policy through `iam simulate-custom-policy` today.

A simple "Action: *, Resource: *" policy → allowed deleting S3 buckets, creating new IAM users, AND terminating EC2 instances. All confirmed, zero resources actually touched.

Least privilege isn't theory. It's testable. 🔐

#AWS #CyberSecurity #IAM
