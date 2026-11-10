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
    fontFace: "Cambria", bold: true, fontSize: 28, color: HEAD,
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
  s.addText("Day 27", {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontFace: "Cambria", bold: true, fontSize: 40, color: ACCENT,
  });
  s.addText("Shared Responsibility Model — A Real S3 Misconfiguration Lab", {
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
  titleBar(s, "I Tried to Make a Bucket Public. AWS Said No.");
  bullets(s, [
    "The command was textbook-correct for public exposure",
    "AWS denied it anyway -- on purpose, by design",
    "Figuring out why is today's whole lesson",
  ], { y: 1.8 });
}

// 3. What we'll cover
{
  const s = newSlide();
  titleBar(s, "What We'll Cover");
  bullets(s, [
    "The shared responsibility model (IaaS / PaaS / SaaS)",
    "Attempting a real public-S3-bucket misconfiguration",
    "Bucket-level vs. account-level guardrails",
    "Auditing for exposure instead of causing it",
  ]);
}

// 4. Shared responsibility table
{
  const s = newSlide();
  titleBar(s, "Shared Responsibility Model");
  bullets(s, [
    "IaaS (e.g. EC2): AWS -- hardware, hypervisor. You -- OS, patches, firewall, data",
    "PaaS (e.g. RDS): AWS also covers OS + engine patching. You -- config, access, data",
    "SaaS (e.g. Gmail): AWS covers nearly everything. You -- data + user access",
    "Most real breaches sit on the CUSTOMER side of this line",
  ], { fontSize: 18 });
}

// 5. Default secure state
{
  const s = newSlide();
  titleBar(s, "Step 1: Confirm the Default Is Private");
  codeBlock(s, "$ aws s3api get-public-access-block --bucket ...\n{\n  \"BlockPublicAcls\": true,\n  \"IgnorePublicAcls\": true,\n  \"BlockPublicPolicy\": true,\n  \"RestrictPublicBuckets\": true\n}", { h: 2.8 });
}

// 6. Attempting the misconfiguration
{
  const s = newSlide();
  titleBar(s, "Weaponizing a Bucket Policy");
  codeBlock(s, '{\n  "Effect": "Allow",\n  "Principal": "*",\n  "Action": "s3:GetObject",\n  "Resource": "arn:aws:s3:::my-bucket/*"\n}', { h: 2.2 });
  bullets(s, [
    "Principal \"*\" + GetObject = anyone, no login, can download everything",
    "The exact pattern behind nearly every leaked-bucket headline",
  ], { y: 3.9, h: 1.4, fontSize: 16 });
}

// 7. Denied
{
  const s = newSlide();
  titleBar(s, "Denied -- By Design");
  codeBlock(s, "AccessDenied: public policies are prevented by the\nBlockPublicPolicy setting in S3 Block Public Access.", { h: 1.6, fontSize: 16 });
  bullets(s, [
    "Bucket-level Block Public Access was already disabled",
    "Something else was still stopping it...",
  ], { y: 3.3, h: 1.4, fontSize: 18 });
}

// 8. Account-level guardrail
{
  const s = newSlide();
  titleBar(s, "Two Layers of Block Public Access");
  codeBlock(s, "$ aws s3control get-public-access-block --account-id ...\n{ all four flags: true }", { h: 1.6, fontSize: 16 });
  bullets(s, [
    "Account-level setting overrides bucket-level",
    "Org admin locked it down -- defense-in-depth, working as intended",
  ], { y: 3.3, h: 1.4, fontSize: 18 });
}

// 9. Mistake/correction -- S3 classification
{
  const s = newSlide();
  titleBar(s, "Common Mistake: Is S3 \"IaaS\"?");
  bullets(s, [
    "Wrong: \"S3 is IaaS, so AWS manages infrastructure\"",
    "Right: S3 is a fully managed service -- no customer-visible OS at all",
    "EC2 = true IaaS (you manage the guest OS). S3 is not.",
    "Bucket config/data ownership is customer's job either way",
  ]);
}

// 10. Auditing instead
{
  const s = newSlide();
  titleBar(s, "Auditing for Exposure at Scale");
  codeBlock(s, "$ aws s3api get-bucket-policy-status --bucket eks.cur\n{ \"PolicyStatus\": { \"IsPublic\": false } }", { h: 1.6, fontSize: 16 });
  bullets(s, [
    "One field, computed from ACL + policy + bucket BPA + account BPA",
    "This is what Access Analyzer / Trusted Advisor automate at scale",
  ], { y: 3.3, h: 1.4, fontSize: 18 });
}

// 11. Recap
{
  const s = newSlide();
  titleBar(s, "Recap");
  bullets(s, [
    "Responsibility split shifts across IaaS / PaaS / SaaS",
    "Most cloud breaches are misconfigurations, not AWS failures",
    "Check guardrails at every layer before trusting a result",
  ]);
}

// 12. Quiz
{
  const s = newSlide();
  titleBar(s, "Quiz — Pause and Think");
  bullets(s, [
    "1. Who patches S3's own infrastructure -- and is that different from bucket config?",
    "2. Bucket-level vs. account-level BPA conflict -- which wins, and why?",
    "3. Auditing 500 buckets: raw policy JSON, or get-bucket-policy-status? Why?",
  ], { h: 3.2, fontSize: 18 });
}

// 13. Closing / takeaway
{
  const s = newSlide();
  titleBar(s, "Operational Takeaway");
  s.addText(
    "Check for guardrails at multiple layers -- resource AND account -- before trusting a result.",
    {
      x: 0.6, y: 1.8, w: 8.8, h: 1.8,
      fontFace: "Cambria", bold: true, fontSize: 22, color: ACCENT,
      valign: "top",
    }
  );
  bullets(s, [
    "Phase 6 started: Cloud Security -- shared responsibility model",
    "Next: IAM in the Cloud",
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
