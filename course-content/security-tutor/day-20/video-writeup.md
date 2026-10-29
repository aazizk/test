# Day 20 — CEH Checkpoint #2: Stress-Testing Nine Days of Web Security Knowledge — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

Here's a question I got wrong twice before: a port scan comes back "filtered." Is that the same as "closed"? I said no the first time I was tested on this — and I said no again today, three weeks later, in a completely different way. If you've ever memorized an answer to a security quiz and then blanked on it the moment the question was phrased slightly differently, this video is for you, because that's exactly what happened to me today, on camera, in real time.

## Intro

This is Day 20 of my CEH-track security training series. If you're new here, I'm working through a full cybersecurity curriculum from absolute networking basics up to CEH-exam-level knowledge, one session at a time, with real hands-on labs wherever possible. Every eight to ten days, instead of new material, I sit a checkpoint quiz covering everything taught so far — no lab today, just recall under pressure. Today was checkpoint number two, twelve questions deep, covering nine days of web security: broken access control, SQL injection, cross-site scripting, CSRF, SSRF, session fixation, and cookie security attributes. Here's what I actually got right, what I got wrong, and why the wrong answers matter more than the right ones.

## Teaching segment: the recurring miss — nmap filtered vs. closed

[SCREEN: simple diagram — three boxes: "open," "closed," "filtered," each with an arrow showing the actual network response]

Let's start with my most embarrassing recurring mistake, because it's the most instructive. When nmap scans a port and gets back a TCP RST — a "connection refused" signal — it reports that port as closed. The host is reachable, nothing's listening, end of story. But when nmap sends a probe and gets nothing back at all — no RST, no SYN-ACK, silence — it reports that port as filtered. That silence usually means a firewall quietly dropped the packet, but it could also just mean the host is slow or unreachable. Nmap genuinely can't tell the difference, which is exactly why filtered is a weaker, less certain result than open or closed.

I got this wrong on checkpoint one. I got it wrong again today — this time I reached for an HTTP analogy, describing filtered as being like a "404 not found," which sounds reasonable but is actually a category error. A 404 is an application-layer response — the web server is very much alive and talking to you, just telling you a URL doesn't exist. Filtered means the opposite: nobody's talking to you at all. Two different layers of the stack, two completely different meanings. After I was corrected, I was able to re-explain it correctly using the right vocabulary. But three misses on the same concept told me something: verbal correction alone isn't sticking. Next time this comes up, I'm doing an actual packet capture against a firewalled and unfirewalled host side by side, because apparently I need to see the silence to believe it.

## Teaching segment: what actually sends the malicious request — CSRF vs. SSRF

[SCREEN: two-panel diagram — left panel "CSRF: victim's browser → bank," right panel "SSRF: vulnerable server → internal target"]

This one I nailed clean, and it's worth explaining because the two attacks get confused constantly. In CSRF — cross-site request forgery — the victim's own browser sends the malicious request. An attacker's page tricks your browser into firing off a request to a site you're already logged into, riding along on your authenticated session cookie. You, the human, never consented; your browser did the work without knowing it was compromised.

SSRF — server-side request forgery — is the mirror image. There, the vulnerable server itself sends the malicious request, tricked by attacker-supplied input like a URL parameter. The classic target is a cloud metadata endpoint at the address 169.254.169.254. That address only responds to requests from inside the instance itself — it's not reachable from the internet or even the rest of the network. SSRF matters specifically because it lets an attacker use the vulnerable server as a proxy to reach that otherwise-unreachable address, and what's waiting there is valuable: temporary IAM credentials for whatever role the instance is running as. Steal those, and you can call cloud APIs as if you were that server.

## Teaching segment: SameSite=Lax — right answer, wrong reasoning

