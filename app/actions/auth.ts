"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { signInSchema, signUpSchema } from "@/lib/schemas";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function signIn(formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate input
  const validation = signInSchema.safeParse({ email, password });

  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return {
      success: false,
      error: firstError.message,
    };
  }

  // Sign in with Supabase
  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/", "layout");

  // Return success without redirect for testing
  return {
    success: true,
  };
}

export async function signUp(formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate input
  const validation = signUpSchema.safeParse({ email, password });

  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return {
      success: false,
      error: firstError.message,
    };
  }

  // Sign up with Supabase
  const { error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data: { message: "Check your email to confirm your account" },
  };
}

export async function signOut() {
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function signInWithOAuth(
  provider: "google" | "github"
): Promise<ActionResult<{ url: string }>> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ||
        "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data: { url: data.url },
  };
}
