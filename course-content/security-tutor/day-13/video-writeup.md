# Day 13 — SQL Injection: building, exploiting, and fixing a real login bypass — Video Script

**Estimated length:** ~11 minutes (~1650 words)

## Hook

I just typed `admin' --` into a login form's username field, left the password field full of garbage, and got logged in as admin anyway. No password guessing, no brute force, no stolen credentials. Just two characters and a quote mark, against a login form I built myself, specifically so I could learn exactly why this works.

[SCREEN: terminal showing the final successful exploit output — "Login successful. Welcome admin."]

## Intro

This is Day 13 of my cybersecurity training series, working toward CEH-level knowledge from the ground up. We just wrapped vulnerability assessment as a full phase, and today we started Phase 4: Web Security and the OWASP Top 10 — the industry-standard list of the most critical web application security risks. By the end of this video you'll understand exactly how SQL injection works at the query level, why a seemingly reasonable attack payload can silently fail, and what the actual industry-standard fix looks like, because I built a real vulnerable app and exploited it myself rather than just reading about it.

## Teaching segment: Broken Access Control, named properly

Before SQL injection, I closed a loop from a few days earlier. Back in an earlier lab, I built a Flask app with a bug where changing a number in the URL let any logged-in user view someone else's social security number. I knew the bug existed and knew how to exploit it, but I didn't have the official industry term for it. Today I learned it: this is called Broken Access Control, and it's literally the number one category in the OWASP Top 10.

The key distinction is authentication versus authorization. Authentication asks "who are you" — did you prove your identity, usually with a login. Authorization asks a completely separate question: "now that I know who you are, what are you allowed to do." That earlier bug passed authentication perfectly — I really was logged in — but failed authorization, because the app never checked whether I was allowed to view that specific profile. That's Broken Access Control in one sentence: authentication succeeds, the permission check on the resource doesn't happen.

## Teaching segment: How SQL injection actually works

Then we moved into SQL injection, one of the most historically damaging web vulnerabilities there is. The core idea: a lot of web apps build database queries by directly pasting user input into a string, instead of treating that input as pure data. If an attacker controls part of that string, they can inject their own SQL logic into the query.

Take a classic login query structure: select everything from the users table where username equals whatever was typed, and password equals whatever was typed. If the app just concatenates raw input into that string, you can type something into the username field that doesn't just provide a username — it changes what the query actually does.

The classic payload is a single quote, followed by OR '1'='1'. Here's the mechanism: that single quote closes the string the developer's code already opened, so the SQL still parses correctly. Then `OR '1'='1'` adds a new condition that's always true, no matter what row of the database you're looking at — it's comparing the literal text "1" to the literal text "1," which has nothing to do with any actual data. Since it's connected with OR, if either side of the condition is true, the whole thing is true. So every row in the table suddenly satisfies the WHERE clause.

## Teaching segment: The precedence trap

Here's where it got genuinely interesting, and this is the part of today's session I'm proudest of — not because I got it right immediately, but because I caught a real mistake in my own reasoning.

I originally proposed the payload `' OR '1'='1'` without anything extra at the end, against a query that checks both username AND password. The problem: in SQL, AND binds tighter than OR, the same way multiplication binds tighter than addition in regular math. So that query doesn't evaluate left to right — it groups as username-check OR (the-true-condition AND password-check). If the password guess is wrong, that whole AND group is false, and you're left with just the original username check, which is also false. The clever-looking bypass actually fails.

[SCREEN: the query grouped visually — (username = '') OR ('1'='1' AND password = 'wrong_guess') — showing the AND group evaluating false]

The real, working version adds a SQL comment marker — two dashes — right after the injected condition. That comment deletes everything after it in the query, including the entire AND password check. So the database never even evaluates a password at all. The comment isn't just decoration; it's doing the actual work of removing the competing condition that precedence would otherwise let survive.

## Teaching segment: The real lab — building, exploiting, and fixing it

Rather than stop at theory, I built an actual vulnerable Flask and SQLite login app, running in an isolated Docker container on its own network — same safety pattern I've used in every hands-on lab this course. The login route built its SQL query with an f-string, directly pasting in the username and password exactly like the textbook vulnerable pattern.

