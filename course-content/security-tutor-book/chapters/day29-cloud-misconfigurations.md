---
day: 29
title: "Chapter 29: Cloud Misconfigurations — Security Groups and Exposed Secrets"
course_phase: "Phase 6 — Cloud Security"
status: draft, good source fidelity
source: "day-29/video-writeup.md + progress.md"
has_diagram: true
---

# Chapter 29: Cloud Misconfigurations — Security Groups and Exposed Secrets

## Learning objectives

By the end of this chapter, you will be able to:
- Explain why an inbound rule open to the entire internet is dangerous on an administrative port (SSH, RDP) but normal and expected on a public web port (HTTP/HTTPS)
- Describe how AWS Systems Manager (SSM) eliminates the open-port attack surface entirely, for both Linux and Windows
- Explain why moving a hardcoded secret into an environment variable does not actually secure it, and what a real secrets manager adds that an environment variable cannot
- Walk through the real four-step lifecycle a secrets manager uses to rotate a credential on both ends — in storage and on the actual target system

## The concept

Chapter 27 and Chapter 28 covered the shared responsibility model and IAM policy evaluation — the two foundational layers of cloud security. This chapter moves into the territory that actually causes most real-world cloud breaches: not exotic attacks, but ordinary misconfigurations that sit in plain sight until someone (ideally a defender, not an attacker) goes looking for them.

The first of these is the overly permissive security group. A security group is a firewall ruleset attached to a cloud resource, specifying what traffic is allowed in or out, on what port, from where. The single most common dangerous pattern is an inbound rule allowing a sensitive port — 22 for SSH, 3389 for Windows Remote Desktop, or a database port like 3306 or 5432 — from `0.0.0.0/0`, meaning any IP address on the entire internet.

The natural question this raises is why that same `0.0.0.0/0` exposure is completely normal, even required, on a public-facing web server listening on port 80 or 443. The answer isn't that web servers are simply more hardened. It comes down to intent and blast radius. A web port is *designed* to be reached by anyone — that is its entire purpose. If an attacker compromises the application behind it, they get whatever that application's logic allows: an application-level foothold, bounded by the app itself. An administrative port like SSH, by contrast, is meant for a small, trusted set of operators and automation — not the public internet. Opening it to everyone does two things at once: it hands every scanning bot on the internet a target for credential attacks (the brute-force and password-spraying techniques covered back in Chapters 22 and 23), and if an attacker does get in, they don't get an application-level foothold — they get a full operating-system shell on the host. That is a categorically larger compromise than a web-app bug, independent of anything a pivot might achieve afterward.

A real-world example sharpens this further. Some organizations block plain HTTP outright and only allow the encrypted HTTPS variant on 443, and separately block SSH access entirely, managing every server instead through **AWS Systems Manager (SSM) Session Manager**. SSM works because the managed instance makes an *outbound* connection to the AWS SSM service; there is no inbound port listening for anyone to even attempt a connection against. That is a stronger security posture than "restrict SSH to a handful of trusted IP ranges" — it removes the open door altogether, rather than guarding it more carefully. And critically, SSM is not Linux-specific: the same agent and session model supports Windows RDP-equivalent sessions, so the exact same tool that replaces SSH for Linux nodes also replaces exposed RDP for Windows nodes.

![Diagram: two contrasting port-exposure models — Port 80/443 open to the public internet feeding an app-level boundary, versus Port 22/3389 either open to the internet (full OS compromise) or replaced entirely by an outbound-only SSM connection with no listening port at all](images/day29-port-exposure-models.svg)

The second misconfiguration class is exposed secrets — API keys, database passwords, and similar credentials. The classic bad pattern is hardcoding a password directly in source code, where it risks ending up committed to git history permanently. The common but incomplete fix is moving that password into an environment variable on the same cloud function instead. This does get the secret out of source code — but anyone with read access to that function's configuration, through the console or an API call, can still see the value in plain text unless encryption is layered on top separately. Often that group of people (everyone with console read access to the account) is *larger* than the handful who had access to the original repository. The exposure hasn't been removed; it has been relocated.

A real secrets manager — AWS Secrets Manager or Parameter Store, for example — differs in three concrete ways, not merely "it's not in the code." First, access requires a narrow, specific IAM permission scoped to that one secret, not general read access to the resource holding it. Second, every retrieval is logged, producing a genuine audit trail of who or what accessed the secret and when — something a plain environment variable provides no equivalent of. Third, the secret can rotate automatically on a schedule, shrinking the window during which a leaked credential remains useful to anyone who obtained it.

## Hands-on lab recap — REAL LAB

