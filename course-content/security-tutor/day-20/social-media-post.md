# Day 20 — CEH Checkpoint #2: What I Got Right, and What I Only Thought I Understood

## LinkedIn

"Filtered" and "closed" are not the same nmap result — and today I mixed them up for the third time.

Day 20 of my CEH-track security training was a checkpoint, not a lesson: 12 questions, zero new material, covering 9 days of web security (broken access control, SQL injection, XSS, CSRF, SSRF, session fixation, cookie security attributes).

The results were more interesting than a pass/fail score would suggest.

What I nailed cleanly: CSRF vs SSRF (the victim's browser sends one, the vulnerable server sends the other), session fixation's actual fix (regenerate the session ID on login, not just on logout), and origin-vs-site reasoning applied to a brand new example I hadn't seen before.

What tripped me up was more valuable than what I got right. I correctly remembered that a SameSite=Lax cookie blocks a cross-site POST but allows a cross-site GET link click — but when asked *why*, I reasoned it was about GET being used for "loading data" versus POST changing state. Wrong mechanism entirely. The real rule is about top-level navigation vs. embedded requests — an image tag or a background fetch call is still a GET, and it still gets blocked, because the page itself never navigated anywhere.

That's the distinction between memorizing an answer and holding the actual model. I had the former. A differently-phrased question exposed it immediately.

And the nmap "filtered vs closed" miss, a third time now, told me something too: verbal correction isn't sticking. Next time it comes up, I'm doing a real packet capture instead of another explanation.

Checkpoints aren't there to make you feel good. They're there to find exactly this.

#CyberSecurity #CEH #InfoSec #LearningInPublic #WebSecurity #SecurityTraining

## Twitter/X

Day 20: CEH checkpoint #2. No new material — just 12 questions testing 9 days of web security.

Scored well, but the real lesson was this: I had the *right answer* for SameSite=Lax cookie behavior but the *wrong reasoning* behind it. Memorized ≠ understood. 🔍

#CEH #InfoSec
