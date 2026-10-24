# Day 10 — Vulnerability Assessment: CVSS Scoring, Scanner Mechanics, and Why "Patched" Banners Lie — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

Here's a sentence that sounds boring until you understand what it actually means: "Server leaks inodes via ETags, header found with file /, fields: 0x689caadf 0x267." That's a real line from a real scan I ran against a real server, five minutes before recording this. And the question I had to answer wasn't "is this scary." It was "is this even real." Because here's the thing nobody tells you when you start learning security tools: half of what a vulnerability scanner reports is noise. And figuring out which half is the actual skill.

[SCREEN: terminal showing the nikto output line]

## Intro

If you're following along with this series, this is Day 10, and we just opened Phase 3: Vulnerability Assessment. If you're new here — I'm working through a structured, CEH-track cybersecurity curriculum from scratch, and wherever possible I do it hands-on in real, isolated lab environments instead of just reading about it. Today you're going to learn how vulnerabilities get classified, how severity actually gets scored, how scanning tools work under the hood, and — the part that actually matters in practice — how to tell a real finding from noise.

## Teaching segment: three kinds of vulnerabilities

Let's start with something simple that I hadn't thought about clearly before today: "vulnerability" isn't one category of thing. There are three.

The first is a **missing patch**. This is the easy case — there's a known, published vulnerability, the vendor already shipped a fix for it, and you just haven't applied it yet. Find the version, check it against a CVE database, update. Done.

The second is a **misconfiguration**. The software itself is fully up to date and has no known bugs — but it's been set up in a way that's insecure. Directory listing left on. Default credentials never changed. Debug mode exposed to the internet. This is actually what most of the recon and enumeration work from earlier in this series was surfacing — open ports, exposed paths, leaky headers. Not bugs. Bad setup.

The third, and the trickiest, is a **design flaw**. The software works exactly as it was built to work — and the design itself is the problem. A password-reset flow that accidentally tells you whether an email address exists in the system. A session token that's predictable by design. There's no patch for this one. You can't update your way out of a bad design — it needs to be rebuilt.

Why does this distinction matter? Because it changes what "fixing it" even means. A missing patch is an update. A misconfiguration is a settings change. A design flaw is a redesign conversation with engineering. Mixing these up in a report wastes everyone's time.

## Teaching segment: reading a CVSS score

Every vulnerability gets scored from 0 to 10 using something called CVSS — the Common Vulnerability Scoring System. And it's built from a vector string that looks intimidating the first time you see it:

[SCREEN: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H]

Here's how to actually read it. AV is attack vector — how close does the attacker need to be. N means network, so they can be anywhere on the internet. AC is attack complexity — low means it's easy to pull off. PR is privileges required — none means the attacker doesn't need an account first. UI is user interaction — none means no victim needs to click anything. And then C, I, A are confidentiality, integrity, and availability impact — how bad it gets if it succeeds.

Here's the mental model that actually made this click for me, after I got it wrong the first time: every one of these fields that comes back as "none" or "low" is a barrier the attacker doesn't have to clear. Network instead of local. No privileges instead of needing an account. No user interaction instead of needing someone to click something. The fewer barriers, the higher the score. When you see a vector string where almost everything is "none" and the impact is "high" across the board — that's not a medium finding. That's Critical. That's the shape of something like Log4Shell, which scored a perfect 10.

## Teaching segment: how a scanner actually works

So where do these findings even come from? Tools like nikto, Nessus, OpenVAS — they're not intelligent in the way people assume. They do three mechanical things. They fingerprint your server's version banner and check it against a database of known CVEs for that version. They probe a big list of commonly dangerous paths — admin panels, exposed git folders, default config files — and see what responds. And they check headers and configuration against known-good baselines.

None of that involves the tool actually understanding your application's logic. It's pattern matching against a signature list. And that single fact explains almost every false positive you'll ever see from a scanner.

## Teaching segment: the real lab — nikto against my own server

So let's make this concrete. I spun up a plain nginx container on an isolated Docker network — bound only to localhost on my own machine, nothing exposed to the internet — and ran nikto against it for real.

