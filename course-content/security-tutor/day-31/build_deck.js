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
  s.addText("Day 31", {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontFace: "Cambria", bold: true, fontSize: 40, color: ACCENT,
  });
  s.addText("Phase 6 Wrap-Up + Phase 7: Detection Begins", {
    x: 0.5, y: 2.5, w: 9, h: 1.3,
    fontFace: "Cambria", bold: true, fontSize: 24, color: HEAD,
  });
  s.addText("Security Tutor — CEH Track", {
    x: 0.5, y: 4.0, w: 9, h: 0.6,
    fontFace: "Courier New", fontSize: 14, color: BODY,
  });
}

// 2. Hook
{
  const s = newSlide();
  titleBar(s, "A Real Log Line From My Own AWS Account");
  codeBlock(s, '"eventName": "SimulateCustomPolicy"\n"sourceIPAddress": "147.161.161.27"\n"mfaAuthenticated": "false"', { h: 1.8, fontSize: 16 });
  bullets(s, [
    "Not a textbook sample -- pulled from real CloudTrail history",
  ], { y: 3.7, h: 0.8, fontSize: 18 });
}

// 3. What we'll cover
{
  const s = newSlide();
  titleBar(s, "What We'll Cover");
  bullets(s, [
    "The one principle behind all of Phase 6",
    "Log sources -- why no single one sees everything",
    "Reading a real CloudTrail event like an analyst",
    "Event correlation: why one log line isn't proof",
  ]);
}

// 4. Phase 6 unifying principle
{
  const s = newSlide();
  titleBar(s, "The Phase 6 Unifying Principle");
  bullets(s, [
    "Not just \"least privilege\" -- that alone misses security groups",
    "Real principle: nothing open or granted by default",
    "Identity, org policy, network, data, delegation -- same rule",
    "SCPs = the safety net when an individual policy is wrong",
  ], { fontSize: 17 });
}

// 5. Log sources
{
  const s = newSlide();
  titleBar(s, "Log Sources: No Single One Sees Everything");
  bullets(s, [
    "OS / auth logs -- who logged in, from where",
    "Application logs -- what the app itself did",
    "Network / firewall logs -- what crossed a boundary",
    "Cloud control-plane logs -- every API call (CloudTrail)",
  ], { fontSize: 17 });
}

// 6. Real CloudTrail query
{
  const s = newSlide();
  titleBar(s, "Hands-On: Querying Real CloudTrail History");
  codeBlock(s, "aws cloudtrail lookup-events \\\n  --profile icd \\\n  --lookup-attributes AttributeKey=EventName,\\\nAttributeValue=SimulateCustomPolicy", { h: 1.8, fontSize: 14 });
  bullets(s, [
    "Pulled 3 real events from Day 30's actual session",
  ], { y: 3.6, h: 0.8, fontSize: 16 });
}

// 7. Reading the fields
{
  const s = newSlide();
  titleBar(s, "Fields That Matter for Detection");
  bullets(s, [
    "userIdentity -- ADFS-federated assumed role, not a static user",
    "sourceIPAddress -- exactly where the call came from",
    "mfaAuthenticated: false -- a real flaggable signal",
    "requestParameters -- redacted by AWS itself (security)",
  ], { fontSize: 16 });
}

// 8. Real vs simulated
{
  const s = newSlide();
  titleBar(s, "Would a Real Attack Log the Same Way?");
  bullets(s, [
    "Yes -- CloudTrail logs the API call regardless of intent",
    "Simulation and real exploitation produce the same event shape",
    "The log never knows who's \"supposed\" to be calling it",
  ], { fontSize: 17 });
}

// 9. Mistake/correction
{
  const s = newSlide();
  titleBar(s, "Common Mistake: \"Least Privilege\" Covers It All");
  bullets(s, [
    "First answer: least privilege explains everything in Phase 6",
    "Gap: doesn't explain why an open security group is dangerous",
    "Fixed: default-deny / minimal access applies to 5 surfaces",
    "Identity, org policy, network, data, delegation -- all one rule",
  ], { fontSize: 16 });
}

// 10. Event correlation
{
  const s = newSlide();
  titleBar(s, "One Event Proves Nothing -- Correlation Does");
  codeBlock(s, "PassRole  (alone)          -> often routine\nPassRole -> CreateFunction  -> same identity/IP,\n                               short time window\n                               = real signal", { h: 2.0, fontSize: 15 });
}

// 11. Recap
{
  const s = newSlide();
  titleBar(s, "Recap");
  bullets(s, [
    "Phase 6: default-deny, minimal necessary access, enforced",
    "No single log source sees a whole attack -- that's why SIEMs exist",
    "Detection = correlating identity + source + sequence, not one event",
  ]);
}

// 12. Quiz
{
  const s = newSlide();
  titleBar(s, "Quiz — Pause and Think");
  bullets(s, [
    "1. Unifying principle behind all 4 Phase 6 lessons?",
    "2. Why isn't CloudTrail alone a complete detection solution?",
    "3. Why does correlating PassRole+CreateFunction cut false positives?",
  ], { h: 3.2, fontSize: 17 });
}

// 13. Closing / takeaway
{
  const s = newSlide();
  titleBar(s, "Operational Takeaway");
  s.addText(
    "A single log event is almost never proof of an attack by itself.",
    {
      x: 0.6, y: 1.8, w: 8.8, h: 1.8,
      fontFace: "Cambria", bold: true, fontSize: 22, color: ACCENT,
      valign: "top",
    }
  );
  bullets(s, [
    "Phase 6 complete: cloud misconfigurations + IAM escalation",
    "Next: Phase 7 continues -- SIEM concepts + alert triage",
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
