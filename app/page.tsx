import { TodoList } from "@/components/TodoList";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <main className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Todo App
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Built with TDD, Next.js, and shadcn/ui
          </p>
        </div>
        <TodoList />
      </main>
    </div>
  );
}
