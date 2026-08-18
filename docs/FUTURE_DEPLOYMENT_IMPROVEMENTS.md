# Future Deployment Improvements

> **Status: proposals only — nothing here has been implemented.**
>
> The current deployment architecture is stable, production-ready, and has been
> reviewed and accepted. This document records ideas for a *future* deployment
> cycle. Nothing in it changes the pipeline today. No deployment script, GitHub
> Actions workflow, PowerShell script, `package.json`, IIS configuration, or
> server setup has been modified.
>
> Each item below should be adopted deliberately, one at a time, and only after
> being validated on the Testing environment first.

---

## Future Improvement 1 — Use `npm ci` instead of `npm install`

The deployment currently runs `npm install`. A future cycle could switch this to
`npm ci`, which is the command npm provides specifically for automated
environments like CI/CD and production servers.

### Why `npm ci` is recommended for production deployments

`npm install` is designed for *development*: its job is to reconcile
`package.json` with whatever is already in `node_modules`, and it is allowed to
update `package-lock.json` when it decides a newer version satisfies a semver
range. That flexibility is useful while developing and undesirable when
deploying — it means the dependency tree installed on the server can differ from
the one that was tested, without anyone changing a single line of code.

`npm ci` inverts those priorities. It treats `package-lock.json` as the single
source of truth and installs exactly what the lockfile specifies, or fails.

### Differences between `npm install` and `npm ci`

| | `npm install` | `npm ci` |
|---|---|---|
| Source of truth | `package.json` | `package-lock.json` |
| May update the lockfile | Yes | Never — it is read-only |
| Lockfile out of sync with `package.json` | Silently reconciles it | Fails immediately with an error |
| Requires a lockfile to exist | No | Yes |
| Existing `node_modules` | Reused and patched incrementally | Deleted, then installed from scratch |
| Installs semver-newer versions | Possible | Never |
| Typical speed in CI | Slower | Faster |
| Intended audience | Developers | Automated builds and deployments |

### Benefits

**Faster deployment.** `npm ci` skips the dependency-resolution phase entirely
because the fully resolved tree is already recorded in the lockfile. It also
writes `node_modules` in one clean pass rather than diffing and patching an
existing tree.

**Deterministic dependency installation.** The same commit always produces
byte-identical dependencies, on every machine and at any point in time. This
removes an entire class of "works on Testing but not on Production" and "worked
last week but not today" problems, where the only thing that changed was a
transitive dependency publishing a new patch release.

**Uses `package-lock.json` exactly.** Nothing is silently upgraded during a
deploy. If the lockfile and `package.json` have drifted apart, `npm ci` stops
with a clear error instead of quietly resolving the difference on the production
server — turning a silent risk into a visible, fixable one.

### Why this is postponed

The current pipeline already works correctly, and this change interacts with
behaviour that is currently relied upon:

- The deployment script has a deliberate step that auto-discards a dirty
  `package-lock.json` before the dirty-tree guard runs. That step exists because
  `npm install` can rewrite the lockfile on the server. The interaction between
  that cleanup and `npm ci` (which never writes the lockfile, but *does* refuse
  to run when the lockfile is out of sync with `package.json`) needs to be
  thought through rather than assumed.
- `npm ci` deletes `node_modules` on every run. This is safe, but it makes each
  deploy do more disk work, which changes deployment timing characteristics.
- If `package.json` and `package-lock.json` are ever out of sync in the
  repository, deploys that currently succeed would begin to fail. That is
  arguably correct behaviour, but it is a behavioural change that should be
  discovered on Testing, not during a production release.

**Suggested adoption path:** switch Testing to `npm ci` first, leave Production
on `npm install`, and run several real deploys through Testing. Only promote the
change to Production once Testing has been stable across multiple releases.

---

## Future Improvement 2 — GitHub Production Environment Approval

The production workflow already references a GitHub *environment* named
`production`. Today that environment has no protection rules attached, so a
merge to `main` deploys immediately. GitHub Environment Protection Rules could
later be enabled on that same environment to require a human approval step
before any production deployment begins.

