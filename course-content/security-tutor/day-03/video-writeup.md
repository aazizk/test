# Day 03 — Networking Fundamentals Part 3: TCP, DNS, and the full request flow — Video Script

**Estimated length:** ~12 minutes (~1700 words)

## Hook

What actually happens, in order, between the moment you hit enter on a URL and the moment a web page shows up on your screen? Most people never think about this. Today I learned every single step of that chain, and then — without anyone telling me to — I found myself explaining the whole thing back as one continuous flow. That's the moment this stopped being disconnected facts and started being an actual mental model, and I want to walk you through it exactly the way it clicked for me.

## Intro

This is Day 3 of my cybersecurity training, finishing up the core networking phase before I move into Linux. If you watched Day 1 and Day 2, you've already got IP addressing, subnetting, and the local-versus-routed delivery decision. Today adds the two missing pieces — TCP and DNS — and then ties everything together. By the end of this video you'll be able to trace a real web request from a URL bar all the way to a loaded page, step by step.

## Teaching segment: TCP vs UDP

The first distinction is TCP versus UDP. TCP is connection-oriented and reliable — it guarantees your data arrives, arrives in order, and resends anything that gets lost. UDP is the opposite: no guarantees, no connection setup, just fire-and-forget packets. Neither one is "better" — they're built for different jobs. TCP is what you want when correctness matters more than speed, like loading a web page. UDP is what you want when speed matters more than occasionally dropping a packet, like a quick DNS lookup or live video.

## Teaching segment: the TCP three-way handshake

Then I went through the TCP three-way handshake in real detail — not just the acronym, but the actual numbers involved. The client sends a SYN packet with an initial sequence number. The server responds with a SYN-ACK, which includes its own sequence number plus an acknowledgment number equal to the client's sequence number plus one. The client finishes with an ACK, acknowledging the server's sequence number plus one. Only after all three of those packets complete is the connection actually considered open and ready to carry real data.

[SCREEN: simple three-arrow diagram — SYN →, ← SYN-ACK, ACK → — with sequence/ack numbers labeled on each arrow]

I also learned about well-known ports versus ephemeral ports. Well-known ports, like 80 for HTTP or 443 for HTTPS, are the fixed, predictable ports servers listen on. Ephemeral ports are temporary, randomly assigned ports your own machine uses for the client side of the connection. And both of those, combined with both IP addresses, make up what's called the 4-tuple — source IP, source port, destination IP, destination port — which is literally how your operating system tells apart hundreds of simultaneous connections that might all be going to the same website.

## Teaching segment: DNS basics

Before any of that TCP handshake can even start, there's usually a DNS lookup. DNS translates a human-readable name into an IP address using A records for IPv4 and AAAA records for IPv6. And here's a detail I found genuinely interesting: DNS runs over UDP, not TCP. That seems backwards at first — isn't reliability important? But a DNS lookup is small, needs to be fast, and if a response is lost, the client just asks again. That's exactly the situation UDP is built for, which ties directly back into the TCP-vs-UDP distinction from earlier in the lesson.

## Teaching segment: chaining it all into one flow

This is the part that actually made the lesson stick. Instead of treating DNS, routing, TCP, and HTTP as four separate topics, I walked through them as one continuous chain: first, DNS resolves the domain name to an IP address. Second, using yesterday's routing logic, the packets get delivered — either locally via ARP or routed through gateways using longest-prefix-match — toward that IP address. Third, once the packets can actually reach the destination, the TCP three-way handshake runs to establish a reliable connection. And only after that handshake completes does an HTTP request actually go out and a web page start loading.

[SCREEN: single flow diagram — DNS lookup → routing/delivery → TCP handshake → HTTP request/response]

Seeing it as one chain instead of four disconnected lessons is what actually matters here, because every one of those steps is also a place where something can break, or where an attacker can interfere — DNS can be spoofed, routing can be manipulated, a TCP handshake can be exploited for things like SYN floods, and HTTP itself can be tampered with. None of that makes sense without the full chain in your head first.

## Mistake/correction moment

I didn't have an outright wrong answer today, but I want to flag something I almost glossed over: it's easy to assume DNS "just happens" invisibly before everything else and stop thinking about it. The useful correction here is to treat DNS as a real step with its own protocol, its own transport choice, and its own failure modes — not just an invisible prerequisite. Skipping past it mentally is exactly how people miss DNS-based attacks later on.

## Recap + quiz

Three takeaways: one, TCP trades speed for reliability via the three-way handshake, while UDP trades reliability for speed. Two, the 4-tuple — source IP, source port, destination IP, destination port — is what makes individual connections distinguishable from each other. Three, a real web request is a chain: DNS resolves the name, routing delivers the packets, the TCP handshake opens the connection, and only then does HTTP actually run.

Quiz: First, why does DNS use UDP instead of TCP? Second, in the three-way handshake, what does the server's SYN-ACK acknowledgment number actually equal? Third, can you name all four parts of the 4-tuple, and explain why all four are needed instead of just the two IP addresses?

## Outro / CTA

Operational takeaway: every real connection is a chain of distinct steps — DNS, routing, the TCP handshake, then the actual protocol — and knowing that chain is what lets you reason about where things break or get attacked. Next up in this series, I move into Linux fundamentals: permissions, users, and the filesystem. Follow along if you want to keep building this with me, and leave your quiz answers below.

## On-screen text / b-roll suggestions

- Side-by-side comparison card: "TCP: reliable, ordered, connection-based" vs "UDP: fast, no guarantees, connectionless"
- Three-way handshake diagram with sequence/ack numbers labeled, shown as an animated arrow sequence
- Callout box: "4-tuple = source IP + source port + destination IP + destination port"
- Full-flow diagram as a recurring visual: DNS → Routing → TCP Handshake → HTTP, highlighting each stage as it's discussed
- End-card with recap bullets and quiz questions
