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
  s.addText("Day 30", {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontFace: "Cambria", bold: true, fontSize: 40, color: ACCENT,
  });
  s.addText("IAM Privilege Escalation: PassRole + CreateFunction", {
    x: 0.5, y: 2.5, w: 9, h: 1.3,
    fontFace: "Cambria", bold: true, fontSize: 24, color: HEAD,
  });
  s.addText("Security Tutor — CEH Track, Phase 6: Cloud Security", {
    x: 0.5, y: 4.0, w: 9, h: 0.6,
    fontFace: "Courier New", fontSize: 14, color: BODY,
  });
}

// 2. Hook
{
  const s = newSlide();
  titleBar(s, "Two Permissions. Zero Admin. Full Secret Access.");
  codeBlock(s, "User has ONLY:\n  iam:PassRole\n  lambda:CreateFunction\n\nNo Secrets Manager. No KMS. No admin.", { h: 2.2, fontSize: 16 });
  bullets(s, [
    "Still reads a KMS-protected secret. Here's how.",
  ], { y: 4.0, h: 0.8, fontSize: 18 });
}

// 3. What we'll cover
{
  const s = newSlide();
  titleBar(s, "What We'll Cover");
  bullets(s, [
    "Why PassRole is dangerous only in combination",
    "Trust policy vs. PassRole -- two separate gates",
    "Proving the chain against a real AWS role",
    "A resource-type mismatch that looked like a fail",
  ]);
}

// 4. PassRole mechanics
{
  const s = newSlide();
  titleBar(s, "PassRole: Harmless Alone, Dangerous Paired");
  bullets(s, [
    "PassRole: hand a role to a service -- doesn't grant it to you",
    "+ CreateFunction: create something that assumes that role",
    "Function runs with the role's permissions, not the user's",
    "No new admin user, no wildcard policy needed",
  ], { fontSize: 17 });
}

// 5. Trust policy gate
{
  const s = newSlide();
  titleBar(s, "Two Gates, Both Required");
  bullets(s, [
    "Permissions policy: what the role can DO",
    "Trust policy: WHO can assume the role",
    "PassRole doesn't override the trust policy",
    "Service must already be a trusted principal",
  ], { fontSize: 17 });
}

// 6. Real role found
{
  const s = newSlide();
  titleBar(s, "Finding a Real Target Role");
  codeBlock(s, "kafka-tls-testing-role-l6yt6b49\n\nkms:Decrypt, kms:GenerateDataKey -> 1 key\nsecretsmanager:GetSecretValue -> 1 secret\n\n(narrowly scoped -- not wildcarded)", { h: 2.4, fontSize: 15 });
}

// 7. Proving the chain
{
  const s = newSlide();
  titleBar(s, "Proving It: simulate-custom-policy");
  codeBlock(s, "secretsmanager:GetSecretValue -> implicitDeny\niam:PassRole (on this role)    -> allowed\nlambda:CreateFunction          -> allowed", { h: 2.0, fontSize: 16 });
  bullets(s, [
    "Denied directly. Allowed indirectly via the role.",
  ], { y: 3.9, h: 0.8, fontSize: 16 });
}

// 8. Mistake/correction
{
  const s = newSlide();
  titleBar(s, "Common Mistake: Wrong Resource Type");
  bullets(s, [
    "First CreateFunction test: implicitDeny -- looked like a fail",
    "Real cause: Resource scoped to role ARN, not function ARN",
    "Not about the role's permissions -- about the TEST policy",
    "Fixed: separate statement, Resource scoped to function/\"*\"",
  ], { fontSize: 16 });
}

// 9. Recap
{
  const s = newSlide();
  titleBar(s, "Recap");
  bullets(s, [
    "PassRole is dangerous only next to a role-assuming create action",
    "Trust policy + PassRole -- both gates must be open",
    "Narrow role scoping limits blast radius, doesn't prevent the path",
  ]);
}

// 10. Quiz
{
  const s = newSlide();
  titleBar(s, "Quiz — Pause and Think");
  bullets(s, [
    "1. Which single permission would you restrict to close this path?",
    "2. Denied in a simulation -- real block, or resource-type mismatch?",
    "3. Does narrow KMS/secret scoping prevent this escalation?",
  ], { h: 3.2, fontSize: 17 });
}

// 11. Closing / takeaway
{
  const s = newSlide();
  titleBar(s, "Operational Takeaway");
  s.addText(
    "Never audit iam:PassRole alone -- check what it's sitting next to.",
    {
      x: 0.6, y: 1.8, w: 8.8, h: 1.8,
      fontFace: "Cambria", bold: true, fontSize: 22, color: ACCENT,
      valign: "top",
    }
  );
  bullets(s, [
    "Phase 6 nears completion: cloud misconfigurations + IAM escalation",
    "Next: Phase 6 wrap-up, then Phase 7 -- Detection",
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
