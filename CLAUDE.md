@AGENTS.md

## Reference System — MANDATORY

This project uses a structured reference system in memory files. These rules are non-negotiable.

### Before starting work in a new conversation:
1. Read `MEMORY.md` to understand project state and find relevant reference files
2. Read `rules.md` to know all constraints and rendering fixes
3. Read the specific `ref_*.md` files relevant to your current task

### After every code change, update the relevant reference files:
- **New/changed component or page** → update `ref_components.md`
- **New/changed CSS class or style change** → update `ref_css_classes.md` (class name + line range)
- **Changed design tokens (colors, fonts, spacing)** → update `ref_tokens.md`
- **Changed animations (keyframes, GSAP, Framer Motion)** → update `ref_animations.md`
- **New reusable pattern** → update `ref_patterns.md`
- **New API route or backend file** → update `ref_components.md` (API Routes section)
- **New rule or constraint discovered** → update `rules.md`
- **Phase completed** → update `project_roadmap.md`
- **New env var or dev setup change** → update `project_dev_setup.md`
- **New dependency added** → update `project_moon_coffee.md`

### When a new domain emerges (first DB model, first auth flow, etc.):
- Create a new `ref_<domain>.md` file in the memory directory
- Add a link to `MEMORY.md` index under "Reference Lookup"

### Important:
- Reference files use tables for fast lookup — maintain this format
- Line ranges in `ref_css_classes.md` must be updated when globals.css is modified
- Empty sections in reference files (API Routes, Hooks, Middleware) are templates — fill them when relevant code is created
