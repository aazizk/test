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
  s.addText("Day 33", {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontFace: "Cambria", bold: true, fontSize: 40, color: ACCENT,
  });
  s.addText("Writing a Real Detection Rule (And Watching It Cry Wolf)", {
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
  titleBar(s, "3 Alerts. 0 Real Threats.");
  codeBlock(s, "ALERT: WizAccess-Role\nALERT: algosec-cloudflow-stack\nALERT: KarpenterControllerRole\n\nReal rule. Real data. 100% false positives.", { h: 2.0, fontSize: 16 });
  bullets(s, [
    "The rule wasn't broken -- it did exactly what it was told.",
  ], { y: 3.9, h: 0.8, fontSize: 18 });
}

// 3. What we'll cover
{
  const s = newSlide();
  titleBar(s, "What We'll Cover");
  bullets(s, [
    "Condition, scope, threshold -- what a rule actually is",
    "Tumbling windows vs. sliding windows",
    "Building a real correlation rule, function by function",
    "Why true-positive-at-pattern can mean false-positive-at-threat",
  ]);
}

// 4. Anatomy of a rule
{
  const s = newSlide();
  titleBar(s, "A Detection Rule Is Three Things");
  bullets(s, [
    "Condition -- what pattern counts as suspicious",
    "Scope -- what time window to group events within",
    "Threshold -- how many events before it fires",
    "Everything else is tuning",
  ], { fontSize: 19 });
}

// 5. Tumbling vs sliding
{
  const s = newSlide();
  titleBar(s, "Tumbling Window vs. Sliding Window");
  bullets(s, [
    "Tumbling: fixed window -- can split a burst across the boundary",
    "Sliding: window re-extends as matching events keep arriving",
    "Sliding catches a slower, paced attacker tumbling would miss",
  ], { fontSize: 18 });
}

// 6. Building the rule
{
  const s = newSlide();
  titleBar(s, "Hands-On: Building siem-alert.py");
  codeBlock(s, "parse_event()   -- CloudTrailEvent is JSON-in-JSON,\n                   parse it twice\ngroup_events()  -- key = (identity, sourceIPAddress)\nfind_bursts()   -- tumbling window, i = j prevents overlap", { h: 2.0, fontSize: 14 });
}

// 7. The i = j line
{
  const s = newSlide();
  titleBar(s, "The Line That Prevents Double-Counting");
  codeBlock(s, "while i < n:\n    window = [...]       # collect matching entries\n    ...\n    i = j   # jump PAST the window just built", { h: 1.8, fontSize: 15 });
  bullets(s, [
    "Without this, overlapping windows re-flag the same burst",
  ], { y: 3.7, h: 0.8, fontSize: 16 });
}

// 8. The result
{
  const s = newSlide();
  titleBar(s, "Ran It Against 20 Real Events");
  bullets(s, [
    "Rule: 5-minute window, 3+ events to fire",
    "Fired on 3 groups -- all known, benign automation",
    "WizAccess-Role, algosec compliance tool, Karpenter autoscaler",
    "True positive at pattern level, false positive at threat level",
  ], { fontSize: 17 });
}

// 9. Mistake/correction
{
  const s = newSlide();
  titleBar(s, "Common Mistake: Allowlist Granularity");
  bullets(s, [
    "Scenario: stolen creds for a trusted role, used from a new IP",
    "First answer: allowlist suppresses it, so no -- rule misses it",
    "Real answer: depends if allowlist checks identity alone",
    "Must match the rule's own key: identity + IP, not identity only",
  ], { fontSize: 16 });
}

// 10. Fix
{
  const s = newSlide();
  titleBar(s, "The Fix: Two Lists, Not One");
  bullets(s, [
    "Allowlist -- known, trusted identity+IP pairs, suppressed",
    "Watchlist -- known-compromised identities, overrides allowlist",
    "Suppression logic must be exactly as specific as detection logic",
  ], { fontSize: 18 });
}

// 11. Recap
{
  const s = newSlide();
  titleBar(s, "Recap");
  bullets(s, [
    "Rule = condition + scope + threshold; tuning is the real work",
    "Tumbling windows are simple but can split an attack",
    "A correct rule can still be 100% false-positive -- that's tuning, not a bug",
  ]);
}

// 12. Quiz
{
  const s = newSlide();
  titleBar(s, "Quiz — Pause and Think");
  bullets(s, [
    "1. Why can a tumbling window miss a slower attacker?",
    "2. Why does CloudTrailEvent need a second json.loads?",
    "3. Stolen creds, same IP as always -- would your rule catch it?",
  ], { h: 3.2, fontSize: 17 });
}

// 13. Closing / takeaway
{
  const s = newSlide();
  titleBar(s, "Operational Takeaway");
  s.addText(
    "Your allowlist has to be scoped exactly as tightly as your detection rule's own logic.",
    {
      x: 0.6, y: 1.8, w: 8.8, h: 1.8,
      fontFace: "Cambria", bold: true, fontSize: 22, color: ACCENT,
      valign: "top",
    }
  );
  bullets(s, [
    "Next: extend this rule with sequence-based detection, or Checkpoint #4",
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
