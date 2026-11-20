# GhostWriter (`song-lyric-generator`) Workspace Rules

Always follow the global `lyric-writing` skill at `C:\Users\asapp\.gemini\config\skills\lyric-writing\SKILL.md` (and its `references/` rulebooks) whenever editing prompts, lyric engines, presets, or generating/critiquing lyrics in this repository.

## Non-Negotiable App & Songwriting Guardrails

1. **Separate the 4 Creative Dimensions**: Keep `Persona` (writing mind), `Flow` (rhythm/cadence), `Voice` (vocal timbre/delivery), and `Topic` (subject/scene) independent.
2. **Mode-Specific Rulebooks**:
   - **Rap**: Meaning first (*a great rhyme that says nothing is a bad bar*), ~90/10 slant-to-perfect rhyme target, dense internal multisyllabic chains, connected enjambed sentences, dynamic cadence (`Rhythm Weaver`, `Chopper` 2–4 bar bursts + recovery, `Torrent` 16–20 syl/bar sustained), zero filler/clichés.
   - **R&B**: Hook-first, one specific emotional conflict, melody & open vowels (`ah`, `oh`, `ay`, `oo`) over dense rhyme chains, singing inside the pocket, purposeful harmonies/ad-libs, and at least one unforgettable replay moment.
3. **Hit Song Rule & Liquid Legend Rule**:
   - Make verses impressive and hooks unforgettable (one line listeners repeat tomorrow).
   - Every song must transform the meaning of at least one word, object, phrase, image, or hook between the start and the end.
4. **Hard Output & Platform Constraints**:
   - **ACE Music (primary)**: Lyrics ≤ 5,000 chars (native `[Section: male|female]` tags, full 10-section sequence including `Bridge` and `Final Chorus`, directions in `[...]`, echoes in `(...)`), Style ≤ 1,000 chars single prose paragraph ending verbatim with `ACE_VOCAL_GUARDRAIL`.
   - **Flow / Mozart (secondary)**: Lyrics ≤ 3,000 chars with plain section labels (`[Verse 1]`, `[Chorus]`, etc.), Sound Prompt ≤ 1,000 chars.
   - **Never leak real artist or producer names** (`findBannedNames` must stay empty).
   - **Always say `"Black"`, never `"African American"`.**
5. **Verification**: Run `pnpm typecheck`, `pnpm test`, and `pnpm build` after any code change.
