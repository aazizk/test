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
  s.addText("Day 23", {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontFace: "Cambria", bold: true, fontSize: 40, color: ACCENT,
  });
  s.addText("Password Spraying: How Attackers Beat Lockout Policies", {
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
  titleBar(s, "2 Accounts. Under 1 Second.");
  codeBlock(s,
    "bob:Summer2024!  -> 200 LOGIN OK\nerin:Summer2024! -> 200 LOGIN OK",
    { y: 1.6, h: 1.2 }
  );
  bullets(s, [
    "Target already had exponential-backoff lockout",
    "Same defense beat a dictionary attack last session",
    "This time: zero delay, zero lockout triggered",
  ], { y: 3.0 });
}

// 3. What we'll cover
{
  const s = newSlide();
  titleBar(s, "What We'll Cover");
  bullets(s, [
    "Brute force vs. password spraying",
    "Why per-username backoff is structurally blind to spraying",
    "Building and exploiting a 10-account target (Docker)",
    "The real fix: per-IP throttling, and its limits",
  ]);
}

// 4. Brute force vs spraying
{
  const s = newSlide();
  titleBar(s, "Brute Force vs. Spraying");
  bullets(s, [
    "Brute force: many passwords -> one username",
    "Spraying: one or two passwords -> many usernames",
    "Each sprayed account sees only 1 failed attempt",
    "Looks identical to an ordinary typo — never crosses any threshold",
  ], { h: 3.0 });
}

// 5. The lab setup
{
  const s = newSlide();
  titleBar(s, "The Lab: 10 Accounts, 2 Weak");
  bullets(s, [
    "10-user Flask login; most passwords strong + unique",
    "bob & erin both reuse 'Summer2024!' — realistic breach pattern",
    "Same per-username exponential backoff from Day 22",
    "Attacker sprays 3 common passwords x 10 usernames",
  ], { h: 3.0 });
}

// 6. The undefended attack
{
  const s = newSlide();
  titleBar(s, "Undefended: Instant Compromise");
  codeBlock(s,
    "--- Round: trying 'Summer2024!' ---\n" +
    "alice -> 401   bob -> 200 LOGIN OK\n" +
    "carol -> 401   dave -> 401\n" +
    "erin -> 200 LOGIN OK   ...\n\n" +
    "2 account(s) compromised",
    { h: 2.6 }
  );
  bullets(s, ["Per-username counter never saw a 2nd failure on bob or erin"], { y: 4.3, h: 0.6, fontSize: 16 });
}

// 7. Measuring the blind spot
{
  const s = newSlide();
  titleBar(s, "Measuring the Blind Spot");
  codeBlock(s,
    "Predicted: 8 accounts x (1s + 2s) = 24s total friction\n" +
    "$ time docker run ... credspray-attacker\n" +
    "real    0m26.690s",
    { h: 1.8 }
  );
  bullets(s, [
    "Math matched almost exactly (overhead = network/Docker)",
    "But the delay landed on accounts that were never at risk",
  ], { y: 3.6, h: 1.2, fontSize: 16 });
}

// 8. The real fix
{
  const s = newSlide();
  titleBar(s, "The Fix: Key by Source, Not Target");
  bullets(s, [
    "failed_attempts[username] -> failed_attempts_by_ip[source_ip]",
    "One structural change, same exponential math",
    "Nearly every request after the 1st now carries prior failures",
    "Est. full spray: <1s -> ~5-6 minutes (capped at 16s/request)",
  ], { h: 3.2 });
}

// 9. Common mistake
{
  const s = newSlide();
  titleBar(s, "Common Mistake: Uncapped Extrapolation");
  bullets(s, [
    "Wrong first instinct: delay could reach ~2^18 seconds",
    "Missed the code's explicit 16-second cap (MAX_DELAY_SECONDS)",
    "Real-world lesson: always check for a coded ceiling",
    "before extrapolating exponential growth outward",
  ], { h: 3.2 });
}

// 10. Limits of the fix
{
  const s = newSlide();
  titleBar(s, "Limits of Per-IP Throttling");
  bullets(s, [
    "Corporate NAT: many real users share one IP — false positives",
    "Well-resourced attacker: botnet / proxy pool spreads requests thin",
    "Real systems layer IP + account + device + global rate, not one signal",
  ], { h: 3.0 });
}

// 11. Recap
{
  const s = newSlide();
  titleBar(s, "Recap");
  bullets(s, [
    "Per-username defenses stop brute force, miss spraying entirely",
    "Keying by source IP closes the gap — with real NAT/botnet tradeoffs",
    "Capped exponential backoff: still a massive practical win",
  ]);
}

// 12. Quiz
{
  const s = newSlide();
  titleBar(s, "Quiz — Pause and Think");
  bullets(s, [
    "1. Why does brute-force vs. spraying determine which key (username/IP) catches it?",
    "2. How would an attacker route around pure per-IP throttling at scale?",
    "3. No cap, 40 failures: how does that compare to outright rejecting the request?",
  ], { h: 3.2, fontSize: 18 });
}

// 13. Closing / takeaway
{
  const s = newSlide();
  titleBar(s, "Operational Takeaway");
  s.addText(
    "A rate-limiting defense is only as good as the key it tracks — always ask what the attacker controls before deciding what to throttle by.",
    {
      x: 0.6, y: 1.8, w: 8.8, h: 1.8,
      fontFace: "Cambria", bold: true, fontSize: 22, color: ACCENT,
      valign: "top",
    }
  );
  bullets(s, [
    "Next: CEH Checkpoint #3, then MFA/SSO mechanics (SAML/OAuth/OIDC)",
    "Follow along for Day 24",
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
