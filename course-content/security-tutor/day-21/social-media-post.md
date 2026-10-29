# Day 21 — Authentication vs. Authorization, Privilege Escalation & Credential Attacks

## LinkedIn

A server checks one thing before letting you delete another user's account: "do you have a valid session cookie?" That's it. No check on whether you're an admin.

Is that an authentication bug or an authorization bug? Day 21 of my CEH-track security training was built around getting that distinction permanently straight.

Authentication answers "who are you?" Authorization answers "what can you do?" They fail independently — and most of the access-control bugs I've already studied (IDOR included) turn out to be authorization failures wearing different costumes.

Today also covered privilege escalation, split into two types that are easy to blur:
→ Vertical: tier changes (regular user escalating to root, like the cron-job exploit from earlier in this series)
→ Horizontal: tier stays the same, target changes (guessing another user's predictable password-reset token)

Plus the four credential-attack patterns: brute force, dictionary attacks, credential stuffing, and password spraying — and why spraying one password across thousands of accounts slides past lockout defenses that are only watching each account individually.

Honest moment: in my own review question, I described both privilege escalation examples correctly but mislabeled one of them "horizontal" when it was actually vertical. The concept was never wrong — I just didn't pause to ask "did the tier change?" before answering. That one question is now permanently part of how I check my own answers.

Next session: a hands-on credential-attack lab against a real login form.

#CyberSecurity #CEH #InfoSec #LearningInPublic #AppSec #IAM

## Twitter/X

Day 21 of my security training: a server lets any logged-in user hit /admin/delete-user — it only checks "valid session?" not "is this person an admin?"

That's not an auth bug. That's an authz bug. Spent today nailing down authN vs authZ, privesc (vertical vs horizontal), and credential stuffing/spraying. 🔐

#CEH #CyberSecurity
