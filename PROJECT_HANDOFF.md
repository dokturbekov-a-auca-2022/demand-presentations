# Interactive English Presentations — Project Handoff

Last updated: 23 August 2026

This file is the durable context for continuing the presentation project in a new chat. Read it completely before editing or creating a lesson.

## 1. Project location and purpose

- Workspace: `C:\Users\doktu\OneDrive\Desktop\presentations`
- Course: Pre-Intermediate 2 English
- Typical learners: ages 13–17
- Master lesson sequence and required teaching structure: `topicslist`
- Deliverable format: self-contained, interactive HTML presentation folders that work offline in a current browser.

The presentations are used as complete classroom lessons, not as simple lecture slides. They must teach, practise, and review the target language through visual and interactive activities.

## 2. Current position — read this first

Lessons 02–13 have been built. Do not recreate or replace them unless the user specifically requests revisions.

The next presentation to build is:

> **Lesson 14 — Passive Voice | Technology & Inventions**

Lessons 02–16 have been built, with Lesson 14 completed after a previous skip. Do not recreate or replace them unless the user specifically requests revisions.

The next presentation to build is **Lesson 17 — Reading Lesson | Psychology & Human Behaviour**.

## 3. Existing Lesson 10 artwork

### `assets/future-postcards-hero.png`

A wide handmade travel-postcard collage. A teenage traveller with a suitcase and cardboard camera is surrounded by postcard scenes of an airport, sleeper train, ferry, and mountain cable car. The left side has generous cream negative space for a title. Best use: title slide or visual lead-in.

### `assets/future-trip-story.png`

An open travel scrapbook showing four chronological scenes: checking an airport departures board, travelling together on a train, standing on a ferry at sunset, and arriving at a mountain lodge. Best use: reading/listening sequence, itinerary activity, or timeline practice.

### `assets/future-window-speaking.png`

A vivid purple evening travel-planning scene with three teenagers, a map, empty speech bubbles, a future clock, and circular destination windows showing a camper van, hot-air balloon, snow train, and night ferry. Best use: speaking activity, prediction task, question practice, or final production.

The exact image-generation prompts that produced these three existing files are not stored in this workspace. Do not invent false provenance. If more artwork is generated, save it inside the Lesson 10 `assets` folder and record the exact prompt in a new `ARTWORK.md`.

## 4. Completed lesson inventory

