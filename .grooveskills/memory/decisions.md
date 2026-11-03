# Architecture Decision Records (ADR)

An append-only log of significant technical and architectural choices.

| Date | Title | Decision | Reason & Consequences |
| :--- | :--- | :--- | :--- |
| 2026-11-03 | Adopt GrooveSkills Harness | Initialized `.grooveskills/` control plane with ODD | Clean, encapsulated agent memory, 3-lane ODD flow, and English copy standard |
| 2026-11-03 | Universal Defensive Typing for Registry | Use `globalThis` defensive access in templates | Prevents TS2580 errors in minimal consumers (Workers, Vite) lacking `@types/node` |
| 2026-11-03 | Synthetic Registry Typecheck | Verify templates against minimal tsconfig | Ensures registry templates remain zero-dependency and universally safe |
| 2026-11-03 | English-Only Communication Standard | CLI prompts, logs, and docs strictly in English | Maintains international OSS consistency and alignment with `@3lineas` standard |
