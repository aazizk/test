# Day 21 — Authentication vs. Authorization, Privilege Escalation, and Credential Attacks — Video Script

**Estimated length:** ~10 minutes (~1450 words)

## Hook

Here's a question that trips up a lot of people studying for CEH: a web app lets any logged-in user hit a URL like `/admin/delete-user?id=5`, and the only thing the server checks is "does this person have a valid session cookie." That's it. No check on whether they're an admin. Is that a broken *authentication* system, or a broken *authorization* system? If you hesitated even for a second, stick around, because today is the day that distinction gets permanently fixed in your head — and it's one of the most tested concepts on the actual exam.

## Intro

This is Day 21 of my CEH-track security training series, and today we're opening Phase 5: Identity and Access Management. If you've been following along, you already know OWASP Top 10 web vulnerabilities cold from the last several days. Today we zoom out and build the vocabulary that sits underneath almost every access-control bug you've already learned: authentication, authorization, privilege escalation, and credential attacks. By the end of this video you'll be able to correctly classify any access-control failure in about two seconds flat.

## Teaching segment: Authentication vs. Authorization

Let's start with the two words everyone mixes up.

**Authentication** answers one question: who are you? It's the process of proving identity — a password, a fingerprint, a certificate, a one-time code. **Authorization** answers a completely different question: what are you allowed to do? It happens *after* identity is established, and it's about permissions on resources and actions.

Here's the thing that makes this click: these two are completely independent systems. You can be perfectly, legitimately authenticated — logged in as yourself, valid session, no funny business — and still not be authorized to do something. Going back to that admin-delete-user example from the hook: the server correctly authenticated the user. It knew exactly who was making the request. What it failed to do was check authorization — whether *that specific user* was allowed to delete other accounts. So the answer is: that's an authorization failure, full stop.

[SCREEN: simple two-column diagram — "Authentication: Who are you?" next to "Authorization: What can you do?" with an arrow showing AuthN happens first, then AuthZ]

And actually, this is the exact same root cause behind IDOR — Insecure Direct Object Reference — which I covered a few days back. Changing a URL parameter from `user_id=123` to `user_id=124` and getting someone else's data isn't an authentication bypass. You're still logged in as you. It's the authorization check that's missing. A simple memory trick: AuthN comes before AuthZ, alphabetically N before Z, and logically too — you have to know who someone is before you can decide what they're allowed to do.

## Teaching segment: Privilege Escalation

Once you understand authorization failures, privilege escalation is really just "an authorization failure that got exploited." But there are two distinct flavors, and CEH absolutely expects you to tell them apart.

**Vertical privilege escalation** is moving up a tier — low privilege to high privilege. Think regular user to administrator, or in Linux terms, your own user account to root. A great real example from earlier in this series: a misconfigured cron job running as root that let an attacker inject a command into a script that job executes. That command runs with root's privileges, even though the attacker started as a totally unprivileged user. That's a tier jump. That's vertical.

**Horizontal privilege escalation** is the opposite kind of move — you stay at the exact same privilege tier, but you access someone else's resources. Same regular-user level, just not your own account. A clean example: a password-reset system generates predictable, sequential reset tokens. An attacker just guessing the next token in sequence can hijack another regular user's account — no tier change at all, just a different target at the same level. If that sounds familiar, it should — that IDOR example from a few minutes ago is actually a horizontal privilege escalation under the hood.

[SCREEN: side-by-side diagram — vertical arrow labeled "user → root (cron job exploit)" next to a horizontal arrow labeled "user A → user B (predictable reset token)"]

The question to ask yourself every time: did the *tier* change, or did the *target* change? Tier change, vertical. Same tier, different target, horizontal.

## Teaching segment: Credential Attacks

Now let's talk about how attackers actually try to get in through the front door — the authentication layer itself, by attacking credentials directly. Four terms, and they're easy to confuse if you don't anchor them to a concrete mental picture.

**Brute force** is trying every possible combination against one specific account. Pure computational grinding.

**Dictionary attack** is smarter — instead of every combination, you try a curated list of likely passwords, because humans are predictable and "password123" shows up constantly.

**Credential stuffing** is different again: you take a list of real username-and-password pairs that leaked from one breach — say, a forum that got hacked — and you try those exact same pairs against a completely unrelated site, like a bank. It works for one simple, very human reason: people reuse passwords across services because it's easier to remember one password than fifty. The attacker isn't guessing anything — they're betting on reuse.

**Password spraying** flips the brute-force approach on its head. Instead of throwing many passwords at one account, you throw one common password — something like "Summer2026!" — at thousands of accounts. Why do this instead of brute force? Because most systems lock an account after a handful of failed login attempts *for that one account*. If you only try each account once, you never trip that per-account lockout threshold, even though you're making thousands of attempts across the whole system.

[SCREEN: simple table — four rows, columns for "Technique," "What varies," "What stays fixed," matching the four definitions above]

## Mistake/correction moment

I want to flag something honest that happened during my own review questions today, because it's a useful lesson for anyone studying this. I was asked to give one example each of vertical and horizontal privilege escalation. I described the scenarios completely correctly — the root cron job example, and the predictable reset-token example — but when I went to *label* them, I called the root-cron-job one "horizontal" by mistake. It's actually vertical, since the privilege tier changes from regular user to root. The second example, the reset-token one, I correctly labeled horizontal.

The reassuring part: the underlying concept was never wrong. I understood exactly what was happening in both scenarios. What slipped was just the label, under the pressure of answering two examples back to back. If this happens to you too, don't panic — it means your mental model is solid, you just need to slow down for one extra second and explicitly ask yourself "did the tier change?" before you say the word "vertical" or "horizontal" out loud. That one habit fixes it completely.

## Recap + quiz

Let's lock in the three big ideas from today. One: authentication is "who are you," authorization is "what can you do," and they fail independently — most access-control bugs you've studied so far are actually authorization failures wearing different costumes. Two: privilege escalation is either vertical, a tier change, or horizontal, a same-tier target change — and the question "did the tier change?" resolves the label every time. Three: credential stuffing and password spraying both exploit systemic weaknesses — password reuse and per-account lockout blind spots — rather than brute-forcing anything directly.

Now, pause the video and work through these three questions before I move on:

First — a session cookie proves someone is logged in, but the server never checks if they own the resource they're requesting. Authentication failure, authorization failure, or both?

Second — name the two types of privilege escalation and give one example of each.

Third — why does password spraying tend to slide past the account-lockout defenses that stop brute force?

If you want to check your answers against mine, they're in the write-up linked in the description.

## Outro / CTA

Here's the one-line takeaway to carry with you: whenever you're classifying a privilege escalation, don't describe the scenario and stop — explicitly ask "did the tier change, or just the target?" That single question is the difference between a confident answer and a label slip, even when your understanding is already correct. If you found this useful, follow along for the next session, where we're going hands-on with a real credential-attack lab against a throwaway login form. And drop your answers to today's three quiz questions in the comments — I'll read through them.

## On-screen text / b-roll suggestions

- Lower-third at 0:00: "Authentication vs. Authorization — CEH Phase 5, Day 21"
- Two-column diagram: "AuthN: Who are you?" vs. "AuthZ: What can you do?" with arrow showing order
- Side-by-side diagram: vertical arrow (user → root, cron exploit) vs. horizontal arrow (user A → user B, reset token)
- Four-row comparison table: Brute Force / Dictionary / Credential Stuffing / Password Spraying, with "what varies" and "what stays fixed" columns
- Caption overlay during mistake segment: "Concept: correct. Label: swapped. Lesson: slow down on the label."
- End-screen graphic: "Next up: hands-on credential-attack lab"
