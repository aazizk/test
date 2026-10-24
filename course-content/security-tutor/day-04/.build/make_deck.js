const pptxgen = require("./node_modules/pptxgenjs");

const BG = "0D1117";      // near-black navy background
const CARD = "161B22";    // slightly lighter card background
const TEXT = "E6EDF3";    // light text
const MUTED = "8B949E";   // muted gray text
const ACCENT = "2DD4BF";  // teal accent
const WARN = "F97066";    // warm red for "mistake" slide
const FONT_HEAD = "Calibri";
const FONT_BODY = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
const W = 13.33, H = 7.5;

function bgSlide() {
  const s = pres.addSlide();
  s.background = { color: BG };
  return s;
}

function kicker(s, label) {
  s.addText(label.toUpperCase(), {
    x: 0.6, y: 0.5, w: 6, h: 0.4,
    fontFace: FONT_BODY, fontSize: 12, color: ACCENT, bold: true,
    charSpacing: 2, isTextBox: true, margin: 0,
  });
}

function title(s, text, opts = {}) {
  s.addText(text, Object.assign({
    x: 0.6, y: 0.9, w: 12.1, h: 1.1,
    fontFace: FONT_HEAD, fontSize: 34, color: TEXT, bold: true,
    isTextBox: true, margin: 0,
  }, opts));
}

function bullets(s, items, opts = {}) {
  const paras = items.map((t, i) => ({
    text: t, options: { bullet: { code: "2022", indent: 18 }, breakLine: i !== items.length - 1 },
  }));
  s.addText(paras, Object.assign({
    x: 0.9, y: 2.3, w: 11, h: 4,
    fontFace: FONT_BODY, fontSize: 20, color: TEXT,
    paraSpaceAfter: 14, isTextBox: true, margin: 0,
  }, opts));
}

function codeBlock(s, lines, opts = {}) {
  const x = opts.x ?? 0.9, y = opts.y ?? 2.3, w = opts.w ?? 11, h = opts.h ?? 2.2;
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: CARD }, line: { type: "none" },
  });
  const paras = lines.map((t, i) => ({
    text: t, options: { breakLine: i !== lines.length - 1 },
  }));
  s.addText(paras, {
    x: x + 0.35, y: y + 0.25, w: w - 0.7, h: h - 0.5,
    fontFace: "Courier New", fontSize: 16, color: ACCENT,
    paraSpaceAfter: 6, isTextBox: true, margin: 0,
  });
}

function pageDot(s, n, total) {
  s.addText(`${n} / ${total}`, {
    x: W - 1.3, y: H - 0.55, w: 1.0, h: 0.35,
    fontFace: FONT_BODY, fontSize: 11, color: MUTED,
    align: "right", isTextBox: true, margin: 0,
  });
  s.addShape(pres.ShapeType.ellipse, {
    x: 0.6, y: H - 0.65, w: 0.12, h: 0.12, fill: { color: ACCENT }, line: { type: "none" },
  });
}

const TOTAL = 11;

// 1. Title
{
  const s = bgSlide();
  s.addText("SECURITY TUTOR — DAY 04", {
    x: 0.9, y: 2.6, w: 11.5, h: 0.5,
    fontFace: FONT_BODY, fontSize: 16, color: ACCENT, bold: true, charSpacing: 2,
    isTextBox: true, margin: 0,
  });
  s.addText("Linux Fundamentals Part 1", {
    x: 0.9, y: 3.1, w: 11.5, h: 1.1,
    fontFace: FONT_HEAD, fontSize: 44, color: TEXT, bold: true,
    isTextBox: true, margin: 0,
  });
  s.addText("Permissions, the Filesystem, and the Disguised-Executable Red Flag", {
    x: 0.9, y: 4.15, w: 11.5, h: 0.6,
    fontFace: FONT_BODY, fontSize: 20, color: MUTED,
    isTextBox: true, margin: 0,
  });
  pageDot(s, 1, TOTAL);
}

// 2. Hook
{
  const s = bgSlide();
  kicker(s, "The Question");
  s.addText("Why would a plain text file\never need permission to execute?", {
    x: 0.9, y: 1.9, w: 11.5, h: 2.4,
    fontFace: FONT_HEAD, fontSize: 36, color: TEXT, bold: true,
    isTextBox: true, margin: 0,
  });
  s.addText("It wouldn't. That's a red flag — not a curiosity.", {
    x: 0.9, y: 4.5, w: 11.5, h: 0.8,
    fontFace: FONT_BODY, fontSize: 22, color: ACCENT, italic: true,
    isTextBox: true, margin: 0,
  });
  pageDot(s, 2, TOTAL);
}

// 3. What we'll cover
{
  const s = bgSlide();
  kicker(s, "Today");
  title(s, "What We'll Cover");
  bullets(s, [
    "Plaintext vs. encrypted protocols",
    "The Linux filesystem hierarchy",
    "The rwx permission string",
    "Octal notation and chmod",
  ]);
  pageDot(s, 3, TOTAL);
}

// 4. Plaintext vs encrypted protocols
{
  const s = bgSlide();
  kicker(s, "Concept 1");
  title(s, "Plaintext vs. Encrypted Protocols");
  bullets(s, [
    "Telnet and plain SMTP send everything in the clear",
    "SSH is the encrypted replacement for Telnet's job",
    "Same pattern as HTTP vs. HTTPS",
    "Rule of thumb: a plaintext protocol in the wild is a flag worth noting",
  ]);
  pageDot(s, 4, TOTAL);
}

