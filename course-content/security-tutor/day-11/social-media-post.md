# Day 11 — Why a "clean" vulnerability scan can still miss a critical bug (false negatives + a real IDOR lab)

## LinkedIn

Ran a real vulnerability scan against my own app today. It came back with 2 minor findings. Meanwhile, two curl commands let me read another user's SSN.

That's the lesson of Day 11 in my security training: false negatives — the vulnerabilities a scanner doesn't catch, not the ones it wrongly flags.

I built a small Flask app with a login page and a `/profile?id=N` endpoint, deployed it in an isolated Docker container. Then I ran nikto against it unauthenticated. It checked 6,544 items and reported exactly two things: a missing clickjacking header and a server banner. Nothing else.

Then I logged in as one user, grabbed the session cookie, and simply changed the `id` parameter in the URL to another user's ID. Their private data loaded instantly — no extra access needed. This is IDOR (Insecure Direct Object Reference): the app checked "are you logged in?" but never checked "does this record actually belong to you?"

The scanner couldn't have found this even with valid credentials, because it has no signature for "this specific app's access rules are broken." That requires a human (or app-aware tooling) actually reasoning about what the app is supposed to enforce.

I fixed it by adding an explicit ownership check — comparing the requested ID against the session's own ID — rebuilt the container, and re-verified the exploit no longer worked.

Operational takeaway: a clean scan report only proves "nothing this scanner's signatures could see at this access level" — not "secure." Authorization logic needs manual or credentialed, logic-aware testing.

#CyberSecurity #AppSec #IDOR #VulnerabilityAssessment #InfoSec #LearningInPublic

## Twitter/X

Scanned my own app today. Report: "2 minor findings." Reality: two curl commands let me read another user's SSN 😅

That's IDOR — app checked "are you logged in" but not "is this yours." Scanners can't catch business logic bugs. Fixed it, re-verified. #AppSec #InfoSec
