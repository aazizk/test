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
  s.addText("Day 29", {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontFace: "Cambria", bold: true, fontSize: 40, color: ACCENT,
  });
  s.addText("Cloud Misconfigurations: Security Groups & Exposed Secrets", {
    x: 0.5, y: 2.5, w: 9, h: 1.3,
    fontFace: "Cambria", bold: true, fontSize: 22, color: HEAD,
  });
  s.addText("Security Tutor — CEH Track, Phase 6: Cloud Security", {
    x: 0.5, y: 4.0, w: 9, h: 0.6,
    fontFace: "Courier New", fontSize: 14, color: BODY,
  });
}

// 2. Hook
{
  const s = newSlide();
  titleBar(s, "8,101 Security Groups. Zero Trusted Blindly.");
  codeBlock(s, "$ aws ec2 describe-security-groups ... \\\n  | jq 'length'\n\n8101", { h: 1.8, fontSize: 18 });
  bullets(s, [
    "A clean scan result is either a real win -- or a silent bug.",
  ], { y: 3.7, h: 1.0, fontSize: 18 });
}

// 3. What we'll cover
{
  const s = newSlide();
  titleBar(s, "What We'll Cover");
  bullets(s, [
    "Why 0.0.0.0/0 on port 22 isn't like port 80",
    "Auditing a real AWS account's security groups",
    "Why env variables don't actually secure a secret",
    "How automatic secret rotation really works",
  ]);
}

// 4. SSH vs HTTP
{
  const s = newSlide();
  titleBar(s, "Port 22 vs. Port 80: Not the Same Risk");
  bullets(s, [
    "Port 80/443: designed to be public -- that's its job",
    "Port 22/3389: an admin-only access path, not a public service",
    "Web compromise -> app-level foothold, bounded by the app",
    "SSH compromise -> full OS-level shell on the host",
  ], { fontSize: 17 });
}

// 5. SSM: the zero-open-port model
{
  const s = newSlide();
  titleBar(s, "Real-World Pattern: SSM Instead of SSH");
  bullets(s, [
    "Managed node makes an outbound connection to AWS",
    "No inbound port listening -- nothing to brute-force at all",
    "Stronger than \"restrict SSH to trusted IPs\"",
    "Same tool works for Windows RDP sessions too -- OS-agnostic",
  ], { fontSize: 17 });
}

// 6. Auditing 8,101 security groups
{
  const s = newSlide();
  titleBar(s, "Auditing the Real Account");
  codeBlock(s, "jq filter: 0.0.0.0/0 on 22/3389/3306/5432/1433\n  -> 0 results\n\njq filter: 0.0.0.0/0 on ANY port\n  -> 0 results\n\ngrep -c '0.0.0.0/0' sg-audit.json\n  -> 0", { h: 2.8, fontSize: 14 });
  bullets(s, [
    "Two structurally different tools agree: genuinely clean",
  ], { y: 4.5, h: 0.6, fontSize: 16 });
}

// 7. Env var isn't a secrets manager
{
  const s = newSlide();
  titleBar(s, "\"I Moved It to an Env Variable\" -- Not Secure");
  bullets(s, [
    "Still plaintext-readable by anyone with config access",
    "Often a BIGGER audience than original repo access",
    "Secrets Manager: scoped IAM access, not general read",
    "Every retrieval logged; rotation happens automatically",
  ], { fontSize: 17 });
}

// 8. Mistake/correction -- rotation mechanics
{
  const s = newSlide();
  titleBar(s, "How Does the Database Learn the New Password?");
  codeBlock(s, "createSecret -> setSecret (updates the REAL DB) ->\ntestSecret -> finishSecret", { h: 1.3, fontSize: 15 });
  bullets(s, [
    "Rotation isn't just a stored value changing",
    "The rotation Lambda logs into the target system itself",
    "App must re-fetch/short-TTL-cache, not hold the secret forever",
  ], { y: 3.1, h: 1.8, fontSize: 16 });
}

// 9. Recap
{
  const s = newSlide();
  titleBar(s, "Recap");
  bullets(s, [
    "Public exposure isn't inherently bad -- intent + blast radius matter",
    "Env var = different visibility boundary, not a security boundary",
    "Automatic rotation only works because the target system is updated too",
  ]);
}

// 10. Quiz
{
  const s = newSlide();
  titleBar(s, "Quiz — Pause and Think");
  bullets(s, [
    "1. SG allows RDP (3389) from 0.0.0.0/0 -- risk, and the SSM-equivalent fix?",
    "2. \"We're secure, I moved the key to an env var\" -- correction?",
    "3. Why verify jq's 0 result with grep before trusting it?",
  ], { h: 3.2, fontSize: 17 });
}

// 11. Closing / takeaway
{
  const s = newSlide();
  titleBar(s, "Operational Takeaway");
  s.addText(
    "A clean scan result needs a second, independent check before you trust it.",
    {
      x: 0.6, y: 1.8, w: 8.8, h: 1.8,
      fontFace: "Cambria", bold: true, fontSize: 22, color: ACCENT,
      valign: "top",
    }
  );
  bullets(s, [
    "Phase 6 continues: Cloud Security -- misconfigurations",
    "Next: IAM privilege-escalation chains (PassRole + CreateFunction)",
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