[SCREEN: comparison table — link click (top-level nav, GET) vs. img tag / iframe / fetch (embedded, GET) vs. auto-submit form (POST) — showing which get the cookie and which don't]

This was the most useful mistake of the whole session, because it's a different kind of wrong than the nmap one. I correctly remembered the outcome: a cookie set with SameSite=Lax gets blocked on a cross-site POST, but gets attached on a cross-site GET link click. Outcome: correct. But when asked to explain *why* Lax treats those two differently, I reasoned that it was about GET being used for loading pictures and data versus POST being used for state changes. That explanation sounds plausible and is completely wrong.

The real mechanism has nothing to do with what the method is typically used for. Lax checks two independent things: is the method "safe" — GET or HEAD — and is this a top-level navigation, meaning the browser's address bar is actually changing because the user is going to a new page. A link click satisfies both: it's a GET, and the whole page navigates. But a cross-site image tag, an iframe, or a JavaScript fetch call are also GET requests — and they still get blocked under Lax, because none of them are top-level navigations. The page you're looking at doesn't go anywhere; the request just happens quietly in the background. I had memorized the answer to a question I'd already seen, without actually holding the underlying model that would let me answer a differently-phrased version of the same question. That's a dangerous kind of "knowing" something, and it's worth watching for in your own studying — can you explain the mechanism, or did you just remember the result?

## Mistake/correction moment

The SameSite mistake above is really the centerpiece mistake of this session, but there was a smaller one worth a quick mention: when asked to describe reflected cross-site scripting, I initially framed it as "the user submits malicious input to themselves," which skips the actual attack chain. The real sequence is that an attacker crafts a malicious link and tricks a victim into clicking it; the victim's own browser sends that payload to the server, which reflects it straight back into the victim's own page, where it executes inside the victim's session. The victim is both the sender and the one who gets hit — just unknowingly, because the attacker supplied the link. One correction, understood immediately, but a good reminder that the social-engineering step — the "how does the payload get into the request in the first place" — is as much a part of the vulnerability as the missing input sanitization.

## Recap + quiz

Three things to take away from today. One: nmap "closed" means an RST came back — the port is reachable, nothing's listening. "Filtered" means nothing came back at all, and that's a firewall-layer concept, not an application-layer one — don't reach for HTTP status code analogies to explain it. Two: CSRF is the victim's browser sending a forged request using their own session; SSRF is the vulnerable server itself making a request on the attacker's behalf, often to reach cloud metadata credentials that are otherwise unreachable. Three: SameSite=Lax isn't a GET-versus-POST rule in spirit — it's a top-level-navigation-versus-embedded-request rule, and GET requests that happen silently in the background, like images or fetch calls, get blocked just like POST does.

Before I give you my actual scores, pause the video and think through these: First, what's the one server-side action that defeats session fixation attacks entirely? Second, name the two independent conditions a cookie must satisfy for SameSite=Lax to allow it on a cross-site request. Third, what specifically is stored behind a cloud instance's metadata endpoint that makes SSRF so dangerous there? If you got all three without rewatching, you're ahead of where I was at the start of today's checkpoint.

## Outro / CTA

My operational takeaway from today: when you're asked "why" something works in security, resist the pull toward the first plausible-sounding analogy — reach for the actual mechanism at the actual layer where it happens, because a confident wrong analogy is worse than admitting you don't remember. If you're following along with this series, the next session moves into Identity and Access Management — authentication versus authorization, privilege escalation, credential attacks — building on a cron privilege-escalation lab from earlier in this series. Subscribe if you want to follow the next session, and drop your answers to those three quiz questions in the comments — I'll tell you if you'd have passed my checkpoint.

## On-screen text / b-roll suggestions

- Lower-third at 0:00: "CEH Checkpoint #2 — Day 20"
- Screen recording/diagram: TCP handshake vs. silence — open/closed/filtered state diagram
- Side-by-side diagram: CSRF (browser sends) vs. SSRF (server sends), with arrows showing request origin
- Comparison table overlay for SameSite=Lax: link click / img tag / iframe / fetch / auto-POST form, each marked cookie-sent or cookie-blocked
- Caption during reflected XSS segment: "Attacker crafts link → Victim clicks → Victim's own browser delivers the payload"
- End-card: "Next up: Phase 5 — Identity & Access Management"
