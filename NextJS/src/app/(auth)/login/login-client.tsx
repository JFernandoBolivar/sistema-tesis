"use client";

import { Buildings } from "@phosphor-icons/react";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export function LoginClient() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="rounded-2xl border border-white/25 bg-card/60 backdrop-blur-2xl shadow-2xl shadow-blue-900/10 overflow-hidden">
          <div className="flex h-1.5 w-full">
            <div className="flex-1 bg-amber-400" />
            <div className="flex-1 bg-blue-600" />
            <div className="flex-1 bg-red-600" />
          </div>

          <div className="px-6 pt-7 pb-5">
            <div className="flex flex-col items-center gap-3 mb-7">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                <Buildings className="size-5" weight="fill" />
              </div>
              <div className="text-center space-y-1">
                <h1 className="text-lg font-bold tracking-tight text-foreground">
                  SAGP
                </h1>
                <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[26ch]">
                  Sistema de Administracion de Gestion de Personal
                </p>
              </div>
            </div>

            <LoginForm />
          </div>

          <div className="border-t border-white/15 px-6 py-3.5 text-center">
            <p className="text-[10px] text-muted-foreground">
              MPPRIJP - Ministerio del Poder Popular para Relaciones Interiores, Justicia y Paz
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
