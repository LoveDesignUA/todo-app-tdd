"use client";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      className="ml-4"
    >
      Sign Out
    </Button>
  );
}
