# Day 29 — Cloud Misconfigurations: Security Groups & Exposed Secrets — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

I just ran one command against a real AWS account and got back eight thousand, one hundred and one security groups. Not eight. Not eighty. Eight thousand one hundred and one. And the first thing I did with that number was not trust it. Because in security, a result that looks "too clean" is usually either a real win — or a bug quietly lying to you. Today I'm going to show you exactly how you tell the difference.

[SCREEN: terminal showing `aws ec2 describe-security-groups ... | jq ... | length` returning `8101`]

## Intro

This is Day 29 of my cybersecurity training series, working toward CEH-level knowledge from the ground up. We're in Phase 6, Cloud Security, and today's topic is the stuff that actually causes most real-world cloud breaches — not exotic zero-days, but boring misconfigurations: security groups left wide open to the internet, and secrets handled carelessly. By the end of this video you'll know exactly what to look for, and — more importantly — how to not fool yourself when your audit tool tells you everything's fine.

## Teaching segment: why port 22 is not like port 80

Let's start with security groups. Think of a security group as a firewall ruleset attached to a cloud resource — it says what traffic can come in, on what port, from where. The single most common dangerous misconfiguration you'll see in the real world is an inbound rule that allows traffic on a sensitive port — like 22 for SSH, or 3389 for Windows Remote Desktop — from "0.0.0.0/0." That CIDR notation just means "any IP address on the entire internet."

Now here's the question I actually posed in this session: if port 22 open to the whole internet is bad, why is it totally normal — expected, even — to have port 80 or 443 open to the whole internet on a web server?

[SCREEN: simple diagram, two boxes — "Port 80/443: Web Server" with a globe icon pointing at it, vs "Port 22: SSH" with the same globe icon and a red X]

The answer isn't "web servers are just more hardened." The real distinction is about intent and blast radius. Port 80 and 443 are *designed* to be public — that's literally the web server's job, to answer requests from anyone on earth. And if someone finds a bug in the web app running behind it, they get whatever that application lets them do — an application-level foothold, bounded by the app's own logic.

SSH, on the other hand, is an administrative access path. It's meant for a small, trusted set of people — admins, automation — not the entire internet. Opening it to everyone does two bad things simultaneously. First, it massively increases your exposure to credential attacks — every bot scanning the internet can now throw brute-force and password-spraying attempts at your login around the clock. And second — this is the big one — if someone actually gets in, they don't get "whatever the app allows." They get a full operating-system-level shell on that machine. That is a categorically bigger compromise than an app-level bug.

And here's something genuinely interesting that came out of this session: a real-world example from an actual company's security posture. Their policy blocks plain HTTP entirely and only allows HTTPS on 443 — and they don't allow public SSH at all, managing every server instead through a tool called AWS Systems Manager, or SSM. SSM is powerful because the managed server makes an *outbound* connection to AWS — there's no inbound port sitting open for anyone to even attempt an attack against. Zero listening ports, zero attack surface for that vector. That's actually a stronger model than "restrict SSH to a few trusted IPs" — it's "don't have an open door at all."

So the real principle isn't "public is bad, private is good." It's: does this port genuinely need to be reachable, and if so, are you exposing the secure version of that service?

## Teaching segment: auditing 8,101 security groups for real

Here's where it got hands-on, for real, against a real cloud account. I asked for a read-only audit: pull every security group in the account and look for any of them allowing inbound traffic from the entire internet on a sensitive port.

[SCREEN: `aws ec2 describe-security-groups --query "..." --output json > sg-audit.json`]

That one command returned 8,101 security groups. Manually scrolling through that is not realistic — this is exactly why automated auditing tools exist. So the next step used a tool called `jq`, which lets you filter and query JSON data from the command line, to search specifically for any security group with an inbound rule open to "0.0.0.0/0" on ports like 22, 3389, 3306, 5432, or 1433 — SSH, RDP, MySQL, Postgres, and SQL Server.

[SCREEN: jq filter command and its output: `0`]

The result came back zero. And this is the moment that actually matters most in this whole video: zero results on 8,101 security groups is *suspicious*. It's either a genuinely well-run account — or a silently broken filter quietly telling you "all clear" when it isn't. So before trusting it, we widened the filter to catch *any* port open to the whole internet, not just the sensitive ones. Still zero. Then we inspected the raw structure of the JSON data itself, to rule out the possibility that the filter was looking for the wrong field name entirely. The structure checked out.

