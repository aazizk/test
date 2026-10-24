# Day 09 — Enumeration: Why a 403 and a 404 Can Look Identical — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

Here's something that should bother you: I just pulled two completely different HTTP responses off the same server — one page that's blocked, one page that doesn't exist at all — and they came back with the exact same Content-Length. Same size, same generic error template, totally different meaning. If you were trying to figure out what's really on a server by eyeballing response size, you'd get it wrong every single time. That's the problem I spent today's security lesson solving for real, on a server I built myself.

[SCREEN: terminal showing two curl -I outputs side by side, both with "Content-Length: 153" highlighted]

## Intro

If you're following along with this series, this is Day 9 of my path toward CEH-level security knowledge, and today closes out Phase 2: reconnaissance methodology. If you're new here — this is a hands-on series. No slides, no theory-only explanations. Every concept gets built and broken on my own isolated lab containers. Today's topic is enumeration: the step where, instead of just knowing a server is there, you actively dig into it to find out exactly what's accessible, what's hidden, and what's worth a second look. By the end of this video you'll understand why status codes — not page content — are the one thing you can actually trust when you're probing a web server, and why automated scanners can straight-up lie to you.

## Teaching segment: setting up the lab

Enumeration is the step between finding a door and learning what's behind it. Recon tells you a port is open; enumeration tells you the details — versions, hidden paths, misconfigurations. To make this concrete, I built a small nginx web server in Docker, completely isolated on its own local network, with three deliberately different paths. One is public and just returns a normal page. One, called "secret," exists but is explicitly blocked with an nginx `deny all` rule, which returns a 403 Forbidden. And the rest of the paths on the server simply don't exist, which returns a plain 404 Not Found.

[SCREEN: nginx config file showing the "location /secret { deny all; return 403; }" block]

I set this up specifically to finally nail down a mistake I'd made a couple of sessions earlier, where I'd mixed up what 403 and 404 actually mean. 403 means "this exists, but you're not allowed in." 404 means "there's genuinely nothing here." Those sound like similar outcomes from the outside — both are errors, both block you — but they tell you completely different things about the target.

## Teaching segment: the identical Content-Length trap

So I checked all three paths with curl, using the -I flag to just pull the headers without downloading the full page.