| Lesson | Folder | Creative identity | Status |
|---|---|---|---|
| 01 | `lesson-01-revision-getting-to-know-each-other` | Postcard Exchange | Complete; 28-scene opening revision + introductions lesson |
| 02 | `lesson-02-present-perfect-continuous` | The Guild of Unfinished Things | Complete |
| 03 | `lesson-03-speaking-medicine-health` | Frequency 103: The Body Broadcast | Complete |
| 04 | `lesson-04-past-continuous-accidents-funny-stories` | Oops! In Motion | Complete |
| 05 | `lesson-05-reading-social-media-good-or-bad` | The Feed on Trial | Complete |
| 06 | `lesson-06-past-simple-vs-past-continuous-crime-news` | Breaking at 9:17 | Complete |
| 07 | `lesson-07-vocabulary-personality-emotions` | The Character Hotel | Complete |
| 08 | `lesson-08-past-perfect-life-stories` | The Memory Metro | Complete and recently rechecked |
| 09 | `lesson-09-speaking-club-technology-ai` | Signal City | Complete; static validator passes |
| 10 | `lesson-10-future-continuous-travel-plans` | Future Postcards | Complete |
| 11 | `lesson-11-video-jobs-careers` | Career Quest | Complete; 22-scene offline visual-storyboard video lesson |
| 12 | `lesson-12-second-conditional-dreams` | Dream Lab | Complete |
| 13 | `lesson-13-debate-money-happiness` | Happiness Exchange | Complete |
| 14 | `lesson-14-passive-voice-technology-inventions` | Invented Here | Complete; 27-scene visual grammar lesson |
| 15 | `lesson-15-pronunciation-fluency-sound-natural` | Sound Studio | Complete |
| 16 | `lesson-16-reported-speech-gossip-communication` | Whisper Lab | Complete |
| 17 | `lesson-17-reading-psychology-human-behaviour` | Mind Atlas | Complete; 27-scene reading lesson |
| 18 | `lesson-18-relative-clauses-describing-people-places` | The Relative Route | Complete; 28-scene visual grammar lesson |
| 19 | `lesson-19-listening-airport-travelling` | Terminal Frequency | Complete; 28-scene listening lesson |
| 20 | `lesson-20-used-to-childhood-habits` | Then / Now | Complete; 27-scene grammar lesson |
| 21 | `lesson-21-business-english-basics` | Office Outfitters | Complete; 28-scene vocabulary lesson |
| 22 | `lesson-22-gerunds-infinitives-hobbies-interests` | Verb Garden | Complete; 28-scene grammar lesson |
| 23 | `lesson-23-movies-books-reviews` | Critics’ Zine | Complete; 28-scene speaking lesson |
| 24 | `lesson-24-phrasal-verbs-daily-life` | Phrasal Verb House | Complete; 28-scene vocabulary lesson |
| 25 | `lesson-25-survival-game-escape-room` | Escape Protocol | Complete; 28-scene problem-solving lesson |
| 26 | `lesson-26-question-tags-small-talk` | Tag Café | Complete; 28-scene speaking lesson |
| 27 | `lesson-27-presentation-skills-speaking-confidently` | Stagecraft Studio | Complete; 28-scene presentation-skills lesson |
| 28 | `lesson-28-linking-words-giving-opinions` | Opinion Loom | Complete; 28-scene linking-words lesson |
| 29 | `lesson-29-final-speaking-project-presentation-debate` | Make Your Case | Rebuilt; 28-scene live-forum final speaking project with route choice, model pitch, project canvas, rehearsal director, performance timer and feedback mosaic |
| 30 | `lesson-30-final-revision-level-test` | Constellation Review | Complete; 28-scene final revision + level test |

Lesson 01 is now complete in `lesson-01-revision-getting-to-know-each-other`.

## 5. Important recent work on Lesson 08

Lesson 08 is complete and should not be mistaken for the next lesson.

Main file:

`lesson-08-past-perfect-life-stories/index.html`

Recent improvements:

- Filled sparse scenes with relevant illustrations, icon strips, timelines, station chains, sentence trains, and quiz-ticket graphics.
- Added animated route lines, waveform, cards, pictures, grammar train, station chain, and quiz tickets.
- Added three new original images: `milestone-panorama.webp`, `earlier-later-platform.webp`, and `speaking-interview.webp`.
- Fixed clipping on the interview and closing slides.
- Rewrote slide 3 so the homework recap is clear: read a weak personality label, predict evidence, tap to reveal a stronger description, and compare.
- Fixed slide 3’s white-on-white card text by explicitly using dark navy text and coral instruction labels.
- Preserved reduced-motion support.

Lesson 08 validation currently passes:

- 26 scenes
- 10 image placements using seven local visual assets
- all interactive activities and timers
- desktop horizontal and vertical overflow checks
- compact/mobile horizontal overflow check
- all assets and teacher notes
- no external runtime URLs

Useful Lesson 08 QA files:

- `validate.mjs`
- `syntax-check.mjs`
- `interaction-check.mjs`
- `visual-audit.mjs`
- `contact-sheet.py`

These may be inspected and adapted for Lesson 10. Reuse testing ideas, not the Memory Metro visual design.

## 6. Non-negotiable design requirements

Every presentation must be:

- unique and visually distinct from all previous presentations;
- creative, polished, and appropriate for teenage learners;
- interactive rather than a sequence of passive text slides;
- rich in relevant pictures, icons, diagrams, and visual cues;
- animated with purposeful motion, while respecting `prefers-reduced-motion`;
- readable from a classroom screen with strong colour contrast;
- responsive on desktop and compact/mobile screens;
- usable offline with no external runtime dependency;
- free from accidental large empty areas, clipping, tiny text, and horizontal overflow;
- pedagogically complete, with every activity having obvious student instructions;
- inclusive: fictional answers and non-personal alternatives should be allowed for sensitive questions.

