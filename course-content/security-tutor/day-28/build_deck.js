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
  s.addText("Day 28", {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontFace: "Cambria", bold: true, fontSize: 40, color: ACCENT,
  });
  s.addText("AWS IAM: Users, Roles, and Policy Evaluation Logic", {
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
  titleBar(s, "One Policy. Full Account Compromise.");
  codeBlock(s, '{\n  "Effect": "Allow",\n  "Action": "*",\n  "Resource": "*"\n}', { h: 1.8 });
  bullets(s, [
    "Four lines. Delete buckets, create admin users, kill EC2 instances.",
  ], { y: 3.7, h: 1.2, fontSize: 18 });
}

// 3. What we'll cover
{
  const s = newSlide();
  titleBar(s, "What We'll Cover");
  bullets(s, [
    "IAM users vs. roles",
    "Policy structure and least privilege",
    "AWS's Allow/Deny evaluation logic",
    "Proving it live with the policy simulator",
  ]);
}

// 4. Users vs Roles
{
  const s = newSlide();
  titleBar(s, "Users vs. Roles");
  bullets(s, [
    "User: persistent identity, long-lived keys -- don't expire on their own",
    "Role: temporary identity, assumed -- short-lived credentials (~1 hr)",
    "A leaked user key stays valid until someone finds it",
    "A compromised role's credentials expire on their own",
  ], { fontSize: 18 });
}

// 5. Policy structure
{
  const s = newSlide();
  titleBar(s, "Anatomy of a Policy");
  codeBlock(s, '{\n  "Effect": "Allow",\n  "Action": "s3:GetObject",\n  "Resource": "arn:aws:s3:::my-bucket/*"\n}', { h: 2.0 });
  bullets(s, [
    "Least privilege: grant exactly what's needed, nothing more",
  ], { y: 3.8, h: 1.0, fontSize: 18 });
}

// 6. Evaluation logic
{
  const s = newSlide();
  titleBar(s, "How AWS Decides: Allow or Deny");
  bullets(s, [
    "1. Default is implicit deny",
    "2. An explicit Allow opens access",
    "3. An explicit Deny always wins -- no exceptions",
    "SCPs set a ceiling -- they never grant, only restrict",
  ], { fontSize: 18 });
}

// 7. Simulating the overbroad policy
{
  const s = newSlide();
  titleBar(s, "Proving It: Overbroad Policy");
  codeBlock(s, "$ aws iam simulate-custom-policy ...\n  --action-names s3:DeleteBucket iam:CreateUser \\\n                 ec2:TerminateInstances\n\nAll three: \"EvalDecision\": \"allowed\"", { h: 2.4, fontSize: 14 });
  bullets(s, [
    "Real AWS evaluation engine, zero resources touched",
  ], { y: 4.2, h: 0.8, fontSize: 16 });
}

// 8. Simulating least privilege
{
  const s = newSlide();
  titleBar(s, "Proving It: Least Privilege");
  codeBlock(s, '{\n  "Action": "s3:GetObject",\n  "Resource": "arn:aws:s3:::app-data-bucket/*"\n}\n\nGetObject: allowed -- everything else: implicitDeny', { h: 2.6, fontSize: 14 });
  bullets(s, [
    "Predicted first, then confirmed exactly",
  ], { y: 4.4, h: 0.6, fontSize: 16 });
}

// 9. Mistake/correction -- file:// bug
{
  const s = newSlide();
  titleBar(s, "Common Mistake: Trusting the Error Message");
  codeBlock(s, "InvalidInput: Policy input list item 1\nhas invalid content", { h: 1.3, fontSize: 15 });
  bullets(s, [
    "JSON was valid (confirmed with json.tool) -- but file:// still failed",
    "Fix: pass the policy as an inline JSON string instead",
    "Lesson: isolate variables one at a time, don't assume your data is wrong",
  ], { y: 3.1, h: 1.8, fontSize: 16 });
}

// 10. Recap
{
  const s = newSlide();
  titleBar(s, "Recap");
  bullets(s, [
    "Roles beat long-lived user keys for anything automated",
    "A policy is Effect + Action + Resource -- scope all three tightly",
    "Implicit deny by default; explicit deny always wins",
  ]);
}

// 11. Quiz
{
  const s = newSlide();
  titleBar(s, "Quiz — Pause and Think");
  bullets(s, [
    "1. Identity policy allows s3:*, bucket policy denies it -- what wins?",
    "2. Why is a role lower-risk than a user with long-lived keys?",
    "3. Why simulate a policy instead of creating a real IAM user to test it?",
  ], { h: 3.2, fontSize: 18 });
}

// 12. Closing / takeaway
{
  const s = newSlide();
  titleBar(s, "Operational Takeaway");
  s.addText(
    "Simulate any policy against your highest-risk actions before you attach it -- not after.",
    {
      x: 0.6, y: 1.8, w: 8.8, h: 1.8,
      fontFace: "Cambria", bold: true, fontSize: 22, color: ACCENT,
      valign: "top",
    }
  );
  bullets(s, [
    "Phase 6 continues: Cloud Security -- IAM and policy evaluation",
    "Next: cloud misconfigurations beyond S3 and IAM basics",
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