// 5. Filesystem hierarchy
{
  const s = bgSlide();
  kicker(s, "Concept 2");
  title(s, "The Linux Filesystem Hierarchy");
  codeBlock(s, [
    "/bin   essential command binaries",
    "/etc   system-wide configuration",
    "/home  per-user personal directories",
    "/var   variable data (e.g. logs)",
    "/tmp   temporary, usually world-writable",
    "/root  home directory for root only",
  ], { h: 3.2 });
  s.addText("Security question: does this file belong where it is — with the permissions that location implies?", {
    x: 0.9, y: 5.8, w: 11, h: 0.8,
    fontFace: FONT_BODY, fontSize: 16, color: MUTED, italic: true,
    isTextBox: true, margin: 0,
  });
  pageDot(s, 5, TOTAL);
}

// 6. rwx permission string
{
  const s = bgSlide();
  kicker(s, "Concept 3");
  title(s, "The rwx Permission String");
  codeBlock(s, ["rwx r-- r--", "owner | group | other"], { h: 1.6, y: 2.3 });
  bullets(s, [
    "Three groups of three: owner, group, other",
    "Each group: read, write, execute",
    "rwxr--r-- = owner full access, everyone else read-only",
  ], { y: 4.3 });
  pageDot(s, 6, TOTAL);
}

// 7. Octal notation & chmod
{
  const s = bgSlide();
  kicker(s, "Concept 4");
  title(s, "Octal Notation and chmod");
  codeBlock(s, [
    "read = 4   write = 2   execute = 1",
    "",
    "rwx       = 7     ->  chmod 700  (owner only)",
    "r--r--r-- = 444",
    "rwxrwxrwx = 777  (everyone, full access)",
  ], { h: 3.0 });
  pageDot(s, 7, TOTAL);
}

// 8. Mistake
{
  const s = bgSlide();
  kicker(s, "Common Mistake");
  title(s, "777 Is Not a Fix");
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.9, y: 2.4, w: 5.4, h: 3.2, rectRadius: 0.08,
    fill: { color: CARD }, line: { type: "none" },
  });
  s.addText([
    { text: "What people do", options: { bold: true, color: WARN, breakLine: true } },
    { text: "chmod 777 to make\nan error go away", options: { breakLine: false } },
  ], { x: 1.2, y: 2.7, w: 4.8, h: 2.6, fontFace: FONT_BODY, fontSize: 18, color: TEXT, isTextBox: true, margin: 0, paraSpaceAfter: 10 });

  s.addShape(pres.ShapeType.roundRect, {
    x: 6.6, y: 2.4, w: 5.8, h: 3.2, rectRadius: 0.08,
    fill: { color: CARD }, line: { type: "none" },
  });
  s.addText([
    { text: "What actually fixes it", options: { bold: true, color: ACCENT, breakLine: true } },
    { text: "Add the right user to a group,\nor use chmod 700 for\nowner-only access", options: { breakLine: false } },
  ], { x: 6.9, y: 2.7, w: 5.2, h: 2.6, fontFace: FONT_BODY, fontSize: 18, color: TEXT, isTextBox: true, margin: 0, paraSpaceAfter: 10 });

  s.addText("777 doesn't solve the error — it removes access control entirely.", {
    x: 0.9, y: 5.9, w: 11.5, h: 0.6,
    fontFace: FONT_BODY, fontSize: 16, color: MUTED, italic: true,
    isTextBox: true, margin: 0,
  });
  pageDot(s, 8, TOTAL);
}

// 9. Recap
{
  const s = bgSlide();
  kicker(s, "Recap");
  title(s, "Three Takeaways");
  bullets(s, [
    "Plaintext protocols (Telnet, plain SMTP) expose everything, including credentials",
    "rwx always breaks into owner / group / other — and maps directly to octal (4-2-1)",
    "An execute bit on a file that shouldn't have one, or 777 anywhere, is a red flag",
  ]);
  pageDot(s, 9, TOTAL);
}

// 10. Quiz
{
  const s = bgSlide();
  kicker(s, "Quiz — Pause and Think");
  title(s, "Test Yourself");
  bullets(s, [
    "What does chmod 644 grant, broken down by owner / group / other?",
    "Why is chmod 700 the right call for a sensitive script?",
    "A .txt file has permissions rwxrwxrwx — what two problems would you flag?",
  ]);
  pageDot(s, 10, TOTAL);
}

// 11. Closing
{
  const s = bgSlide();
  kicker(s, "Operational Takeaway");
  s.addText("Don't just read permission strings — question them.", {
    x: 0.9, y: 2.1, w: 11.5, h: 1.6,
    fontFace: FONT_HEAD, fontSize: 32, color: TEXT, bold: true,
    isTextBox: true, margin: 0,
  });
  s.addText("A file's permissions should always match what it's actually supposed to do.", {
    x: 0.9, y: 3.6, w: 11.5, h: 0.8,
    fontFace: FONT_BODY, fontSize: 20, color: ACCENT,
    isTextBox: true, margin: 0,
  });
  s.addText("Next up — Day 5: how /etc/passwd and /etc/shadow actually work.", {
    x: 0.9, y: 4.9, w: 11.5, h: 0.6,
    fontFace: FONT_BODY, fontSize: 16, color: MUTED,
    isTextBox: true, margin: 0,
  });
  pageDot(s, 11, TOTAL);
}

pres.writeFile({ fileName: "/home/claudeuser/course-content/security-tutor/day-04/presentation.pptx" })
  .then(() => console.log("written"));
