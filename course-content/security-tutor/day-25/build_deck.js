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
    fontFace: "Cambria", bold: true, fontSize: 30, color: HEAD,
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
  s.addText("Day 25", {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontFace: "Cambria", bold: true, fontSize: 40, color: ACCENT,
  });
  s.addText("AAA Framing and the SAML/OAuth/OIDC Mess", {
    x: 0.5, y: 2.5, w: 9, h: 1.3,
    fontFace: "Cambria", bold: true, fontSize: 24, color: HEAD,
  });
  s.addText("Security Tutor — CEH Track, Phase 5: Identity & Access Management", {
    x: 0.5, y: 4.0, w: 9, h: 0.6,
    fontFace: "Courier New", fontSize: 14, color: BODY,
  });
}

// 2. Hook
{
  const s = newSlide();
  titleBar(s, "\"Sign In With Google\" -- Login or Access?");
  bullets(s, [
    "You click it daily -- what does it actually do under the hood?",
    "Login and delegated-access are NOT the same thing",
    "Today's session mixed them up twice before it clicked",
  ], { y: 1.8 });
}

// 3. What we'll cover
{
  const s = newSlide();
  titleBar(s, "What We'll Cover");
  bullets(s, [
    "AAA: the third leg nobody talks about (Accounting)",
    "SAML vs. OAuth vs. OIDC -- three different jobs",
    "ID token vs. access token: audience and purpose",
    "Why clock tricks and replay attacks don't work",
  ]);
}

// 4. AAA
{
  const s = newSlide();
  titleBar(s, "AAA: Authentication, Authorization, Accounting");
  bullets(s, [
    "Authentication: who are you",
    "Authorization: what can you do",
    "Accounting: what did you actually do, logged",
    "Missing accounting = incident response hits a wall",
  ]);
}

// 5. SAML vs OAuth vs OIDC
{
  const s = newSlide();
  titleBar(s, "Three Protocols, Three Jobs");
  bullets(s, [
    "SAML: XML assertion, enterprise login (Okta -> app)",
    "OAuth: delegated access (\"let this app touch my data\")",
    "OIDC: OAuth + identity layer (\"Sign in with Google\")",
    "OAuth alone never proves who you are",
  ]);
}

// 6. ID token vs access token
{
  const s = newSlide();
  titleBar(s, "ID Token vs. Access Token");
  codeBlock(s,
    "ID token:     read by the CLIENT APP, once, at login\n              \"this person is verified\"\n\nAccess token: read by the API, repeatedly\n              \"this request is allowed to touch data\"",
    { y: 1.6, h: 2.0 }
  );
  bullets(s, [
    "Different audience = different purpose, not just reuse",
  ], { y: 3.8, h: 0.8 });
}

// 7. SAML vs OIDC flow
{
  const s = newSlide();
  titleBar(s, "Same Job, Different Plumbing");
  bullets(s, [
    "SAML: browser -> Okta -> signed XML assertion -> Salesforce",
    "OIDC: browser -> Google -> ID token (+ access token) -> app",
    "SAML has no native delegated-access mechanism",
    "That's exactly why OIDC+OAuth fits mobile/API use cases better",
  ], { fontSize: 18 });
}

// 8. Clock tricks and replay protection
{
  const s = newSlide();
  titleBar(s, "Can You Fake Token Expiry?");
  bullets(s, [
    "No -- exp timestamp is cryptographically signed",
    "Edit it, signature breaks, token rejected",
    "Server validates against ITS clock, not your device's",
    "Real replay defense: a nonce, checked independently of expiry",
  ]);
}

// 9. Recap
{
  const s = newSlide();
  titleBar(s, "Recap");
  bullets(s, [
    "Accounting is the AAA leg most systems under-invest in",
    "SAML/OIDC prove identity; OAuth grants delegated access",
    "ID token (client, once) vs. access token (API, reusable)",
  ]);
}

// 10. Quiz
{
  const s = newSlide();
  titleBar(s, "Quiz — Pause and Think");
  bullets(s, [
    "1. SIEM logs logins but not actions -- which AAA leg, why does IR suffer?",
    "2. Mobile app needs login + calendar access -- SAML or OIDC+OAuth?",
    "3. Captured ID token replayed before expiry -- what catches it, and why not expiry alone?",
  ], { h: 3.2, fontSize: 18 });
}

// 11. Closing / takeaway
{
  const s = newSlide();
  titleBar(s, "Operational Takeaway");
  s.addText(
    "A token's expiry timestamp alone doesn't protect you from replay -- that's a separate mechanism (a nonce) that must be checked independently.",
    {
      x: 0.6, y: 1.8, w: 8.8, h: 1.8,
      fontFace: "Cambria", bold: true, fontSize: 22, color: ACCENT,
      valign: "top",
    }
  );
  bullets(s, [
    "Next: hands-on privilege escalation lab, then Phase 6 -- Cloud Security",
    "Follow along for the next session",
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
