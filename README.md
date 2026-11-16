# CollabSpace – Smart Collaborative Documents

> **CollabSpace** is a lightweight, production-grade Google Docs alternative designed for fast, seamless document creation, rich-text editing, automatic saving, file importing, and granular role-based sharing permissions.

Built for the hiring assessment using Next.js 14 (App Router), React, TypeScript, Tailwind CSS, TipTap rich text editor, and Supabase PostgreSQL with Row Level Security (RLS).

---

## 🚀 Live Demo & Deployment

- **Live Application URL**: [Deploy on Vercel or your hosted link]
- **Walkthrough Video**: See `WALKTHROUGH_URL.txt`
- **Submission Details**: See `SUBMISSION.md` and `AI_WORKFLOW.md`

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14 (App Router)** | Modern React Server & Client Components, file-based routing |
| **Language** | **TypeScript** | Strict type safety across document models, permissions, and editor states |
| **Styling** | **Tailwind CSS** | Clean minimalist SaaS design inspired by Google Docs / Notion |
| **Rich Text Editor** | **TipTap (ProseMirror)** | Headings, bold, italic, underline, strike, bullet/number lists, blockquotes, code blocks |
| **Database** | **Supabase PostgreSQL** | `profiles`, `documents`, `document_shares` with Row Level Security (RLS) |
| **Authentication** | **Supabase Auth** | Session management, email/password, and instant 1-click test accounts |
| **File Import** | **Custom Engine (.md, .txt)** | Client-side validation, size verification, and TipTap JSON conversion |
| **Testing** | **Vitest** | Automated unit tests for file import, validation, and permission matrices |

---

## ✨ Features Walkthrough

### 1. Dashboard
- **Separated Workspaces**: Dedicated tabs for **My Documents** and **Shared with Me** with document count indicators.
- **Instant Search**: Real-time client-side search filtering by document title.
- **Document Management**: Create new blank documents, rename documents, and delete owned documents with confirmation modals.
- **Metadata**: Real-time relative last-modified timestamps (`Just now`, `15 min ago`, `2 hr ago`), owner avatars, and permission badges.

### 2. TipTap Rich Text Editor
- **Full Formatting Toolbar**:
  - Headings (H1, H2, H3, Paragraph)
  - Formatting (Bold, Italic, Underline, Strikethrough)
  - Lists (Bulleted list, Ordered list)
  - Code blocks, Blockquotes, and Divider rules
  - Undo and Redo actions
- **Automatic Saving with Debounce**: 1,000ms debounce ensures changes are automatically synchronized without flooding the backend.
- **Visual Save Status**:
  - `Saved` (Green checkmark)
  - `Saving...` (Blue spinner)
  - `Unsaved changes` (Amber indicator)
  - `Save Error` (Red alert with error tooltip)
- **Document Title Auto-Save**: Title can be edited inline with instant debounced persistence.
- **Export**: 1-click export of documents as Markdown (`.md`) or Plain Text (`.txt`).

### 3. Document Sharing & Access Control
- **Role Distinction**:
  - **Owner**: Full control (create, view, edit, rename, delete, manage collaborators).
  - **Editor**: Collaborative editing and auto-save enabled; cannot delete or manage shares.
  - **Viewer**: Read-only access. Editor surface is locked (`editable: false`), toolbar is disabled, and an informative read-only banner is displayed.
- **Collaborator Management**: Invite registered users by email address with instant role selection.
- **Permission Management**: Owners can update roles (Viewer ↔ Editor) or revoke collaborator access at any time.

### 4. File Import (.txt and .md)
- **Validation**: Strict client-side file extension check (`.txt`, `.md`, `.markdown`) and file size limit (< 2MB).
- **Structure Conversion**: Markdown headers, lists, quotes, and code fences are converted into native TipTap ProseMirror document structures.
- **Direct Redirection**: Upon import, a new document is instantly created and opened in the editor.

### 5. Resilient Dual-Engine Architecture
- **Supabase Cloud Mode**: Seamlessly queries Supabase PostgreSQL and handles auth when `.env.local` is provided.
- **Local Reviewer Mode**: Includes built-in simulated storage pre-populated with realistic team documents and 1-click reviewer accounts (`alex@collabspace.io`, `sarah@collabspace.io`, `david@collabspace.io`), enabling immediate testing without waiting for cloud setup.

---

## 🏃 Getting Started Locally

### Prerequisites
- Node.js >= 18 (Node 20 or 22 recommended)
- npm or yarn

### 1. Clone & Install
```bash
git clone <repository-url>
cd collabspace
npm install
```

### 2. Environment Setup (Optional for Supabase Cloud)
Copy the example environment file:
```bash
cp .env.example .env.local
```
Add your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
> *Note: If credentials are not configured, CollabSpace will automatically run in local demo mode with full functionality and pre-seeded test data!*

### 3. Database Migration (If using Supabase)
Execute the SQL script in `supabase/schema.sql` in your Supabase SQL Editor. This sets up:
- `profiles`, `documents`, and `document_shares` tables
- Row Level Security (RLS) policies
- Automatic user profile trigger on auth signup
- Automatic `updated_at` timestamps trigger

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Automated Tests

Run the Vitest test suite:
```bash
npm run test
```
To run tests with watch mode:
```bash
npx vitest
```

---

## 📦 Building for Production

Verify production build and TypeScript types:
```bash
npm run build
```

---

## 👥 Reviewer Test Accounts

Use the **Role Switcher** in the top navigation bar or log in via the Auth page:

| User | Email | Role / Test Purpose |
| :--- | :--- | :--- |
| **Alex Rivera** | `alex@collabspace.io` | **Document Owner** (Can edit, rename, delete, and share) |
| **Sarah Jenkins** | `sarah@collabspace.io` | **Editor** (Can view and edit shared documents, cannot delete) |
| **David Chen** | `david@collabspace.io` | **Viewer** (Read-only access, toolbar disabled, banner shown) |