And then came the real verification step: running a completely different, dumber tool — a plain text search, `grep`, counting literal occurrences of the string "0.0.0.0/0" anywhere in the entire file. No logic, no interpretation, just "does this exact text appear." That also came back zero.

[SCREEN: `grep -c '0.0.0.0/0' sg-audit.json` → `0`]

That's the moment you can actually trust the result. Two structurally different tools, one using logic-based filtering and one using dumb string matching, agreeing on the same answer. That account genuinely has zero security groups exposing a sensitive port — or any port — to the open internet, across all 8,101 of them. That's a real, earned "clean," not a false negative dressed up as good news.

## Teaching segment: the problem with "I moved it to an environment variable"

The second misconfiguration class today was exposed secrets — API keys, database passwords, that kind of thing. The classic bad pattern is a password hardcoded directly into source code. Someone eventually realizes that's bad and "fixes" it by moving the password into an environment variable on the same cloud function instead.

Here's the question that actually has a sharp answer: has that actually solved the problem?

No — and the reasoning matters. Moving a secret into an environment variable does get it out of source code, so it won't end up committed into git history. But anyone who has read access to that function's configuration — through the console, or through an API call — can still see that value in plain text, unless you've layered encryption on top. Often that's actually a *larger* group of people than the handful who had access to the original code repository. You haven't removed the exposure. You've relocated it.

[SCREEN: simple before/after diagram — "Hardcoded in code" → "Env variable" → both labeled "still plaintext-readable", vs "Secrets Manager" labeled "encrypted + logged + rotated"]

A real secrets manager is different for three concrete reasons: it requires a specific, narrow permission just to read that one secret — not general read access to the function; every single retrieval gets logged, so you have a real audit trail of who accessed it and when; and it can rotate the secret automatically on a schedule, shrinking the window where a leaked credential is still useful to an attacker.

## Mistake/correction moment

A genuinely great question came up during this session: if a secret rotates automatically, how does the actual downstream system — say, a SQL database — find out its password changed, without someone manually updating it?

That's not a small question — it's the thing that makes rotation either secure or completely broken. The answer is that rotation isn't just "change a stored value." AWS Secrets Manager runs rotation as a coordinated, four-step process through a small function: it generates a new candidate password, then — this is the critical step — actually connects to the real database and changes the password there to match, then tests that it can log in with the new credential, and only after that succeeds does it mark the new version as the current one that your application will receive. If any step fails, it stops before finalizing, so you never get locked out. The one thing your own application needs to do right is not cache that secret forever at startup — it needs to fetch it fresh, or refresh it periodically, so it actually picks up the new value.

## Recap + quiz

Three things to take away: a port being open to the public internet isn't automatically bad — it depends on whether that's the port's actual job, and what level of access a compromise there would grant. An environment variable is not a security boundary — it's just a different, often bigger, visibility boundary than source code. And automatic secret rotation only works because of a real coordinated process that updates the actual target system, not just a database record.

Before I give you the answers, pause and think about these three: if you found a security group allowing inbound RDP, port 3389, from the entire internet, what's the risk, and what's the equivalent fix to SSM for Windows machines? Second — a teammate tells you "we're secure now, I moved the API key to an environment variable" — what's your one-sentence correction? And third — why did it matter that we verified the jq filter's "zero results" with a completely different tool, grep, instead of just trusting the first answer?

## Outro / CTA

Here's today's operational takeaway: when a security scan comes back completely clean on a large dataset, don't report "all clear" off a single tool's output — verify with a second, independent method first, because a silent tooling bug and a genuinely secure environment look exactly the same from where you're standing. If you want to follow along as this series moves into IAM privilege escalation chains next, hit follow, and drop your answer to the RDP question in the comments — I'll tell you if you got the SSM equivalent right.

## On-screen text / b-roll suggestions

- Lower third: "Day 29 — Cloud Security: Misconfigurations"
- On-screen caption during hook: "8,101 security groups. 0 trusted blindly."
- Split-screen diagram: Port 80/443 (public-by-design, app-level compromise) vs Port 22/3389 (admin-only, full OS compromise)
- Screen recording: the actual `aws ec2 describe-security-groups` command and JSON output
- Screen recording: `jq` filter command + result, then `grep -c` command + result side by side
- On-screen text: "Env variable = still plaintext-readable, just a different audience"
- Diagram: Secrets Manager rotation lifecycle — createSecret → setSecret (updates real DB) → testSecret → finishSecret
- Closing caption: "Verify clean results with a second method before you trust them"
