import { TodoListServer } from "@/components/TodoListServer";
import { SignOutButton } from "@/components/SignOutButton";
import { filterSchema } from "@/lib/schemas";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  // Проверка авторизации
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const params = await searchParams;
  const parsed = filterSchema.safeParse(params?.filter ?? "all");
  const initialFilter = parsed.success ? parsed.data : "all";

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <main className="w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              My Todo App
            </h1>
            <SignOutButton />
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Built with TDD, Next.js, Server Actions, and shadcn/ui
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Logged in as: {user.email}
          </p>
        </div>
        <TodoListServer initialFilter={initialFilter} />
      </main>
    </div>
  );
}
