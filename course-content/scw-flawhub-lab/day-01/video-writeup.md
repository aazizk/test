# Day 01 — FlawHub: Chaining SSRF, Path Traversal, and a Known-Plaintext XOR Attack Into Admin Takeover — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

Here's a sentence I did not expect to type this week: I broke into the admin account of a marketplace app by exploiting its PDF export button. Not a login form. Not an API key. A button that generates a PDF of some documentation. That one feature, chained with three other small bugs, got me a fully admin-approved malicious upload into a production-style app. Let me show you exactly how, step by step, including the part where I spent an embarrassing amount of time debugging my own testing tool instead of the actual target.

[SCREEN: FlawHub library homepage, skill list visible]

## Intro

If you're following along with my security learning series, this one's a hands-on lab from SecureCodeWarrior — a platform my employer gives me access to for exactly this kind of practice. The target is a fictional app called FlawHub: a marketplace where users upload "skills" for AI agents, and other users download and use them. My job in this lab was to think like an attacker — upload something malicious, and find a way to get it approved so it would ship to every single user in the library. By the end of this video, you'll understand four real, common web vulnerability classes, how they chain together, and — just as important — how your own tools can lie to you mid-investigation if you're not careful.

## Teaching segment: stored HTML injection into a server-side PDF renderer (SSRF)

Let's start with the first crack in the wall. FlawHub lets you write documentation for your uploaded skill in Markdown. Markdown is supposed to be safe — it's just text formatting, right? Bold, italics, headers, links.

Except a lot of Markdown renderers also let raw HTML pass straight through, untouched. And that includes `<script>` tags.

[SCREEN: skill upload form, documentation field with raw HTML pasted in]

Now, normally, if your browser rendered that script, the worst case is some client-side mischief in your own tab — not very exciting on its own. But FlawHub has a feature where you can export any skill's documentation as a PDF. And PDF generation like this is almost always done the same way under the hood: a real, headless browser — in this case, a tool called Puppeteer — loads the page server-side and essentially takes a snapshot of it as a PDF.

Here's the key insight: that headless browser executes JavaScript. Including my JavaScript. And it's not running on my laptop — it's running inside FlawHub's own server infrastructure.

So I wrote a tiny script into the documentation field that does a `fetch()` call to an internal URL — something like `localhost:8080` — and writes the response onto the page. Then I exported that skill's documentation to PDF.

[SCREEN: generated PDF showing leaked internal log content]

The PDF came back containing the actual response from FlawHub's internal diagnostics service — a debug log endpoint nobody intended the public to reach. This is called SSRF: Server-Side Request Forgery. I tricked the server into making a request on my behalf, into a part of the network I could never reach directly. And the entry point wasn't some obscure backend API — it was a "download my docs as PDF" button.

That leaked debug log turned out to be a goldmine: it described a backup job that takes several sensitive files — a certificate, some log files, an environment file full of secrets — and "encrypts" them with XOR before writing them into a backup folder. Remember that detail. It matters a lot later.

## Teaching segment: path traversal on a public download endpoint

Step two. FlawHub also has a totally ordinary, public-facing feature: downloading a skill as a zip file. When you click download, it fires off a request like this:

`GET /api/skills/download?filename=test-2-bundle.zip`

[SCREEN: browser DevTools network tab showing the download request]

See that `filename` parameter? Any time you see user-controlled input that looks like a filename being handed straight to a server, your instinct as a security tester should be: what if I change that filename to point somewhere else entirely? That's path traversal — using sequences like `../` to climb out of the folder the developer intended and into somewhere else on the filesystem.

I tried the obvious thing first: `filename=../../../backups/backup_id/error.log`. And I got the same error every single time, no matter how many `../` I added or removed: "Bundle not found."

That consistency was actually the clue, but I didn't see it right away — which brings me to the mistake segment.

## Mistake/correction moment

Here's where I burned way more time than I should have. I was testing through a repeater tool — basically a way to replay and tweak HTTP requests. I kept typing my traversal payload into its URL field, and kept getting the exact same error, regardless of depth.

My assumption was: the server must be filtering this somehow. So I tried encoding the dots, encoding the slashes, double-encoding everything. Same result, every time.

Eventually I figured out the real problem: the testing tool's own URL input field was quietly cleaning up my `../` sequences before the request even left my machine — the exact same way your browser's address bar collapses `..` in a path. It wasn't the server blocking me. It was my own tool, silently "helping."

