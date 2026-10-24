# Day 08 — Reconnaissance: passive recon and the "identical response" scan signal — Video Script

**Estimated length:** ~13 minutes (~1800 words)

## Hook

I pointed a port scanner at a mystery service running in my own lab today, and no matter what kind of probe I threw at it — a normal connection attempt, a request formatted for a completely different protocol, anything — I got back the exact same raw response every single time. That one detail told me everything about what that service actually was, before I even looked at a single line of its code. That's today's lesson, and it's the kind of thing that only clicks once you've actually run the scan yourself.

## Intro

This is Day 8 of my cybersecurity training, and it's the start of a new phase: reconnaissance — the methodology attackers and security professionals both use to learn about a target before doing anything else. Everything today was real: real lookups against a real public domain, and a real Docker lab for active scanning. By the end of this video, you'll understand the difference between passive and active recon, how to spot CDN protection properly instead of guessing from IP ranges, and how a scanner's own output can tell you a service isn't what it appears to be.

## Teaching segment: passive vs. active recon

The core distinction I learned is refreshingly simple once you frame it right: does a packet of yours ever actually reach the target's own infrastructure? Passive recon — things like WHOIS lookups and DNS queries — never touches the target directly. You're querying a third party, a domain registry or a DNS resolver, for data they already hold. Active recon — port scanning, direct connections — sends packets straight to the target's own systems. That's the line, and it matters because active recon is detectable by the target and passive recon generally isn't.

## Teaching segment: real WHOIS and DNS recon

I ran a real `whois` lookup against anthropic.com — a real public domain, using only publicly available registration data. I saw registry lock statuses like `clientTransferProhibited`, which is actually a good sign, an anti-hijacking protection, not a vulnerability. I also noticed the contact email was redacted rather than shown directly — that's a GDPR-driven change from 2018 onward, where registrars replaced raw contact emails with web-form-based contact methods instead.

[SCREEN: real whois output with registry status lines and redacted contact fields highlighted]

Then I ran `dig A` and `dig NS` and found the domain's nameservers were on Cloudflare. That led into a concept called origin-IP disclosure: when a site sits behind a CDN or WAF like Cloudflare, attackers specifically hunt for the real origin server IP, because reaching that IP directly lets them bypass the CDN's protections entirely. They look for things like historical DNS records, unproxied subdomains, or IP addresses leaked in a certificate's subject alternative names.

## Teaching segment: proving CDN protection with headers, not IP ranges

Here's where it got concrete. I ran `curl -I` against the site and saw a `server: cloudflare` header and a `cf-ray` header in the response. That's actual proof the request passed through Cloudflare's infrastructure — not an assumption based on which IP range the address happens to fall into. That distinction matters because CDN IP ranges expand over time, so an IP-range-based assumption can silently go stale. Verifying through response headers is a method that stays accurate regardless of how the provider's infrastructure grows.

[SCREEN: curl -I output with server: cloudflare and cf-ray highlighted]

I also noticed a Content Security Policy header in that same response — I didn't go deep on it today, since that's really a Phase 4 web security topic, but I flagged it for later.

## Teaching segment: active scanning in a real lab

For active recon, I built a real lab: two containers on an isolated Docker network, bound only to localhost, with no path to the internet. One container, `reconlab-web`, ran a real nginx server on port 8080. The other, `reconlab-mystery`, was a minimal listener on port 9000 that just dumps a fixed banner to anything that connects — standing in for an unknown service you might find on a real target.

[SCREEN: docker network diagram — isolated reconlab-net with two containers, both 127.0.0.1-only]

I ran `nmap -sV -p 7999-9001 127.0.0.1`, a real SYN scan with version detection. It correctly fingerprinted the nginx service as version 1.29.1 through real banner grabbing. But port 9000 came back as unrecognized — nmap literally labeled it `cslistener?`, with a question mark meaning it wasn't confident.

## Teaching segment: the identical-response signal

This is the core insight of the day. Looking at nmap's own fingerprint output for that unrecognized port, it had sent several completely different probe types at it — a null probe, a generic HTTP-style GET request, a help command, and a couple of others — and gotten back the exact identical raw response every single time, regardless of what it sent. That's the tell. A real service that actually parses incoming data responds differently depending on what you send it. A service that returns the same fixed output no matter what you send it isn't processing your input at all — it's just dumping a static string the instant a connection opens.

[SCREEN: nmap fingerprint block showing multiple probe types all returning the same raw bytes]

I followed up manually with a plain `nc 127.0.0.1 9000` and got the exact same banner, confirming by hand what the automated scan had flagged. That two-step pattern — automated scan flags something anomalous, then a manual tool confirms it — is exactly how a real analyst actually works, not just running one tool and trusting its label blindly.

## Mistake/correction moment

I made a mix-up worth calling out: I conflated nmap's "filtered" port state with "closed." They're not the same thing. "Closed" means nmap got an explicit RST packet back — a clear, confirmed signal that nothing is listening on that port. "Filtered" means nmap got silence, no response at all, which is genuinely ambiguous — it usually means a firewall is silently dropping the probe, and nmap can't actually tell from that silence whether something is listening behind it or not. Treating silence as equivalent to a confirmed "closed" throws away real information about a possible firewall sitting in the way.

## Recap + quiz

Three takeaways. One: passive recon never touches the target directly — it queries third parties like WHOIS registries and DNS resolvers — while active recon sends packets straight to the target's own infrastructure. Two: verify CDN or WAF protection through response headers like `server` and `cf-ray`, not IP range assumptions, because ranges expand over time and headers are actual evidence. Three: a service that returns the identical raw response to every different type of probe isn't parsing your input at all — it's a strong signal worth manually confirming, not dismissing as a scanner quirk.

Quiz: First, what's the one-sentence test for whether a recon technique counts as passive or active? Second, why is verifying `cf-ray`/`server: cloudflare` headers more reliable than checking if an IP falls in a known CDN range? Third, what's the actual difference between nmap's "closed" and "filtered" port states, and why does that difference matter?

## Outro / CTA

Operational takeaway from today: a port number is a convention, not an enforcement mechanism — never trust what's supposedly running on a port just because of its number, verify it with a real probe and read the response, not the assumption. That wraps up passive and active recon; next session finishes Phase 2 with enumeration — digging deeper into service details and directory brute-forcing, including finally revisiting that 403-versus-404 lesson from Day 7 in a real scanning context. Follow along for that, and tell me in the comments what port number you'd never trust at face value.

## On-screen text / b-roll suggestions

- Split diagram: "Passive recon → third party (WHOIS/DNS)" vs "Active recon → target directly"
- curl -I output with `server: cloudflare` and `cf-ray` circled
- Lab network diagram: isolated reconlab-net, two containers, 127.0.0.1-only, no internet path
- nmap fingerprint block with the repeated identical response across different probe types highlighted
- Port-state taxonomy graphic: open / closed (RST) / filtered (silent) with icons
- End-card with recap bullets and quiz questions