[SCREEN: docker run command + nikto -h http://127.0.0.1:8080]

It came back with two findings. First: the server leaks inode numbers through its ETag header. An ETag is normally just a caching identifier, but nginx's default format happens to bake in the file's inode number and exact size — filesystem-internal details. Second: the anti-clickjacking X-Frame-Options header wasn't present.

Now here's where the actual skill comes in — triage. Is either of these worth reporting?

The inode leak sounds scary at first — my gut reaction was "this could let someone traverse the filesystem or copy files." That's wrong, and it's worth saying out loud because it's a natural mistake. An inode number is just an internal serial number for a file. Knowing it doesn't let you reach other files or read anything you couldn't already request over HTTP. The real, much smaller risk is that in a clustered setup, differing inode-based ETags across backend servers can leak infrastructure details or let someone fingerprint which server answered a request. Real, but minor — an informational note, not a headline finding.

The missing header is a different story. X-Frame-Options exists specifically to stop clickjacking — where an attacker embeds your site in an invisible iframe, overlays a decoy button on top, and tricks a logged-in user into clicking something on your real site without realizing it. That header tells the browser "don't let anyone frame this page," and the attack simply can't render. That's a real, demonstrable attack with a direct fix. That one goes in the report.

[SCREEN: curl -I output after adding add_header X-Frame-Options SAMEORIGIN always; and reloading nginx]

So I added the header, reloaded nginx, and re-ran the scan. The clickjacking warning was gone. And notice what the scanner said instead — it now reported the header as "uncommon," not as "good." It still doesn't know this is a security control. It just has a rule for "missing" and a separate generic rule for "present but unrecognized." The tool never understood why the fix mattered. I did, because I verified it myself.

## Mistake/correction moment

I want to flag two mistakes from today specifically, because they're the kind of thing you'll probably do too. First, on the CVSS ranking drill, I initially ranked the "easiest to exploit, worst impact" vector as the lowest severity — I was reading the letters without connecting them to "how many barriers does the attacker face." Once I reframed it that way, I got every ranking right afterward. Second, on a question about verifying a Heartbleed vulnerability, my first instinct was to check if port 80 was open — but Heartbleed is a bug in TLS, which lives on HTTPS, not plain HTTP on port 80. I'd conflated the two protocols. The actual fix is to test the real behavior directly, with a tool like testssl.sh or nmap's ssl-heartbleed script, rather than trusting the version banner — which ties straight back into the backporting lesson: distros often patch a vulnerability while leaving the version string unchanged, so the banner alone can't prove anything either way.

## Recap + quiz

Three things to hold onto: vulnerabilities split into missing patches, misconfigurations, and design flaws, and each needs a different fix. CVSS severity is really just "how many barriers does the attacker have to clear" — fewer barriers, higher score. And scanners pattern-match, they don't understand — which means every finding needs a human to verify the actual behavior before it goes in a report.

Here are the three questions from today — pause and think before I give you the shape of the answer. One: a scanner flags an outdated OpenSSL version vulnerable to Heartbleed — what's the one thing you have to check before reporting that as real? Two: rank these three CVSS vectors by severity — AV:N/PR:N/UI:N, AV:L/PR:H/UI:R, and AV:N/PR:L/UI:N. Three: what's the actual difference in how you'd fix a missing-patch vulnerability versus a misconfiguration?

## Outro / CTA

If there's one line to take away from today, it's this: a scanner's output is a lead, not a verdict — always verify the actual behavior before you act on it or report it. That's not just a security lesson, honestly, it's a decent life lesson too.

Next time we're covering the flip side of today — false negatives, and why a scan can miss a real vulnerability entirely. Follow along for that one, and drop your answer to the quiz questions in the comments — I'll tell you how close you got.

## On-screen text / b-roll suggestions

- Caption overlay of the raw nikto output line on the hook
- Lower-third graphic breaking down the CVSS vector string field by field (AV/AC/PR/UI/S/C/I/A) as it's explained
- Screen recording of `docker run` setup for the nginx lab
- Screen recording of the nikto scan running and its two findings
- Before/after split-screen or sequential `curl -I` output showing the missing header vs. the fixed header
- Simple diagram of the clickjacking iframe-overlay attack (invisible iframe + decoy button graphic)
- Text callout: "Scanner finding = lead, not verdict" as a recurring visual motif
- End-card listing the three quiz questions for viewers to answer in comments
