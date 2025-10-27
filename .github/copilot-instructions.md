---
applyTo: '**/*.ts'
---

# Todo List Application - Coding Standards

## Tech Stack
- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript (strict mode)
- **Database**: Supabase
- **Validation**: Zod
- **Testing**: Jest + React Testing Library
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI

## General Principles

### TypeScript Standards
- Use strict TypeScript configuration
- Always define explicit return types for functions
- Use `interface` for object shapes, `type` for unions/intersections
- Avoid `any` - use `unknown` and type guards instead
- Use const assertions where appropriate

### Code Organization
- Follow Next.js App Router conventions
- Separate server and client components clearly
- Use `"use client"` directive only when necessary
- Keep server actions in separate files (e.g., `actions/todos.ts`)
- Group related functionality in feature folders

### Naming Conventions
- Components: PascalCase (e.g., `TodoList.tsx`)
- Files: kebab-case for utilities, PascalCase for components
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Database tables/columns: snake_case

## Supabase Integration

### Database Schema
- Use snake_case for table and column names
- Always include `id`, `created_at`, `updated_at` fields
- Enable Row Level Security (RLS) on all tables
- Use Supabase types generation: `supabase gen types typescript`

### Client Usage
```typescript
// Use singleton pattern for Supabase client
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Server Actions
- Always use try-catch blocks
- Return structured responses: `{ data, error }`
- Validate input with Zod before database operations
- Use `revalidatePath` or `revalidateTag` after mutations

## Zod Validation

### Schema Definitions
- Define schemas in `schemas/` directory
- Export both schema and inferred types
- Use descriptive error messages

```typescript
import { z } from 'zod'

export const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  completed: z.boolean().default(false),
  due_date: z.string().datetime().optional(),
})

export type TodoInput = z.infer<typeof todoSchema>
```

### Validation in Server Actions
```typescript
export async function createTodo(formData: FormData) {
  const validatedFields = todoSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors }
  }

  // Proceed with database operation
}
```

## Testing Standards

### Test File Organization
- Co-locate tests with components: `ComponentName.test.tsx`
- Unit tests for utilities in `__tests__/` folders
- Integration tests in `tests/integration/`

### Testing Best Practices
- Use descriptive test names: `it('should create todo when valid data is submitted')`
- Follow AAA pattern: Arrange, Act, Assert
- Mock Supabase client in tests
- Test error states and edge cases
- Aim for 80%+ code coverage

### Example Test Structure
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoForm } from './TodoForm'

describe('TodoForm', () => {
  it('should display validation error for empty title', async () => {
    render(<TodoForm />)
    const submitButton = screen.getByRole('button', { name: /add/i })
    
    await userEvent.click(submitButton)
    
    expect(screen.getByText(/title is required/i)).toBeInTheDocument()
  })
})
```

## Component Patterns

### Server Components (Default)
```typescript
// app/todos/page.tsx
import { createClient } from '@/lib/supabase/server'
import { TodoList } from '@/components/TodoList'

export default async function TodosPage() {
  const supabase = createClient()
  const { data: todos } = await supabase.from('todos').select('*')
  
  return <TodoList initialTodos={todos ?? []} />
}
```

### Client Components
```typescript
'use client'

import { useState } from 'react'
import { createTodo } from '@/actions/todos'

export function TodoForm() {
  const [error, setError] = useState<string | null>(null)
  
  async function handleSubmit(formData: FormData) {
    const result = await createTodo(formData)
    if (result.error) setError(result.error)
  }
  
  return <form action={handleSubmit}>{/* form fields */}</form>
}
```

## Error Handling

### Consistent Error Responses
```typescript
type ActionResponse<T> = 
  | { data: T; error: null }
  | { data: null; error: string }

export async function updateTodo(id: string, data: TodoInput): Promise<ActionResponse<Todo>> {
  try {
    const validated = todoSchema.parse(data)
    const { data: todo, error } = await supabase
      .from('todos')
      .update(validated)
      .eq('id', id)
      .select()
      .single()
    
    if (error) return { data: null, error: error.message }
    
    revalidatePath('/todos')
    return { data: todo, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors[0].message }
    }
    return { data: null, error: 'An unexpected error occurred' }
  }
}
```

## Performance Optimization

- Use React Server Components by default
- Implement optimistic updates for better UX
- Use Supabase real-time subscriptions sparingly
- Implement pagination for large lists
- Use Next.js Image component for images
- Implement proper loading and error states

## Security

- Never expose Supabase service key on client
- Implement proper RLS policies
- Validate all user input with Zod
- Sanitize user-generated content
- Use environment variables for secrets
- Implement rate limiting for server actions

## Code Style

- Use Prettier for formatting
- Use ESLint with Next.js recommended rules
- Prefer functional components over class components
- Use destructuring for props and objects
- Keep components small and focused (< 200 lines)
- Extract reusable logic into custom hooks
- Use early returns to reduce nesting

## Documentation

- Add JSDoc comments for complex functions
- Document API routes and server actions
- Keep README.md up to date
- Document environment variables in `.env.example`

