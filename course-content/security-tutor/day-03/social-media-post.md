# Day 03 — Networking Fundamentals Part 3: chaining DNS → routing → TCP handshake → HTTP into one flow

## LinkedIn

Today I connected every networking concept I've learned this week into a single mental model: what actually happens, step by step, when you type a URL into a browser.

Day 3 of my cybersecurity training covered TCP vs UDP, the TCP three-way handshake (SYN, SYN-ACK, ACK — with real sequence and acknowledgment number math, not just the acronyms), well-known vs ephemeral ports, and the "4-tuple" that uniquely identifies a connection (source IP, source port, destination IP, destination port).

Then DNS: why A/AAAA records exist, and specifically why DNS runs over UDP instead of TCP — it needs to be fast and lightweight for small, simple lookups, not reliable for large transfers.

But the part that made this day click wasn't any single concept — it was chaining all of it together without being told to: DNS resolves the name, routing (from yesterday) gets the packets there, the TCP handshake establishes a reliable connection, and only then does HTTP actually request the page.

That's the real skill in security work — not memorizing each layer in isolation, but being able to trace a full request end-to-end and know exactly where something could go wrong (or be attacked) at each step.

#CyberSecurity #Networking #TCP #DNS #LearningInPublic #InfoSec

## Twitter/X

Day 3: TCP three-way handshake, ports, the 4-tuple, DNS basics — then chained all of it into one flow: DNS → routing → TCP handshake → HTTP. That's the moment individual networking facts turned into an actual mental model. 🧵

#CyberSecurity #Networking
