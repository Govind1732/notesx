<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

<!-- This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. -->
<!-- END:nextjs-agent-rules -->

# NotesX AI Development Guidelines

Project: NotesX (Minimal Notes App)
Stack: Next.js (App Router), TypeScript, Tailwind CSS, MongoDB

## Principles

- Keep everything minimal and simple
- Avoid over-engineering
- Prefer readability over abstraction
- Build only what is required for current task

## Code Rules

- Use functional components
- Use React hooks (no Redux or Zustand initially)
- Use native fetch for API calls (no React Query yet)
- Keep components small and reusable
- Avoid unnecessary libraries

## Backend Rules

- Use Next.js API routes
- Keep controllers simple
- Validate inputs
- Return clean JSON responses

## UI/UX Rules

- Mobile-first design
- Minimal UI (no clutter)
- Fast interactions
- Focus on usability over design complexity

## Folder Structure

- Keep clear separation of components, API, and utilities

## Development Approach

- Build feature by feature (no full app generation)
- Always produce working code
- No placeholder or pseudo code

## Avoid

- No authentication (for now)
- No global state libraries
- No advanced caching
- No unnecessary abstractions

## Output Expectations

- Provide complete working code
- Include file structure
- Ensure code runs without errors

## Data Modeling Rules

- Use simple relationships (e.g., note → folderId)
- Avoid complex joins or nested structures
- Keep schema flexible and minimal

## API Design Rules

- Support filtering via query params (e.g., ?folderId=xyz)
- Keep APIs RESTful and predictable
- Do not overcomplicate controllers

## UI State Rules

- Keep state local using React hooks
- Avoid global state libraries
- Ensure UI updates correctly when state changes (e.g., folder selection updates notes list)

## Component Design Rules

- Split UI into small reusable components (Sidebar, List, Editor)
- Keep components focused on one responsibility
- Avoid deeply nested component trees

## UX Rules (Navigation)

- Sidebar should control main content
- Highlight active selections (e.g., selected folder)
- Ensure smooth and intuitive navigation

## Scalability Mindset

- Design so features can be extended later (e.g., nested folders, tags)
- But DO NOT implement advanced features now

## Editing Experience Rules

- Note editing must be fast and distraction-free
- Avoid page reloads for editing
- Use local state for immediate UI updates
- Persist changes via API (manual save or auto-save)

## UX Feedback Rules

- Show loading states when fetching data
- Show success/error feedback for actions (save/delete)
- Prevent user confusion (e.g., disable save button when empty)

## Data Handling Rules

- Always handle empty states (no notes, no folders)
- Validate inputs before API calls
- Prevent crashes on undefined/null data

## Performance Rules

- Avoid unnecessary re-renders
- Fetch only required data
- Keep API calls minimal

## Error Handling Rules

- Gracefully handle API failures
- Show user-friendly messages
- Never break UI on errors

## Search & Filtering Rules

- Implement fast and simple search (client-side first)
- Search should work on title and content
- Avoid complex indexing or external search services
- Debounce search input to reduce unnecessary processing

## Data Fetching Rules

- Minimize API calls
- Prefer client-side filtering if data size is small
- Avoid refetching unchanged data

## Performance UX Rules

- Search results should update instantly
- No UI lag during typing
- Keep interactions smooth on mobile devices

## Scalability Preparation

- Structure code so server-side search can be added later
- Keep search logic modular and replaceable

## Media Handling Rules

- Allow attaching images to notes (simple upload or URL)
- Store image URLs, not raw files in database
- Keep image handling lightweight and fast

## Editor Enhancement Rules

- Editor should support mixed content (text + images)
- Keep UI clean and distraction-free
- Avoid complex rich-text editors

## Storage Rules

- Use external storage (Cloudinary or similar)
- Ensure uploads are reliable and validated
- Keep file size reasonable

## Extensibility Rules

- Design editor so more content types can be added later
- Keep data structure flexible
- Avoid rigid schemas

## UX Rules (Attachments)

- Show image preview inside note
- Allow removing images
- Keep interaction simple and intuitive

## UX Polish Rules

- App should feel smooth and fast in everyday use
- Avoid friction in navigation and interactions
- Reduce number of clicks for common actions

## Keyboard & Productivity Rules

- Support keyboard shortcuts for common actions (optional but preferred)
- Focus on fast note creation and editing

## Empty State Rules

- Always show helpful UI when no data exists
- Guide user on what to do next (e.g., "Create your first note")

## Mobile UX Rules

- Ensure all features work well on mobile devices
- Sidebar should be collapsible
- Touch interactions should be smooth

## UI Consistency Rules

- Maintain consistent spacing, colors, and typography
- Avoid visual clutter
- Keep design minimal but polished

## Interaction Feedback Rules

- Provide visual feedback for actions (click, save, delete)
- Use subtle animations where helpful (not excessive)

## Authentication Rules

- Use simple and reliable authentication (Supabase or Firebase preferred)
- Do NOT build custom auth from scratch
- Keep authentication minimal (email/password or magic link)

## Data Ownership Rules

- Every note and folder must belong to a user
- Always filter data by userId
- Prevent access to other users' data

## Security Rules

- Never expose sensitive data in frontend
- Validate user identity in API routes
- Protect all CRUD operations with authentication

## Sync Rules

- Data should be consistent across devices
- Fetch only logged-in user’s data
- Handle login/logout state properly

## UX Rules (Auth)

- Clean login/signup screen
- Redirect after login
- Show loading state during auth

## Simplicity Rule

- Keep auth integration minimal and working
- Avoid advanced features (roles, permissions, OAuth complexity)

## Editor Architecture Rules

- Use a block-based rich text editor architecture
- Support mixed content types:
  - paragraphs
  - headings
  - bullet lists
  - images
  - checklists

- Images should be insertable anywhere in content
- Support image resizing and drag/drop positioning
- Store editor content as structured JSON
- Avoid custom rich text implementation from scratch

## Rich Editor Rules

- Prefer Tiptap editor for implementation
- Keep editor minimal and distraction-free
- Focus on writing experience similar to Notion / Google Docs

## Content Model Rules

- Replace rigid arrays (content[], images[]) with flexible block-based schema
- Ensure future extensibility for embeds, code blocks, etc.

## Writing Experience Rules

- The editor should feel immersive and distraction-free
- Prioritize smooth typing experience over feature quantity
- Reduce visible UI chrome and unnecessary borders

## Rich Editor UX Rules

- Prefer floating/contextual toolbars over fixed toolbars
- Support slash commands similar to Notion
- Keep editor interactions fluid and lightweight

## Typography Rules

- Optimize readability:
  - proper line-height
  - balanced spacing
  - comfortable content width

## Performance Rules (Editor)

- Avoid re-rendering entire editor on every keystroke
- Debounce expensive updates
- Keep typing latency extremely low

## Image UX Rules

- Images should feel native to the editor
- Support resizing and inline positioning
- Avoid separating images from text content

## Workspace Design Rules

- Design NotesX as a writing workspace, not an admin dashboard
- Use subtle depth and spacing
- Reduce visual clutter
