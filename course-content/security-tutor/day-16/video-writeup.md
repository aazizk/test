# Day 16 — SSRF: Making the Server Attack Itself — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

I ran one `curl` command against a URL preview tool — not even a login form, not a file upload, just a box that says "paste a link, we'll show you a preview" — and the server handed me back a set of AWS credentials it had no business giving me. I never touched the system those credentials lived on. I just asked the server, politely, to go fetch something for me. That's Server-Side Request Forgery, and it's the exact bug class behind the 2019 Capital One breach — over a hundred million customer records, starting with one misused "fetch this URL" feature.

[SCREEN: terminal window, cursor blinking, ready to type]

## Intro

This is Day 16 of my cybersecurity training series, where I'm working through CEH-level material from absolute fundamentals up — networking, Linux, web security, all of it, one real hands-on lab at a time. If you've been following along, we just finished CSRF a couple of days ago, where a victim's *browser* gets tricked into sending a forged request. Today's topic is the server-side mirror image of that: SSRF, where the attacker tricks the *server itself* into becoming an unwitting accomplice. By the end of this video you'll understand exactly how that happens, why it's so dangerous against cloud infrastructure specifically, and how to actually fix it — because I built and broke a real vulnerable app to prove every step of this.

## Teaching segment: CSRF vs SSRF — who actually sends the request

Quick contrast before we dive in, because these two get confused constantly. In CSRF, the attacker can't send a request themselves — they trick the *victim's browser* into sending it, piggybacking on the victim's logged-in session cookie. In SSRF, the attacker again can't send the request themselves — but this time they trick the *vulnerable server* into sending it, piggybacking on the server's network position and permissions. Neither attack involves the attacker directly firing the malicious request. That's the common thread, and it's also exactly where I got tripped up when my tutor quizzed me on it — I said "the attacker makes a forged request" for both, which blurs the real mechanism. Say it precisely: a third party — the browser or the server — sends it on the attacker's behalf.

[SCREEN: simple side-by-side diagram, CSRF arrow from browser to bank server, SSRF arrow from vulnerable server to internal server]

## Teaching segment: why internal network position matters

Here's the setup I built to prove this for real. I spun up two Docker containers on their own isolated network. One, called `internal-service`, simulates something an attacker should never be able to reach directly — think an internal admin panel, or in the real world, AWS's instance metadata endpoint. I deliberately did **not** publish its port to my host machine. The second container, `vulnerable-app`, is a simple Flask app with a "preview this URL" feature — you give it a URL, and the server fetches it server-side and shows you the response. That app's port *is* published, so I can reach it like a normal user.

[SCREEN: docker ps output showing internal-service with no PORTS mapping, vulnerable-app with 5000:5000]

First, I proved the perimeter was real: I tried `curl http://localhost:5000/` straight at where internal-service would be — connection refused. My machine genuinely cannot reach it. Then I used the preview feature instead, pointing it at `http://internal-service:5000/latest/meta-data/iam/security-credentials/` — the internal container's name, resolvable only inside that Docker network. And the vulnerable app, sitting inside that network, happily fetched it and printed back a full JSON blob of fake IAM credentials, straight into my browser.

[SCREEN: curl output showing the JSON response with AccessKeyId, SecretAccessKey, Token]

That's the whole exploit. I never got direct access to the internal service. I convinced something that already had access to go get it for me.

## Teaching segment: why cloud metadata is the crown jewel

This matters so much in the real world because of a special address: `169.254.169.254`. Every major cloud provider — AWS, Azure, GCP — exposes this address to every virtual machine. It's the instance metadata service, and it hands out temporary cloud credentials so the instance can talk to other cloud services without a human hardcoding a password anywhere. If an SSRF bug lets an attacker make the server fetch that address, they don't just get a webpage — they get live, valid cloud account credentials. That's precisely how Capital One got breached in 2019: an SSRF bug reached the metadata service, pulled IAM credentials, and from there an attacker pivoted into S3 buckets holding over a hundred million customer records.

And this part actually happened live while I was recording this course — I ran a real `curl` against my own authorized AWS sandbox's metadata endpoint, and got back `401 Unauthorized`. That's not nothing — that's IMDSv2 in action. The older version, IMDSv1, just handed metadata back on a plain GET request, no authentication needed, which is exactly what made it so exploitable. IMDSv2 requires you to first send a `PUT` request to get a short-lived token, then include that token on your `GET`. Most SSRF bugs only let an attacker control a URL fetched via a simple GET — they can't inject a prior PUT request or custom headers. So IMDSv2 doesn't eliminate SSRF as a vulnerability, but it slams the door on the easy "just feed it a URL" exploit path that burned Capital One.

[SCREEN: the two-step curl commands — PUT for token, then GET with the token header]

## Mistake/correction moment

When I went to apply the fix, I handed myself just the `preview()` function to splice into the existing file, and I ended up deleting the line `app = Flask(__name__)` in the process — the app crashed with `NameError: name 'app' is not defined`. Lesson learned, and it's a good one for anyone following along doing real lab work: when you're editing a short file, just replace the *whole file*. Partial snippet edits are exactly how you silently drop a critical line and spend ten minutes debugging a typo instead of learning the security concept. Full-file replacement cost nothing and the rebuild worked immediately.

[SCREEN: the NameError traceback, then the corrected full file]

## Recap + quiz

Three things to hold onto: first, SSRF abuses network trust, not browser same-origin policy — it's a completely different mechanism from CSRF even though they rhyme. Second, cloud metadata endpoints are the single highest-value SSRF target because they hand out live credentials, not just data. Third, the fix is validating the destination before fetching — ideally with an allowlist of permitted destinations, because a denylist has to anticipate every bypass technique, while an allowlist fails closed by default.

Here are the three review questions from today's session — pause the video and answer them yourself before I give you my answers:

One — in one sentence, what's the structural difference between CSRF and SSRF, in terms of who actually makes the forged request?

Two — why did IMDSv2's token requirement specifically defeat the classic SSRF exploit pattern, even though SSRF itself wasn't "fixed"?

Three — if the fix only blocked the literal string "internal-service" instead of checking the resolved IP address, how could an attacker still get through?

[SCREEN: three numbered questions on screen, pause card]

And my answers: one, the victim's browser sends the forged request in CSRF, the vulnerable server sends it in SSRF — the attacker never sends it directly in either case. Two, IMDSv2 requires a PUT plus a custom header before you can GET anything, and classic SSRF bugs can only control the URL of a GET request, not the method or headers. Three, just use the container's raw IP address instead of its hostname — the string "internal-service" never appears, so a string-based denylist never triggers.

## Outro / CTA

Here's today's one-line operational takeaway: when you validate a user-supplied URL server-side, always check the *actual resolved IP address* against policy, not just the hostname string — and recheck it at connect time, not just validation time, or you're vulnerable to DNS rebinding. If you want to see Day 17, where we're covering session hijacking — the attack that comes after someone's already logged in — follow along, and drop a comment with your own answer to question one before you watch me give mine. See you next time.

## On-screen text / b-roll suggestions

- Lower-third: "SSRF = Server-Side Request Forgery" on first mention
- Caption overlay: "169.254.169.254 — the cloud metadata address every VM can see"
- Split-screen diagram: attacker → vulnerable-app → internal-service (arrow chain) vs attacker ✗ internal-service (blocked direct line)
- On-screen callout quoting the Capital One 2019 breach as the real-world stakes
- Code snippet overlay of the `is_blocked()` IP-validation function during the fix segment
- End-card: "Day 17: Session Hijacking" teaser
