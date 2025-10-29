"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn, signInWithOAuth } from "@/app/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    startTransition(async () => {
      const result = await signInWithOAuth(provider);
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else if (result.error) {
        setError(result.error);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Client-side validation для быстрой обратной связи
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");

    startTransition(async () => {
      const result = await signIn(formData);
      if (!result.success && result.error) {
        setError(result.error);
      } else if (result.success) {
        // Redirect on successful login
        window.location.href = "/";
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isPending}
              >
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("github")}
                disabled={isPending}
              >
                Continue with GitHub
              </Button>
            </div>

            <div className="h-px bg-border my-2" />

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                disabled={isPending}
                onChange={() => setError("")}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                disabled={isPending}
                onChange={() => setError("")}
              />
            </div>

            {error && (
              <div
                role="alert"
                className="text-red-500 text-sm p-2 bg-red-50 rounded"
              >
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
