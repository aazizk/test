---
day: 08
title: "Chapter 8: Passive and Active Recon — Trusting Evidence Over Assumptions"
course_phase: "Phase 2 — Reconnaissance Methodology"
status: draft, good source fidelity
source: "day-08/video-writeup.md, day-08/social-media-post.md"
has_diagram: false
---

# Chapter 8: Passive and Active Recon — Trusting Evidence Over Assumptions

## Learning objectives

By the end of this chapter, you will be able to:
- State the one-sentence test for whether a recon technique is passive or active.
- Verify CDN/WAF protection using response headers instead of IP-range assumptions.
- Explain why a service returning an identical response to every probe type is a red flag.
- Correctly distinguish nmap's "closed" port state from "filtered."

## The concept

This chapter opens Phase 2, the methodology attackers and defenders both use to learn about a target before doing anything else. The core distinction is refreshingly simple once it's framed correctly: **does a packet of yours ever actually reach the target's own infrastructure?** Passive recon — WHOIS lookups, DNS queries — never touches the target directly; you're querying a third party (a registry, a resolver) for data they already hold. Active recon — port scanning, direct connections — sends packets straight to the target's own systems. That line matters because active recon is detectable by the target, and passive recon generally isn't.

A real `whois` lookup against a public domain surfaces registry lock statuses like `clientTransferProhibited` — a good sign, an anti-hijacking protection, not a vulnerability — and shows contact emails redacted rather than shown directly, a GDPR-driven change from 2018 onward where registrars replaced raw contact emails with web-form-based contact instead. A `dig A` / `dig NS` lookup can reveal a domain's nameservers sit on a CDN provider, which opens up **origin-IP disclosure**: when a site sits behind a CDN or WAF, attackers specifically hunt for the real origin server IP, because reaching it directly bypasses the CDN's protections entirely — hunting through historical DNS records, unproxied subdomains, or IPs leaked in a certificate's subject alternative names.

Here's where recon gets concrete and evidence-based rather than assumption-based: running `curl -I` against a site and seeing a `server: cloudflare` header plus a `cf-ray` header is *actual proof* the request passed through that CDN's infrastructure — not an assumption based on which IP range the address happens to fall into. That distinction matters because CDN IP ranges expand over time, so an IP-range-based assumption can silently go stale, while verifying through response headers stays accurate regardless of how a provider's infrastructure grows.

For active recon, consider a lab with two containers on an isolated network: one running a real web server on a normal port, the other a minimal listener standing in for an unknown service on an unusual port. Running `nmap -sV` — a SYN scan with version detection — correctly fingerprints the real web server through genuine banner grabbing. The unknown listener, though, comes back unrecognized, flagged with a question mark meaning low confidence.

That low-confidence flag is the core insight of this chapter. Looking at nmap's own fingerprint output for an unrecognized port, it sends several different probe types — a null probe, a generic HTTP-style GET, a help command, others — and if it gets back the **exact identical raw response every single time, regardless of what was sent**, that's the tell. A real service that actually parses incoming data responds differently depending on what you send it. A service returning the same fixed output no matter the input isn't processing input at all — it's dumping a static string the instant a connection opens. Following up manually with a plain `nc` connection to confirm what the automated scan flagged is exactly how a real analyst works: automated scan flags something anomalous, then a manual tool confirms it by hand — not one tool run blindly trusted.

The mistake worth flagging from this chapter: conflating nmap's "filtered" port state with "closed." They are not the same. **Closed** means nmap got an explicit RST packet back — a clear, confirmed signal nothing is listening. **Filtered** means nmap got silence, no response at all — genuinely ambiguous, usually meaning a firewall is silently dropping the probe, and nmap can't tell from silence alone whether something is listening behind it. Treating silence as equivalent to a confirmed "closed" throws away real information about a possible firewall in the way.

## Hands-on lab recap — REAL LAB

This was a real lab on an isolated Docker network bound only to localhost with no path to the internet: one container ran a real web server, a second ran a minimal fixed-banner listener standing in for an unknown service. A real `nmap -sV` SYN scan correctly fingerprinted the known web server and flagged the mystery listener as unrecognized, with its own probe-fingerprint output showing identical responses across multiple distinct probe types. A manual `nc` connection confirmed the same banner by hand. Separately, real passive recon (`whois`, `dig`, `curl -I`) was run against a real public domain to observe genuine registry data and CDN headers — no synthetic data involved.

## Review questions

1. What's the one-sentence test for whether a recon technique counts as passive or active?
2. Why is verifying `cf-ray`/`server: cloudflare` headers more reliable than checking if an IP falls in a known CDN range?
3. What's the actual difference between nmap's "closed" and "filtered" port states, and why does that difference matter?

### Answers

1. Does a packet of yours ever actually reach the target's own infrastructure? If yes, it's active; if you're only querying a third party who already holds the data, it's passive.
2. CDN IP ranges expand over time, so an IP-range check can silently go stale; response headers are direct evidence the request actually passed through that provider's infrastructure right now, regardless of how its ranges have grown.
3. "Closed" means an explicit RST was received — confirmed, nothing listening. "Filtered" means silence — ambiguous, usually a firewall dropping the probe, and it's impossible to tell from that silence alone whether something is actually listening behind it. Treating the two the same discards real information about a possible firewall.

## Operational takeaway

> A port number is a convention, not an enforcement mechanism — never trust what's supposedly running on a port just because of its number; verify it with a real probe and read the response, not the assumption.

## Today in the broader CEH journey

This chapter opens Phase 2 — Reconnaissance Methodology, applying Phase 1's HTTP and networking fluency outward toward real infrastructure for the first time. Chapter 9 finishes Phase 2 with enumeration — digging deeper into what a target actually exposes once you know it's there, and finally resolving the 403-versus-404 lesson from Chapter 7 inside a real scanning context.
