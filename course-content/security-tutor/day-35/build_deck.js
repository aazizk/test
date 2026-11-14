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
    fontFace: "Cambria", bold: true, fontSize: 26, color: HEAD,
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
  s.addText("Day 35", {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontFace: "Cambria", bold: true, fontSize: 40, color: ACCENT,
  });
  s.addText("OAuth/OIDC: Fixing a Mistake I Kept Making", {
    x: 0.5, y: 2.5, w: 9, h: 1.3,
    fontFace: "Cambria", bold: true, fontSize: 24, color: HEAD,
  });
  s.addText("Security Tutor — CEH Track, Phase 5 Re-Teach", {
    x: 0.5, y: 4.0, w: 9, h: 0.6,
    fontFace: "Courier New", fontSize: 14, color: BODY,
  });
}

// 2. Hook
{
  const s = newSlide();
  titleBar(s, "Wrong Twice. Same Question.");
  codeBlock(s, "ID token: \"one-time-use\"? -- WRONG\nAccess token: \"full access to the service\"? -- WRONG\n\nBackwards. Both times. Weeks apart.", { h: 1.8, fontSize: 17 });
  bullets(s, [
    "Today: no new topic. Just fixing this for real.",
  ], { y: 3.7, h: 0.8, fontSize: 18 });
}

// 3. What we'll cover
{
  const s = newSlide();
  titleBar(s, "What We'll Cover");
  bullets(s, [
    "ID token vs. access token -- who reads what",
    "A real gap: session hijacking through a stolen ID token",
    "Where tokens can actually be intercepted",
    "Nonce vs. PKCE -- and PKCE's real limit",
  ]);
}

// 4. The TripPlanner scenario
{
  const s = newSlide();
  titleBar(s, "TripPlanner Signs In With Google");
  bullets(s, [
    "ID token -- addressed to the app, read once, proves identity",
    "Access token -- addressed to the Calendar API, reusable",
    "Test: \"which API would reject this token?\"",
    "Only makes sense for an access token",
  ], { fontSize: 18 });
}

// 5. The twist
{
  const s = newSlide();
  titleBar(s, "What If the Session Gets Hijacked?");
  bullets(s, [
    "Attacker steals ID token -> logs in as the user",
    "App still holds the real access token server-side",
    "App calls Calendar API for whoever is in the session",
    "Audience split stops direct API calls -- not session hijacking",
  ], { fontSize: 17 });
}

// 6. Where tokens can be stolen
{
  const s = newSlide();
  titleBar(s, "Authorization Code Flow: Tokens Never Hit the Browser");
  codeBlock(s, "Browser <--> Google:  short-lived auth code only\nApp server <--> Google: code exchanged for tokens\n\nReal risk: implicit flow (deprecated),\nor the auth code itself in transit", { h: 2.0, fontSize: 15 });
}

// 7. Nonce vs PKCE
{
  const s = newSlide();
  titleBar(s, "Nonce vs. PKCE");
  bullets(s, [
    "Nonce -- binds the ID token to this login attempt (app checks)",
    "PKCE -- binds the code exchange to the app that started it (Google checks)",
    "Different mechanisms, different moments in the flow",
  ], { fontSize: 18 });
}

// 8. Mistake/correction
{
  const s = newSlide();
  titleBar(s, "Common Mistake: \"Guarantee\" vs. \"Mitigation\"");
  bullets(s, [
    "Q: Does PKCE guarantee a stolen code can never be used?",
    "First answer: \"true, if attacker lacks the verifier\"",
    "Real answer: False -- a conditional defense isn't a guarantee",
    "Captured both code + verifier together? PKCE doesn't help",
  ], { fontSize: 16 });
}

// 9. The real lesson
{
  const s = newSlide();
  titleBar(s, "What PKCE Actually Stops");
  bullets(s, [
    "Stops: a different app stealing just the code",
    "Does not stop: full interception of code + verifier together",
    "That gap is closed by TLS, not PKCE",
  ], { fontSize: 18 });
}

// 10. Recap
{
  const s = newSlide();
  titleBar(s, "Recap");
  bullets(s, [
    "ID token = who (app, once). Access token = what-you-can-do (API, reusable)",
    "Token audience splits stop direct API abuse -- not session hijacking",
    "Every control has a boundary -- know exactly what's outside it",
  ]);
}

// 11. Quiz
{
  const s = newSlide();
  titleBar(s, "Quiz — Pause and Think");
  bullets(s, [
    "1. Who reads the ID token? Who reads the access token?",
    "2. What does a nonce protect against vs. PKCE?",
    "3. True/false: PKCE guarantees a stolen code can never be used.",
  ], { h: 3.2, fontSize: 17 });
}

// 12. Closing / takeaway
{
  const s = newSlide();
  titleBar(s, "Operational Takeaway");
  s.addText(
    "Don't ask \"is this secure\" -- ask what exactly this control stops, and what's just outside its boundary.",
    {
      x: 0.6, y: 1.8, w: 8.8, h: 1.8,
      fontFace: "Cambria", bold: true, fontSize: 22, color: ACCENT,
      valign: "top",
    }
  );
  bullets(s, [
    "Next: extend the detection-rule script, or begin Incident Response",
  ], { y: 3.7, h: 1.2, fontSize: 16 });
}

// 13. About the Trainer
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