The security-group half of this session was a real, read-only audit against the learner's actual shared AWS account (account 524234064850, profile `icd`) — the same account used in Chapters 27 and 28. Running `aws ec2 describe-security-groups` returned **8,101 security groups**, far too many to review by hand, which is precisely the reason automated auditing exists. A `jq` filter was built to search that output for any inbound rule allowing `0.0.0.0/0` on a sensitive port (22, 3389, 3306, 5432, or 1433). It returned zero matches.

Zero across 8,101 groups is a result worth treating with suspicion rather than immediate relief — a silently broken filter and a genuinely well-run account look identical from a single tool's output. So the filter was broadened to catch `0.0.0.0/0` on *any* port at all, not just the sensitive list; that also returned zero. The raw JSON structure was then inspected directly to rule out a field-name mismatch causing a silent false negative. With the structure confirmed correct, a second and structurally unrelated verification method was used: a plain-text search with `grep -c '0.0.0.0/0'` across the entire exported file, counting literal string occurrences with no filtering logic involved at all. That also returned zero. Two tools, one built on logical selectors and one on dumb string matching, agreeing on the same answer, is what actually earns the conclusion: this account genuinely has zero security groups exposing any port to the open internet, across all 8,101 of them — consistent with the organization's real policy of blocking public SSH entirely and managing nodes through SSM. This was a read-only exercise throughout; no resource was created, modified, or needed cleanup.

The secrets portion of the session was conceptual rather than a built lab, working through the environment-variable-versus-Secrets-Manager reasoning above using a hypothetical Lambda-and-SQL-database scenario. A genuinely sharp, self-directed follow-up question drove the most valuable part of this segment: if a secret rotates automatically, how does the downstream system — the actual SQL server — learn its password changed, without someone manually updating it? The answer is that AWS Secrets Manager rotation is not merely a stored value changing; it runs as a coordinated four-step process through a small rotation function: **createSecret** generates a new candidate password and stores it as a pending version while the old one remains active; **setSecret** is the step that actually connects to the real target system — the SQL server itself — and changes the credential there to match; **testSecret** verifies the rotation function can log in successfully using the new credential; and only after that success does **finishSecret** mark the new version as current, the one the application's `GetSecretValue` calls will now receive. If any step fails, the process halts before `finishSecret`, so the old credential remains valid rather than locking everyone out. The one remaining requirement on the application side is not caching the secret indefinitely from startup — it needs to re-fetch, or use a reasonably short cache lifetime, so it actually picks up the rotated value rather than continuing to use a stale one.

## Review questions

1. A security group allows inbound RDP (port 3389) from `0.0.0.0/0` on a Windows instance. What's the risk, and what's the SSM-equivalent fix?
2. A teammate says, "I moved the API key into an environment variable instead of hardcoding it, so we're secure now." What's the one-sentence correction?
3. Why did it matter to verify the `jq` filter's "zero results" finding with a second, structurally different tool (`grep`) before trusting it?

### Answers

1. The risk is identical in kind to open SSH: anyone on the internet can attempt credential attacks against the RDP login, and a successful login grants a full operating-system-level session on the host, not merely application-level access. The fix is the same tool already used for Linux — AWS Systems Manager Session Manager supports Windows sessions through the same outbound-only agent model, so no inbound RDP port needs to be open at all.
2. Moving a secret to an environment variable only removes it from source code; it remains plaintext-readable by anyone with read access to that resource's configuration, which is often a larger group than those who had access to the original repository — real security requires a secrets manager with scoped access, logged retrieval, and rotation.
3. A logic-based filter like `jq` can contain a subtle bug in its selector or condition that silently produces a false "zero results," which would be indistinguishable from a genuinely clean account without independent confirmation; cross-checking with a structurally unrelated method — a dumb literal string search — rules out a tooling bug before the clean result is reported as fact.

## Operational takeaway

> When a security scan returns a completely clean result on a large dataset, verify it with a second, independent method before trusting it — a silent tooling bug and a genuinely secure environment produce identical output from a single tool.

## Today in the broader Security Tutor journey

This chapter continues Phase 6 — Cloud Security, moving from Chapter 28's policy-evaluation mechanics into the broader class of misconfigurations that actually show up in real incidents: open administrative ports and carelessly handled secrets. The verification discipline running through this phase — check for guardrails at more than one layer in Chapter 27, simulate a policy before attaching it in Chapter 28 — reappears here in a slightly different but equally important form: don't trust a single tool's "all clear" without a second, independent check. The next session in this phase moves into IAM privilege-escalation chains, where individually reasonable-looking permissions — like the ability to pass a role to a Lambda function — combine into something far more dangerous than either permission looks on its own, a natural extension of the policy-evaluation groundwork laid in Chapter 28.
