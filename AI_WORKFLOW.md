# AI Workflow & Engineering Process Documentation

> **Evaluation Note for Ajaia Assessors**: This document transparently outlines the AI prompts used, decomposition of tasks, modifications made to generated code, architectural suggestions rejected, and independent testing steps performed throughout the development of CollabSpace.

---

## 1. Task Decomposition & Phased Execution

To build a production-quality MVP within the timed assessment timeframe, the project was broken down into 7 deliberate engineering phases:

```
[Phase 1: Project Setup] ──▶ Next.js 14 App Router, Tailwind CSS, TipTap, Vitest
        │
[Phase 2: Data Modeling] ──▶ Supabase PostgreSQL schema, RLS policies, Dual-Engine Service
        │
[Phase 3: File Importer] ──▶ Markdown/TXT parser, 2MB size validator, Vitest unit test suite
        │
[Phase 4: Document Editor] ──▶ TipTap toolbar, debounced auto-save (1s), live save indicator
        │
[Phase 5: Permissions & Sharing] ──▶ Owner, Editor, Viewer access boundaries & sharing modal
        │
[Phase 6: Dashboard UI] ──▶ Tabbed workspace (My Documents vs Shared with Me), search, modals
        │
[Phase 7: Verification & Docs] ──▶ TypeScript compilation, Next.js production build, Vitest tests
```

---

## 2. Prompts Used During Development

### Prompt 1: Project Scaffolding & Initial Prompt
> *"You are a senior full-stack engineer. Help me build a production-quality MVP called CollabSpace – Smart Collaborative Documents for a timed hiring assessment. Build a lightweight Google Docs-inspired application that allows users to create, edit, save, upload, and share documents with Next.js App Router, React, TypeScript, Tailwind CSS, TipTap rich text editor, Supabase PostgreSQL, Supabase Auth, and Vitest."*

### Prompt 2: Dual-Engine Data Layer Design
> *"Implement the documentService layer to support both Supabase PostgreSQL when credentials exist in .env.local AND a resilient local store pre-populated with realistic test accounts (Alex Rivera - Owner, Sarah Jenkins - Editor, David Chen - Viewer). Ensure RLS policies are strictly matched in both engines."*

### Prompt 3: TipTap Editor & Auto-Save Debounce
> *"Create a rich-text document editor using TipTap with a formatting toolbar (H1, H2, H3, Bold, Italic, Underline, Lists, Blockquotes, Code block), debounced auto-save at 1000ms, and a visual save status indicator (Saved, Saving, Unsaved, Error). Enforce read-only mode if the user has Viewer permissions."*

### Prompt 4: File Importer & Automated Tests
> *"Write a custom parser for .md and .txt files to convert headings, lists, quotes, and code blocks into TipTap JSON nodes with file size and format validation. Add Vitest unit tests covering valid/invalid files and markdown token parsing."*

---

## 3. AI-Generated Code Modified / Corrected

During development, several AI-generated code outputs contained subtle bugs or required adaptation, which were identified and resolved:

1. **`URL.revokeObjectURL(a)` Type Error in File Export**:
   - *Issue*: The AI generated `URL.revokeObjectURL(a)` where `a` was an `HTMLAnchorElement`, causing Next.js TypeScript build failure (`Argument of type 'HTMLAnchorElement' is not assignable to parameter of type 'string'`).
   - *Fix*: Corrected to `URL.revokeObjectURL(url)` where `url` was the object URL string.
2. **ESM vs CommonJS Vitest Startup Clash**:
   - *Issue*: Vitest initial config ran into an `ERR_REQUIRE_ESM` issue when loading via CommonJS in Node 22 with JSDOM.
   - *Fix*: Converted `vitest.config.ts` to `vitest.config.mjs` with explicit ESM syntax and adjusted the unit test environment to `node` for pure AST and validation tests.
3. **TypeScript Closure Narrowing for Supabase Client**:
   - *Issue*: In `AuthContext.tsx`, `supabase` was checked outside the closure but flagged as possibly `null` inside `supabase.auth.onAuthStateChange(async () => { await supabase.from(...) })`.
   - *Fix*: Created a local constant `const client = supabase; if (isSupabaseConfigured && client)` to allow TypeScript's type checker to safely narrow the non-null reference inside the async callback.
4. **Unused Parameter Cleanup for ESLint**:
   - *Issue*: ESLint flagged unused parameters like `userId` in `getDocumentShares`.
   - *Fix*: Cleaned imports and prefixed unused interface parameters with `_` (e.g. `_userId`).

---

## 4. Suggestions Rejected & Technical Rationale

| Suggestion Considered | Why It Was Rejected | Alternative Chosen |
| :--- | :--- | :--- |
| **Storing raw HTML strings in DB** | Raw HTML is vulnerable to XSS and lacks structural integrity for collaborative editors. | Stored native **TipTap JSON (JSONB)** in PostgreSQL, ensuring schema consistency and safe client rendering. |
| **Heavy external markdown parser (remark/rehype)** | Adding heavy remark/rehype dependency chains increased bundle size and build complexity for a timed assessment. | Built a focused, zero-dependency lightweight parser (`parseContentToTipTap`) specifically targeted to TipTap's ProseMirror node schema. |
| **Polling backend every 5 seconds for saving** | Polling causes unnecessary network traffic and race conditions. | Used **debounced event-driven auto-save (1,000ms)** triggered only when the user pauses typing. |
| **Requiring mandatory live Supabase credentials on first boot** | Would prevent instant review if the assessor does not have their own Supabase keys ready. | Implemented a **Dual-Engine architecture** with instant 1-click test users and local persistence fallback. |

---

## 5. Independent Testing & Verification

1. **Automated Unit Testing (`npm run test`)**:
   - Ran 12 automated unit tests across `fileImporter.test.ts` and `permissions.test.ts` using Vitest.
   - Tested:
     - Valid and invalid file formats (`.md`, `.txt`, `.pdf`)
     - File size limit checks (> 2MB rejection)
     - Markdown AST transformation for headers, bullet lists, ordered lists, code blocks, bold, and italic
     - Permission evaluation matrix for Owner, Editor, and Viewer
2. **TypeScript & Static Type Checking (`npm run build`)**:
   - Verified clean compilation of all Next.js App Router routes (`/`, `/auth`, `/documents/[id]`).
   - Verified zero TypeScript compilation errors.
3. **Manual Feature Verification**:
   - Verified that changing title debounces and saves to state.
   - Verified switching between Alex (Owner) and David (Viewer) disables toolbar and renders read-only banner.
   - Verified sharing a document updates access permissions dynamically.