No workflow changes are needed to adopt this. Protection rules are configured in
the repository settings, which is what makes this a low-risk change to enable —
and equally easy to switch off again.

### Approval flow

```
Developer
    ↓
Merge to main
    ↓
GitHub waits for approval
    ↓
Reviewer approves
    ↓
Production deployment starts
```

### Required reviewers

A named list of people or teams authorised to approve a production release.
GitHub blocks the job until one of them approves. The list is configured per
environment, so Production can require approval while Testing continues to
deploy automatically with no friction.

A useful additional setting is preventing self-review, so the person who wrote
and merged the change is not the same person who approves its release. This
guarantees a second pair of eyes on anything reaching production.

### Manual approval before deployment

When protection is enabled, a merge to `main` queues the deployment rather than
starting it. The workflow run pauses at the deploy job and displays a "Review
deployments" prompt; reviewers are notified and can inspect the diff, the
commit, and the Testing results before deciding. Nothing touches the production
server until someone approves — the SSH connection is not even opened.

Approval can also be denied, and a wait timer can be configured to add a
deliberate delay before a deployment proceeds.

### Protection against accidental production releases

This closes the gap where a merge — including one made in a hurry, made by
someone unfamiliar with the release process, or made before the change has been
verified on Testing — goes straight to live customers. It converts production
deployment from an automatic consequence of merging into an explicit, attributed
decision. It also creates an audit trail: GitHub records who approved each
deployment and when.

**This should remain disabled until the team decides to adopt an approval
workflow.** It introduces a human bottleneck, which is a trade-off worth making
deliberately rather than by default — for a small team shipping frequently, the
added latency may not be worth it yet.

---

## Future Improvement 3 — IIS-Level Health Check

### Current behaviour

The deployment currently verifies the application at the loopback address,
directly against the Node.js process:

```
http://127.0.0.1:3001/api/health     # Production
http://127.0.0.1:3002/api/health     # Testing
```

This confirms the Next.js application started and is serving requests, which is
exactly the thing most likely to break during a deploy. It is fast, has no
external dependencies, and cannot be affected by DNS or network conditions.

### Proposed improvement

Check through the public domain instead:

```
https://jivo.in/api/health           # Production
https://abc.jivo.in/api/health       # Testing
```

### Why this verifies more

A loopback check confirms only the last hop in the chain. A request to the
public URL travels the entire path a real visitor's request takes, so a single
check validates every component along the way:

- **IIS** — that the site is running, its bindings are correct, and the
  application pool is healthy. A stopped site or a misconfigured binding is
  invisible to a loopback check.
- **Reverse proxy** — that the URL Rewrite / ARR rules still forward traffic to
  the correct backend port. If Production's proxy were ever pointed at port
  3002, a loopback check on 3001 would still pass while live traffic silently
  reached the Testing application.
- **SSL certificate** — that the certificate is installed, valid, matched to the
  hostname, and **not expired**. Certificate expiry is a common cause of total
  outages, and it is completely invisible to an HTTP loopback check. This is
  arguably the single strongest argument for the change.
- **Next.js** — that the application itself responds correctly, exactly as the
  current check already confirms.
- **Entire request pipeline** — DNS resolution, TLS negotiation, proxy routing,
  and application response, verified end to end as one unit.

In short: the current check answers *"did the app start?"*. A public-domain
check answers *"can a real user actually load the site?"* — which is the
question a deployment ultimately needs answered.

### Trade-offs to weigh before adopting

This is not strictly an upgrade, and the current approach has real advantages
that would be given up:

- The check becomes dependent on external DNS and outbound network access from
  the server. A DNS or network problem unrelated to the deployment would fail
  the health check and trigger an unnecessary rollback of a perfectly good
  build.
- Server-side loopback-to-public-hostname resolution (NAT hairpinning) does not
  work in every hosting configuration and would need to be confirmed first.
- A certificate that expires between deployments would cause the *next*
  deployment to roll back, even though the deployment itself was fine. The
  rollback would not fix the certificate, so the failure could be confusing.

