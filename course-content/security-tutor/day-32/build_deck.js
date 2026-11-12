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
  s.addText("Day 32", {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontFace: "Cambria", bold: true, fontSize: 40, color: ACCENT,
  });
  s.addText("SIEM Pipeline, Real Correlation, and Alert Triage", {
    x: 0.5, y: 2.5, w: 9, h: 1.3,
    fontFace: "Cambria", bold: true, fontSize: 24, color: HEAD,
  });
  s.addText("Security Tutor — CEH Track, Phase 7: Detection", {
    x: 0.5, y: 4.0, w: 9, h: 0.6,
    fontFace: "Courier New", fontSize: 14, color: BODY,
  });
}

// 2. Hook
{
  const s = newSlide();
  titleBar(s, "Same 3 Calls. Scanner or Attacker?");
  codeBlock(s, "GetAccountPasswordPolicy\nListAccountAliases\nGetAccountProperties\n\nSame IP. Same second. Real AWS account.", { h: 2.0, fontSize: 16 });
  bullets(s, [
    "One thing actually tells them apart -- it's not the calls.",
  ], { y: 3.9, h: 0.8, fontSize: 18 });
}

// 3. What we'll cover
{
  const s = newSlide();
  titleBar(s, "What We'll Cover");
  bullets(s, [
    "The 4-stage SIEM pipeline",
    "Why normalization comes before correlation",
    "Finding a real correlation cluster in live AWS data",
    "The real differentiator in alert triage",
  ]);
}

// 4. SIEM pipeline
{
  const s = newSlide();
  titleBar(s, "The SIEM Pipeline");
  bullets(s, [
    "1. Collection -- pull logs from every source",
    "2. Normalization -- rewrite into one common schema",
    "3. Correlation -- apply rules to spot patterns",
    "4. Alerting -- hand a flagged case to a human",
  ], { fontSize: 18 });
}

// 5. Normalization failure
{
  const s = newSlide();
  titleBar(s, "Why Normalization Comes First");
  codeBlock(s, "CloudTrail:  sourceIPAddress\nAuth log:    remote_addr\nFirewall:    src_ip\n\nSame IP value -- 3 different field names", { h: 2.0, fontSize: 15 });
  bullets(s, [
    "Rule comparing literal names misses the match -- silently",
  ], { y: 3.9, h: 0.8, fontSize: 16 });
}

// 6. Real CloudTrail query
{
  const s = newSlide();
  titleBar(s, "Hands-On: 20 Real IAM Events");
  codeBlock(s, "aws cloudtrail lookup-events \\\n  --profile icd \\\n  --lookup-attributes AttributeKey=EventSource,\\\nAttributeValue=iam.amazonaws.com", { h: 1.8, fontSize: 14 });
  bullets(s, [
    "Messy, real, unscripted account activity",
  ], { y: 3.6, h: 0.8, fontSize: 16 });
}

// 7. The cluster found
{
  const s = newSlide();
  titleBar(s, "A Real Cluster: WizAccess-Role");
  bullets(s, [
    "3 calls, same IP, same second",
    "Also present: Karpenter, EKS, ADFS login, algosec",
    "Found unprompted in live, unscripted data",
  ], { fontSize: 18 });
}

// 8. Mistake/correction
{
  const s = newSlide();
  titleBar(s, "Common Mistake: Judging the Action, Not the Actor");
  bullets(s, [
    "First instinct: \"checks password policy -- investigate\"",
    "Real signal: WHO made the call, not WHAT it checked",
    "WizAccess-Role = known CSPM vendor, legitimate scan",
    "Same calls = also textbook attacker recon",
  ], { fontSize: 16 });
}

// 9. The real differentiator
{
  const s = newSlide();
  titleBar(s, "Identity Is the Differentiator, Not the Action");
  bullets(s, [
    "Legit scan and attacker recon: structurally identical",
    "Only difference: known/expected identity vs. unrecognized",
    "SIEMs baseline \"known good\" identity behavior for this",
  ], { fontSize: 17 });
}

// 10. Evasion reasoning
{
  const s = newSlide();
  titleBar(s, "How Would an Attacker Blend In?");
  codeBlock(s, "Steal real WizAccess-Role creds  -> ARN matches, invisible\nCreate lookalike role            -> ARN mismatch,\n                                     CreateRole itself flags", { h: 1.8, fontSize: 14 });
}

// 11. Recap
{
  const s = newSlide();
  titleBar(s, "Recap");
  bullets(s, [
    "Collection -> Normalization -> Correlation -> Alerting",
    "Normalization must precede correlation or rules silently miss",
    "Check WHO before judging HOW SENSITIVE an action looks",
  ]);
}

// 12. Quiz
{
  const s = newSlide();
  titleBar(s, "Quiz — Pause and Think");
  bullets(s, [
    "1. Name the 4 SIEM pipeline stages, in order.",
    "2. Why does the WizAccess-Role cluster prove identity > action?",
    "3. Credential theft vs. lookalike role -- which evades better?",
  ], { h: 3.2, fontSize: 17 });
}

// 13. Closing / takeaway
{
  const s = newSlide();
  titleBar(s, "Operational Takeaway");
  s.addText(
    "The same calls can be routine or malicious -- identity is the signal, not the action.",
    {
      x: 0.6, y: 1.8, w: 8.8, h: 1.8,
      fontFace: "Cambria", bold: true, fontSize: 22, color: ACCENT,
      valign: "top",
    }
  );
  bullets(s, [
    "Phase 7 continues: detection engineering basics next",
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
