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
