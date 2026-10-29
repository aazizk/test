# Day 22 — Dictionary Attacks, Exponential Backoff, and Why Password Spraying Still Wins — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

[SCREEN: terminal showing the attack script output, specifically line 6]

Here's ten lines of Python, a password list with ten entries, and a login form. Watch this: attempt one, fails. Attempt two, fails. Three, four, five — all fail. Attempt six: "admin colon Summer2024 exclamation point" — login OK. Cracked. Total time? Under a second. That password had uppercase, lowercase, a number, and a symbol. It followed every password complexity rule your IT department has ever nagged you about. And it still fell in six guesses, because it followed a pattern — season plus year plus punctuation — that's exactly what password dictionaries are built to catch. Today we're going to break that login for real, then fix it for real, and then break the fix.

## Intro

If you're following this series from the start, this is Day 22, and we're deep into Phase 5: Identity and Access Management. Last session we talked about credential attacks — brute force, dictionary attacks, credential stuffing, password spraying — but only on a whiteboard, so to speak. Today we build one. By the end of this video you'll understand not just what a dictionary attack is, but why the "obvious" fix — adding a delay after failed logins — has a hole in it that a lot of real systems still get wrong.

## Teaching segment: online vs. offline attacks, and where dictionary attacks live

Before we touch the keyboard, one distinction matters: there are online credential attacks and offline ones. An online attack means the attacker is sending guesses to your live server, one request at a time — that's what we're doing today. An offline attack means the attacker already has something like your password hash, stolen in a breach, and is cracking it on their own hardware with no network involved at all. That distinction matters enormously for defense. Online attacks can be slowed down or blocked by the server, because every single guess has to round-trip through you. Offline attacks can't be touched that way — the attacker isn't talking to you anymore. The only defenses that help against an offline attack are a genuinely unpredictable password, and the server using a deliberately slow hashing algorithm, so every individual guess costs real computing time even when nobody's watching.

[SCREEN: simple diagram — online attack arrow hitting a server with a clock icon; offline attack showing a hash file with a GPU icon, no network line]

Today's lab is the online kind: a dictionary attack, where instead of trying every possible character combination — that's brute force, and it's brutally slow — we try a curated list of passwords real humans actually pick.

## Teaching segment: building and breaking the target

[SCREEN: terminal — docker build and docker run commands]

The lab target is a tiny Flask app with one hardcoded login: username "admin," password "Summer2024!" — deliberately weak, deliberately realistic. It runs inside a Docker container on a network created with the `--internal` flag, which means that network has zero route to the internet. It can only talk to other containers sitting on it. That's containment — nothing here can reach anything outside this sandbox.

The attack itself is a second container running a Python script. It opens a ten-line wordlist, and for each password, sends a POST request to `/login` with the username "admin" and that candidate password, checking the response code. It doesn't need to guess the target's IP address, either — Docker gives containers on the same network built-in DNS, so the script just resolves the target by its container name.

[SCREEN: the actual attack output — ten login attempts, six succeeding]

Run it, and here's what happens: the first five passwords — "password," "123456," "admin," "letmein," "qwerty" — all get rejected instantly. The sixth, "Summer2024!", returns "LOGIN OK." Total elapsed time: well under a second. That's the problem with an undefended login form — there is nothing on the server slowing an attacker down at all. It'll happily answer ten thousand guesses as fast as your network can deliver them.

## Teaching segment: exponential backoff

So we fix it — but with a specific design choice. Instead of a hard lockout after, say, five failed attempts, we use exponential backoff: every failed login for a given username increases a counter, and the server delays its *next* response for that username by two to the power of the failure count, in seconds. First failure: no delay. Second: one second. Third: two seconds. Fourth: four. By the fifth or sixth failed guess, the attacker is waiting sixteen seconds just to find out they were wrong again.

[SCREEN: the app.py code, highlighting the failed_attempts dictionary and the time.sleep line]

Why not just lock the account outright after five tries? Because a hard lockout is itself a denial-of-service vector — anyone who knows your username can lock you out of your own account just by typing the wrong password five times on purpose. Backoff avoids that: a real user who mistypes their password once or twice barely notices a one- or two-second pause, while an attacker trying hundreds of guesses gets crushed by the math.

