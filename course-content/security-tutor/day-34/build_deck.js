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
  s.addText("Day 34", {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontFace: "Cambria", bold: true, fontSize: 40, color: ACCENT,
  });
  s.addText("CEH Checkpoint #4", {
    x: 0.5, y: 2.5, w: 9, h: 1.3,
    fontFace: "Cambria", bold: true, fontSize: 24, color: HEAD,
  });
  s.addText("Security Tutor — CEH Track, Quiz Session (Days 25-33)", {
    x: 0.5, y: 4.0, w: 9, h: 0.6,
    fontFace: "Courier New", fontSize: 14, color: BODY,
  });
}

// 2. Hook
{
  const s = newSlide();
  titleBar(s, "9/9 Core Questions. Best Run Yet.");
  codeBlock(s, "AAA * cron-privesc * shared responsibility\nIAM evaluation * SG exposure * PassRole+CreateFunction\nSIEM pipeline * alert triage * alert fatigue\n\nAll clean or lightly sharpened.", { h: 2.0, fontSize: 15 });
  bullets(s, [
    "But one old mistake came back for a second time...",
  ], { y: 3.9, h: 0.8, fontSize: 18 });
}

// 3. What we'll cover
{
  const s = newSlide();
  titleBar(s, "What We'll Cover");
  bullets(s, [
    "9 core questions spanning 9 different sessions",
    "A label that keeps slipping: IaaS vs PaaS vs SaaS",
    "A recurring miss: OAuth/OIDC token confusion, again",
    "Why 2 misses beats 10 correct answers as a signal",
  ]);
}

// 4. Core material held
{
  const s = newSlide();
  titleBar(s, "The Core Material Held Up");
  bullets(s, [
    "AAA, cron-privesc root cause, shared responsibility",
    "IAM explicit-deny evaluation, PassRole+CreateFunction",
    "SIEM pipeline stages, alert-fatigue tradeoffs",
    "SSH-vs-HTTP port exposure -- clean & unprompted, 3rd try",
  ], { fontSize: 17 });
}

// 5. The label that slips
{
  const s = newSlide();
  titleBar(s, "A Label That Keeps Slipping: S3");
  bullets(s, [
    "Classified S3 as \"PaaS\" -- wrong label",
    "S3 = fully managed, SaaS-like -- no platform to deploy onto",
    "True PaaS example: RDS -- a platform you still interact with",
    "Substance correct both times; only the 3-letter label slips",
  ], { fontSize: 17 });
}

// 6. The recurring miss
{
  const s = newSlide();
  titleBar(s, "The One That Mattered Most");
  codeBlock(s, "WRONG: Access token = \"one-time-use\"\nWRONG: ID token = \"full access to the service\"\n\n...backwards. Same swap as before.", { h: 1.8, fontSize: 16 });
  bullets(s, [
    "2nd genuine miss on the exact same concept",
  ], { y: 3.7, h: 0.8, fontSize: 18 });
}

// 7. Mistake/correction
{
  const s = newSlide();
  titleBar(s, "Common Mistake: Leading With the Secondary Signal");
  bullets(s, [
    "Asked: first question when triaging a suspicious API cluster?",
    "First answer: check if the source IP matches a known pattern",
    "Real answer: identity/provenance comes first, IP is corroboration",
    "3rd time this exact pattern has shown up, different topics",
  ], { fontSize: 16 });
}

// 8. One miss vs two misses
{
  const s = newSlide();
  titleBar(s, "One Miss Is Noise. Two Is Signal.");
  bullets(s, [
    "1 miss on a concept -- normal, light re-check next time",
    "2 genuine misses, same concept, weeks apart -- escalate",
    "Verbal correction clearly isn't enough by miss #2",
    "Needs a dedicated session, not another quiz question",
  ], { fontSize: 18 });
}

// 9. Recap
{
  const s = newSlide();
  titleBar(s, "Recap");
  bullets(s, [
    "Strongest core-material checkpoint of the series so far",
    "A concept surviving a NEW scenario unprompted = real mastery",
    "Labels can slip even when the substance is understood",
  ]);
}

// 10. Quiz
{
  const s = newSlide();
  titleBar(s, "Quiz — Pause and Think");
  bullets(s, [
    "1. What's the real test for a dangerous open port vs. just open?",
    "2. Why is \"PaaS\" the wrong label for S3?",
    "3. Which token would an API ever reject -- ID or access?",
  ], { h: 3.2, fontSize: 17 });
}

// 11. Closing / takeaway
{
  const s = newSlide();
  titleBar(s, "Operational Takeaway");
  s.addText(
    "Track not just right vs. wrong -- track whether this is the 1st, 2nd, or 3rd time you've missed it.",
    {
      x: 0.6, y: 1.8, w: 8.8, h: 1.8,
      fontFace: "Cambria", bold: true, fontSize: 22, color: ACCENT,
      valign: "top",
    }
  );
  bullets(s, [
    "Next: a full dedicated fix for the OAuth/OIDC token mix-up",
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
