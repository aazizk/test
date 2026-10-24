# Day 08 — Reconnaissance: why a service that gives the same answer to every probe is hiding something

## LinkedIn

I scanned a mystery service on my own lab network today and got the same raw response back no matter what kind of probe I sent it. That single detail was the whole lesson.

Day 8 opened Phase 2 of my cybersecurity training — reconnaissance — with real recon against a real public domain (anthropic.com, using only public WHOIS/DNS/HTTP data) plus a real Docker lab for active scanning.

Passive recon first: `whois` and `dig` against a real domain. Learned that modern WHOIS records are GDPR-redacted (no raw contact emails since 2018), and dug into why attackers hunt for a site's real origin IP behind a CDN — then empirically confirmed via `curl -I` that `server: cloudflare` and `cf-ray` headers are the actual proof of proxying, not just an IP range guess. Ranges expand over time; headers don't lie the same way.

Then active recon, hands-on: two containers on an isolated lab network, one real nginx server, one mystery service dumping a fixed banner. `nmap -sV` correctly fingerprinted the nginx instance. But the mystery service came back unrecognized — and the reason was visible right in nmap's own output: it returned the exact same raw response regardless of probe type. That's the signal a service isn't actually parsing input at all, just echoing a static string on connect. Confirmed it manually with a plain `nc` afterward.

I also mixed up nmap's "filtered" (silent, ambiguous) and "closed" (explicit rejection) port states — good correction to make early.

#CyberSecurity #Recon #Nmap #LearningInPublic #InfoSec

## Twitter/X

Scanned a mystery service in my own lab. Every probe type — same exact raw response. That's not a mystery service, that's a service not parsing input at all, just dumping a fixed string. nmap flagged it, `nc` confirmed it. Day 8 of #CyberSecurity training. 🕵️
