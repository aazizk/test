# Day 14 — Cross-Site Scripting: making the victim's own browser betray them

## LinkedIn

Today I navigated to a completely ordinary-looking URL and got a real JavaScript alert box to pop up in my own browser — not because anything was broken, but because the server took my input and printed it straight back into the page as executable code. That's Cross-Site Scripting, and I built it, exploited it twice, and fixed it for real.

Hands-on lab (Flask, no Docker needed for this one): two vulnerable routes, both using Jinja2's `|safe` filter to explicitly skip auto-escaping. `/search?q=<script>alert('XSS')</script>` fired a reflected alert immediately. Submitting the same payload into a guestbook field fired it again — and then kept firing on every future page load, including from a completely fresh incognito window with zero prior session. That's the real difference between reflected XSS (one click, one victim, needs social engineering) and stored XSS (submit once, attack everyone, indefinitely).

The fix: remove `|safe`, let Flask's default auto-escaping convert `<` and `>` into harmless entities before they ever reach the browser's HTML parser. Re-ran both exploits — the script tag printed as literal text, no execution.

Good correction moment: I conflated this with yesterday's SQL injection fix, but they're genuinely different mechanisms sharing one goal. Parameterized queries separate data from query structure entirely (out-of-band). HTML escaping still embeds the data in the document, just encodes the dangerous characters so they can't be parsed as markup (in-band). Same goal, different mechanism — and `HttpOnly` (from Day 7) only hides the cookie from JavaScript, it doesn't fix the underlying XSS hole at all.

#CyberSecurity #XSS #AppSec #CEH #LearningInPublic #WebSecurity

## Twitter/X

Got a real alert() box to fire in my own browser today — not a bug, just unescaped user input rendered straight into the page. Built reflected AND stored XSS in a real Flask lab, then fixed both by removing one `|safe` filter. 🔓

#XSS #CyberSecurity #CEH
