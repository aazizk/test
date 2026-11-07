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
  s.addText("Day 24", {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontFace: "Cambria", bold: true, fontSize: 40, color: ACCENT,
  });
  s.addText("CEH Checkpoint #3: Closing the Loop", {
    x: 0.5, y: 2.5, w: 9, h: 1.3,
    fontFace: "Cambria", bold: true, fontSize: 24, color: HEAD,
  });
  s.addText("Security Tutor — CEH Track, Phase 5 Checkpoint", {
    x: 0.5, y: 4.0, w: 9, h: 0.6,
    fontFace: "Courier New", fontSize: 14, color: BODY,
  });
}

// 2. Hook
{
  const s = newSlide();
  titleBar(s, "3 Checkpoints. Same Mistake.");
  codeBlock(s,
    "Checkpoint #1: nmap closed vs. filtered -- MISS\nCheckpoint #2: nmap closed vs. filtered -- MISS\nCheckpoint #3: nmap closed vs. filtered -- ...",
    { y: 1.6, h: 1.4 }
  );
  bullets(s, [
    "Today: the third attempt, and 3 other 2-week-old mistakes",
  ], { y: 3.3 });
}

// 3. What we'll cover
{
  const s = newSlide();
  titleBar(s, "What We'll Cover");
  bullets(s, [
    "Phase 5 recap: authN/authZ, privesc, credential attacks",
    "4 standing watch-items, re-tested with fresh scenarios",
    "2 older mistakes, re-tested and resolved",
    "Readiness read heading into Phase 5's final stretch",
  ]);
}

// 4. AuthN vs AuthZ
{
  const s = newSlide();
  titleBar(s, "Authentication vs. Authorization");
  bullets(s, [
    "Authentication: who are you (session cookie check)",
    "Authorization: what can you do (role/permission check)",
    "Scored clean, first try",
  ]);
}

// 5. Privilege escalation labeling
{
  const s = newSlide();
  titleBar(s, "Vertical vs. Horizontal Privesc");
  bullets(s, [
    "Vertical: tier change (cron job -> root)",
    "Horizontal: same tier, different target (user_id swap)",
    "Day 21 mislabeled this once -- retested with 2 fresh scenarios",
    "Both labeled correctly: one-off slip, not a pattern",
  ]);
}

// 6. Credential attacks
{
  const s = newSlide();
  titleBar(s, "Three Credential Attacks");
  bullets(s, [
    "Brute force / dictionary: many passwords, one username",
    "Credential stuffing: leaked pairs, reused elsewhere",
    "Password spraying: few passwords, many usernames",
    "Spraying evades per-username lockout by spreading thin",
  ]);
}

// 7. The nmap mistake, resolved
{
  const s = newSlide();
  titleBar(s, "Common Mistake: Closed vs. Filtered");
  codeBlock(s,
    "closed:   SYN sent -> RST received\n          \"I'm here, nobody's home.\"\n\nfiltered: SYN sent -> no response at all\n          \"something ate my packet.\"",
    { y: 1.5, h: 2.2 }
  );
  bullets(s, [
    "Missed 3x across 3 checkpoints -- finally resolved this session",
  ], { y: 4.0, h: 0.8 });
}

// 8. SameSite and concurrency
{
  const s = newSlide();
  titleBar(s, "Also Resolved This Session");
  bullets(s, [
    "SameSite=Lax: correct top-level-navigation reasoning, unprompted",
    "Concurrency model: single-threaded stacks delays, multi-threaded overlaps",
    "Clickjacking: invisible iframe over a decoy button",
    "Escaping vs. parameterized queries: structural fix, not just cleaner escaping",
  ], { fontSize: 18 });
}

// 9. Recap
{
  const s = newSlide();
  titleBar(s, "Recap");
  bullets(s, [
    "AuthN = who you are, AuthZ = what you can do",
    "Vertical = tier change, horizontal = same tier new target",
    "Spraying beats lockouts by spreading thin, not hammering one account",
  ]);
}

// 10. Quiz
{
  const s = newSlide();
  titleBar(s, "Quiz — Pause and Think");
  bullets(s, [
    "1. Why does a reset packet tell you more than a timeout does?",
    "2. Why is a parameterized query a structural fix, not just better escaping?",
    "3. Why is an SSO identity-provider breach worse than one app's password breach?",
  ], { h: 3.2, fontSize: 18 });
}

// 11. Closing / takeaway
{
  const s = newSlide();
  titleBar(s, "Operational Takeaway");
  s.addText(
    "Don't re-ask the same question to confirm a fix -- test the same concept with a brand-new scenario. That's the only way to tell memorized from understood.",
    {
      x: 0.6, y: 1.8, w: 8.8, h: 1.8,
      fontFace: "Cambria", bold: true, fontSize: 22, color: ACCENT,
      valign: "top",
    }
  );
  bullets(s, [
    "Next: SSO protocol mechanics (SAML/OAuth/OIDC) + hands-on privesc lab",
    "Follow along for Day 25",
  ], { y: 3.7, h: 1.2, fontSize: 16 });
}

// 12. About the Trainer
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
