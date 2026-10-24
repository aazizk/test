# Day 07 — HTTP Fundamentals: proving TLS matters with a packet capture — Video Script

**Estimated length:** ~11 minutes (~1500 words)

## Hook

I want to show you something that sounds obvious until you actually see it happen. I logged into a test server twice today — the exact same username and password — once over plain HTTP, and once over TLS. Then I captured both logins with a packet sniffer called tcpdump. On the first capture, I opened the raw packet file and just read the password. In plain text. On the second capture, I searched that same file for the same password, and it wasn't there. Not scrambled — gone. That's not a slide, that's not a diagram someone drew for a textbook, that's a real password showing up or not showing up on my own screen. That's what today's lesson proved, and I'm going to walk you through exactly how.

## Intro

If you're following this series, this is Day 7 of my hands-on cybersecurity training, and it's the day that closes out the entire networking foundations phase. If you're new here, I've spent the last six days building up from IP addressing and subnetting, through Linux permissions and logs, and today it all comes together in HTTP — the protocol that basically every web attack in the OWASP Top 10 eventually touches. By the end of this video you'll understand what an HTTP request actually looks like on the wire, how cookies keep you logged in, and why TLS isn't just a padlock icon — it's the only thing standing between your password and anyone watching the network.

## Teaching segment: anatomy of a real HTTP request

I started by spinning up a real nginx web server in an isolated Docker container — not a diagram, an actual running server — and hit it with `curl -v`, which shows you the entire request and response instead of just the final rendered output.

[SCREEN: terminal running `curl -v http://localhost:8080`]

What you see is a method — GET — a path, and a version number, followed by a block of headers, then a completely blank line, and then the body. That blank line isn't decoration. It's the one signal that tells the receiving computer "headers are done, everything after this is content." Get that wrong and the whole parser breaks.

Two headers matter a lot here. `Content-Length` tells the receiver exactly how many bytes of body to expect, so it knows when to stop reading. `Content-Type` tells it how to interpret those bytes — HTML, JSON, an image, whatever. I also noticed the `Server` header in the response, which was happily announcing the exact web server software and version. That's a small detail today, but it's a big deal later — that's literally how attackers fingerprint what software you're running before they go looking for a known vulnerability in it.

## Teaching segment: status codes, live

Next I hit a path that existed and a path that didn't, and watched the status codes come back live — a real 200 for the page that was there, a real 404 for the one that wasn't.

[SCREEN: curl output showing `HTTP/1.1 200 OK` vs `HTTP/1.1 404 Not Found`]

Status codes aren't arbitrary. 2xx means success, 3xx means "go look somewhere else," 4xx means you, the client, did something wrong, and 5xx means the server broke. That sounds simple, but it turns out this simple categorization is the backbone of a security concept I didn't fully appreciate until I made a mistake with it — more on that in a minute.

## Teaching segment: cookies and sessions

Then I built a tiny custom Python HTTP server to actually watch a session get created in real time. First request: the server responds with a `Set-Cookie` header. I watched my client store that cookie. Then, on the very next request, the client automatically sent that same cookie back in a `Cookie` header, with no extra code — that round trip is literally the entire mechanism behind "staying logged in" on every website you use.

[SCREEN: Python server terminal showing Set-Cookie on response 1, Cookie header on request 2]

Then I looked at the `HttpOnly` flag on that cookie. What that flag does is block JavaScript running on the page from reading the cookie at all — only the browser's own request machinery can touch it. That's a direct defense against cross-site scripting attacks stealing your session, and I'll come back to XSS properly later in this series.

## Teaching segment: TLS, proven empirically

This is the part from the hook. I used `tcpdump` to capture network traffic for two separate logins to a test server — identical username and password both times. The first went over plain HTTP. The second went over TLS, using a self-signed certificate I generated with `openssl s_server`.

[SCREEN: side-by-side terminal, two pcap files]

On the plaintext capture, I ran `cat` against the raw packet data, and the login string was sitting right there in clear text: username, ampersand, password, in plain readable characters. On the TLS capture, I ran a `grep` for that exact same password string, and it came back with nothing. Not hidden somewhere else in the file — the search tool found zero matches, because the entire payload was encrypted before it ever hit the network. That's the whole argument for HTTPS, demonstrated, not asserted.

## Mistake/correction moment

I want to be honest about something I got wrong today, because I think it's a really common mix-up. When I saw a `403 Forbidden` response, my first instinct was "oh, that's a wrong password." It's not. A `403` means the server found the resource and is deliberately blocking you from it — it exists, but access is denied. A `404` means there's genuinely nothing there. That distinction matters a lot more than it sounds, because it's exactly the signal an attacker uses to map out which hidden pages or admin panels actually exist on a server, just by watching which status code comes back. If I hadn't caught this, I'd have carried a wrong mental model straight into recon, which is literally my next topic.

## Recap + quiz

So, three things to take away from today. One: an HTTP request and response are plain, readable text with a strict structure — headers, a blank line, then body. Two: cookies are a simple round trip — server sets one, client echoes it back — and `HttpOnly` protects that cookie from JavaScript. Three: TLS doesn't just "add security" in the abstract, it's the literal difference between a password sitting in cleartext on the wire and that password being completely unrecoverable from the same capture.

Here's your quiz, pause the video if you want to actually think about these: First, what's the practical difference between a 403 and a 404 response, and why would an attacker care about that difference? Second, what does the `HttpOnly` flag actually prevent? Third, if `Content-Length` is missing or wrong on a response, what problem could that cause for the client reading it?

## Outro / CTA

If there's one operational lesson from today, it's this: "private" doesn't mean "protected" — a network you trust is not the same as a network that's encrypted, and today's packet capture proved that with an actual password, not a slide. If you want to see Day 8, where I take this straight into real reconnaissance against a real public domain, hit follow. And drop your answer to the quiz questions in the comments — I'll read them.

## On-screen text / b-roll suggestions

- Lower third on hook: "Same password. Two captures. One is readable."
- Caption overlay during HTTP anatomy segment: "METHOD + PATH + VERSION / HEADERS / [blank line] / BODY"
- On-screen callout circling `Content-Length` and `Content-Type` in the curl output
- Split-screen graphic: "HTTP capture: password visible" vs "TLS capture: password not found" with the actual terminal output cropped in
- Lower third during mistake segment: "403 = exists, blocked. 404 = not there."
- End-card with the three recap bullets and the quiz questions as on-screen text
