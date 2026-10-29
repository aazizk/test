const pptxgen = require("pptxgenjs");
const path = require("path");

const LOGO = "/home/claudeuser/repos/test/pictures/BrainsWork_Logo_Square_1000_1000-150x150.jpg";
const PHOTO = "/home/claudeuser/repos/test/pictures/Abdul_Aziz_Khan.JPG";

const BG = "14181F";
const ACCENT = "2FDD95";
const HEAD = "F2F2F2";
const BODY = "9AA3AE";

const pptx = new pptxgen();
pptx.defineLayout({ name: "WIDE", width: 10, height: 5.625 });
pptx.layout = "WIDE";

function addLogo(slide) {
  slide.addImage({ path: LOGO, x: 10 - 0.6 - 0.15, y: 5.625 - 0.6 - 0.15, w: 0.6, h: 0.6 });
}

function newSlide() {
  const s = pptx.addSlide();
  s.background = { color: BG };
  addLogo(s);
  return s;
}

function titleBar(slide, text) {
  slide.addText(text, {
    x: 0.5, y: 0.35, w: 9, h: 0.9,
    fontFace: "Cambria", bold: true, fontSize: 30, color: HEAD,
  });
}

function bullets(slide, items, opts = {}) {
  slide.addText(
    items.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })),
    {
      x: 0.6, y: opts.y || 1.5, w: 8.8, h: opts.h || 3.5,
      fontFace: "Calibri", fontSize: opts.fontSize || 20, color: BODY,
      valign: "top", lineSpacingMultiple: 1.3,
    }
  );
}

function codeBlock(slide, text, opts = {}) {
  slide.addText(text, {
    x: 0.6, y: opts.y || 1.6, w: 8.8, h: opts.h || 2.8,
    fontFace: "Courier New", fontSize: opts.fontSize || 15, color: ACCENT,
    fill: { color: "1D232C" }, valign: "top", align: "left",
    margin: 10,
  });
}

// 1. Title
{
  const s = newSlide();
  s.addText("Day 22", {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontFace: "Cambria", bold: true, fontSize: 40, color: ACCENT,
  });
  s.addText("Dictionary Attacks, Exponential Backoff, and the Password Spraying Blind Spot", {
    x: 0.5, y: 2.5, w: 9, h: 1.3,
    fontFace: "Cambria", bold: true, fontSize: 24, color: HEAD,
  });
  s.addText("Security Tutor — CEH Track, Phase 5: Identity & Access Management", {
    x: 0.5, y: 4.0, w: 9, h: 0.6,
    fontFace: "Courier New", fontSize: 14, color: BODY,
  });
}

// 2. Hook
{
  const s = newSlide();
  titleBar(s, "6 Guesses. Under 1 Second.");
  codeBlock(s,
    "[6] trying 'Summer2024!' -> 200 LOGIN OK\n[+] SUCCESS: admin:Summer2024!",
    { y: 1.6, h: 1.2 }
  );
  bullets(s, [
    "Password had upper + lower + digit + symbol",
    "Still fell to a 10-word dictionary attack",
    "Complexity rules don't stop pattern-based guessing",
  ], { y: 3.0 });
}

// 3. What we'll cover
{
  const s = newSlide();
  titleBar(s, "What We'll Cover");
  bullets(s, [
    "Online vs. offline credential attacks",
    "Building and breaking a real login form (Docker)",
    "Exponential backoff as a defense",
    "The password spraying blind spot",
  ]);
}

// 4. Online vs offline
{
  const s = newSlide();
  titleBar(s, "Online vs. Offline Attacks");
  bullets(s, [
    "Online: guesses sent live to the server — rate-limitable",
    "Offline: attacker already has the hash, cracks locally — not rate-limitable",
    "Offline defense: strong password + slow hash (bcrypt/scrypt/argon2)",
    "Today's lab: online dictionary attack",
  ]);
}

// 5. The lab setup
{
  const s = newSlide();
  titleBar(s, "The Lab: Target + Attacker Containers");
  bullets(s, [
    "Flask login, hardcoded admin:Summer2024!",
    "Docker network created with --internal (no internet route)",
    "Attacker container resolves target by container name (Docker DNS)",
    "Dictionary script POSTs each candidate password to /login",
  ], { h: 3.0 });
}

// 6. The undefended attack
{
  const s = newSlide();
  titleBar(s, "Undefended: Instant Compromise");
  codeBlock(s,
    "[1] trying 'password'   -> 401 LOGIN FAILED\n" +
    "[2] trying '123456'     -> 401 LOGIN FAILED\n" +
    "[3] trying 'admin'      -> 401 LOGIN FAILED\n" +
    "[4] trying 'letmein'    -> 401 LOGIN FAILED\n" +
    "[5] trying 'qwerty'     -> 401 LOGIN FAILED\n" +
    "[6] trying 'Summer2024!' -> 200 LOGIN OK",
    { h: 2.4 }
  );
  bullets(s, ["Total elapsed time: well under 1 second"], { y: 4.1, h: 0.6, fontSize: 16 });
}

