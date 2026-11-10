# Day 27 — Shared Responsibility Model + Real S3 Misconfiguration Lab — Video Script

**Estimated length:** ~11 minutes (~1550 words)

## Hook

[SCREEN: terminal showing `aws s3api get-public-access-block` output with all four flags `true`]

Here's a sentence that should scare you a little: I just tried to make an Amazon S3 bucket public on a real AWS account — on purpose, as a learning exercise — and AWS stopped me. Not because I did anything wrong technically. The command I ran was textbook-correct for making a bucket public. It got denied anyway. And figuring out *why* it got denied taught me more about cloud security in five minutes than an hour of reading documentation would have.

## Intro

This is Day 27 of my cybersecurity course, and today we're starting a brand-new phase: Cloud Security. If you've been following along, we just wrapped up Identity and Access Management — authentication, privilege escalation, credential attacks — with a real hands-on lab where I caught a root shell through a cron job misconfiguration. Today we're moving into the cloud, starting with a foundational concept called the shared responsibility model, and then I'm going to show you exactly what happened when I tried to reproduce one of the most common real-world cloud breaches: a public S3 bucket.

## Teaching segment: The Shared Responsibility Model

Let's start with the concept. When you use a cloud provider like AWS, Azure, or GCP, security isn't entirely their job, and it's not entirely your job either — it's split, and exactly where that split happens depends on what kind of service you're using.

[SCREEN: simple table — IaaS / PaaS / SaaS rows, Provider covers / You cover columns]

Think of it in three tiers. At the IaaS level — Infrastructure as a Service, like an EC2 virtual machine — AWS handles the physical data center, the hardware, the hypervisor. But you handle the guest operating system, patching it, configuring the firewall, managing your data, and controlling who has access. Move up to PaaS — something like a managed database — and AWS now also handles the OS and the database engine patching for you. You're left managing configuration, access control, and your data. And at the SaaS level, something like Gmail, AWS or the vendor handles almost everything infrastructure-side. You're really just responsible for your data and your user access settings.

Here's why this matters in practice: the overwhelming majority of real cloud breaches you read about in the news are not failures on AWS's side of this line. They're misconfigured S3 buckets, overly permissive IAM policies, leaked secrets — all squarely on the customer's side.

[SCREEN: quick check question on screen — "Who patches the OS on an EC2 instance?"]

I was asked to apply this directly: who's responsible for patching the operating system on an EC2 instance — AWS, or the customer? The answer is the customer. EC2 is IaaS. AWS stops at the hypervisor. Everything above that — the OS, the patches, the firewall rules — is yours. That's exactly why unpatched EC2 instances are such a common finding in real security audits: it's clearly the customer's job, and it's easy to neglect.

## Teaching segment: Attempting a Real S3 Misconfiguration

Now here's where it got interesting. Instead of just talking about misconfigurations abstractly, I wanted to reproduce a real one — the public S3 bucket, which is probably the single most common cloud data breach pattern of the last decade. Companies have leaked customer records, internal documents, even credentials, all because a bucket was accidentally made public.

[SCREEN: terminal — `aws s3api create-bucket` command and output]

First, I created a brand-new, disposable S3 bucket on a real AWS account — specifically scoped to something disposable I owned, not touching any of the account's existing production or dev resources. I confirmed by default it was private, with something called Block Public Access enabled — four settings that all read `true`, acting as a safety net against exactly the kind of mistake we were about to make on purpose.

[SCREEN: terminal — `put-public-access-block` disabling the four flags, output confirming all `false`]

Step one of the misconfiguration: I disabled that safety net at the bucket level. That part worked exactly as expected — the flags flipped to `false`.

[SCREEN: terminal — the public bucket policy JSON, with Principal: "*" and Action: s3:GetObject highlighted]

Step two: I wrote a bucket policy that says, in plain English, "anyone on the internet, no login required, can download any file in this bucket." This exact pattern — a wildcard Principal plus GetObject permission — is the signature you'll find behind nearly every public-S3-bucket breach headline you've ever read.

[SCREEN: terminal — the AccessDenied error from put-bucket-policy]