[SCREEN: the re-run, wrapped in `time`]

We rebuilt the container with this fix and ran the exact same attack again. Same six attempts to succeed — we didn't change the password, only the defense — but this time, wrapped in the `time` command, the whole thing took thirty-one point seven seconds. One, plus two, plus four, plus eight, plus sixteen — thirty-one seconds of cumulative delay, right where the math predicted. A ten-word list went from instant to half a minute. Scale that list up to the ten thousand entries a real dictionary attack would use, and you're talking hours instead of seconds. That's the win — not making the attack impossible, but making it not worth running.

## Mistake/correction moment

Here's where it got interesting. I asked: this backoff only tracks failures per *username* — what's the gap in that design? The first instinct was to reach for IP addresses — "what if the attacker rotates IPs." Reasonable guess, wrong target: our counter never looked at IP addresses at all, so that wouldn't change anything. The real gap is a technique from last session's list: password spraying. Instead of hammering one username with a thousand passwords, you try *one* password across a thousand *different* usernames. Each username only ever sees a single attempt — which means it never accumulates enough failures to trigger any delay at all. You sweep the whole list, get mostly rejections, then start over with your next candidate password. No account ever crosses its own threshold, because the attacker never returns to the same username twice in a row.

Then a second, subtler mistake: I asked what happens if the attacker sends many requests *concurrently* instead of waiting for each response — does our sleep-based delay still hold up? The first answer was "they'd still queue and get delayed anyway," which is true for our lab's single-threaded dev server, but not true in general. A real production server with multiple worker threads handles concurrent requests in parallel — which means fifty simultaneous guesses sleep *simultaneously*, not one after another. Fifty requests that should've taken fifty times sixteen seconds sequentially might all finish in about sixteen seconds if they're parallelized. That's exactly why real systems don't rely on sleeping the response — they reject requests outright once a threshold is crossed, because rejection doesn't fall apart under parallelization the way a timer does.

## Recap + quiz

Three things to hold onto from today. One: online attacks can be throttled because every guess has to reach your server; offline attacks can't be, so they need a different defense — strong passwords plus slow hashing. Two: exponential backoff beats a hard lockout because it punishes repeated guessing without creating a denial-of-service path for legitimate users. Three: any defense keyed to a single account — backoff or lockout alike — is blind to password spraying, which spreads its guesses thin across many accounts instead of piling them on one.

Before I give you the answer, pause the video and think about this one yourself: if per-account lockout doesn't catch password spraying, what *would* catch it? Hint — it's not a code fix inside the login function itself.

[SCREEN: pause card with the question text]

The answer: you need a detection signal that looks across accounts, not within one — something like "the same password, or the same source IP, hitting many different usernames in a short window." No single account ever looks suspicious in isolation; the pattern only shows up when you look at the whole system's login attempts together.

## Outro / CTA

Here's today's one-line takeaway: a defense that only watches one account at a time will always have a blind spot for an attacker who spreads their guesses across many. If you're building or auditing login security, ask not just "does this account lock out" but "what does this look like in the aggregate logs."

If this is useful, follow along for the rest of this series — next time we're either turning today's lab inside-out to build a real password-spraying demo, or moving on to MFA and SSO protocol mechanics. And drop a comment with your own answer to today's quiz question before you scroll past it — I want to see what detection signal you'd reach for first.

## On-screen text / b-roll suggestions

- Lower third on hook: "6 guesses. Under 1 second. Password had upper/lower/digits/symbol."
- Caption overlay during online-vs-offline segment: "ONLINE = rate-limitable | OFFLINE = not rate-limitable"
- Screen recording: full `docker build` / `docker run` sequence for both target and attacker containers
- Side-by-side split screen: undefended attack output (instant) vs. backoff-defended attack output (31.7s), synced to show the time difference viscerally
- Code highlight callout on `failed_attempts` dict and the `2 ** (failures - 1)` line
- Simple animated diagram: "dictionary attack" (one username, many passwords) vs. "password spraying" (many usernames, one password) as two arrow diagrams side by side
- Closing quiz card with a 5-second countdown before revealing the answer
