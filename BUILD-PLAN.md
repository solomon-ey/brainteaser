# The Brain Teaser — Build & Finishing Plan

A roadmap for taking the current single-file prototype into VS Code and finishing it
properly. Written so you can act on it directly.

---

## 1. Where it stands today

One self-contained `index.html` (~154 KB), vanilla JS + inline CSS, **no backend**,
progress saved per-device via `localStorage`. Mobile-friendly and touch-polished.

**Content inventory (all validated):**

| Area | Detail | Questions |
|---|---|---|
| Children — grade path | 6 grades × 4 subjects × 8 questions; each round draws a fresh 5-of-8 | 192 |
| Children — Reading Club | 30 words, 3 read-aloud games (Spell It, First Sound, Read & Find) | — |
| Adults — professions | Stage engine; Developer = 3 stages (30 Q), 14 others = 1 stage (10 Q each) | 170 |
| Modes | Daily Challenge, Expedition (endless), Brain Arcade (4 games), Mind Map | — |
| Systems | XP/levels, badges, spirits, streaks, SFX, affiliate "Brain Shelf" | — |

**The stage engine you asked for is already built.** A profession is a ladder of
stages (10 questions each, ★★ to clear, clears unlock the next). It scales to **10
stages per profession automatically** — stages appear as the question pool grows.
Developer demonstrates the full 3-stage ladder; the rest are ready to be filled.

---

## 2. The one honest constraint: content volume

The full target is **15 professions × 10 stages × 10 questions = 1,500**, plus deeper
child banks. The *engine* supports all of it now. The bottleneck is **authoring at
quality** — a validator catches an out-of-range answer but **cannot catch a wrong
answer key**. So content must be filled in reviewed batches, never dumped. Everything
below assumes content is a pipeline, not a one-shot.

---

## 3. How to "finish properly" — two tracks

### Track A — Stay static (fastest, cheapest, ship this week)
Split the single file into a real project and keep deploying to Vercel/Netlify.

```
brain-teaser/
  index.html
  src/
    main.js
    state.js          # profile, Store (localStorage)
    engine.js         # quiz/stage/draw logic  (already unit-tested in prototype)
    screens/          # home, ladder, professions, profstages, reading, arcade, results
    audio.js          # SFX + speech
    components/        # confetti, modal, toast
  data/
    grades.json        # child questions
    professions.json   # profession questions (this is where the 1,500 live)
    words.json         # reading club
  styles/styles.css
  vite.config.js
```

Run in VS Code: `npm create vite@latest`, drop in the files, `npm run dev`, then
`npm run build`. Deploy the `dist/` folder.
**Best if:** you want to launch now and grow content. Keeps zero hosting cost.
**Limit:** progress is per-device; no accounts, no real leaderboards.

### Track B — Add a backend (accounts, sync, leaderboards, B2B)
Recommended stack: **Supabase** (hosted Postgres + auth, generous free tier, works
well from Nigeria). Alternatives: Firebase, or small Node/Express + SQLite.

Unlocks: cross-device progress sync, real leaderboards, **parent/teacher dashboards**,
**school licensing (B2B)**, and content managed in the database so you add questions
without redeploying.
**Best if:** you want accounts, classrooms, or to sell to schools.

> Recommendation: ship **Track A now**, design the data model (below) so a move to
> **Track B** later is a drop-in, not a rewrite.

---

## 4. Data model (so content scales without touching code)

Move questions out of the JS into data files / a table:

```
question:
  id            unique
  domain        "child" | "profession" | "reading"
  groupId       gradeId+subjectId  OR  professionId
  stage         0..9        (profession stages)
  difficulty    1..3        (drives stage ordering)
  type          Logic | Pattern | Numbers | Verbal | Spatial | Lateral
  q, v          prompt, optional visual
  options[4], answer, explanation
```

With this, filling the 1,500 is editing JSON/CSV (or a DB), never code — and the same
validation script keeps guarding shape and answer range.

---

## 5. Feature roadmap (options, prioritized)

Effort: **S** ≈ hours, **M** ≈ a day or two, **L** ≈ a week+. "BE" = needs a backend.