And then — it failed. AWS denied the request, and the error message told me exactly why: "public policies are prevented by the BlockPublicPolicy setting in S3 Block Public Access." But I'd just turned that off at the bucket level. So what was blocking it?

## Teaching segment: Account-Level Guardrails

[SCREEN: terminal — `aws s3control get-public-access-block --account-id ...` output, all four flags `true`]

The answer: AWS has this Block Public Access setting at *two* layers — per bucket, and per account. I'd only disabled the bucket-level one. The account-level setting, which an administrator at the organization had locked down, was still fully enabled and it overrides whatever an individual bucket says. In other words, even though I — an authorized engineer, deliberately trying to misconfigure my own test bucket — had the technical steps exactly right, a higher-level guardrail stopped the exposure from ever actually happening.

This is a real example of a concept called defense-in-depth: security that doesn't rely on every single engineer getting every single setting right, every single time. One layer failed — or rather, one layer was deliberately weakened by me — but another layer caught it.

## Teaching segment: Auditing for Public Buckets

Since I couldn't reproduce the actual exposure, I pivoted to the more realistic skill anyway: detection. In the real world you're usually auditing buckets someone *else* configured, not deliberately breaking your own.

[SCREEN: terminal — `aws s3api get-bucket-policy-status` command and `IsPublic: false` output]

There's a single AWS command that tells you the real answer without you having to manually reason through bucket policy, bucket-level settings, and account-level settings all at once: `get-bucket-policy-status`. It returns one field — `IsPublic`, true or false — and AWS computes that by factoring in every layer simultaneously. I tested it against a real pre-existing bucket in the account and got `IsPublic: false`, confirming the account's guardrails were doing their job account-wide, not just on my test bucket. At scale, this is exactly what tools like AWS IAM Access Analyzer and Trusted Advisor automate across every bucket in an account.

## Mistake/correction moment

In the closing review, I was asked who's responsible for patching S3's own underlying infrastructure, and I answered that S3 is IaaS, so AWS should manage it. The second half was right — but calling S3 "IaaS" wasn't. S3 is actually a fully managed service — you never see or touch an operating system or a server at all, unlike EC2, which is true IaaS. The correction stuck quickly: service classification matters because it tells you exactly where the responsibility line sits, and I'd put S3 on the wrong side of that line even though I correctly separated "infrastructure" from "bucket configuration and data," which is always the customer's job no matter the service type.

## Recap + quiz

Three things to take away from today. One: the shared responsibility model splits security duties between provider and customer, and exactly where that split falls shifts depending on whether you're using IaaS, PaaS, or SaaS. Two: cloud misconfigurations — not infrastructure failures — are behind most real cloud breaches, and a public S3 bucket is the textbook example. Three: defense-in-depth means checking for guardrails at multiple layers, not just the resource level, before concluding something is safe or exposed.

Here are the three review questions from today — pause the video and think through your own answer before I move on. One: who's responsible for patching S3's own underlying infrastructure, and is that different from who's responsible for a bucket's access configuration? Two: when a bucket-level setting and an account-level setting conflict, which one wins, and why does that design make sense? Three: if you had to audit five hundred buckets for public exposure, would you rather manually read each bucket's raw policy JSON, or use a single command that computes the real answer for you?

## Outro / CTA

Here's your operational takeaway for the day: when you're auditing cloud resources for misconfigurations, always check for guardrails at multiple layers — resource-level and account-level — before you conclude something is exposed, or safe. A check at just one layer can mislead you in either direction.

If you want to follow along as this course moves deeper into cloud security — IAM policies, least privilege, and the misconfigurations beyond S3 — hit follow, and drop your answer to question three in the comments. I'll read every one.

## On-screen text / b-roll suggestions

- Lower-third: "Day 27 — Cloud Security: Shared Responsibility Model"
- Screen recording: full terminal sequence from bucket creation through the AccessDenied error through the final get-bucket-policy-status check
- Caption overlay on the IaaS/PaaS/SaaS table: "Where does the responsibility line move?"
- Text callout over the AccessDenied error: "The attack failed — and that's the lesson"
- Diagram: two stacked boxes labeled "Account-level Block Public Access" and "Bucket-level Block Public Access," with an arrow showing account-level overriding bucket-level
- End-card text: "Next: IAM in the Cloud"