// 7. Exponential backoff
{
  const s = newSlide();
  titleBar(s, "The Fix: Exponential Backoff");
  bullets(s, [
    "Per-username failure counter",
    "Delay before next response = 2^(failures-1) seconds",
    "1s, 2s, 4s, 8s, 16s... capped",
    "Beats hard lockout: no denial-of-service on real users",
  ], { h: 3.0 });
}

// 8. Backoff re-test
{
  const s = newSlide();
  titleBar(s, "Re-Test: Same Attack, Timed");
  codeBlock(s,
    "$ time docker run --rm --network credattack-net credattack-attacker\n" +
    "...\n" +
    "[+] SUCCESS: admin:Summer2024!\n\n" +
    "real    0m31.725s",
    { h: 2.2 }
  );
  bullets(s, [
    "Matches predicted 1+2+4+8+16 = 31s cumulative delay",
    "10-word list: instant -> 31.7s. 10,000-word list: hours.",
  ], { y: 3.9, h: 1.2, fontSize: 16 });
}

// 9. Common mistake
{
  const s = newSlide();
  titleBar(s, "Common Mistake: What Bypasses Backoff?");
  bullets(s, [
    "Wrong first instinct: \"rotate source IPs\"",
    "Backoff tracks usernames, not IPs — rotating IPs changes nothing",
    "Real bypass: password spraying — 1 password, many usernames",
    "Each username only ever sees a single attempt — never triggers the counter",
  ], { h: 3.2 });
}

// 10. Concurrency mistake
{
  const s = newSlide();
  titleBar(s, "Second Mistake: Sleep vs. Reject");
  bullets(s, [
    "time.sleep() delays one request at a time — if the server is single-threaded",
    "A multi-threaded/multi-worker server runs delays in parallel, not stacked",
    "50 concurrent guesses can finish in ~16s, not 50x16s",
    "Production systems reject over threshold instead of sleeping",
  ], { h: 3.2 });
}

// 11. Recap
{
  const s = newSlide();
  titleBar(s, "Recap");
  bullets(s, [
    "Online attacks are throttle-able; offline attacks need strong passwords + slow hashing",
    "Exponential backoff beats hard lockout — no self-inflicted DoS",
    "Per-account defenses are blind to password spraying",
  ]);
}

// 12. Quiz
{
  const s = newSlide();
  titleBar(s, "Quiz — Pause and Think");
  bullets(s, [
    "1. Online vs. offline attacks: why does the difference matter for defenses?",
    "2. What's the weakness of a sleep-based delay vs. outright rejection?",
    "3. What log signal would flag password spraying, even with no single account over threshold?",
  ], { h: 3.2, fontSize: 18 });
}

// 13. Closing / takeaway
{
  const s = newSlide();
  titleBar(s, "Operational Takeaway");
  s.addText(
    "A defense that only watches one account at a time will always miss an attacker who spreads guesses thin across many.",
    {
      x: 0.6, y: 1.8, w: 8.8, h: 1.8,
      fontFace: "Cambria", bold: true, fontSize: 22, color: ACCENT,
      valign: "top",
    }
  );
  bullets(s, [
    "Next: password-spraying hands-on lab, or MFA/SSO protocol mechanics",
    "Follow along for Day 23",
  ], { y: 3.7, h: 1.2, fontSize: 16 });
}

// 14. About the Trainer
{
  const s = newSlide();
  s.addImage({ path: PHOTO, x: 6.6, y: 0.8, w: 2.4, h: 3.2 });
  s.addText("Abdul Aziz Khan", {
    x: 0.6, y: 0.9, w: 5.8, h: 0.6,
    fontFace: "Cambria", bold: true, fontSize: 26, color: HEAD,
  });
  s.addText("Trainer, BrainsWork", {
    x: 0.6, y: 1.45, w: 5.8, h: 0.4,
    fontFace: "Calibri", fontSize: 16, color: ACCENT,
  });
  s.addText(
    "Abdul Aziz Khan is a seasoned Telecom and IT professional, currently working as a DevOps engineer for a Fortune 500 financial company. A long-time practitioner turned teacher, he built this course to make security concepts concrete through real, hands-on labs rather than slides alone. Open, candid, and always glad to talk shop.",
    {
      x: 0.6, y: 2.0, w: 5.8, h: 2.2,
      fontFace: "Calibri", fontSize: 14, color: BODY, valign: "top", lineSpacingMultiple: 1.25,
    }
  );
  s.addText("khan.abdulaziz@gmail.com   |   linkedin.com/in/abdulazizk", {
    x: 0.6, y: 4.6, w: 5.8, h: 0.5,
    fontFace: "Courier New", fontSize: 13, color: BODY,
  });
}

pptx.writeFile({ fileName: path.join(__dirname, "presentation.pptx") }).then(() => {
  console.log("done");
});
