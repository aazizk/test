# Day 1 — Networking Fundamentals Part 1: IP Addressing, CIDR, and Interfaces

## LinkedIn

192.168.1.0/24 looks like a random string of numbers — until you can tell, at a glance, exactly which 254 devices it can hold and where it starts and ends.

Day 1 of my cybersecurity training (working toward CEH-level knowledge, starting from scratch) was all about that: IP addressing and subnetting.

What I covered:
- How an IP address and a subnet mask combine to define a network
- Reading CIDR notation (/24, /25, /26, /28) and calculating the network address, broadcast address, and usable host range for each
- MAC addresses and how they differ from IP addresses
- Interface state flags — specifically the difference between UP (administratively enabled) and LOWER_UP (physical link actually detected), which is a distinction I'd genuinely never thought about before

The subnet math clicked faster than I expected, which was a nice confidence boost for Day 1. It's a good reminder that most of security starts with genuinely boring fundamentals — you can't reason about scanning, segmentation, or lateral movement later if you can't first answer "what range of addresses does this network actually cover."

On to Day 2: routing and how traffic actually decides where to go.

#CyberSecurity #Networking #LearningInPublic #CEH #InfoSec #100DaysOfLearning

## Twitter/X

Day 1 of my security training: learned to read CIDR notation (/24, /25, /26) and calculate network/broadcast/usable host ranges by hand. Also TIL interface flags UP ≠ LOWER_UP — enabled isn't the same as actually connected. 🔌

#InfoSec #Networking