Do not copy the theme, metaphor, colour system, layouts, or signature interaction from an earlier lesson. Consistent controls are welcome, but the visual experience must feel new.

For Lesson 10, the existing artwork naturally supports a handmade **postcards from tomorrow / future travel scrapbook** direction. Develop that idea into a coherent identity, but avoid turning it into another metro or newsroom presentation.

## 7. Interaction and navigation expectations

A strong deck normally includes:

- previous/next controls;
- arrow-key and Page Up/Page Down navigation;
- Space to advance when appropriate;
- touch/swipe navigation;
- a scene directory or route map, normally opened with `M`;
- teacher notes, normally toggled with `N`;
- an accurate scene counter and progress indicator;
- clickable reveal cards;
- vocabulary matching or categorising;
- grammar choices with visible feedback;
- sentence construction or transformation;
- timers for speaking tasks;
- a review quiz;
- an exit ticket.

Buttons must look clickable, provide immediate feedback, and remain keyboard accessible. Every image needs meaningful alt text.

## 8. Required lesson structure

Use `topicslist` as the source of truth. A standard grammar lesson should cover:

1. Title and learning promise
2. Check-in and personal icebreaker
3. Previous-lesson/homework bridge
4. Visual warm-up or prediction
5. Objectives
6. Vocabulary introduction
7. Vocabulary practice
8. Grammar discovery
9. Meaning and timeline
10. Form: positive, negative, and questions
11. Signal words/time expressions
12. Pronunciation or connected speech where useful
13. Controlled practice
14. Common mistakes and error correction
15. Reading, listening, or schedule-based context
16. Comprehension and language noticing
17. Pair/group speaking
18. A realistic production task
19. Review quiz
20. Homework, reflection, and exit ticket

Every scene should include a concise teacher note with suggested timing or facilitation guidance.

## 9. Recommended Lesson 10 teaching route

The exact slide count may be adjusted if the lesson remains complete, but approximately 24–26 scenes works well. A strong 26-scene route would be:

1. Title — a distinctive “Postcards from Tomorrow” travel promise
2. Check-in — where would you like to be this time next year?
3. Lesson 09 bridge — one technology prediction or AI travel-tool idea
4. Visual lead-in using `future-postcards-hero.png`
5. Objectives and lesson route
6. Travel vocabulary picture discovery
7. Transport and accommodation vocabulary matching
8. Travel collocations: check in, board a flight, catch a train, stay at, explore, return
9. Pronunciation and word-stress mini-task
10. Grammar discovery through two future snapshots
11. Meaning — an action in progress at a specific future time
12. Timeline — now → future reference time → activity in progress
13. Positive form: subject + will be + verb-ing
14. Negative and question forms
15. Time expressions: this time tomorrow, at 8 p.m. next Friday, when you arrive
16. Useful contrast with Future Simple, without overloading learners
17. Common mistakes and repair activity
18. Controlled multiple-choice or gap-fill practice
19. Interactive sentence/itinerary builder
20. Travel-story sequence using `future-trip-story.png`
21. Reading or teacher-read listening comprehension
22. Information-gap itinerary activity
23. Polite future questions: “Will you be staying…?” / “Will you be travelling…?”
24. Speaking and trip-planning production using `future-window-speaking.png`
25. Animated review quiz or passport-stamp challenge
26. Homework, self-assessment, exit ticket, and preview of Lesson 11

Core grammar to teach accurately:

- Positive: `I/you/he/she/we/they will be travelling.`
- Negative: `will not be travelling` / `won’t be travelling`
- Question: `Will + subject + be + verb-ing?`
- Short answers: `Yes, I will.` / `No, I won’t.`
- Main meaning: an action that will be in progress at a particular future time.
- Secondary useful meaning: asking about expected plans politely, for example, “Will you be staying at a hotel?”
- Common errors: missing `be`, using the base verb after `be`, adding `to`, or using `will be` with the wrong verb form.

Keep explanations at Pre-Intermediate 2 level. Grammar should be discovered visually and then stated clearly.

