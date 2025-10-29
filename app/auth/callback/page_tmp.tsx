"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      router.replace("/");
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Completing sign-in…</p>
    </div>
  );
}