The fix was simple once I understood it: stop typing into that field, and instead fire the request directly with JavaScript's `fetch()` from the browser's developer console, scoped to the actual app's page. No helpful auto-cleanup, no surprises — just the raw request going out exactly as I wrote it.

The broader lesson here applies way beyond this one lab: if you change an input and the output never changes, no matter what you try, don't assume your technique is wrong. Suspect something upstream of your actual target — a tool, a cache, a proxy — that's silently intercepting or normalizing things before your test ever reaches the thing you're trying to test.

Once I fixed that, I hit a second, smaller trap: I was still requesting `error.log`, but remember that debug log from step one? It said the backup job replaces the original files with `.xor`-encrypted versions. The plain `error.log` didn't exist anymore — only `error.log.xor` did. Small detail, same lesson: always go back and check your earlier recon for the exact, literal names things actually have, instead of assuming.

With both of those fixed — a clean `fetch()` call, three levels of `../`, and the correct `.xor` filenames — I successfully pulled down the encrypted certificate and environment files straight from the backup folder.

[SCREEN: console output showing successful 200 response with encrypted file content]

## Teaching segment: known-plaintext XOR attack

Final stage. I now had two encrypted files: a certificate backup and an environment file, both XOR-"encrypted." XOR encryption works by combining each byte of your data with a byte from a key, repeating the key as needed. It has one famous weakness: if an attacker can guess even a little bit of the original, unencrypted content, they can recover the key directly — because XOR is its own inverse. Plaintext XORed with the key gives you ciphertext; ciphertext XORed with the key gives you back the plaintext. Rearrange that, and ciphertext XORed with plaintext gives you the key.

So — what's a piece of plaintext I could guarantee is inside that certificate file, without ever seeing it? Every single `.pem` certificate file in existence starts with the exact same fixed line: `-----BEGIN CERTIFICATE-----`. That's not a secret. That's a published, universal file format header.

[SCREEN: diagram showing plaintext XOR ciphertext = key]

I XORed that known header against the first chunk of the encrypted certificate file, byte by byte, and got back a string of bytes — the key. And because the key was short, after about sixteen bytes, the pattern started repeating. That told me the exact key length.

Then I took that recovered key and applied it to the second encrypted file — the one containing environment secrets — using the lab's built-in XOR tool. Out came the administrator's email and password, in plain text.

From there, it was a straight line to the finish: log in as admin, find my uploaded malicious skill sitting in a pending-approval queue, and approve it myself. Goal complete — a skill nobody should trust is now published to every user in the library.

## Recap + quiz

Let's pull the whole chain together, because this is the real point of the lab: no single step here was catastrophic on its own.

One: an input sanitization gap in a documentation field became server-side request forgery, because a PDF renderer is a real HTTP client most developers never think about that way.

Two: a trusted-looking filename parameter on a public endpoint allowed path traversal once I stopped letting my own tooling mislead me.

Three: "encryption" that was really just XOR fell apart the moment any piece of the plaintext was predictable.

Each one, alone, is a moderate finding. Chained together, they're a full compromise.

Before I give you my own takeaway — pause the video and think about this: if you were the developer of FlawHub, which single one of these four weaknesses would you fix first to break the entire chain, and why?

## Outro / CTA

My operational takeaway from today: when you're testing and the result refuses to change no matter what you vary, stop tweaking the payload and start questioning the tool sitting between you and the target. That one realization saved this entire lab for me.

If you want to see how I handle SSRF and injection bugs in the next lab, follow along for the next session, and drop your answer to the quiz question in the comments — I want to see which fix you'd prioritize and why.

## On-screen text / b-roll suggestions

- Lower-third on first mention: "SSRF = Server-Side Request Forgery"
- Lower-third on first mention: "Path Traversal: escaping the intended directory using `../`"
- On-screen diagram: `plaintext XOR ciphertext = key` (show this twice — once in the teaching segment, once faded in behind the recap)
- Screen recording: the upload form with the malicious `<script>` in the Markdown field
- Screen recording: DevTools Network tab showing the `filename=` download request
- Screen recording: Console `fetch()` call succeeding after the repeater-tool mistake is fixed
- Caption overlay during the mistake segment: "The bug wasn't in the server. It was in my own tool."
- End-card text: "Which fix would you prioritize? Comment below."
