# Day 1 — Networking Fundamentals Part 1: IP Addressing, CIDR, and Interfaces — Video Script

**Estimated length:** ~9 minutes (~1400 words)

## Hook

Quick question: if I hand you the address 192.168.1.137/26, can you tell me — without a calculator, without a subnet cheat sheet app — exactly how many other devices can live on that same network, and what the very first and very last usable address are? By the end of today's video, you will be able to do that in under thirty seconds. That one skill is the foundation for basically everything else in networking and security that follows it.

[SCREEN: title card — "Day 1: IP Addressing & CIDR" with a /24 network diagram]

## Intro

Hey, welcome to Day 1 of my cybersecurity learning series. I'm starting from a basic IT background and working my way up to CEH-level knowledge — networking, Linux, web security, all of it — one roughly 45-minute session at a time, and I'm documenting every single day. Today's topic is the true starting point of networking: IP addressing, subnet masks, and CIDR notation. If you've ever seen a "/24" and just nodded along without really knowing what it meant, this one's for you.

## Teaching segment: IP addresses and subnet masks

An IP address on its own doesn't tell you much — it's just a number. What actually defines a network is the combination of an IP address and a subnet mask. The subnet mask tells you how many of the bits in that address are "network" bits — fixed, shared by every device on that network — versus "host" bits, which is the part that actually varies from device to device.

[SCREEN: diagram splitting an IP address into network portion and host portion]

That's where CIDR notation comes in. When you see something like 192.168.1.0/24, that slash-24 is literally telling you: the first 24 bits are the network portion, and the remaining 8 bits are available for host addresses. A /24 gives you 8 host bits, which works out to 256 total addresses — though as we'll get to in a second, not all 256 are actually usable by devices.

## Teaching segment: calculating network, broadcast, and usable host range

This is the part that sounds intimidating until you do it three or four times. For any CIDR block, there are three numbers you care about:

First, the network address — the very first address in the block, always ending in all-zero host bits. It identifies the network itself and is never assigned to a device.

Second, the broadcast address — the very last address in the block, all-one host bits. It's used to send a message to every device on that network at once, and it's also never assigned to an individual device.

Third, the usable host range — everything in between those two. That's the actual pool of addresses you can hand out to devices.

[SCREEN: worked example — 192.168.1.0/24 broken into network address 192.168.1.0, broadcast 192.168.1.255, usable range .1 through .254]

So for a /24, you get 256 total addresses, minus the network and broadcast addresses, leaving 254 usable host addresses. I worked through this same logic for /25, /26, and /28 blocks during the session — each time halving the host bits shrinks the usable range dramatically. A /28, for example, only gives you 16 total addresses and just 14 usable ones. That's the kind of math that matters a lot in the real world — it's literally how network engineers decide how to carve up address space for different departments, VLANs, or environments.

## Teaching segment: MAC addresses vs IP addresses

The other piece from today was MAC addresses. Where an IP address is a logical address — assigned, and can change depending on what network you're connected to — a MAC address is burned into the network interface hardware itself. It's used for addressing on the local network segment, one hop at a time, while IP addresses are what get you across networks. We'll come back to exactly how those two work together once we get into ARP and routing in the next session.

## Teaching segment: interface state flags — UP vs LOWER_UP

This was honestly my favorite small detail from today. When you look at a network interface's status, you'll often see flags like UP and LOWER_UP, and it's tempting to think they mean the same thing. They don't.

[SCREEN: example interface output showing flags, UP and LOWER_UP highlighted separately]

UP means the interface has been administratively enabled — basically, someone or something told the operating system "this interface should be active." LOWER_UP is a completely different signal: it means there is an actual physical link detected — a cable plugged in, a radio link established, something real on the other end. You can absolutely have an interface that's UP but not LOWER_UP — enabled in software, but with nothing physically connected. That distinction matters a lot when you're troubleshooting, or later, when you're trying to figure out whether a target host is actually reachable versus just configured.

## Mistake/correction moment

No major mistakes to flag on Day 1 — the subnet math landed correctly across every example worked through in the session, which was a solid confidence builder for starting this series. The real lesson from today isn't a correction, it's a reminder: fundamentals like this feel almost too simple to bother with, but every later topic — scanning, segmentation, lateral movement, firewall rules — assumes you can do this math instantly and correctly. Skipping it to get to the "exciting" security topics faster would have been a mistake.

## Recap + quiz

Let's recap the three big ideas from today. One: a subnet mask, or its CIDR shorthand, splits an IP address into a network portion and a host portion. Two: every CIDR block has a network address and a broadcast address that are reserved and never assigned to devices — everything else is usable. Three: interface flags UP and LOWER_UP are not the same thing — one is software state, the other is physical link state.

Here's a quiz for you, pause the video if you want to actually work it out: for the network 10.0.0.0/28, what is the network address, the broadcast address, and how many usable host addresses are there? Drop your answer in the comments — I'll pin the correct answer so you can check yourself.

## Outro / CTA

My one practical takeaway from today: always check interface state before trusting that an IP is reachable — UP alone doesn't mean connected. If this was useful, follow along for Day 2, where we get into routing, default gateways, and how a packet actually decides where to go next. See you then.

## On-screen text / b-roll suggestions

- Lower-third captions for key terms as they're introduced: "CIDR notation," "Network address," "Broadcast address," "Usable host range"
- Full-screen worked diagram for the 192.168.1.0/24 breakdown (network/broadcast/usable range) held for a few extra seconds so viewers can pause
- Side-by-side comparison graphic for /24 vs /26 vs /28 showing shrinking usable host counts
- Terminal/output screenshot showing interface flags with UP and LOWER_UP visually circled or highlighted separately
- End-card text overlay with the quiz question so it's visible even with sound off