### Content
- Finish profession stages to 3 each, then toward 10 — batched, reviewed **(L, ongoing)**
- **Add more kids subjects** beyond the current four (Numbers, Words, Logic, Science) —
  e.g. **Memory, Shapes, Money, Nature/Science, Time, Patterns**. Each new subject is
  8 questions × 6 grades = 48, and the grade-complete check, mastery meter and stars all
  update automatically from `SUBJECTS.length` — no engine change, pure content **(M per subject)**
- Grow child subject banks past 8; add Grade-level word lists to Reading Club **(M)**
- Relabel grades to Nigerian **Primary 1–6 / JSS** for local schools **(S)**
- Add sight-word level (the, and, you…) to Reading Club **(S)**

### Engagement & retention
- PWA: installable + offline play **(M)** — big for spotty connections
- Daily streak reminders / "come back tomorrow" **(S)**
- Leaderboards — classroom or global **(M, BE)**
- Avatar / XP shop (spend earned XP) **(M)**
- Parent & teacher mode: assign stages, see progress **(L, BE)**
- Printable worksheets from question banks **(M)**

### Monetization
- Swap affiliate `#` placeholders for real tracking links — see **§7 Affiliate promotion** **(S)**
- Parent subscription — **Paystack / Flutterwave** (Naira) + Stripe (global) **(M, BE)**
- B2B school licences — keep the kids' side ad-free as the selling point **(L, BE)**

### Trust & compliance (launch blockers)
- **Privacy Policy page + cookie/consent banner** — required before affiliates **(S)**
- No ads on the children's side; document COPPA / NDPA posture **(S)**

