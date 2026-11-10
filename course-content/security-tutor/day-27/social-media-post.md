# Day 27 — Shared Responsibility Model + Real S3 Misconfiguration Lab

## LinkedIn

I tried to make an S3 bucket public on a real AWS account today — on purpose, as a learning exercise. AWS stopped me. And figuring out why taught me more than the textbook definition ever could.

Day 27 of my cybersecurity course started with the shared responsibility model: AWS handles the hardware and hypervisor, you handle everything from the guest OS up (for IaaS like EC2), and that line shifts depending on whether you're using IaaS, PaaS, or SaaS.

Then we went hands-on. I created a disposable S3 bucket, confirmed it was private by default, disabled Block Public Access at the bucket level, and attached a policy granting anyone on the internet read access — the exact pattern behind nearly every "leaked S3 bucket" headline you've ever seen.

It got denied. Turns out there's a second, account-level Block Public Access setting that overrides whatever any individual bucket says — and someone at my organization had it locked down tight. Even with the technically-correct steps to expose the bucket, a higher layer caught it. That's defense-in-depth in action: security that doesn't depend on any one engineer getting every setting right.

Since I couldn't reproduce the exposure, I pivoted to auditing instead — `aws s3api get-bucket-policy-status` returns a single computed field that factors in every layer (ACL, policy, bucket settings, account settings) at once, which is exactly how you'd check hundreds of buckets at scale rather than reading raw policy JSON one by one.

One correction along the way: I called S3 itself "IaaS" when asked about infrastructure patching. It's not — S3 is a fully managed service with no customer-visible OS at all, unlike EC2. Small distinction, but it's exactly the kind of thing that determines where the responsibility line actually falls.

Starting Phase 6 of this course — Cloud Security — with a real result instead of a simulated one feels like the right way to begin.

#CloudSecurity #AWS #CyberSecurity #S3 #CEH #LearningInPublic

## Twitter/X

Tried to make an S3 bucket public on a real AWS account today. AWS said no — an account-level Block Public Access setting overrode my bucket-level change.

Lesson: check guardrails at every layer before assuming something's exposed (or safe). Defense-in-depth, live. 🔒

#AWS #CloudSecurity #DevOps