[SCREEN: the vulnerable line of code — a Python f-string building the SQL query]

First I confirmed it worked normally with a real login. Then I ran the exploit: `' OR '1'='1' --` in the username field. That logged me in — but as whichever account came back first from the database, not necessarily the one I wanted, because the app only reads the first matching row. To specifically target the admin account and steal its data, I used a more precise payload: `admin' --`. That skips the OR trick entirely and just matches the real username "admin," then comments out the password check completely. The result: I was logged in as admin and pulled its secret data, using a password that actually belonged to a completely different account.

[SCREEN: curl command and response showing "Login successful. Welcome admin. Secret: ...root access token..."]

Then came the fix. The actual industry-standard solution isn't "sanitize the input" in some vague sense — it's parameterized queries, also called prepared statements. Instead of pasting the username and password into the query text, you pass them as separate bound parameters, using placeholder question marks in the query. The database compiles the query structure first, before it ever sees your input, so there's no parsing step left where quotes or comment markers could change what the query does. I rebuilt the app with this fix and re-ran the exact same exploit — it failed cleanly with a login error, while a real, legitimate login still worked perfectly.

[SCREEN: side-by-side of the vulnerable f-string line vs. the fixed parameterized-query line]

## Mistake/correction moment

The mistake worth remembering from today isn't really a mistake I made — it's one I almost walked someone else into. I initially explained the SQL injection bypass without accounting for operator precedence, and the correction came from working through a real table of data step by step: AND binds tighter than OR, so a naive OR-based payload against a two-condition WHERE clause can silently fail unless you also comment out the competing condition. If you're building SQL injection payloads yourself, don't just memorize `' OR '1'='1'` — understand that the comment marker afterward is often doing the real work, not the OR trick alone.

## Recap + quiz

Three big takeaways from today. One: Broken Access Control is the formal OWASP name for what happens when authentication succeeds but authorization — checking what a specific authenticated user is allowed to do — fails; IDOR is one specific flavor of it. Two: SQL injection happens when user input gets pasted directly into a query instead of being treated as pure data, and the fix is parameterized queries, which separate query structure from data at the database driver level so input can never be interpreted as code. Three: operator precedence in SQL is a real, exploitable gotcha — AND binds tighter than OR, so comment markers often do more of the actual work in a bypass payload than the boolean logic does.

Here are the three questions from the end of the session — pause and think through your own answers first. One: what's the difference between authentication and authorization, and which one did the access-control bug fail, versus which one would a "no login required at all" bug fail? Two: in your own words, why does `' OR '1'='1' --` work as a SQL injection payload — what are the two separate things that payload is doing to the query? Three: what is the actual fix for SQL injection, and why does it work at a mechanical level — what does the database do differently with it?

## Outro / CTA

The operational takeaway from today: never build a SQL query by concatenating user input into the query string — always use parameterized queries, so the database separates code from data at the structural level, not just through input filtering that a clever payload might slip past. That's SQL injection and Broken Access Control covered in the OWASP Top 10. Next up is likely Cross-Site Scripting or session attacks, continuing through Phase 4. If you're following along, subscribe for the next one, and drop your answers to those three quiz questions in the comments — I'll go over mine in the next video.

## On-screen text / b-roll suggestions

- Lower-third: "Day 13 — SQL Injection: Exploit, Precedence Trap, and the Real Fix"
- Text overlay during hook: "admin' --"
- Terminal screen recording: the vulnerable app's normal login, then the exploit attempts, then the final successful admin takeover
- Diagram: query grouped with parentheses showing (username='') OR ('1'='1' AND password='wrong') evaluating to false — the precedence trap
- Code comparison graphic: vulnerable f-string query vs. fixed parameterized query, side by side
- Callout graphic: "Authentication = who are you. Authorization = what are you allowed to do."
- Terminal recording: final re-verification showing the exploit now fails (401) while legitimate login still succeeds
- Closing text card: the three quiz questions, so viewers can pause and answer before the next video
