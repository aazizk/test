# Day 01 — FlawHub: chaining SSRF, path traversal, and a known-plaintext XOR attack into full admin takeover

## LinkedIn

I just chained four separate bugs into a full admin takeover of a marketplace app — and the trickiest part wasn't the exploit, it was my own testing tool lying to me.

The lab (SecureCodeWarrior's FlawHub scenario): a marketplace where users share "skills" for AI agents. Goal — upload a malicious skill and get it verified so it's pushed to every user in the library.

Here's the chain:

1. The skill documentation field accepts Markdown, but raw `<script>` tags pass straight through — unsanitized — into a server-side Puppeteer PDF renderer. Embedding a `fetch()` call in the doc and exporting to PDF made FlawHub's *own server* issue requests into its internal network. Classic SSRF, hiding in a feature nobody thinks of as an HTTP client.

2. That leaked an internal diagnostics log describing a backup job — which pointed to a public file-download endpoint vulnerable to classic `../` path traversal, reachable with the right depth and encoding.

3. The backup files were XOR "encrypted." Since every `.pem` certificate file starts with the same fixed header, I XOR'd that known text against the encrypted certificate to recover the (short, repeating) XOR key — a textbook known-plaintext attack.

4. Applied that key to a second encrypted file, recovered admin credentials, logged in, and approved the malicious skill. Game over.

The real lesson, though: my biggest time sink wasn't the vulnerabilities — it was a testing tool silently "cleaning up" `../` sequences before sending my requests, making every depth I tried look identical. When results look suspiciously the same no matter what you change, suspect something upstream short-circuiting your input, not a dead end in your technique.

Chained bugs, not single dramatic exploits, are what real incidents actually look like.

#CyberSecurity #AppSec #SSRF #PathTraversal #InfoSec #BugBounty

## Twitter/X

1/ Just chained 4 bugs into full admin takeover of a marketplace app: stored-HTML-injection → SSRF (via a PDF renderer!) → path traversal → known-plaintext XOR crack of leaked creds. 🧵

2/ The SSRF hid in the last place I'd expect: a server-side Puppeteer PDF renderer that executed attacker JS embedded in Markdown docs — turning a "render my docs" feature into an internal HTTP client.

3/ Biggest lesson wasn't the exploit chain — it was that my own repeater tool was silently stripping `../` before sending requests. Every depth I tried gave the exact same error. Identical results across varied inputs = suspect the tooling, not your technique.

4/ Every `.pem` file starts with `-----BEGIN CERTIFICATE-----`. That one fact is enough to fully crack a XOR "encrypted" file via known-plaintext attack. XOR ≠ encryption.

#AppSec #SSRF #InfoSec