### Platform & polish
- Real phonics audio (recorded clips) — true letter *sounds*, not letter names **(M)**
  (this is the one literacy gap browser speech can't fill)
- i18n scaffolding for future languages **(M)**
- Analytics (privacy-respecting, e.g. Plausible) to see what's used **(S)**

---

## 6. Replay variation — so a retry isn't just memorization (built in)

Two things keep a second attempt from being a memory test:

1. **Question order is shuffled** every play (already there).
2. **Option order is shuffled** every play — each question's four choices are reshuffled
   and the correct-answer index remapped, so the right answer lands in a different position
   each time. You can't pass by remembering "tap the 2nd one"; you have to know the answer.
   *(Now applied to normal quizzes, profession stages, Daily and Expedition.)*
3. **Question swapping** happens wherever a pool is larger than the round:
   - **Kids subjects already swap** — each subject holds 8 questions and a round serves a
     rotating 5-of-8, so replays bring different questions until the pool cycles.
   - **Profession stages are swap-ready** — a stage draws through the same rotation helper.
     Today most stages hold exactly 10 and show 10 (no spare), so to turn on literal
     swapping, **author 12–14 per stage and keep the shown count at 10**: the engine serves
     a rotating 10 and rotates the extras in on replay. Pure content choice, no code change.

> Net effect: the first play teaches; the retry re-tests with moved answers and (where the
> pool allows) different questions — real practice, not rote recall.

---

## 7. Affiliate promotion (the launch-day revenue path)

**Already wired in the app** — the mechanism is in place; it just needs real links:
- A `RECS` map covering **all 4 kid subjects, all 15 professions, and all 6 reasoning
  types** — 25 buckets, 30 product slots.
- Contextual placement: a **Brain Shelf** hub screen plus a matched picks block on results.
  Kids' picks are **parent-framed** ("for grown-ups to choose"); adult picks are direct.
- **FTC-style disclosure** shown, and every link carries `rel="sponsored nofollow noopener"`.
- All 30 links are `#` placeholders today — swapping them turns promotion on.

**Programs to join, then paste tracking links:**
- **Nigeria-first:** Jumia Affiliate, Konga — Naira payouts; books, kids' kits, gadgets.
- **Diaspora / higher CPM:** Amazon Associates (US/UK) — books and learning toys.
- **Courses (higher commission, adult side):** Coursera, Udemy, Domestika.
- **Your own products:** link Selar ebooks/courses where they fit — no approval, full margin.

**How to swap (and keep it maintainable in VS Code):**
- Move the 30 links into a single `data/affiliates.json` keyed exactly like `RECS`, so
  updating links never touches code.
- Add UTM tags (`?utm_source=brainteaser&utm_medium=shelf&utm_campaign=<bucket>`) so each
  program's dashboard shows what actually converts.
- Optional (Track B): a small click logger to see in-app which shelves earn.

**Placement & trust rules (keep these):**
- Kids' side stays parent-framed and light — trust is the asset; never pitch to a child.
- One or two relevant picks per context, never a wall of links.
- Keep the disclosure visible and the `rel` tags intact.

**Compliance:** affiliate programs require a Privacy Policy + disclosure **before approval**,
so do §9 step 1 first. Topic-matched product links are fine; behavioural ad **targeting of
children** (COPPA/NDPA) is not — that's why this is affiliate, not ads.

---

## 8. Search & discoverability (SEO)

**The honest constraint:** the app is a **client-rendered single page** — almost all content
is injected by JS after load. Crawlers see the `<head>` and a near-empty body, so **the app
itself will not rank** for topic searches. That's the central SEO limitation; no tag fixes it.

**In place now (on-page basics):**
- Title, meta description, Open Graph + Twitter cards, `lang`, zoom-enabled mobile viewport,
  favicon, `robots` meta, and **JSON-LD `WebApplication` structured data**.
- Template `robots.txt` and `sitemap.xml` in the deploy folder — replace the domain token.

**The real lever — a thin static content layer** (build it with the §3 Vite/SSG migration):
- Statically-generate a few **pages with genuine text** that crawlers index, each linking into the app:
  - a marketing **homepage** (what it is, who it's for, screenshots),
  - **topic landing pages**: "brain teasers for kids", "logic puzzles for Primary school",
    "reasoning practice for adults", "developer reasoning quiz", "learn-to-read games", etc.,
  - optionally short **articles** (ties to your MindFacts content engine) hitting the same
    keywords and linking to the matching mode.
- Tooling: easiest is **Astro** or **Next.js static export** (excellent SSG + per-page meta);
  a plain Vite multi-page setup also works for a handful of hand-written pages.

**Per-page must-haves (once pages exist):** unique title + description, canonical URL,
`og:url` + a real `og:image` (1200×630), one `<h1>`, a sitemap entry, and page-type structured
data (`BreadcrumbList`, `FAQPage` on landing pages, `Course`/`Quiz` where it fits).

**Performance & signals:** Core Web Vitals are mostly good (single file loads fast); self-host
or `font-display: swap` the Google fonts, add a **PWA** for mobile engagement, run Lighthouse.
Submit the sitemap to **Google Search Console** + **Bing Webmaster**; measure with a
privacy-respecting tool (Plausible) to see which pages and keywords convert.

**Distribution (off-page):** backlinks and shares from your existing channels (MindFacts Daily
on FB/YouTube, Selar) plus the content pages; for a kids/education product, links from
parent/teacher and Nigerian education sites carry real weight.

> Bottom line: tags are in place, but **organic traffic needs the static-content layer**, which
> rides on the §3 migration. Until then, traffic comes from your channels and direct links, not
> search. Effort: on-page tags **(done)**, static content layer **(L, depends on §3)**, PWA/CWV **(M)**.

---

## 9. Content pipeline (reaching 1,500 without wrecking quality)

1. Author one profession's stage at a time (10–14 Q), tiered by difficulty.
2. Run the validation script (shape + answer-range + duplicate check).
3. **Human review every answer key** — the step that protects learners.
4. Merge. Stages light up automatically as each pool crosses 10, 20, 30…
5. Optional: draft with AI, then human-verify before merge — speeds volume, keeps trust.

---

## 10. Suggested next 5 steps (concrete)

1. **Privacy policy + consent banner** — unblocks affiliate sign-up and launch. *(I can draft both now.)*
2. **Split into a Vite project** with the structure in §3 so VS Code work is sane.
3. **Move questions to `data/*.json`** per the model in §4.
4. **Deepen 2–3 professions** (Doctor, Lawyer, Founder) to full 3-stage ladders — first content batch.
5. **Decide static vs Supabase.** If accounts/leaderboards/schools matter, stand up Supabase auth + a `progress` table; otherwise stay static and revisit later.

---

## 11. Quick start in VS Code

```bash
npm create vite@latest brain-teaser -- --template vanilla
cd brain-teaser
npm install
# move index.html content + split JS/CSS/data per §3
npm run dev          # local preview
npm run build        # outputs dist/
# deploy dist/ to Netlify (drag-drop) or Vercel (vercel --prod)
```

Keep the validation harness from the prototype as `scripts/validate.mjs` and run it on
every content change.