## 10. Technical implementation conventions

- Prefer one main `index.html` with local CSS and JavaScript.
- Store illustrations in the lesson’s own `assets` folder.
- Do not depend on CDNs, remote fonts, external JavaScript, or network access at runtime.
- Use semantic buttons rather than clickable generic elements.
- Make each scene a clearly identifiable section.
- Keep teacher notes inside each scene.
- Add `prefers-reduced-motion: reduce` handling.
- Avoid destructive edits to existing lesson folders.
- Preserve unrelated user files.
- Use `apply_patch` for source-file edits.

Suggested Lesson 10 files:

- `index.html` — complete interactive presentation
- `README.md` — title, topic, route, controls, and artwork note
- `ARTWORK.md` — exact prompts and provenance for any newly generated art
- `validate.mjs` — static checks
- `interaction-check.mjs` — browser interaction and overflow checks
- `visual-audit.mjs` — full-deck screenshot capture

## 11. Quality-assurance workflow

Do not declare a lesson complete after only checking syntax.

1. Run a static validator.
2. Run the browser interaction suite.
3. Test a desktop classroom viewport around `1600×900`.
4. Test a compact viewport around `500×844`.
5. Check horizontal overflow at both sizes.
6. Check that visible content is not clipped vertically on desktop.
7. Confirm that all images load and have alt text.
8. Capture every scene and inspect contact sheets or individual screenshots.
9. Pay special attention to slides with long questions, large timers, multi-column activities, and homework content.
10. Re-run all checks after the final visual correction.

Typical commands, from inside a lesson folder:

```powershell
node .\validate.mjs
$env:SKIP_SHOTS='1'; node .\interaction-check.mjs
node .\visual-audit.mjs
```

Browser automation on this Windows machine has used Microsoft Edge at:

`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`

The current workspace is not a Git repository, so do not rely on `git status` or `git diff` for verification.

## 12. How to report completion

When a lesson is finished, the handoff should include:

- a clickable link to the new `index.html`;
- the final scene count;
- the major interactions and visual identity;
- all new asset names;
- which tests passed;
- any known limitation;
- confirmation of which lesson comes next.

Update this file’s “Current position” section when Lesson 10 is complete so future chats continue with Lesson 11.

## 13. Copy-ready prompt for a new chat

Copy everything inside the following block into a new Codex chat:

```text
Continue my interactive English presentation project in:
C:\Users\doktu\OneDrive\Desktop\presentations

First, read these two files completely before doing any work:
1. C:\Users\doktu\OneDrive\Desktop\presentations\PROJECT_HANDOFF.md
2. C:\Users\doktu\OneDrive\Desktop\presentations\topicslist

Treat PROJECT_HANDOFF.md as the durable project context and topicslist as the source of truth for lesson order and teaching structure.

Lessons 02–13 are already complete. Do not redo them. Start and fully implement Lesson 14: Passive Voice | Technology & Inventions in:
C:\Users\doktu\OneDrive\Desktop\presentations\lesson-14-passive-voice-technology-inventions

Build a unique, creative, highly interactive offline HTML presentation with a new visual identity, relevant pictures and icons, purposeful animation, clear grammar explanations, classroom activities, teacher notes, responsive design, and strong text contrast. Avoid large accidental empty spaces and do not copy the visual style of previous lessons.

Do not stop at a plan. Build the complete presentation, create validation and browser-interaction checks, capture and visually inspect every scene at desktop and compact sizes, fix any clipping or overflow, and then report the completed file and test results. Use image generation only if the existing artwork is insufficient, and record every new image prompt in ARTWORK.md.

After completion, update PROJECT_HANDOFF.md so the next lesson is Lesson 15.
```

## 14. Maintenance rule

After every completed lesson:

1. Add it to the completed inventory.
2. Change the current position to the next lesson in `topicslist`.
3. Record any prepared-but-unused assets.
4. Record important QA scripts and known issues.
5. Refresh the copy-ready new-chat prompt.

This keeps the project independent of chat history and makes it safe to clear old conversations.
