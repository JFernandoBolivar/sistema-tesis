"use client";

import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      role="status"
      aria-label="Cargando"
      className={cn("size-10", className)}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="20"
        cy="20"
        r="16"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.15"
      />
      <path
        d="M36 20C36 11.163 28.837 4 20 4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="animate-[spin_0.8s_linear_infinite] origin-center"
      />
    </svg>
  );
}

export { Spinner };
