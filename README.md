# Todo App with TDD

A modern, production-ready Todo application built with **Next.js 16**, **TypeScript**, **Supabase**, and comprehensive **Test-Driven Development (TDD)** practices.

## ✨ Features

- ✅ **Full CRUD operations** for todos with real-time updates
- ✅ **Optimistic UI updates** for instant feedback
- ✅ **Undo delete functionality** with 7-second window and progress bar
- ✅ **Server Actions** for all mutations (Next.js App Router)
- ✅ **Authentication** with Supabase (login/signup/logout)
- ✅ **Row Level Security (RLS)** - users only see their own todos
- ✅ **Filtering** by all/active/completed tasks
- ✅ **Duplicate prevention** with case-insensitive validation
- ✅ **Real-time toast notifications** with Sonner
- ✅ **Fully tested** - tests with Jest & React Testing Library
- ✅ **100% TypeScript** with strict mode
- ✅ **Modern UI** with Tailwind CSS and shadcn/ui components
- ✅ **Accessibility (a11y)** - ARIA labels, keyboard navigation, semantic HTML

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Validation:** [Zod](https://zod.dev/)
- **Testing:** [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/react)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)

## 🏗️ Architecture

### Server/Client Component Pattern

- **Server Components** (default) handle data fetching and authentication
- **Client Components** manage interactivity and optimistic updates
- **Server Actions** handle all CRUD operations with Zod validation

### Optimistic UI

- Immediate visual feedback on user actions
- Automatic rollback on server errors
- Toast notifications for success/error states

### TDD Approach

- **Red-Green-Refactor** workflow
- **46 passing tests** covering all critical paths
- Component, integration, and server action tests
- Mocking strategy for Supabase and Next.js APIs

## 📦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/LoveDesignUA/todo-app-tdd.git
cd todo-add-with-tests
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL migration from `supabase/migrations/` in your Supabase SQL Editor
3. Copy your project URL and anon key

### 4. Configure environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 6. Run tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🧪 Testing

This project follows **Test-Driven Development (TDD)** principles:

- **46 tests** across 6 test suites
- **Component tests:** TodoItem, TodoList, Login, SignUp
- **Integration tests:** Server actions with Supabase
- **Mocking:** Supabase client, Server Actions, Next.js navigation

### Test Coverage

```bash
npm run test:coverage
```

Key test patterns:

- Optimistic UI updates and rollback
- Undo functionality with timing
- Form validation and error handling
- Authentication flows

## 📁 Project Structure

```
├── app/
│   ├── actions/          # Server Actions (CRUD operations)
│   ├── auth/             # Authentication pages & callbacks
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── page.tsx          # Home page (auth-protected)
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── TodoListServer.tsx    # Server Component (data fetching)
│   ├── TodoListClient.tsx    # Client Component (state management)
│   ├── TodoItemWithActions.tsx # Todo item with optimistic updates
│   ├── AddTodoForm.tsx   # Create todo form
│   └── TodoFilters.tsx   # Filter buttons
├── lib/
│   ├── supabase.ts       # Supabase client
│   ├── schemas.ts        # Zod validation schemas
│   └── utils.ts          # Utility functions
├── __tests__/            # Jest test files
└── supabase/
    └── migrations/       # Database schema
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy

### Deploy to other platforms

```bash
npm run build
npm start
```

## 🔑 Key Features Explained

### Undo Delete with Progress Bar

When deleting a todo:

1. Item disappears from UI immediately (optimistic)
2. Toast appears with "Undo" button and 7-second progress bar
3. Click "Undo" → item restored instantly
4. Wait 7 seconds → permanent deletion from database
5. On error → item restored with error toast

### Optimistic Updates

All mutations use optimistic UI updates:

- Toggle complete status
- Edit todo text
- Delete todo
- Create new todo

Changes appear instant, with automatic rollback on server errors.

### Validation

- **Client-side:** Zod schemas for type safety
- **Server-side:** Validation in Server Actions
- **Duplicate detection:** Case-insensitive text comparison
- **Empty input prevention:** Trimmed and validated

### Accessibility Features

This app implements comprehensive accessibility features:

- **ARIA Labels:** All interactive elements have descriptive `aria-label` attributes
  - "Toggle todo completion" for checkboxes
  - "Edit", "Delete", "Save", "Cancel" for action buttons
- **ARIA Current:** Filter buttons use `aria-current="page"` to indicate active state
- **Semantic HTML:** Proper use of `<button>`, `role="alert"` for errors
- **Keyboard Navigation:**
  - `Enter` to submit forms and save edits
  - `Escape` to cancel edit mode
  - Tab navigation through all interactive elements
- **Focus Management:**
  - Auto-focus on edit input when entering edit mode
  - Focus returns to Edit button after save/cancel
- **Error Announcements:** Error messages use `role="alert"` for screen reader announcements
- **Visual Feedback:** Clear hover states and transitions for all interactive elements

## 📝 License

MIT

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/todo-add-with-tests](https://github.com/yourusername/todo-add-with-tests)
