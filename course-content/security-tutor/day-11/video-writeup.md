# Day 11 — Why a "clean" vulnerability scan can still miss a critical bug — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

I just ran a vulnerability scanner against my own web app. It checked over six thousand five hundred items and came back with exactly two findings — both minor. A missing header, a server banner. Nothing serious.

Then, using nothing but two curl commands and a session cookie, I pulled another user's social security number out of that same app.

The scanner said "mostly fine." The app was leaking private data to anyone who was logged in at all. That gap — between what a scanner reports and what's actually wrong — is what today is about.

[SCREEN: terminal showing the nikto scan output scrolling, ending on "2 item(s) reported"]

## Intro

If you're following along with this security training series, this is Day 11, and we're in Phase 3: Vulnerability Assessment. Last time we covered false positives — when a scanner wrongly flags something that's actually fine. Today's the flip side, and arguably the more dangerous one: false negatives, where a scanner misses something that's actually broken. By the end of this video you'll understand exactly why automated scanners have a blind spot here, and you'll watch me build, exploit, and fix a real vulnerability that no scanner could have caught.

## Teaching segment: the three reasons scanners miss real vulnerabilities

Before touching any code, let's talk about why this blind spot exists at all. There are three main reasons a scanner can report "clean" when it isn't.

First: the scan was unauthenticated. If a scanner only ever visits a site as an anonymous visitor, it simply never sees what happens once you're logged in. A vulnerability that only exists behind a login — say, one user being able to see another user's private page — is invisible to a scanner that never logs in.

Second: custom application logic. Scanners work by matching known patterns — known bad versions, known bad paths, known bad headers. A bug that's unique to how your specific app was built has no pattern to match. There's no CVE number for "this coupon code can be redeemed twice" or "this user ID isn't checked against the session." It's not that the scanner is bad at its job — this category of bug is outside its job description entirely.

Third: active defenses blocking the scan itself. A web application firewall or a rate limiter can detect that it's being scanned — rapid requests, suspicious payloads, a recognizable scanner user-agent — and simply throttle or drop that traffic. The scanner then reports "no issues found," when the truth is it was never actually let through the door.

[SCREEN: simple three-item list graphic — "Unauthenticated scope / Custom logic / Active blocking"]

Here's a test I had to think through myself: if you upgrade to a credentialed scan — one configured with valid login credentials — which of those three problems does that actually fix? The answer is: only the first one. Credentials solve a visibility problem — now the scanner can reach the logged-in pages. They don't solve an understanding problem — the scanner still has no idea what "my own data" is supposed to mean in your app. And they don't solve an interference problem — a WAF doesn't care whether you're logged in, it cares whether your traffic looks like a scanner, and logging in doesn't change that.

## Teaching segment: building and exploiting a real IDOR

To make this concrete, I built a tiny real application — not a simulation — and ran a real scanner against it, in an isolated Docker container on my own machine.

[SCREEN: app.py source code, highlighting the /profile route]

The app has a login page and a profile page at a URL like `/profile?id=1`. When you log in, it redirects you to your own profile using your own user ID. Simple enough.

I ran nikto — a real, widely used web vulnerability scanner — against this app with no login at all. It checked 6,544 items. It found two things: a missing clickjacking header, and the fact that the server discloses its software version in response headers. Both real, both minor, both completely beside the point.

[SCREEN: nikto output — "6544 items checked: 0 error(s) and 2 item(s) reported"]

So I logged in myself, as a user called alice, using a real curl command that posts her credentials and saves her session cookie to a file. Her profile loaded correctly, showing her own information.

Then I ran one more curl command — same session cookie, same login, nothing escalated — and just changed the number in the URL from alice's ID to a different user's ID.

[SCREEN: terminal — curl command with "id=2", output showing "Profile: bob, SSN: 222-22-2222"]

And it worked. Bob's private data, through Alice's own ordinary session, just by editing a number in a URL. That's called an IDOR — an Insecure Direct Object Reference. The bug isn't that authentication was missing. Alice was fully, legitimately logged in. The bug is that the app never checked whether the record she was asking for actually belonged to her. It checked "are you logged in," and stopped there. It never asked "is this yours."

## Teaching segment: the fix

The fix is a single comparison. Instead of trusting whatever ID shows up in the URL, the server needs to look up the ID that belongs to the current session, and reject any request for a different one.

[SCREEN: diff of the profile() function — before/after, highlighting the "if req_id != own_id: return 403" line]

I made that change, rebuilt the container, logged back in as alice, and tried the exact same attack again. This time: "Forbidden. You can only view your own profile." Fixed, and verified — not just patched and hoped.

## Mistake/correction moment

I want to flag my own stumble here, because it's a useful one. When I first worked through which false-negative causes a credentialed scan fixes, my gut answer included the WAF-blocking scenario — I figured "well, now it's a legitimate logged-in request, so it should get through." But that's mixing up two completely different things a security control can check. Authentication answers "who are you." A WAF or rate limiter is answering a totally different question: "does this traffic pattern look automated." Those are independent checks, and fixing one doesn't touch the other. It's a reminder that in security, it really pays to ask precisely which problem a given fix solves, instead of assuming any one fix is a cure-all.

## Recap + quiz

Three things to take away from today. One: false negatives happen for three distinct reasons — unauthenticated scope, custom logic the scanner can't understand, and active defenses silently blocking the scanner. Two: IDOR is a specific, extremely common real-world bug where authentication is checked but ownership isn't — and it falls under the broader OWASP category called Broken Access Control. Three: a scanner reporting zero critical findings tells you what the scanner's signatures could see — it does not mean the app is secure.

Here are the same three questions I was asked at the end of the session — pause the video and think through your own answers before I give mine.

Question one: your vulnerability scan comes back with zero critical findings, and your manager wants to ship based on that report. What's your one-sentence pushback?

Question two: in the lab, the app checked "are you logged in" but never checked what specific thing — and what's the general name for that vulnerability class?

Question three: why couldn't a generic scanner have found this IDOR bug, even if you handed it a valid, logged-in session cookie to scan with?

[SCREEN: three questions displayed as text, several seconds each, before the answers]

My answers: one — a clean unauthenticated scan only proves there's nothing visible to an anonymous user, and that's a small fraction of the real attack surface; we need a credentialed scan and manual testing before calling anything secure. Two — the missing check was whether the requested record actually belongs to the logged-in user, and that's Broken Access Control, specifically an IDOR. Three — because there's no signature, no CVE, no generic pattern for "this app's specific business rule is broken" — that requires something that actually understands what the app is supposed to do.

## Outro / CTA

The operational takeaway for today: a clean scan report is not a security sign-off. It only proves the scanner's signatures found nothing within the access level it was given — authorization bugs like this one almost always require manual or credentialed, logic-aware testing to catch.

If you're following this series, next time we're wrapping up Phase 3 with vulnerability assessment methodology — scoping, authorization, and how individual findings actually become a real report — before moving into Phase 4 and the OWASP Top 10. Follow along for that, and drop your answer to question two in the comments before I post the next one.

## On-screen text / b-roll suggestions

- Lower-third on hook: "6,544 checks. 2 findings. 1 missed SSN leak."
- Caption overlay during scanner segment: "FALSE NEGATIVE: a real vuln the scan didn't catch"
- Screen recording of the full curl sequence (login → view own profile → view bob's profile) sped up slightly, with on-screen arrows pointing at the changed `id=2` parameter
- Lower-third defining "IDOR" and "Broken Access Control" the first time each term is spoken
- Split-screen before/after diff of the `profile()` function during the fix segment
- End-card: "Day 11 of my security training — Phase 3: Vulnerability Assessment"