[SCREEN: curl -I http://127.0.0.1:8080/ ... curl -I http://127.0.0.1:8080/secret/ ... curl -I http://127.0.0.1:8080/nonexistent/]

The public page came back 200 OK, as expected. The secret path came back 403 Forbidden. The nonexistent path came back 404 Not Found. All normal so far. But then I looked closer at the actual header values, and here's the part that surprised me: the 403 response and the 404 response both had Content-Length: 153. Identical. That's because nginx was serving its generic default error page for both of them — same template, same byte count, completely different real-world meaning.

That's the entire lesson in one data point: if you were scanning a server and judging "does this path actually exist" by how big the response body is, you would be completely unable to tell a protected resource apart from one that simply isn't there. The only reliable signal is the status code line itself — the "403" or "404" at the very top of the response. Everything else about those two responses can be made to look identical on purpose, and often is, specifically to prevent this kind of probing.

## Teaching segment: gobuster and the filtering trick

Knowing that, I moved on to the actual attacker technique this maps to: directory brute-forcing. I used a real tool called gobuster, which takes a wordlist of common path names and fires a request at the server for each one, logging what comes back. I built a tiny custom wordlist with five words: secret, admin, backup, login, and nonexistent.

[SCREEN: gobuster command and full terminal output]

Here's the part that really made the lesson click. Out of those five words, only one showed up in gobuster's output: "/secret," reported as a 403. The other four — admin, backup, login, nonexistent — all returned 404s, and none of them appeared in the results at all. Not even as a "not found" line. They were just gone.

The reason is sitting right there in gobuster's own startup banner: "Negative Status codes: 404." By default, gobuster treats any 404 response as noise and drops it entirely. It's not looking for "paths that exist" in some absolute sense — it's looking for "anything that isn't the default negative response." And that reframes the whole exercise: a 403 is actually a more interesting finding to an attacker than you might assume, because it confirms something is there and somebody specifically cared enough to lock it. People tend to name the things worth protecting after something sensitive. That's exactly where an attacker's attention goes first.

## Teaching segment: nmap's script engine and a false positive

To round out enumeration, I ran nmap's script engine against the same lab server — the `-sC` flag, combined with version detection.

[SCREEN: nmap -sC -sV -p 8080 127.0.0.1 output]

Nmap came back with three results worth unpacking. First, `http-server-header`, which just confirmed the nginx version banner I'd already seen in earlier sessions. Second, `http-title`, which tries to extract the page's `<title>` tag — genuinely useful, because titles often leak the name of the application running, something like "WordPress Login" or "Jenkins Dashboard." Mine came back blank, because my test page only has an `<h1>`, no title tag at all — an accurate, if boring, result.

The third one is the interesting one: `http-open-proxy`, which said "Proxy might be redirecting requests." That is a false positive. My nginx config has no proxy configuration at all — there's no way it's actually functioning as an open proxy. Nmap hedged its own language with "might be," which is the tool itself telling you it isn't confident.

## Mistake/correction moment

When I was asked what I'd do before treating that open-proxy flag as a real finding, my first instinct was exactly right: go test it manually, actually try to use the server as a proxy to reach some other URL, and see if it actually works. That's the correct move, and it's worth internalizing as a habit, not just a one-off answer. Automated tools — gobuster, nmap scripts, vulnerability scanners — surface candidates. They do not hand you verdicts. Every flagged result needs a human to go confirm it before it's worth acting on, let alone putting in a report. That's not a minor caveat; it's the entire discipline that the next phase of this series, vulnerability assessment, is built around.

## Recap + quiz

So, three things to take away from today. One: status codes, not response size or body content, are the only reliable way to tell "exists but blocked" apart from "genuinely not there." Two: tools like gobuster have default filtering behavior built in — they hunt for "not the expected negative response," not for some absolute notion of "what exists." And three: anything an automated scanner flags is a candidate for investigation, not a confirmed fact.

Before I move on, here are the three questions I was asked at the end of this session — pause the video and think through your own answers before I tell you mine. Question one: why did gobuster report the 403 result but silently drop all four 404 results — what's the general principle behind why scanners treat those two codes so differently? Question two: if two different paths return identical response body size, what's the one thing you should check instead to tell them apart? Question three: nmap flagged a false positive on my own container — what's the operational lesson for how you should treat any automated scanner output before you act on it?

## Outro / CTA

Here's the one-line takeaway I'm walking away with today: automated tools report candidates, not verdicts — treat every flagged result as a question, not an answer, until you've confirmed it yourself. That closes out reconnaissance methodology entirely — recon, scanning, and enumeration are done. Next session starts vulnerability assessment: CVSS scoring, vulnerability classes, and scanning methodology, building directly off today's false-positive lesson. If you're learning security alongside me, follow for the next one, and drop your answers to today's three quiz questions in the comments — I'll tell you how I answered them in the next video.

## On-screen text / b-roll suggestions

- Lower-third caption: "Day 9 — Enumeration (Phase 2 complete)"
- Split-screen or side-by-side terminal captures of the two curl -I outputs with "Content-Length: 153" circled/highlighted on both
- On-screen text overlay: "403 = exists, blocked. 404 = not there." as a simple two-line graphic
- Full gobuster terminal output with the single "/secret (Status: 403)" line highlighted/zoomed
- nmap output with the three http-* script lines each getting a brief on-screen label: "banner," "possible leak (blank here)," "false positive"
- Closing text card with the operational takeaway line for a freeze-frame moment
- End-screen graphic: "Phase 2 complete ✅ — Phase 3: Vulnerability Assessment next"
