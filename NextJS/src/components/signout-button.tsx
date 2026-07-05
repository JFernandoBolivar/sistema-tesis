"use client";

import { Button } from "@/components/ui/button";
import { SignOut } from "@phosphor-icons/react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => signOut({ redirectTo: "/" })}
      className="text-muted-foreground hover:text-destructive transition-colors"
    >
      <SignOut className="size-4" weight="bold" />
    </Button>
  );
}
