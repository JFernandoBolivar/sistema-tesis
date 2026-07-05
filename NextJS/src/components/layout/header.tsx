"use client";

import { SignOutButton } from "@/components/signout-button";
import { Breadcrumb, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CaretDown } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function HeaderLayout({
  children,
  title,
  subtitle,
}: Readonly<{
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}>) {
  const { data: session } = useSession();
  const isRac = session?.user.department.nombre_departamento === "RAC";
  const pathName = usePathname().split("/");
  const pasivoPath = "dashboard/gestion-pasivos".split("/");
  const activoPath = "dashboard/gestion-trabajadores".split("/");

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b-2 border-primary bg-card shadow-sm px-6">
      <div className="flex flex-row items-center gap-4">
        {children}
        <div className="flex flex-col">
<h1 className="text-sm font-semibold tracking-tight text-foreground leading-tight truncate max-w-[50vw]">
              {title}
            </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground leading-tight">
              {subtitle}
            </p>
          )}
          
        </div>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <SignOutButton />
      </div>
    </header>
  );
}
