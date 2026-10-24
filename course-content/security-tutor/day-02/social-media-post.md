# Day 02 — Networking Fundamentals Part 2: how your computer decides "local delivery" vs "send it to the router"

## LinkedIn

Every single packet your computer sends starts with one decision: is the destination on my own local network, or does it need to go through the router?

Day 2 of my cybersecurity training was about understanding exactly how that decision gets made — and it's more mechanical (and more interesting) than I expected.

If the destination is local, your machine uses ARP to find the destination's actual hardware (MAC) address and delivers the packet directly on the local segment. If it's not local, your machine hands the packet off to its default gateway — the router — to take it from there.

But routers don't just blindly forward everything to one place either. They consult a routing table and use longest-prefix-match logic: among all the possible matching routes, the most specific one wins. And when nothing more specific matches, there's a catch-all — the default route, 0.0.0.0/0 — that becomes "send it this way if you don't know where else to send it."

Once this clicked, a lot of networking stopped being a black box. Every "why can't I reach this server" problem usually starts right here: is this local-vs-routed decision even happening the way I think it is?

Next up: TCP/UDP and DNS, and tying this routing logic into a full request from start to finish.

#CyberSecurity #Networking #LearningInPublic #InfoSec #ITFundamentals

## Twitter/X

Day 2 of cybersecurity training: how does a computer decide whether to deliver a packet locally (ARP) or send it to the router (default gateway)? And how do routers pick the right route when several could match? Longest-prefix-match wins. 🧠

#CyberSecurity #Networking