**A safer variant:** keep the loopback check as the authoritative gate that
controls rollback, and add the public-domain check as an additional
*non-blocking* verification that logs a warning without failing the deploy. The
deployment script already has an `Invoke-StepOptional` pattern for exactly this
kind of non-fatal check. This captures most of the diagnostic value while
keeping rollback decisions dependent only on things the deployment actually
controls.

---

## Future Improvement 4 — Feature Branch Workflow

### Current workflow

```
feature
    ↓
testing
    ↓
main
```

### Proposed workflow

```
feature/*
    ↓
testing
    ↓
Client Approval
    ↓
main
```

The change is to formalise `feature/*` as a naming convention with one branch
per unit of work, and to add an explicit client approval gate between Testing
and Production.

### Better developer isolation

Each piece of work lives on its own branch, named for what it does
(`feature/blog-search`, `feature/contact-form`). Work in progress cannot
destabilise anyone else's work, and an unfinished or abandoned feature can be
dropped by deleting its branch — with no unpicking of commits from a shared
branch, and no risk that a half-finished change reaches `testing` because it
happened to be sitting in the same branch as something that was ready.

### Multiple developers working simultaneously

Several developers can work in parallel without stepping on each other. Each
merges into `testing` when their feature is ready, and conflicts surface at
merge time — in a pull request, where they can be reviewed and resolved — rather
than accumulating silently in a shared branch. This scales the process from one
developer to a team without changing how it works.

### Cleaner Git history

Each feature becomes a coherent, reviewable unit with a clear start and end.
This makes history genuinely useful rather than a flat sequence of unrelated
commits: it becomes straightforward to see which commits belong to which
feature, to review a change as a whole, and — importantly for deployment — to
revert one feature cleanly without disturbing unrelated work.

### Safer production releases

Every change reaches production along the same path: feature branch → Testing →
approval → `main`. Nothing arrives in production without having run on the
Testing environment first. The client approval gate adds an explicit business
sign-off on top of technical readiness, so "the code works" and "we want this
live now" become two separate decisions — which is particularly valuable for
client-facing sites where release timing matters as much as correctness.

This pairs naturally with Future Improvement 2: the client approval step and the
GitHub required-reviewers step can be the same gate.

**Do not implement.**

---

## Future Improvement 5 — Permanent Scripts Folder

### Current layout

The current layout is acceptable and needs no change. Permanent PowerShell
scripts live in the repository under `scripts/`, and the deployment workflows
extract a copy of the deployment script into `Deploy\` on each run.

### Future suggestion

```
C:\LiveProjects\JIVO_WEBSITE\
├── Scripts
├── Deploy
├── Logs
└── Backups
```

Move permanent PowerShell scripts into `Scripts`. Keep `Deploy` strictly for the
temporary script copies generated by the GitHub Actions workflows on each run.

### Rationale

At present `Deploy\` holds only generated files, which is already clean. The
suggestion is a small clarification for the future: if hand-maintained
operational scripts are ever placed on the server — a manual rollback helper, a
log archiver, a certificate renewal check — they should not sit in the same
folder as files that are overwritten by every deployment.

The distinction is about lifecycle, and it makes the safety rule obvious at a
glance:

- **`Scripts`** — permanent, hand-maintained, safe to keep. Never touched by a
  deployment.
- **`Deploy`** — disposable, machine-generated, overwritten on every run. Safe to
  delete entirely at any time.

Anything in `Deploy` can be wiped without a second thought; anything in
`Scripts` cannot.

**This is purely for cleaner organization and is not required today.** No script
currently depends on such a folder, and adopting it would mean updating the
paths the workflows write to — a change to working deployment code for a purely
cosmetic benefit. It is best done alongside another change to that area rather
than on its own.

---

## Current Status

The current deployment architecture has been intentionally left unchanged
because:

- It is already stable.
- It supports Production and Testing.
- It includes rollback.
- It includes health checks.
- It includes logging.
- It includes backups.
- It includes isolated environments.
- It supports zero-downtime style deployment.
- It has been reviewed and accepted for production use.

These improvements are intentionally postponed until a future deployment cycle
to avoid introducing unnecessary deployment risk before the current production
release.
